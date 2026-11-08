/**
 * Backend/src/controllers/taskController.ts
 *
 * Controller xử lý REST API cho Lệnh Bảo Trì & Sự Cố (Maintenance Tasks CMMS):
 * - Tích hợp 100% Prisma ORM kết nối bảng Task, Printer, WorkLog và TaskAttachment.
 * - Lưu trữ ảnh nghiệm thu in test & chứng từ lên MinIO S3 qua Presigned URLs (15 phút).
 * - Ghi nhận WorkLog tính toán MTTR thực tế & Chi phí theo CostRateConfig.
 * - Tuân thủ AGENTS.md Rule 5 & Rule 7.1 (< 300 LOC).
 */

import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { storageService } from '../services/storage/minioClient';
import { taskAttachmentController } from './taskAttachmentController';
import {
  TASK_RELATIONS,
  buildTaskCreateData,
  computeUpdatedTaskCost,
  mapAttachmentRecord,
  mapTaskRecord,
  mapWorkLogRecord,
} from '../utils/taskMapper';

export class TaskController {
  // GET /api/v1/tasks
  async getTasks(req: Request, res: Response) {
    try {
      const { status, printerId, priority, assigneeId } = req.query;
      const where: any = {};
      if (status && status !== 'all') where.status = status;
      if (printerId && printerId !== 'all') where.printerId = String(printerId);
      if (priority && priority !== 'all') where.priority = priority;
      if (assigneeId && assigneeId !== 'all') where.assigneeId = String(assigneeId);

      const dbTasks = await prisma.task.findMany({ where, include: TASK_RELATIONS, orderBy: { createdAt: 'desc' } });
      return res.status(200).json(dbTasks.map(mapTaskRecord));
    } catch (err: any) {
      console.error('[TaskController.getTasks] Lỗi truy vấn:', err);
      return res.status(500).json({ error: 'Không thể lấy danh sách công việc', message: err.message });
    }
  }

  // GET /api/v1/tasks/:id
  async getTaskById(req: Request, res: Response) {
    try {
      const found = await prisma.task.findUnique({ where: { id: req.params.id }, include: { ...TASK_RELATIONS, incident: true } });
      if (!found) return res.status(404).json({ error: 'Không tìm thấy phiếu công việc', id: req.params.id });
      return res.status(200).json(mapTaskRecord(found));
    } catch (err: any) {
      console.error('[TaskController.getTaskById] Lỗi truy vấn:', err);
      return res.status(500).json({ error: 'Không thể lấy chi tiết công việc', message: err.message });
    }
  }

  // POST /api/v1/tasks
  async createTask(req: Request, res: Response) {
    try {
      const created = await prisma.task.create({ data: buildTaskCreateData(req.body), include: TASK_RELATIONS });
      return res.status(201).json(mapTaskRecord(created));
    } catch (err: any) {
      console.error('[TaskController.createTask] Lỗi tạo công việc:', err);
      return res.status(500).json({ error: 'Không thể tạo phiếu công việc', message: err.message });
    }
  }

  // PATCH /api/v1/tasks/:id
  async updateTask(req: Request, res: Response) {
    try {
      const {
        title,
        priority,
        status,
        assignee,
        newAssignee,
        assigneeId,
        progressPercent,
        percent,
        dynamicSteps,
        timeAndCost,
        dueDate,
        newDueDate,
        reworkReason,
      } = req.body;
      const existing = await prisma.task.findUnique({ where: { id: req.params.id } });
      if (!existing) return res.status(404).json({ error: 'Không tìm thấy phiếu công việc' });

      const isAdmin = req.user?.role === 'ADMIN';
      const isAssignee = Boolean(req.user?.userId && existing.assigneeId === req.user.userId);

      // Phân quyền gắt gao theo RBAC: Chỉ Admin hoặc KTV được giao mới có quyền cập nhật tiến độ / SOP
      if (!isAdmin && existing.assigneeId && !isAssignee) {
        return res.status(403).json({
          error: 'Từ chối truy cập: Chỉ Quản trị viên hoặc Kỹ thuật viên được giao việc mới có quyền cập nhật lệnh này.',
        });
      }

      // Bảo vệ kho lịch sử: Task đã hoàn tất chỉ Admin mới có quyền mở lại
      if (existing.status === 'Completed') {
        if (!isAdmin) {
          return res.status(403).json({ error: 'Nhiệm vụ trong kho lịch sử đã đóng, chỉ Quản trị viên mới có quyền mở lại' });
        }
        if (status && status === 'Completed') {
          return res.status(400).json({ error: 'Nhiệm vụ đã hoàn tất trong kho lịch sử, chỉ được phép mở lại' });
        }
      }

      const resolvedProgress = progressPercent ?? percent;
      const resolvedAssignee = assignee ?? newAssignee;
      const resolvedDue = dueDate ?? newDueDate;

      const updated = await prisma.task.update({
        where: { id: req.params.id },
        data: {
          title: title ?? undefined,
          priority: priority ?? undefined,
          status: status ?? undefined,
          assigneeId: assigneeId ?? undefined,
          assigneeName: resolvedAssignee ?? undefined,
          progressPercent: resolvedProgress !== undefined ? Number(resolvedProgress) : undefined,
          reworkReason: reworkReason !== undefined ? reworkReason : undefined,
          dynamicSteps: dynamicSteps ?? undefined,
          timeAndCost: timeAndCost ?? undefined,
          dueDate: resolvedDue ? new Date(resolvedDue) : undefined,
          completedDate: status === 'Completed' ? new Date() : (status === 'In_Progress' ? null : undefined),
        },
        include: TASK_RELATIONS,
      });

      await prisma.auditLog.create({
        data: {
          userId: req.user?.userId || null,
          action: 'TASK_UPDATE',
          targetId: updated.id,
          ipAddress: req.ip,
          diffJson: req.body,
        },
      });

      return res.status(200).json(mapTaskRecord(updated));
    } catch (err: any) {
      console.error('[TaskController.updateTask] Lỗi cập nhật:', err);
      return res.status(500).json({ error: 'Không thể cập nhật công việc', message: err.message });
    }
  }

  // PATCH /api/v1/tasks/:id/status
  async updateTaskStatus(req: Request, res: Response) {
    try {
      const { status, progressPercent, dynamicSteps, timeAndCost, reworkReason } = req.body;
      const existing = await prisma.task.findUnique({ where: { id: req.params.id } });
      if (!existing) return res.status(404).json({ error: 'Không tìm thấy phiếu công việc' });

      const isAdmin = req.user?.role === 'ADMIN';
      const isAssignee = Boolean(req.user?.userId && existing.assigneeId === req.user.userId);
      if (!isAdmin && existing.assigneeId && !isAssignee) {
        return res.status(403).json({
          error: 'Từ chối truy cập: Bạn không phải người được giao việc của lệnh bảo trì này.',
        });
      }

      if (existing.status === 'Completed' && !isAdmin) {
        return res.status(403).json({ error: 'Nhiệm vụ trong kho lịch sử đã đóng, chỉ Quản trị viên mới có quyền mở lại' });
      }

      const updated = await prisma.task.update({
        where: { id: req.params.id },
        data: {
          status,
          progressPercent:
            status === 'Completed'
              ? 100
              : progressPercent !== undefined
              ? Number(progressPercent)
              : undefined,
          reworkReason: reworkReason !== undefined ? reworkReason : undefined,
          dynamicSteps: dynamicSteps ?? undefined,
          timeAndCost: timeAndCost ?? undefined,
          completedDate: status === 'Completed' ? new Date() : (status === 'In_Progress' ? null : undefined),
        },
        include: TASK_RELATIONS,
      });

      // Đồng bộ trạng thái sự cố nếu KTV bắt đầu xử lý
      if (status === 'In_Progress' && existing.incidentId) {
        await prisma.incident.update({
          where: { id: existing.incidentId },
          data: { status: 'IN_PROGRESS' },
        }).catch((err) => console.warn('[TaskController] Không thể đồng bộ trạng thái Incident:', err.message));
      }

      return res.status(200).json({ success: true, task: mapTaskRecord(updated) });
    } catch (err: any) {
      return res.status(500).json({ error: 'Không thể cập nhật trạng thái công việc', message: err.message });
    }
  }

  // POST /api/v1/tasks/:id/worklogs
  async addWorkLog(req: Request, res: Response) {
    try {
      const taskId = req.params.id;
      const { hoursSpent, note, actionsTaken, partsCostVnd, authorName, performerName, author } = req.body;

      const task = await prisma.task.findUnique({ where: { id: taskId }, include: { workLogs: true } });
      if (!task) return res.status(404).json({ error: 'Không tìm thấy phiếu công việc' });
      if (task.status === 'Completed') {
        return res.status(403).json({ error: 'Nhiệm vụ trong kho lịch sử đã đóng, không thể ghi thêm thao tác' });
      }

      const authorId = req.user?.userId || (await prisma.user.findFirst())?.id;
      if (!authorId) return res.status(400).json({ error: 'Không xác định được kỹ thuật viên thực hiện' });

      const parsedHours = Number(hoursSpent) || 0.5;
      const createdLog = await prisma.workLog.create({
        data: {
          taskId,
          authorId,
          authorName: authorName || performerName || author || req.user?.fullName || 'Kỹ thuật viên',
          hoursSpent: parsedHours,
          note: note || actionsTaken || 'Đã kiểm tra và xử lý kỹ thuật',
        },
      });

      const rateConfig = await prisma.costRateConfig.findFirst({ orderBy: { effectiveDate: 'desc' } });
      const nextTimeAndCost = computeUpdatedTaskCost(
        task.timeAndCost,
        task.workLogs,
        parsedHours,
        Number(partsCostVnd) || 0,
        rateConfig?.techHourlyRate ?? 150000
      );

      const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: { timeAndCost: nextTimeAndCost },
        include: TASK_RELATIONS,
      });

      return res.status(201).json({
        success: true,
        workLog: mapWorkLogRecord(createdLog),
        task: mapTaskRecord(updatedTask),
      });
    } catch (err: any) {
      console.error('[TaskController.addWorkLog] Lỗi ghi nhật ký:', err);
      return res.status(500).json({ error: 'Không thể lưu nhật ký sửa chữa', message: err.message });
    }
  }

  // POST /api/v1/tasks/:id/attachments
  async uploadAttachment(req: Request, res: Response) {
    return taskAttachmentController.uploadAttachment(req, res);
  }

  // GET /api/v1/tasks/:id/attachments/:attachmentId/download
  async getAttachmentDownloadUrl(req: Request, res: Response) {
    return taskAttachmentController.getAttachmentDownloadUrl(req, res);
  }
}

export const taskController = new TaskController();

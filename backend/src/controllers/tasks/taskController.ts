/**
 * Backend/src/controllers/tasks/taskController.ts
 *
 * HTTP Controller cho Lệnh Bảo Trì & Sự Cố (Maintenance Tasks CMMS):
 * - Đóng vai trò HTTP Adapter mỏng (< 120 LOC), ủy quyền 100% Business Logic,
 *   Prisma transactions và tính toán chi phí sang `taskService`.
 * - Tuân thủ AGENTS.md Rule 8.1 & Rule 8.3 (< 150 LOC).
 */

import { Request, Response } from 'express';
import { taskService, TaskDomainError } from '../../services/task/taskService';
import { taskAttachmentController } from './taskAttachmentController';

export class TaskController {
  // GET /api/v1/tasks
  async getTasks(req: Request, res: Response) {
    try {
      const tasks = await taskService.listTasks({
        status: req.query.status as string | undefined,
        printerId: req.query.printerId as string | undefined,
        priority: req.query.priority as string | undefined,
        assigneeId: req.query.assigneeId as string | undefined,
      });
      return res.status(200).json(tasks);
    } catch (err: any) {
      console.error('[TaskController.getTasks] Lỗi truy vấn:', err);
      return res.status(500).json({ error: 'Không thể lấy danh sách công việc', message: err.message });
    }
  }

  // GET /api/v1/tasks/:id
  async getTaskById(req: Request, res: Response) {
    try {
      const task = await taskService.getTaskDetail(req.params.id);
      return res.status(200).json(task);
    } catch (err: any) {
      if (err instanceof TaskDomainError) {
        return res.status(err.statusCode).json({ error: err.message, id: req.params.id });
      }
      console.error('[TaskController.getTaskById] Lỗi truy vấn:', err);
      return res.status(500).json({ error: 'Không thể lấy chi tiết công việc', message: err.message });
    }
  }

  // POST /api/v1/tasks
  async createTask(req: Request, res: Response) {
    try {
      const created = await taskService.createTask(req.body);
      return res.status(201).json(created);
    } catch (err: any) {
      console.error('[TaskController.createTask] Lỗi tạo công việc:', err);
      return res.status(500).json({ error: 'Không thể tạo phiếu công việc', message: err.message });
    }
  }

  // PATCH /api/v1/tasks/:id
  async updateTask(req: Request, res: Response) {
    try {
      const updated = await taskService.updateTask(req.params.id, req.body, {
        userId: req.user?.userId,
        fullName: req.user?.fullName,
        role: req.user?.role,
        ipAddress: req.ip,
      });
      return res.status(200).json(updated);
    } catch (err: any) {
      if (err instanceof TaskDomainError) {
        return res.status(err.statusCode).json({ error: err.message });
      }
      console.error('[TaskController.updateTask] Lỗi cập nhật:', err);
      return res.status(500).json({ error: 'Không thể cập nhật công việc', message: err.message });
    }
  }

  // PATCH /api/v1/tasks/:id/status
  async updateTaskStatus(req: Request, res: Response) {
    try {
      const updated = await taskService.updateTaskStatus(req.params.id, req.body, {
        userId: req.user?.userId,
        fullName: req.user?.fullName,
        role: req.user?.role,
      });
      return res.status(200).json({ success: true, task: updated });
    } catch (err: any) {
      if (err instanceof TaskDomainError) {
        return res.status(err.statusCode).json({ error: err.message });
      }
      return res.status(500).json({ error: 'Không thể cập nhật trạng thái công việc', message: err.message });
    }
  }

  // POST /api/v1/tasks/:id/worklogs
  async addWorkLog(req: Request, res: Response) {
    try {
      const result = await taskService.addWorkLog(req.params.id, req.body, {
        userId: req.user?.userId,
        fullName: req.user?.fullName,
        role: req.user?.role,
      });
      return res.status(201).json({
        success: true,
        workLog: result.workLog,
        task: result.task,
      });
    } catch (err: any) {
      if (err instanceof TaskDomainError) {
        return res.status(err.statusCode).json({ error: err.message });
      }
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


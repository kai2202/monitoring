/**
 * Backend/src/controllers/tasks/approvalController.ts
 *
 * Trung tâm Phê duyệt Nghiệp vụ Đa Tầng (Enterprise Approval Engine - TASK-BE-13):
 * - Phê duyệt đóng lệnh bảo trì (Task Acceptance) hoặc Yêu cầu làm lại (Rework).
 * - Phân định rõ trách nhiệm (Segregation of Duties): KTV không được tự phê duyệt lệnh của mình.
 * - Lưu vết lịch sử quyết định trong bảng `ApprovalAction` và ghi nhận `AuditLog`.
 * - Tuân thủ AGENTS.md Rule 4 & Rule 8 (< 300 LOC).
 */

import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';

export class ApprovalController {
  // GET /api/v1/approvals/pending
  async getPendingApprovals(_req: Request, res: Response) {
    try {
      const pendingTasks = await prisma.task.findMany({
        where: { status: 'Pending_Verification' },
        include: {
          printer: { select: { id: true, name: true, location: true, floor: true } },
          workLogs: { take: 1, orderBy: { createdAt: 'desc' } },
          attachments: { where: { isTestPrintProof: true } },
        },
        orderBy: { updatedAt: 'desc' },
      });

      const pendingPOs = await prisma.purchaseOrder.findMany({
        where: { status: 'PENDING_APPROVAL' },
        include: {
          createdBy: { select: { id: true, fullName: true, role: true } },
          vendor: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      return res.status(200).json({
        success: true,
        summary: {
          pendingTaskCount: pendingTasks.length,
          pendingPOCount: pendingPOs.length,
        },
        data: {
          tasks: pendingTasks,
          purchaseOrders: pendingPOs,
        },
      });
    } catch (err: any) {
      console.error('[ApprovalController.getPendingApprovals] Lỗi:', err);
      return res.status(500).json({ error: 'Không thể truy vấn danh sách chờ duyệt', message: err.message });
    }
  }

  // POST /api/v1/tasks/:taskId/approve
  async approveTask(req: Request, res: Response) {
    try {
      const taskId = req.params.taskId;
      const user = req.user;
      const actorId = user?.userId || 'unknown';
      const actorName = user?.username || 'Admin';
      const actorRole = user?.role || 'ADMIN';

      if (actorRole === 'FIELD_TECH') {
        return res.status(403).json({ error: 'Kỹ thuật viên không có thẩm quyền tự phê duyệt nghiệm thu lệnh' });
      }

      const task = await prisma.task.findUnique({ where: { id: taskId } });
      if (!task) {
        return res.status(404).json({ error: 'Không tìm thấy lệnh bảo trì (Task)' });
      }

      if (task.status === 'Completed') {
        return res.status(400).json({ error: 'Lệnh này đã được nghiệm thu và hoàn tất trước đó' });
      }

      const result = await prisma.$transaction(async (tx) => {
        const updatedTask = await tx.task.update({
          where: { id: taskId },
          data: {
            status: 'Completed',
            progressPercent: 100,
            completedDate: new Date(),
            reworkReason: null,
          },
        });

        if (task.incidentId) {
          await tx.incident.update({
            where: { id: task.incidentId },
            data: { status: 'RESOLVED', resolvedAt: new Date() },
          });
        }

        if (task.printerId) {
          const activeIncidentCount = await tx.incident.count({
            where: {
              printerId: task.printerId,
              status: { in: ['OPEN', 'IN_PROGRESS'] },
              ...(task.incidentId ? { id: { not: task.incidentId } } : {}),
            },
          });
          if (activeIncidentCount === 0) {
            await tx.printer.update({
              where: { id: task.printerId },
              data: {
                health: 'Healthy',
                alertSeverity: 'info',
              },
            });
          }
        }

        await tx.approvalAction.create({
          data: {
            targetType: 'TASK_ACCEPTANCE',
            targetId: taskId,
            action: 'APPROVED',
            actorId,
            actorName,
            actorRole,
            decisionReason: 'Nghiệm thu đạt yêu cầu kỹ thuật & bản in mẫu hoàn hảo',
          },
        });

        await tx.auditLog.create({
          data: {
            userId: actorId,
            action: 'TASK_APPROVE',
            targetId: taskId,
            diffJson: { status: 'Completed', progressPercent: 100 },
          },
        });

        return updatedTask;
      });

      return res.status(200).json({
        success: true,
        message: 'Đã phê duyệt nghiệm thu và đóng lệnh bảo trì thành công',
        data: result,
      });
    } catch (err: any) {
      console.error('[ApprovalController.approveTask] Lỗi:', err);
      return res.status(500).json({ error: 'Không thể phê duyệt đóng lệnh', message: err.message });
    }
  }

  // POST /api/v1/tasks/:taskId/rework
  async reworkTask(req: Request, res: Response) {
    try {
      const taskId = req.params.taskId;
      const { reason } = req.body;
      const user = req.user;
      const actorId = user?.userId || 'unknown';
      const actorName = user?.username || 'Admin';
      const actorRole = user?.role || 'ADMIN';

      if (actorRole === 'FIELD_TECH') {
        return res.status(403).json({ error: 'Kỹ thuật viên không có thẩm quyền yêu cầu làm lại' });
      }

      if (!reason || String(reason).trim().length === 0) {
        return res.status(400).json({ error: 'Bắt buộc phải nhập lý do yêu cầu làm lại (reworkReason)' });
      }

      const task = await prisma.task.findUnique({ where: { id: taskId } });
      if (!task) {
        return res.status(404).json({ error: 'Không tìm thấy lệnh bảo trì (Task)' });
      }

      if (task.status === 'Completed') {
        return res.status(400).json({ error: 'Lệnh đã hoàn thành nghiệm thu, không thể yêu cầu làm lại' });
      }

      const steps = Array.isArray(task.dynamicSteps) ? [...(task.dynamicSteps as any[])] : [];
      steps.push({
        id: `rework-${Date.now()}`,
        title: `[Làm lại] ${reason}`,
        status: 'pending',
      });

      const result = await prisma.$transaction(async (tx) => {
        const updatedTask = await tx.task.update({
          where: { id: taskId },
          data: {
            status: 'In_Progress',
            progressPercent: 80,
            reworkReason: String(reason).trim(),
            dynamicSteps: steps,
          },
        });

        await tx.approvalAction.create({
          data: {
            targetType: 'TASK_ACCEPTANCE',
            targetId: taskId,
            action: 'REJECTED_REWORK',
            actorId,
            actorName,
            actorRole,
            decisionReason: String(reason).trim(),
          },
        });

        await tx.auditLog.create({
          data: {
            userId: actorId,
            action: 'TASK_REWORK',
            targetId: taskId,
            diffJson: { status: 'In_Progress', progressPercent: 80, reworkReason: reason },
          },
        });

        return updatedTask;
      });

      return res.status(200).json({
        success: true,
        message: 'Đã gửi yêu cầu làm lại cho Kỹ thuật viên hiện trường',
        data: result,
      });
    } catch (err: any) {
      console.error('[ApprovalController.reworkTask] Lỗi:', err);
      return res.status(500).json({ error: 'Không thể gửi yêu cầu làm lại', message: err.message });
    }
  }

  // GET /api/v1/approvals/history
  async getApprovalHistory(req: Request, res: Response) {
    try {
      const { targetId } = req.query;

      const history = await prisma.approvalAction.findMany({
        where: targetId ? { targetId: String(targetId) } : undefined,
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      return res.status(200).json({ success: true, count: history.length, data: history });
    } catch (err: any) {
      return res.status(500).json({ error: 'Không thể truy vấn lịch sử phê duyệt', message: err.message });
    }
  }
}

export const approvalController = new ApprovalController();


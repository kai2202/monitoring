/**
 * Backend/src/services/task/taskService.ts
 *
 * Domain Service cho Lệnh Bảo Trì & Sửa Chữa (Task CMMS & WorkLog Engine):
 * - Gói gọn toàn bộ Prisma queries, RBAC ownership verification, đồng bộ trạng thái Incident,
 *   và tính toán thời gian sửa chữa thực tế (MTTR) / chi phí VNĐ từ CostRateConfig.
 * - Tách bạch hoàn toàn Business Logic khỏi HTTP Controller theo chuẩn Clean 4-Layer (AGENTS.md Rule 8).
 * - Tuân thủ AGENTS.md Rule 5 & Rule 7.1 (< 300 LOC).
 */

import { prisma } from '../../lib/prisma';
import {
  TASK_RELATIONS,
  buildTaskCreateData,
  computeUpdatedTaskCost,
  mapTaskRecord,
  mapWorkLogRecord,
} from '../../utils/taskMapper';

export interface TaskQueryFilter {
  status?: string;
  printerId?: string;
  priority?: string;
  assigneeId?: string;
}

export interface TaskActorContext {
  userId?: string;
  fullName?: string;
  role?: string;
  ipAddress?: string;
}

export class TaskDomainError extends Error {
  public readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, TaskDomainError.prototype);
  }
}

export class TaskService {
  async listTasks(filters: TaskQueryFilter) {
    const where: Record<string, unknown> = {};
    if (filters.status && filters.status !== 'all') where.status = filters.status;
    if (filters.printerId && filters.printerId !== 'all') where.printerId = String(filters.printerId);
    if (filters.priority && filters.priority !== 'all') where.priority = filters.priority;
    if (filters.assigneeId && filters.assigneeId !== 'all') where.assigneeId = String(filters.assigneeId);

    const dbTasks = await prisma.task.findMany({
      where,
      include: TASK_RELATIONS,
      orderBy: { createdAt: 'desc' },
    });
    return dbTasks.map(mapTaskRecord);
  }

  async getTaskDetail(taskId: string) {
    const found = await prisma.task.findUnique({
      where: { id: taskId },
      include: { ...TASK_RELATIONS, incident: true },
    });
    if (!found) {
      throw new TaskDomainError(404, 'Không tìm thấy phiếu công việc');
    }
    return mapTaskRecord(found);
  }

  async createTask(payload: Record<string, unknown>) {
    const created = await prisma.task.create({
      data: buildTaskCreateData(payload),
      include: TASK_RELATIONS,
    });
    return mapTaskRecord(created);
  }

  private verifyTaskMutationAccess(existing: { assigneeId: string | null; status: string }, actor: TaskActorContext, targetStatus?: string) {
    const isAdmin = actor.role === 'ADMIN';
    const isAssignee = Boolean(actor.userId && existing.assigneeId === actor.userId);

    if (!isAdmin && existing.assigneeId && !isAssignee) {
      throw new TaskDomainError(
        403,
        'Từ chối truy cập: Chỉ Quản trị viên hoặc Kỹ thuật viên được giao việc mới có quyền cập nhật lệnh này.'
      );
    }

    if (existing.status === 'Completed') {
      if (!isAdmin) {
        throw new TaskDomainError(
          403,
          'Nhiệm vụ trong kho lịch sử đã đóng, chỉ Quản trị viên mới có quyền mở lại'
        );
      }
      if (targetStatus === 'Completed') {
        throw new TaskDomainError(
          400,
          'Nhiệm vụ đã hoàn tất trong kho lịch sử, chỉ được phép mở lại'
        );
      }
    }
  }

  async updateTask(taskId: string, body: Record<string, any>, actor: TaskActorContext) {
    const existing = await prisma.task.findUnique({ where: { id: taskId } });
    if (!existing) {
      throw new TaskDomainError(404, 'Không tìm thấy phiếu công việc');
    }

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
    } = body;

    this.verifyTaskMutationAccess(existing, actor, status);

    const resolvedProgress = progressPercent ?? percent;
    const resolvedAssignee = assignee ?? newAssignee;
    const resolvedDue = dueDate ?? newDueDate;

    const updated = await prisma.task.update({
      where: { id: taskId },
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
        completedDate:
          status === 'Completed' ? new Date() : status === 'In_Progress' ? null : undefined,
      },
      include: TASK_RELATIONS,
    });

    await prisma.auditLog.create({
      data: {
        userId: actor.userId || null,
        action: 'TASK_UPDATE',
        targetId: updated.id,
        ipAddress: actor.ipAddress,
        diffJson: body,
      },
    });

    return mapTaskRecord(updated);
  }

  async updateTaskStatus(taskId: string, body: Record<string, any>, actor: TaskActorContext) {
    const { status, progressPercent, dynamicSteps, timeAndCost, reworkReason } = body;
    const existing = await prisma.task.findUnique({ where: { id: taskId } });
    if (!existing) {
      throw new TaskDomainError(404, 'Không tìm thấy phiếu công việc');
    }

    this.verifyTaskMutationAccess(existing, actor);

    const updated = await prisma.task.update({
      where: { id: taskId },
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
        completedDate:
          status === 'Completed' ? new Date() : status === 'In_Progress' ? null : undefined,
      },
      include: TASK_RELATIONS,
    });

    // Đồng bộ trạng thái sự cố sang IN_PROGRESS nếu KTV bắt đầu thực thi
    if (status === 'In_Progress' && existing.incidentId) {
      await prisma.incident
        .update({
          where: { id: existing.incidentId },
          data: { status: 'IN_PROGRESS' },
        })
        .catch((err) =>
          console.warn('[TaskService] Không thể đồng bộ trạng thái Incident:', err.message)
        );
    }

    return mapTaskRecord(updated);
  }

  async addWorkLog(taskId: string, body: Record<string, any>, actor: TaskActorContext) {
    const { hoursSpent, note, actionsTaken, partsCostVnd, authorName, performerName, author } = body;

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { workLogs: true },
    });
    if (!task) {
      throw new TaskDomainError(404, 'Không tìm thấy phiếu công việc');
    }
    if (task.status === 'Completed') {
      throw new TaskDomainError(
        403,
        'Nhiệm vụ trong kho lịch sử đã đóng, không thể ghi thêm thao tác'
      );
    }

    const authorId = actor.userId || (await prisma.user.findFirst())?.id;
    if (!authorId) {
      throw new TaskDomainError(400, 'Không xác định được kỹ thuật viên thực hiện');
    }

    const parsedHours = Number(hoursSpent) || 0.5;
    const createdLog = await prisma.workLog.create({
      data: {
        taskId,
        authorId,
        authorName:
          authorName || performerName || author || actor.fullName || 'Kỹ thuật viên',
        hoursSpent: parsedHours,
        note: note || actionsTaken || 'Đã kiểm tra và xử lý kỹ thuật',
      },
    });

    const rateConfig = await prisma.costRateConfig.findFirst({
      orderBy: { effectiveDate: 'desc' },
    });
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

    return {
      workLog: mapWorkLogRecord(createdLog),
      task: mapTaskRecord(updatedTask),
    };
  }
}

export const taskService = new TaskService();


/**
 * Backend/src/services/task/taskDossierService.ts
 *
 * Domain Service xử lý Chuỗi Phối Hợp Gmail & Thẩm Định Chốt Hồ Sơ Tài Sản HR:
 * - Tiếp nhận ý kiến đóng góp & tệp đính kèm đa bên (TaskContribution).
 * - HR thẩm định và Chốt Lưu Hồ Sơ Tài Sản (archiveDossier):
 *   + Yêu cầu bắt buộc có ít nhất 1 chứng từ đính kèm.
 *   + Ghi nhận đồng thời vào PrinterHistoryLog (máy in) và AuditLog (hệ thống).
 * - Tuân thủ AGENTS.md Rule 4, Rule 8 & Rule 7.1 (< 300 LOC).
 */

import { prisma } from '../../lib/prisma';
import { TASK_RELATIONS, mapTaskRecord } from '../../utils/taskMapper';
import { TaskActorContext, TaskDomainError } from './taskService';

export interface AddContributionDto {
  authorName?: string;
  authorRole?: string;
  content: string;
  storageKey?: string;
  attachedFileName?: string;
  fileSize?: number;
  mimeType?: string;
  sha256Hash?: string;
}

export interface ArchiveDossierDto {
  hrReviewNotes?: string;
  totalCostVnd?: number;
}

export class TaskDossierService {
  async addContribution(taskId: string, dto: AddContributionDto, actor: TaskActorContext) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { contributions: true },
    });

    if (!task) {
      throw new TaskDomainError(404, 'Không tìm thấy phiếu công việc');
    }
    if (task.dossierStatus === 'DOSSIER_ARCHIVED') {
      throw new TaskDomainError(403, 'Hồ sơ tài sản của nhiệm vụ này đã đóng và khóa lưu trữ');
    }

    const contribution = await prisma.taskContribution.create({
      data: {
        taskId,
        authorName: dto.authorName || actor.fullName || 'Cộng tác viên',
        authorRole: dto.authorRole || actor.role || 'FIELD_TECH',
        content: dto.content.trim(),
        storageKey: dto.storageKey || null,
        attachedFileName: dto.attachedFileName || null,
        fileSize: dto.fileSize || null,
        mimeType: dto.mimeType || null,
        sha256Hash: dto.sha256Hash || null,
      },
    });

    // Cập nhật trạng thái chờ HR duyệt nếu đã có nội dung hoàn tất
    const nextDossierStatus =
      task.dossierStatus === 'PENDING_DOCUMENTATION' && dto.storageKey
        ? 'PENDING_HR_REVIEW'
        : task.dossierStatus;

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { dossierStatus: nextDossierStatus },
      include: TASK_RELATIONS,
    });

    return {
      contribution,
      task: mapTaskRecord(updatedTask),
    };
  }

  async archiveDossier(taskId: string, dto: ArchiveDossierDto, actor: TaskActorContext) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        contributions: true,
        attachments: true,
        printer: true,
      },
    });

    if (!task) {
      throw new TaskDomainError(404, 'Không tìm thấy phiếu công việc');
    }
    if (task.dossierStatus === 'DOSSIER_ARCHIVED') {
      throw new TaskDomainError(400, 'Hồ sơ tài sản này đã được chốt lưu trữ trước đó');
    }

    // Kiểm tra tính toàn vẹn: Bắt buộc có ít nhất 1 file tài liệu/biên bản hợp lệ
    const hasAttachments =
      task.attachments.length > 0 ||
      task.contributions.some((c) => c.storageKey != null);

    if (!hasAttachments) {
      throw new TaskDomainError(
        400,
        'Không thể chốt hồ sơ: Yêu cầu bắt buộc phải có ít nhất 1 tệp tin biên bản kỹ thuật hoặc hóa đơn/chứng từ hợp lệ'
      );
    }

    const calculatedCost =
      dto.totalCostVnd ??
      task.totalCostVnd ??
      (task.timeAndCost as any)?.totalCostVnd ??
      null;

    const now = new Date();

    // Cập nhật trạng thái Task sang Hoàn tất & Chốt Lưu Hồ Sơ
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        status: 'Completed',
        dossierStatus: 'DOSSIER_ARCHIVED',
        hrReviewNotes: dto.hrReviewNotes?.trim() || 'Hồ sơ đã được HR/Tổng vụ thẩm định và chốt lưu',
        totalCostVnd: calculatedCost,
        archivedAt: now,
        completedDate: now,
      },
      include: TASK_RELATIONS,
    });

    // 1. Ghi vết vào Kho Lịch Sử Riêng của Máy In (PrinterHistoryLog)
    await prisma.printerHistoryLog.create({
      data: {
        printerId: task.printerId,
        actionType: 'TASK_DOSSIER_ARCHIVED',
        previousData: { taskId: task.id, status: task.status, dossierStatus: task.dossierStatus },
        newData: {
          taskId: task.id,
          title: task.title,
          totalCostVnd: calculatedCost,
          archivedAt: now.toISOString(),
          hrNotes: dto.hrReviewNotes || null,
        },
        performedBy: actor.fullName || actor.userId || 'Asset HR',
        notes: `Chốt lưu hồ sơ tài sản nhiệm vụ [${task.id}] - ${task.title}`,
      },
    });

    // 2. Ghi nhật ký tập trung toàn hệ thống (AuditLog)
    await prisma.auditLog.create({
      data: {
        userId: actor.userId || null,
        action: 'TASK_DOSSIER_ARCHIVE',
        targetId: task.id,
        ipAddress: actor.ipAddress || null,
        diffJson: {
          taskId: task.id,
          printerId: task.printerId,
          totalCostVnd: calculatedCost,
          archivedAt: now.toISOString(),
        },
      },
    });

    return mapTaskRecord(updatedTask);
  }
}

export const taskDossierService = new TaskDossierService();


/**
 * Backend/src/controllers/taskAttachmentController.ts
 *
 * Controller xử lý tải lên & cấp phát liên kết tải tệp đính kèm / ảnh nghiệm thu MinIO S3:
 * - Tách riêng từ TaskController để tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { storageService } from '../services/storage/minioClient';
import { mapAttachmentRecord } from '../utils/taskMapper';

export class TaskAttachmentController {
  // POST /api/v1/tasks/:id/attachments
  async uploadAttachment(req: Request, res: Response) {
    try {
      const taskId = req.params.id;
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: 'Vui lòng chọn tệp đính kèm hợp lệ (<= 10MB)' });
      }

      const taskExists = await prisma.task.findUnique({
        where: { id: taskId },
        select: { id: true, assigneeId: true },
      });
      if (!taskExists) {
        return res.status(404).json({ error: 'Không tìm thấy lệnh bảo trì tương ứng.' });
      }

      const isAdmin = req.user?.role === 'ADMIN';
      const isAssignee = Boolean(req.user?.userId && taskExists.assigneeId === req.user.userId);
      if (!isAdmin && taskExists.assigneeId && !isAssignee) {
        return res.status(403).json({
          error: 'Từ chối truy cập: Chỉ Quản trị viên hoặc KTV được giao việc mới có quyền nạp ảnh nghiệm thu.',
        });
      }

      const uploaderId = req.user?.userId || (await prisma.user.findFirst())?.id;
      if (!uploaderId) {
        return res.status(401).json({ error: 'Chưa xác thực người tải lên.' });
      }

      const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
      const objectKey = `tasks/${taskId}/${Date.now()}_${sanitizedName}`;
      await storageService.uploadBuffer(file.buffer, objectKey, file.mimetype);
      const fileUrl = await storageService.getPresignedUrl(objectKey, 15 * 60);

      const isImageProof =
        req.body?.isTestPrintProof === 'true' || file.mimetype.toLowerCase().startsWith('image/');

      const attachment = await prisma.taskAttachment.create({
        data: {
          taskId,
          fileName: file.originalname,
          fileUrl,
          fileType: file.mimetype,
          fileSize: file.size,
          minioObjectKey: objectKey,
          isTestPrintProof: isImageProof,
          uploadedById: uploaderId,
        },
        include: { uploadedBy: { select: { fullName: true } } },
      });

      return res.status(201).json({
        success: true,
        data: mapAttachmentRecord(attachment, req.user?.fullName),
      });
    } catch (err: any) {
      console.error('[TaskAttachmentController.uploadAttachment] Lỗi tải tệp:', err);
      return res.status(502).json({
        error: err?.message || 'Không thể tải lên tệp đính kèm vào MinIO S3',
      });
    }
  }

  // GET /api/v1/tasks/:id/attachments/:attachmentId/download
  async getAttachmentDownloadUrl(req: Request, res: Response) {
    try {
      const { id: taskId, attachmentId } = req.params;
      const found = await prisma.taskAttachment.findFirst({
        where: { id: attachmentId, taskId },
      });

      if (!found) {
        return res.status(404).json({ error: 'Không tìm thấy tệp đính kèm yêu cầu.' });
      }

      const freshUrl = await storageService.getPresignedUrl(found.minioObjectKey, 15 * 60);
      return res.status(200).json({
        success: true,
        data: {
          downloadUrl: freshUrl,
          fileName: found.fileName,
        },
      });
    } catch (err: any) {
      console.error('[TaskAttachmentController.getAttachmentDownloadUrl] Lỗi tạo link tải:', err);
      return res.status(502).json({
        error: err?.message || 'Không thể sinh liên kết tải tệp từ MinIO S3',
      });
    }
  }
}

export const taskAttachmentController = new TaskAttachmentController();


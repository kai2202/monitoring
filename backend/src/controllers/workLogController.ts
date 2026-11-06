/**
 * Backend/src/controllers/workLogController.ts
 *
 * Controller xử lý Nhật Ký Bảo Trì Thực Địa & Tệp Đính Kèm MinIO (TASK-BE-03):
 * - Tích hợp 100% Prisma ORM kết nối bảng WorkLog, Task và CostRateConfig.
 * - Hạch toán chi phí linh kiện & nhân công: totalCostVnd = partsCostVnd + laborCostVnd.
 * - Sinh Presigned URLs 15 phút tải file lên MinIO S3 an toàn.
 * - Tuân thủ AGENTS.md Rule 6 & Rule 7.1 (< 300 LOC).
 */

import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { minioService, DEFAULT_ATTACHMENT_BUCKET } from '../services/minioClient';
import { createWorkLogSchema } from '../validators/apiValidators';

export class WorkLogController {
  // GET /api/v1/tasks/:id/worklogs
  async getWorkLogsByTaskId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const logs = await prisma.workLog.findMany({
        where: { taskId: id },
        orderBy: { createdAt: 'desc' },
      });
      return res.status(200).json(logs);
    } catch (err: any) {
      return res.status(500).json({ error: 'Không thể lấy nhật ký sửa chữa', message: err.message });
    }
  }

  // POST /api/v1/tasks/:id/worklogs
  async createWorkLog(req: Request, res: Response) {
    try {
      const { id: taskId } = req.params;
      const parsed = createWorkLogSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0]?.message || 'Dữ liệu nhật ký không hợp lệ' });
      }

      const {
        technicianName,
        authorName,
        workPerformed,
        note,
        hoursSpent,
        partsCostVnd = 0,
        laborCostVnd,
      } = parsed.data;

      const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: { workLogs: true },
      });
      if (!task) {
        return res.status(404).json({ error: 'Không tìm thấy phiếu công việc' });
      }

      const authorId = req.user?.userId || (await prisma.user.findFirst())?.id;
      if (!authorId) {
        return res.status(400).json({ error: 'Không xác định được kỹ thuật viên thực hiện' });
      }

      const rateConfig = await prisma.costRateConfig.findFirst({ orderBy: { effectiveDate: 'desc' } });
      const hourlyRate = rateConfig?.techHourlyRate ?? 150000;
      const resolvedHours = hoursSpent ?? (laborCostVnd ? Number((laborCostVnd / hourlyRate).toFixed(2)) : 1.0);

      const created = await prisma.workLog.create({
        data: {
          taskId,
          authorId,
          authorName: authorName || technicianName || req.user?.fullName || 'Kỹ thuật viên',
          hoursSpent: resolvedHours,
          note: note || workPerformed || 'Bảo trì linh kiện theo SOP',
        },
      });

      const totalHours = task.workLogs.reduce((acc, w) => acc + w.hoursSpent, 0) + resolvedHours;
      const prevCost: any = task.timeAndCost || {};
      const newPartsCost = (Number(prevCost.partsCostVnd) || 0) + Number(partsCostVnd);
      const newLaborCost = laborCostVnd !== undefined ? Number(laborCostVnd) : Math.round(totalHours * hourlyRate);

      await prisma.task.update({
        where: { id: taskId },
        data: {
          timeAndCost: {
            repairTimeHours: Number(totalHours.toFixed(2)),
            waitingTimeHours: prevCost.waitingTimeHours ?? null,
            downtimeHours: prevCost.downtimeHours ?? Number(totalHours.toFixed(2)),
            laborCostVnd: newLaborCost,
            partsCostVnd: newPartsCost,
            totalCostVnd: newLaborCost + newPartsCost,
          },
        },
      });

      return res.status(201).json(created);
    } catch (err: any) {
      return res.status(500).json({ error: 'Không thể lưu nhật ký sửa chữa', message: err.message });
    }
  }

  // POST /api/v1/worklogs/:id/presigned-upload
  async generatePresignedUploadUrl(req: Request, res: Response) {
    try {
      const { id: workLogId } = req.params;
      const { fileName } = req.body;
      const cleanFileName = fileName || 'attachment.jpg';
      const objectKey = `worklogs/${workLogId}/${Date.now()}_${cleanFileName}`;

      const uploadUrl = await minioService.getPresignedUploadUrl(objectKey, DEFAULT_ATTACHMENT_BUCKET, 15 * 60);

      return res.status(200).json({
        uploadUrl,
        objectKey,
        bucket: DEFAULT_ATTACHMENT_BUCKET,
        expiresInSeconds: 900,
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Không thể sinh Presigned Upload URL', message: err.message });
    }
  }

  // GET /api/v1/worklogs/:id/attachments/:objectKey/download
  async generatePresignedDownloadUrl(req: Request, res: Response) {
    try {
      const { objectKey } = req.params;
      const downloadUrl = await minioService.getPresignedDownloadUrl(objectKey, DEFAULT_ATTACHMENT_BUCKET, 15 * 60);
      return res.status(200).json({ downloadUrl });
    } catch (err: any) {
      return res.status(500).json({ error: 'Không thể sinh Presigned Download URL', message: err.message });
    }
  }
}

export const workLogController = new WorkLogController();

/**
 * Backend/src/routes/workLogRoutes.ts
 *
 * Định tuyến REST API cho Nhật Ký Bảo Trì & MinIO Presigned URLs (TASK-BE-03):
 * - Bắt buộc xác thực JWT (`authenticateToken`) và phân quyền thao tác kỹ thuật.
 * - Tuân thủ AGENTS.md Rule 4 & Rule 7.1 (< 300 LOC).
 */

import { Router } from 'express';
import { workLogController } from '../controllers/workLogController';
import { authenticateToken, requireRoles } from '../middlewares/authMiddleware';

export const workLogRouter = Router();

workLogRouter.use(authenticateToken);

workLogRouter.get('/tasks/:id/worklogs', (req, res) => workLogController.getWorkLogsByTaskId(req, res));
workLogRouter.post('/tasks/:id/worklogs', requireRoles(['ADMIN', 'FIELD_TECH']), (req, res) =>
  workLogController.createWorkLog(req, res)
);
workLogRouter.post('/worklogs/:id/presigned-upload', requireRoles(['ADMIN', 'FIELD_TECH']), (req, res) =>
  workLogController.generatePresignedUploadUrl(req, res)
);
workLogRouter.get('/worklogs/:id/attachments/:objectKey/download', (req, res) =>
  workLogController.generatePresignedDownloadUrl(req, res)
);

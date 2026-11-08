/**
 * Backend/src/routes/taskRoutes.ts
 *
 * Định tuyến REST API cho Lệnh Bảo Trì (Tasks CMMS API):
 * - Bắt buộc `authenticateToken` trước `sanitizeCostData` để tự động che chi phí tài chính đối với FIELD_TECH.
 * - Hỗ trợ GET /, POST /, PATCH /:id, POST /:id/worklogs, POST /:id/attachments, tải Presigned URL,
 *   và endpoint phê duyệt / yêu cầu làm lại (POST /:taskId/approve, POST /:taskId/rework).
 * - Tuân thủ AGENTS.md Rule 4 & Rule 7.1 (< 300 LOC).
 */

import { Router } from 'express';
import { taskController } from '../controllers/taskController';
import { approvalController } from '../controllers/approvalController';
import { handleAttachmentUpload } from '../middlewares/uploadMiddleware';
import { authenticateToken, requireRoles, sanitizeCostData } from '../middlewares/authMiddleware';

export const taskRouter = Router();

taskRouter.use(authenticateToken);
taskRouter.use(sanitizeCostData);

taskRouter.get('/', (req, res) => taskController.getTasks(req, res));
taskRouter.get('/:id', (req, res) => taskController.getTaskById(req, res));
taskRouter.post('/', requireRoles(['ADMIN', 'FIELD_TECH']), (req, res) => taskController.createTask(req, res));
taskRouter.patch('/:id', requireRoles(['ADMIN', 'FIELD_TECH']), (req, res) => taskController.updateTask(req, res));
taskRouter.patch('/:id/status', requireRoles(['ADMIN', 'FIELD_TECH']), (req, res) =>
  taskController.updateTaskStatus(req, res)
);
taskRouter.patch('/:id/reassign', requireRoles(['ADMIN']), (req, res) => taskController.updateTask(req, res));
taskRouter.patch('/:id/reschedule', requireRoles(['ADMIN', 'FIELD_TECH']), (req, res) =>
  taskController.updateTask(req, res)
);
taskRouter.patch('/:id/progress', requireRoles(['ADMIN', 'FIELD_TECH']), (req, res) =>
  taskController.updateTask(req, res)
);
taskRouter.post('/:id/worklogs', requireRoles(['ADMIN', 'FIELD_TECH']), (req, res) =>
  taskController.addWorkLog(req, res)
);
taskRouter.post('/:id/notes', requireRoles(['ADMIN', 'FIELD_TECH']), (req, res) =>
  taskController.addWorkLog(req, res)
);
taskRouter.post('/:id/attachments', requireRoles(['ADMIN', 'FIELD_TECH']), handleAttachmentUpload, (req, res) =>
  taskController.uploadAttachment(req, res)
);
taskRouter.get('/:id/attachments/:attachmentId/download', (req, res) =>
  taskController.getAttachmentDownloadUrl(req, res)
);

// Endpoints phê duyệt đóng lệnh & yêu cầu làm lại (hỗ trợ gọi trực tiếp qua /tasks/:taskId/...)
taskRouter.post('/:taskId/approve', requireRoles(['ADMIN', 'ASSET_HR']), (req, res) =>
  approvalController.approveTask(req, res)
);
taskRouter.post('/:taskId/rework', requireRoles(['ADMIN', 'ASSET_HR']), (req, res) =>
  approvalController.reworkTask(req, res)
);

export default taskRouter;

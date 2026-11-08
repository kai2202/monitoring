/**
 * Backend/src/routes/taskRoutes.ts
 *
 * Định tuyến REST API cho Miền Lệnh Bảo Trì & Trung Tâm Phê Duyệt Nghiệm Thu (Tasks & Approvals Domain):
 * - `taskRouter`: Vòng đời phiếu bảo trì CMMS, phân công KTV, worklogs, đính kèm tệp (/tasks).
 * - `approvalRouter`: Hàng đợi chờ duyệt nghiệm thu, lịch sử phê duyệt, phê duyệt đóng lệnh, yêu cầu làm lại (/approvals).
 * Tuân thủ AGENTS.md Rule 4 & Rule 7.1 (< 300 LOC).
 */

import { Router } from 'express';
import { taskController } from '../controllers/tasks/taskController';
import { approvalController } from '../controllers/tasks/approvalController';
import { handleAttachmentUpload } from '../middlewares/uploadMiddleware';
import { authenticateToken, requireRoles, sanitizeCostData } from '../middlewares/authMiddleware';

// ==========================================
// 1. Tasks Router (/tasks)
// ==========================================
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

// Endpoints phê duyệt đóng lệnh & yêu cầu làm lại (gọi trực tiếp qua /tasks/:taskId/...)
taskRouter.post('/:taskId/approve', requireRoles(['ADMIN', 'ASSET_HR']), (req, res) =>
  approvalController.approveTask(req, res)
);
taskRouter.post('/:taskId/rework', requireRoles(['ADMIN', 'ASSET_HR']), (req, res) =>
  approvalController.reworkTask(req, res)
);

// ==========================================
// 2. Approvals Center Router (/approvals)
// ==========================================
export const approvalRouter = Router();

approvalRouter.use(authenticateToken);

// Danh sách các mục đang chờ phê duyệt (ADMIN & ASSET_HR)
approvalRouter.get('/pending', requireRoles(['ADMIN', 'ASSET_HR']), (req, res) =>
  approvalController.getPendingApprovals(req, res)
);

// Lịch sử phê duyệt kiểm toán
approvalRouter.get('/history', requireRoles(['ADMIN', 'ASSET_HR']), (req, res) =>
  approvalController.getApprovalHistory(req, res)
);

// Phê duyệt nghiệm thu đóng lệnh hoặc Yêu cầu làm lại qua /approvals/tasks/...
approvalRouter.post('/tasks/:taskId/approve', requireRoles(['ADMIN', 'ASSET_HR']), (req, res) =>
  approvalController.approveTask(req, res)
);
approvalRouter.post('/tasks/:taskId/rework', requireRoles(['ADMIN', 'ASSET_HR']), (req, res) =>
  approvalController.reworkTask(req, res)
);

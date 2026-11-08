/**
 * Backend/src/routes/approvalRoutes.ts
 *
 * Định tuyến REST API cho Trung tâm Phê duyệt Nghiệp vụ Đa Tầng (TASK-BE-13):
 * - ADMIN và ASSET_HR có quyền phê duyệt đóng lệnh nghiệm thu hoặc yêu cầu làm lại.
 * - Tuân thủ AGENTS.md Rule 4 & Rule 7.1 (< 300 LOC).
 */

import { Router } from 'express';
import { approvalController } from '../controllers/approvalController';
import { authenticateToken, requireRoles } from '../middlewares/authMiddleware';

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

// Phê duyệt nghiệm thu đóng lệnh hoặc Yêu cầu làm lại (Chỉ ADMIN & ASSET_HR)
approvalRouter.post('/tasks/:taskId/approve', requireRoles(['ADMIN', 'ASSET_HR']), (req, res) =>
  approvalController.approveTask(req, res)
);
approvalRouter.post('/tasks/:taskId/rework', requireRoles(['ADMIN', 'ASSET_HR']), (req, res) =>
  approvalController.reworkTask(req, res)
);


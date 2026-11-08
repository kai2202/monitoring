/**
 * Backend/src/routes/vendorRoutes.ts
 *
 * Định tuyến REST API cho Quản trị Nhà cung cấp & Nhật ký hãng (TASK-BE-11):
 * - KTV được phép ghi nhật ký trao đổi hỗ trợ kỹ thuật trong Task.
 * - ADMIN và ASSET_HR có toàn quyền quản trị danh mục đối tác hãng.
 * - Tuân thủ AGENTS.md Rule 4 & Rule 7.1 (< 300 LOC).
 */

import { Router } from 'express';
import { vendorController } from '../controllers/vendorController';
import { authenticateToken, requireRoles } from '../middlewares/authMiddleware';

export const vendorRouter = Router();

vendorRouter.use(authenticateToken);

// Danh bạ đối tác & Xem lịch sử trao đổi kỹ thuật
vendorRouter.get('/', (req, res) => vendorController.getVendors(req, res));
vendorRouter.get('/:id/communications', (req, res) => vendorController.getVendorCommunications(req, res));

// Khai báo đối tác mới (Chỉ ADMIN & ASSET_HR)
vendorRouter.post('/', requireRoles(['ADMIN', 'ASSET_HR']), (req, res) => vendorController.createVendor(req, res));

// Ghi nhật ký trao đổi hãng gắn với lệnh bảo trì Task (KTV & ADMIN)
vendorRouter.post('/tasks/:taskId/vendor-logs', (req, res) => vendorController.logTaskCommunication(req, res));


/**
 * Backend/src/routes/procurementRoutes.ts
 *
 * Định tuyến REST API cho Mua sắm & Đề xuất vật tư (TASK-BE-10):
 * - KTV được phép gửi đề xuất cấp phát vật tư hiện trường.
 * - ADMIN và ASSET_HR có thẩm quyền tạo PO và nghiệm thu nhập kho.
 * - Tuân thủ AGENTS.md Rule 4 & Rule 7.1 (< 300 LOC).
 */

import { Router } from 'express';
import { procurementController } from '../controllers/procurementController';
import { authenticateToken, requireRoles } from '../middlewares/authMiddleware';

export const procurementRouter = Router();

procurementRouter.use(authenticateToken);

// Danh sách đề xuất & Gửi đề xuất mua sắm mới (Mọi vai trò đã xác thực)
procurementRouter.get('/requests', (req, res) => procurementController.getRequests(req, res));
procurementRouter.post('/requests', (req, res) => procurementController.createRequest(req, res));

// Danh sách PO, Lập đơn đặt hàng PO & Xác nhận nhập kho (Chỉ ADMIN & ASSET_HR)
procurementRouter.get('/orders', requireRoles(['ADMIN', 'ASSET_HR']), (req, res) =>
  procurementController.getPurchaseOrders(req, res)
);
procurementRouter.post('/orders', requireRoles(['ADMIN', 'ASSET_HR']), (req, res) =>
  procurementController.createPurchaseOrder(req, res)
);
procurementRouter.post('/orders/:id/receive', requireRoles(['ADMIN', 'ASSET_HR']), (req, res) =>
  procurementController.receivePurchaseOrder(req, res)
);


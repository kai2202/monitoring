/**
 * Backend/src/routes/financeRoutes.ts
 *
 * Định tuyến REST API cho Chi phí, Ngân sách & Hợp đồng (TASK-BE-12):
 * - Bảo vệ bí mật tài chính (KTV không được phép truy cập xem chi phí VNĐ).
 * - ADMIN và ASSET_HR có toàn quyền thiết lập định mức ngân sách và hợp đồng.
 * - Tuân thủ AGENTS.md Rule 4 & Rule 7.1 (< 300 LOC).
 */

import { Router } from 'express';
import { financeController } from '../controllers/financeController';
import { authenticateToken, requireRoles } from '../middlewares/authMiddleware';

export const financeRouter = Router();

financeRouter.use(authenticateToken);

// Bóc tách chi phí TCO & Định mức ngân sách phòng ban (Chỉ ADMIN & ASSET_HR)
financeRouter.get('/costs/breakdown', requireRoles(['ADMIN', 'ASSET_HR']), (req, res) =>
  financeController.getCostBreakdown(req, res)
);
financeRouter.get('/budgets', requireRoles(['ADMIN', 'ASSET_HR']), (req, res) =>
  financeController.getBudgets(req, res)
);
financeRouter.post('/budgets', requireRoles(['ADMIN', 'ASSET_HR']), (req, res) =>
  financeController.setBudget(req, res)
);

// Quản lý hợp đồng thuê thiết bị
financeRouter.get('/contracts', requireRoles(['ADMIN', 'ASSET_HR']), (req, res) =>
  financeController.getContracts(req, res)
);
financeRouter.post('/contracts', requireRoles(['ADMIN', 'ASSET_HR']), (req, res) =>
  financeController.createContract(req, res)
);


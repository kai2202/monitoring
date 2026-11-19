/**
 * Backend/src/routes/analyticsRoutes.ts
 *
 * Định tuyến REST API cho Miền Phân Tích Dữ Liệu, Tổng Quan & Tài Chính (Analytics Domain):
 * - `dashboardRouter`: KPI tổng quan hệ thống, trạng thái trực quan hạm đội máy in (/dashboard).
 * - `analyticsRouter`: Phân tích xu hướng, so sánh máy in, báo cáo chi phí SLA (/analytics).
 * - `financeRouter`: Chi phí TCO, định mức ngân sách phòng ban, hợp đồng thuê thiết bị (/finance).
 * Tuân thủ AGENTS.md Rule 4 & Rule 7.1 (< 300 LOC).
 */

import { Router } from 'express';
import { dashboardController } from '../controllers/analytics/dashboardController';
import { analyticsController } from '../controllers/analytics/analyticsController';
import { financeController } from '../controllers/analytics/financeController';
import { authenticateToken, requireRoles, sanitizeCostData } from '../middlewares/authMiddleware';

// ==========================================
// 1. Dashboard Router (/dashboard)
// ==========================================
export const dashboardRouter = Router();

dashboardRouter.use(authenticateToken);

dashboardRouter.get('/summary', (req, res) => dashboardController.getSummary(req, res));

// ==========================================
// 2. Analytics Router (/analytics)
// ==========================================
export const analyticsRouter = Router();

analyticsRouter.use(authenticateToken);
analyticsRouter.use(sanitizeCostData);

analyticsRouter.get('/summary', (req, res) => analyticsController.getSummary(req, res));
analyticsRouter.get('/trend', (req, res) => analyticsController.getTrend(req, res));
analyticsRouter.get('/distribution', (req, res) => analyticsController.getDistribution(req, res));
analyticsRouter.get('/supplies', (req, res) => analyticsController.getSupplies(req, res));
analyticsRouter.get('/sla-cost', requireRoles(['ADMIN', 'ASSET_HR']), (req, res) =>
  analyticsController.getSLACost(req, res)
);
analyticsRouter.get('/compare', (req, res) => analyticsController.getCompare(req, res));
analyticsRouter.post('/compare', (req, res) => analyticsController.getCompare(req, res));
analyticsRouter.post('/comparison', (req, res) => analyticsController.getCompare(req, res));

// ==========================================
// 3. Finance Router (/finance)
// ==========================================
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

// Quản lý hợp đồng thuê thiết bị (Chỉ ADMIN & ASSET_HR)
financeRouter.get('/contracts', requireRoles(['ADMIN', 'ASSET_HR']), (req, res) =>
  financeController.getContracts(req, res)
);
financeRouter.post('/contracts', requireRoles(['ADMIN', 'ASSET_HR']), (req, res) =>
  financeController.createContract(req, res)
);

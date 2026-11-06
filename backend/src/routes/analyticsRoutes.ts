/**
 * Backend/src/routes/analyticsRoutes.ts
 *
 * Định tuyến REST API cho Phân Hệ Phân Tích & Báo Cáo Sản Lượng (Analytics API):
 * - Bắt buộc `authenticateToken` trước `sanitizeCostData` và chặn `FIELD_TECH` truy cập `/sla-cost`.
 * - Tuân thủ AGENTS.md Rule 4 & Rule 7.1 (< 300 LOC).
 */

import { Router } from 'express';
import { analyticsController } from '../controllers/analyticsController';
import { authenticateToken, requireRoles, sanitizeCostData } from '../middlewares/authMiddleware';

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

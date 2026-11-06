/**
 * Backend/src/routes/dashboardRoutes.ts
 *
 * Định tuyến REST API cho Dashboard Điều Hành (Dashboard API):
 * - Yêu cầu phiên đăng nhập hợp lệ (`authenticateToken`).
 * - Tuân thủ AGENTS.md Rule 4 & Rule 7.1 (< 300 LOC).
 */

import { Router } from 'express';
import { dashboardController } from '../controllers/dashboardController';
import { authenticateToken } from '../middlewares/authMiddleware';

export const dashboardRouter = Router();

dashboardRouter.use(authenticateToken);

dashboardRouter.get('/summary', (req, res) => dashboardController.getSummary(req, res));

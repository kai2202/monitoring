/**
 * Backend/src/routes/suppliesRoutes.ts
 *
 * Định tuyến REST API cho Phân hệ Vật Tư Tiêu Hao CMYK & Hộp Mực Thải (`/api/v1/supplies`).
 * Yêu cầu phiên xác thực JWT hợp lệ (`authenticateToken`).
 */

import { Router } from 'express';
import { suppliesController } from '../controllers/suppliesController';
import { authenticateToken } from '../middlewares/authMiddleware';

export const suppliesRouter = Router();

suppliesRouter.use(authenticateToken);

suppliesRouter.get('/summary', (req, res) => suppliesController.getSuppliesSummary(req, res));
suppliesRouter.get('/printer/:id', (req, res) => suppliesController.getPrinterSupplies(req, res));
suppliesRouter.get('/', (req, res) => suppliesController.getSuppliesList(req, res));

export default suppliesRouter;


/**
 * Backend/src/routes/incidentRoutes.ts
 *
 * Định tuyến REST API cho Phân hệ Sự Cố & Chẩn Đoán (Incidents API):
 * - Yêu cầu xác thực JWT (`authenticateToken`) và kiểm soát vai trò khi xử lý sự cố.
 * - Tuân thủ AGENTS.md Rule 6 & Rule 7.1 (< 300 LOC).
 */

import { Router } from 'express';
import { incidentController } from '../controllers/incidentController';
import { authenticateToken, requireRoles } from '../middlewares/authMiddleware';

export const incidentRouter = Router();

incidentRouter.use(authenticateToken);

incidentRouter.get('/', (req, res) => incidentController.getIncidents(req, res));
incidentRouter.get('/knowledge-reuse', (req, res) => incidentController.getKnowledgeReuse(req, res));
incidentRouter.get('/:id', (req, res) => incidentController.getIncidentById(req, res));

// Đóng sự cố và Triage yêu cầu xác thực (ADMIN hoặc FIELD_TECH)
incidentRouter.post('/:id/resolve', requireRoles(['ADMIN', 'FIELD_TECH']), (req, res) =>
  incidentController.resolveIncident(req, res)
);
incidentRouter.post('/:id/triage', requireRoles(['ADMIN', 'FIELD_TECH']), (req, res) =>
  incidentController.triageIncident(req, res)
);
incidentRouter.patch('/:id/status', requireRoles(['ADMIN', 'FIELD_TECH']), (req, res) =>
  incidentController.resolveIncident(req, res)
);

export default incidentRouter;

/**
 * Backend/src/routes/incidentRoutes.ts
 *
 * Định tuyến REST API cho Miền Sự Cố Kỹ Thuật, Cổng Tích Hợp & Thông Báo (Incidents Domain):
 * - `incidentRouter`: Danh sách sự cố, triaging, đóng sự cố, tri thức tái sử dụng (/incidents).
 * - `integrationRouter`: Tiếp nhận Zabbix Action Webhook Push (/integrations).
 * - `notificationRouter`: Chuông thông báo tập trung theo phân quyền người dùng (/notifications).
 * Tuân thủ AGENTS.md Rule 4 & Rule 7.1 (< 300 LOC).
 */

import { Router } from 'express';
import { incidentController } from '../controllers/incidents/incidentController';
import { zabbixWebhookController } from '../controllers/incidents/zabbixWebhookController';
import { notificationController } from '../controllers/incidents/notificationController';
import { authenticateToken, requireRoles } from '../middlewares/authMiddleware';

// ==========================================
// 1. Incidents Router (/incidents)
// ==========================================
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

// ==========================================
// 2. Integration Router (/integrations)
// ==========================================
export const integrationRouter = Router();

// Endpoint tiếp nhận sự kiện Zabbix Action Webhook Push (Problem & Recovery)
integrationRouter.post('/zabbix-webhook', (req, res) => zabbixWebhookController.handleWebhook(req, res));

// ==========================================
// 3. Notifications Router (/notifications)
// ==========================================
export const notificationRouter = Router();

notificationRouter.use(authenticateToken);

notificationRouter.get('/', (req, res) => notificationController.getNotifications(req, res));
notificationRouter.patch('/:id/read', (req, res) => notificationController.markAsRead(req, res));

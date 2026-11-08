/**
 * Backend/src/routes/integrationRoutes.ts
 *
 * Định tuyến các cổng tích hợp ngoại vi (Zabbix Webhook, v.v.):
 * - Tuân thủ AGENTS.md Rule 4 & Rule 7.1 (< 300 LOC).
 */

import { Router } from 'express';
import { zabbixWebhookController } from '../controllers/zabbixWebhookController';

export const integrationRouter = Router();

// Endpoint tiếp nhận sự kiện Zabbix Action Webhook Push (Problem & Recovery)
integrationRouter.post('/zabbix-webhook', (req, res) => zabbixWebhookController.handleWebhook(req, res));

export default integrationRouter;


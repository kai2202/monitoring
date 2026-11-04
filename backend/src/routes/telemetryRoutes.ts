/**
 * Backend/src/routes/telemetryRoutes.ts
 *
 * Định tuyến API cho Phân hệ Phân tích Sản lượng Đội Máy In (Fleet Analytics).
 */

import { Router } from 'express';
import { telemetryController } from '../controllers/telemetryController';

export const telemetryRouter = Router();

telemetryRouter.get('/reliability-stats', (req, res) => telemetryController.getReliabilityStats(req, res));
telemetryRouter.get('/lemon-devices', (req, res) => telemetryController.getLemonDevices(req, res));
telemetryRouter.get('/zabbix-status', (req, res) => telemetryController.getZabbixStatus(req, res));
telemetryRouter.get('/scatter-3d', (req, res) => telemetryController.get3DScatterData(req, res));



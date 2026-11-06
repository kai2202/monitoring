/**
 * Backend/src/routes/telemetryRoutes.ts
 *
 * Định tuyến API cho Phân hệ Đo lường & Khả dụng Đội Máy In (Fleet Telemetry).
 * Yêu cầu phiên đăng nhập xác thực (`authenticateToken`).
 */

import { Router } from 'express';
import { telemetryController } from '../controllers/telemetryController';
import { authenticateToken } from '../middlewares/authMiddleware';

export const telemetryRouter = Router();

telemetryRouter.use(authenticateToken);

telemetryRouter.get('/availability', (req, res) => telemetryController.getAvailabilityTimeline(req, res));
telemetryRouter.get('/volume-trend', (req, res) => telemetryController.getVolumeTrend(req, res));
telemetryRouter.get('/production-trend', (req, res) => telemetryController.getProductionTrend(req, res));
telemetryRouter.get('/top-printers-volume', (req, res) => telemetryController.getTopPrintersVolume(req, res));
telemetryRouter.get('/rankings', (req, res) => telemetryController.getRankings(req, res));
telemetryRouter.get('/inventory', (req, res) => telemetryController.getInventory(req, res));
telemetryRouter.get('/heatmap', (req, res) => telemetryController.getHeatmap(req, res));
telemetryRouter.get('/compare', (req, res) => telemetryController.getCompare(req, res));
telemetryRouter.get('/reliability-stats', (req, res) => telemetryController.getReliabilityStats(req, res));
telemetryRouter.get('/lemon-devices', (req, res) => telemetryController.getLemonDevices(req, res));
telemetryRouter.get('/zabbix-status', (req, res) => telemetryController.getZabbixStatus(req, res));
telemetryRouter.get('/scatter-3d', (req, res) => telemetryController.get3DScatterData(req, res));
telemetryRouter.get('/rollups', (req, res) => telemetryController.getDailyRollups(req, res));
telemetryRouter.post('/rollups', (req, res) => telemetryController.recordCounterRollup(req, res));

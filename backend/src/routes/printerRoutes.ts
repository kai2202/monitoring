/**
 * Backend/src/routes/printerRoutes.ts
 *
 * Định tuyến REST API cho Miền Quản Lý & Đo Lường Thiết Bị Máy In (Printers & Telemetry Domain):
 * - `printerRouter`: CRUD danh mục máy in, phân vùng vị trí, đồng bộ Zabbix (/printers).
 * - `telemetryRouter`: Dữ liệu khả dụng, xu hướng sản lượng, bảng xếp hạng, 3D Scatter, Counter Rollups (/telemetry).
 * Tuân thủ AGENTS.md Rule 4 & Rule 7.1 (< 300 LOC).
 */

import { Router } from 'express';
import { printerController } from '../controllers/printers/printerController';
import { telemetryController } from '../controllers/printers/telemetryController';
import { authenticateToken, requireRoles } from '../middlewares/authMiddleware';

// ==========================================
// 1. Printers Router (/printers)
// ==========================================
export const printerRouter = Router();

printerRouter.use(authenticateToken);

// Truy vấn danh mục & chi tiết máy in
printerRouter.get('/', (req, res) => printerController.getPrinters(req, res));
printerRouter.get('/:id', (req, res) => printerController.getPrinterById(req, res));

// Nghiệp vụ quản trị thiết bị (ADMIN / FIELD_TECH)
printerRouter.post('/', requireRoles(['ADMIN']), (req, res) => printerController.createPrinter(req, res));
printerRouter.put('/:id', requireRoles(['ADMIN']), (req, res) => printerController.updatePrinter(req, res));
printerRouter.patch('/:id', requireRoles(['ADMIN']), (req, res) => printerController.updatePrinter(req, res));
printerRouter.delete('/:id', requireRoles(['ADMIN']), (req, res) => printerController.deletePrinter(req, res));
printerRouter.patch('/:id/location', requireRoles(['ADMIN', 'FIELD_TECH']), (req, res) =>
  printerController.updatePrinterLocation(req, res)
);
printerRouter.patch('/:id/relocate', requireRoles(['ADMIN', 'FIELD_TECH']), (req, res) =>
  printerController.updatePrinterLocation(req, res)
);
printerRouter.post('/sync', requireRoles(['ADMIN']), (req, res) => printerController.syncPrinters(req, res));

// ==========================================
// 2. Telemetry Router (/telemetry)
// ==========================================
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

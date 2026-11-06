/**
 * Backend/src/routes/printerRoutes.ts
 *
 * Định tuyến REST API cho Phân hệ Máy In (Printers API):
 * - Yêu cầu xác thực JWT cho toàn bộ truy vấn; ADMIN toàn quyền CRUD danh mục.
 * - Tuân thủ AGENTS.md Rule 4 & Rule 7.1 (< 300 LOC).
 */

import { Router } from 'express';
import { printerController } from '../controllers/printerController';
import { authenticateToken, requireRoles } from '../middlewares/authMiddleware';

export const printerRouter = Router();

printerRouter.use(authenticateToken);

// Endpoint truy vấn danh sách & chi tiết (Mọi vai trò đã xác thực)
printerRouter.get('/', (req, res) => printerController.getPrinters(req, res));
printerRouter.get('/:id', (req, res) => printerController.getPrinterById(req, res));

// Endpoint quản trị thiết bị yêu cầu quyền ADMIN
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

export default printerRouter;

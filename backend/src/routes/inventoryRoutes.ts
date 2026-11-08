/**
 * Backend/src/routes/inventoryRoutes.ts
 *
 * Định tuyến REST API cho Phân hệ Quản lý Kho vật tư (TASK-BE-09):
 * - KTV được phép tra cứu & ghi nhận xuất kho khi thực thi Task.
 * - ADMIN và ASSET_HR có quyền khai báo SKU và quản trị toàn diện.
 * - Tuân thủ AGENTS.md Rule 4 & Rule 7.1 (< 300 LOC).
 */

import { Router } from 'express';
import { inventoryController } from '../controllers/inventoryController';
import { authenticateToken, requireRoles } from '../middlewares/authMiddleware';

export const inventoryRouter = Router();

inventoryRouter.use(authenticateToken);

// Tra cứu danh mục kho & tính tương thích model máy in
inventoryRouter.get('/items', (req, res) => inventoryController.getItems(req, res));
inventoryRouter.get('/compatibility/:printerModel', (req, res) => inventoryController.getCompatibility(req, res));

// Khai báo vật tư mới (Chỉ ADMIN và ASSET_HR)
inventoryRouter.post('/items', requireRoles(['ADMIN', 'ASSET_HR']), (req, res) => inventoryController.createItem(req, res));

// Ghi nhận xuất/nhập kho (KTV được ghi nhận xuất kho qua task; ADMIN/HR toàn quyền)
inventoryRouter.post('/transactions', (req, res) => inventoryController.createTransaction(req, res));


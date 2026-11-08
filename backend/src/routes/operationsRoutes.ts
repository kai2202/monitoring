/**
 * Backend/src/routes/operationsRoutes.ts
 *
 * Định tuyến REST API cho Miền Vận Hành & Hậu Cần Thiết Bị (Operations & Logistics Domain):
 * - `suppliesRouter`: Mức mực CMYK, hộp mực thải, cảnh báo cạn kiệt (/supplies).
 * - `inventoryRouter`: Quản lý kho phụ tùng, SKU vật tư, xuất nhập kho (/inventory).
 * - `procurementRouter`: Đề xuất mua sắm linh kiện, đơn hàng PO, nhận hàng (/procurement).
 * - `vendorRouter`: Danh mục nhà cung cấp, nhật ký trao đổi kỹ thuật với hãng (/vendors).
 * Tuân thủ AGENTS.md Rule 4 & Rule 7.1 (< 300 LOC).
 */

import { Router } from 'express';
import { suppliesController } from '../controllers/operations/suppliesController';
import { inventoryController } from '../controllers/operations/inventoryController';
import { procurementController } from '../controllers/operations/procurementController';
import { vendorController } from '../controllers/operations/vendorController';
import { authenticateToken, requireRoles } from '../middlewares/authMiddleware';

// ==========================================
// 1. Supplies Router (/supplies)
// ==========================================
export const suppliesRouter = Router();

suppliesRouter.use(authenticateToken);

suppliesRouter.get('/summary', (req, res) => suppliesController.getSuppliesSummary(req, res));
suppliesRouter.get('/printer/:id', (req, res) => suppliesController.getPrinterSupplies(req, res));
suppliesRouter.get('/', (req, res) => suppliesController.getSuppliesList(req, res));

// ==========================================
// 2. Inventory Router (/inventory)
// ==========================================
export const inventoryRouter = Router();

inventoryRouter.use(authenticateToken);

// Tra cứu danh mục kho & tính tương thích model máy in
inventoryRouter.get('/items', (req, res) => inventoryController.getItems(req, res));
inventoryRouter.get('/compatibility/:printerModel', (req, res) => inventoryController.getCompatibility(req, res));

// Khai báo vật tư mới (Chỉ ADMIN và ASSET_HR)
inventoryRouter.post('/items', requireRoles(['ADMIN', 'ASSET_HR']), (req, res) =>
  inventoryController.createItem(req, res)
);

// Ghi nhận xuất/nhập kho (KTV được ghi nhận xuất kho qua task; ADMIN/HR toàn quyền)
inventoryRouter.post('/transactions', (req, res) => inventoryController.createTransaction(req, res));

// ==========================================
// 3. Procurement Router (/procurement)
// ==========================================
export const procurementRouter = Router();

procurementRouter.use(authenticateToken);

// Danh sách đề xuất & Gửi đề xuất mua sắm mới (Mọi vai trò đã xác thực)
procurementRouter.get('/requests', (req, res) => procurementController.getRequests(req, res));
procurementRouter.post('/requests', (req, res) => procurementController.createRequest(req, res));

// Danh sách PO, Lập đơn đặt hàng PO & Xác nhận nhập kho (Chỉ ADMIN & ASSET_HR)
procurementRouter.get('/orders', requireRoles(['ADMIN', 'ASSET_HR']), (req, res) =>
  procurementController.getPurchaseOrders(req, res)
);
procurementRouter.post('/orders', requireRoles(['ADMIN', 'ASSET_HR']), (req, res) =>
  procurementController.createPurchaseOrder(req, res)
);
procurementRouter.post('/orders/:id/receive', requireRoles(['ADMIN', 'ASSET_HR']), (req, res) =>
  procurementController.receivePurchaseOrder(req, res)
);

// ==========================================
// 4. Vendors Router (/vendors)
// ==========================================
export const vendorRouter = Router();

vendorRouter.use(authenticateToken);

// Danh bạ đối tác & Xem lịch sử trao đổi kỹ thuật
vendorRouter.get('/', (req, res) => vendorController.getVendors(req, res));
vendorRouter.get('/:id/communications', (req, res) => vendorController.getVendorCommunications(req, res));

// Khai báo đối tác mới (Chỉ ADMIN & ASSET_HR)
vendorRouter.post('/', requireRoles(['ADMIN', 'ASSET_HR']), (req, res) => vendorController.createVendor(req, res));

// Ghi nhật ký trao đổi hãng gắn với lệnh bảo trì Task (KTV & ADMIN)
vendorRouter.post('/tasks/:taskId/vendor-logs', (req, res) => vendorController.logTaskCommunication(req, res));


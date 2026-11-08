/**
 * Backend/src/routes/settingsRoutes.ts
 *
 * Định tuyến REST API cho Cấu Hình, Người Dùng RBAC & Từ Điển Mã Lỗi (Settings API):
 * - Áp dụng nghiêm ngặt `authenticateToken` và kiểm tra vai trò `ADMIN`.
 * - Tuân thủ AGENTS.md Rule 4 & Rule 7.1 (< 300 LOC).
 */

import { Router } from 'express';
import { settingsController } from '../controllers/settingsController';
import { branchController } from '../controllers/branchController';
import { userAdminController } from '../controllers/userAdminController';
import { authenticateToken, requirePermissions, requireRoles } from '../middlewares/authMiddleware';

export const settingsRouter = Router();

// 1. Danh mục Tòa nhà & Sơ đồ Tầng (Hỗ trợ cả /floors và /branches tương thích)
settingsRouter.get(['/branches', '/floors'], authenticateToken, (req, res) => branchController.getBranches(req, res));
settingsRouter.post(['/branches', '/floors'], authenticateToken, requireRoles(['ADMIN']), (req, res) =>
  branchController.createBranch(req, res)
);
settingsRouter.delete(['/branches/:id', '/floors/:id'], authenticateToken, requireRoles(['ADMIN']), (req, res) =>
  branchController.deleteBranch(req, res)
);
settingsRouter.post(['/branches/:id/floors', '/floors/:id/items'], authenticateToken, requireRoles(['ADMIN']), (req, res) =>
  branchController.addFloor(req, res)
);
settingsRouter.delete(['/branches/:id/floors/:floorName', '/floors/:id/items/:floorName'], authenticateToken, requireRoles(['ADMIN']), (req, res) =>
  branchController.removeFloor(req, res)
);

// 2. Tra cứu từ điển mã lỗi (Mọi user đã đăng nhập phục vụ chẩn đoán KTV/NOC)
settingsRouter.get('/errors', authenticateToken, (req, res) => settingsController.getErrors(req, res));
settingsRouter.get('/errors/lookup/:code', authenticateToken, (req, res) => settingsController.lookupError(req, res));

// 3. Cấu hình hệ thống, Zabbix Ping & Nạp CSV (Chỉ ADMIN)
settingsRouter.get('/', authenticateToken, requireRoles(['ADMIN']), (req, res) =>
  settingsController.getSettings(req, res)
);
settingsRouter.patch('/', authenticateToken, requireRoles(['ADMIN']), (req, res) =>
  settingsController.updateSettings(req, res)
);
settingsRouter.post('/test-zabbix', authenticateToken, requireRoles(['ADMIN']), (req, res) =>
  settingsController.testZabbix(req, res)
);
settingsRouter.post(
  '/csv/import',
  authenticateToken,
  requirePermissions(['csv:import_errors']),
  (req, res) => settingsController.importCsv(req, res)
);
settingsRouter.get('/csv/dictionary-status', authenticateToken, requireRoles(['ADMIN']), (req, res) =>
  settingsController.getDictionaryStatus(req, res)
);
settingsRouter.delete('/csv/dictionary', authenticateToken, requireRoles(['ADMIN']), (req, res) =>
  settingsController.unloadDictionary(req, res)
);
settingsRouter.get('/csv/jobs', authenticateToken, requireRoles(['ADMIN']), (req, res) =>
  settingsController.getCsvJobs(req, res)
);
settingsRouter.get('/audit-logs', authenticateToken, requireRoles(['ADMIN']), (req, res) =>
  settingsController.getAuditLogs(req, res)
);

// 4. Danh sách Kỹ thuật viên khả dụng để gán phiếu công việc (Mọi user đã đăng nhập) & Quản trị RBAC (Chỉ ADMIN)
settingsRouter.get('/technicians', authenticateToken, (req, res) =>
  userAdminController.getTechnicians(req, res)
);
settingsRouter.get('/users', authenticateToken, requireRoles(['ADMIN']), (req, res) =>
  userAdminController.getUsers(req, res)
);
settingsRouter.post('/users', authenticateToken, requireRoles(['ADMIN']), (req, res) =>
  userAdminController.createUser(req, res)
);
settingsRouter.patch('/users/:id', authenticateToken, requireRoles(['ADMIN']), (req, res) =>
  userAdminController.updateUser(req, res)
);
settingsRouter.patch('/users/:id/password', authenticateToken, requireRoles(['ADMIN']), (req, res) =>
  userAdminController.changePassword(req, res)
);

/**
 * Backend/src/routes/authRoutes.ts
 *
 * Định tuyến REST API cho Miền Xác Thực, Phân Quyền & Cấu Hình Quản Trị (Auth & Settings Domain):
 * - `authRouter`: Đăng nhập, refresh token, đăng xuất, lấy thông tin tài khoản phiên hiện tại (/auth).
 * - `settingsRouter`: Tòa nhà/Sơ đồ tầng, từ điển mã lỗi CSV, cài đặt runtime, kiểm toán & quản trị người dùng (/settings).
 * Tuân thủ AGENTS.md Rule 4 & Rule 7.1 (< 300 LOC).
 */

import { Router } from 'express';
import { authController } from '../controllers/auth/authController';
import { settingsController } from '../controllers/auth/settingsController';
import { branchController } from '../controllers/printers/branchController';
import { userAdminController } from '../controllers/auth/userAdminController';
import { authenticateToken, requirePermissions, requireRoles } from '../middlewares/authMiddleware';
import { authRateLimiter } from '../middlewares/rateLimiter';

// ==========================================
// 1. Auth Router (/auth)
// ==========================================
export const authRouter = Router();

// Endpoint công khai có rate limiter chống brute-force
authRouter.post('/login', authRateLimiter, (req, res) => authController.login(req, res));
authRouter.post('/refresh', (req, res) => authController.refresh(req, res));
authRouter.post('/logout', (req, res) => authController.logout(req, res));

// Endpoint yêu cầu phiên đăng nhập hợp lệ
authRouter.get('/me', authenticateToken, (req, res) => authController.me(req, res));

// ==========================================
// 2. Settings & Admin Router (/settings)
// ==========================================
export const settingsRouter = Router();

// 2.1. Danh mục Tòa nhà & Sơ đồ Tầng (Hỗ trợ cả /branches và /floors tương thích)
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

// 2.2. Tra cứu từ điển mã lỗi
settingsRouter.get('/errors', authenticateToken, (req, res) => settingsController.getErrors(req, res));
settingsRouter.get('/errors/lookup/:code', authenticateToken, (req, res) => settingsController.lookupError(req, res));

// 2.3. Cấu hình hệ thống, Zabbix Ping & Nạp CSV
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

// 2.4. Kỹ thuật viên & Quản trị RBAC
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

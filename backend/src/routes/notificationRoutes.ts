/**
 * Backend/src/routes/notificationRoutes.ts
 *
 * Định tuyến REST API cho Chuông Thông Báo Tập Trung (Notification Pipeline - TASK-BE-15):
 * - Hỗ trợ phân loại thông báo theo vai trò người dùng (ADMIN, FIELD_TECH, ASSET_HR).
 * - Tuân thủ AGENTS.md Rule 4 & Rule 7.1 (< 300 LOC).
 */

import { Router } from 'express';
import { notificationController } from '../controllers/notificationController';
import { authenticateToken } from '../middlewares/authMiddleware';

export const notificationRouter = Router();

notificationRouter.use(authenticateToken);

// Lấy danh sách thông báo theo vai trò và số lượng chưa đọc
notificationRouter.get('/', (req, res) => notificationController.getNotifications(req, res));

// Đánh dấu thông báo đã đọc
notificationRouter.patch('/:id/read', (req, res) => notificationController.markAsRead(req, res));


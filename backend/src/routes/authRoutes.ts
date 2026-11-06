/**
 * Backend/src/routes/authRoutes.ts
 *
 * Định tuyến REST API cho Phân hệ Xác thực & Phân quyền (Auth & RBAC):
 * - Áp dụng authRateLimiter chống tấn công Brute-force mật khẩu.
 * - Tuân thủ AGENTS.md Rule 4 & Rule 7.1 (< 300 LOC).
 */

import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authenticateToken } from '../middlewares/authMiddleware';
import { authRateLimiter } from '../middlewares/rateLimiter';

export const authRouter = Router();

// Endpoint công khai có rate limiter
authRouter.post('/login', authRateLimiter, (req, res) => authController.login(req, res));
authRouter.post('/refresh', (req, res) => authController.refresh(req, res));
authRouter.post('/logout', (req, res) => authController.logout(req, res));

// Endpoint yêu cầu đăng nhập (Authenticated)
authRouter.get('/me', authenticateToken, (req, res) => authController.me(req, res));

export default authRouter;

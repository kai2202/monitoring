/**
 * Backend/src/controllers/auth/authController.ts
 *
 * Controller xử lý Đăng nhập, Token Rotation, Đăng xuất và Thông tin phiên (FleetMonitor):
 * - Áp dụng chuẩn bảo mật OWASP: HTTP-Only Cookie + Database Refresh Token Revocation.
 * - Tuân thủ AGENTS.md Rule 4 & Rule 8 (< 300 LOC).
 */

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma';
import { tokenService } from '../../services/auth/tokenService';
import { loginSchema } from '../../validators/authValidator';

const COOKIE_NAME = 'refreshToken';
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

const setRefreshCookie = (res: Response, token: string) => {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: REFRESH_COOKIE_MAX_AGE,
    path: '/',
  });
};

const mapUserResponse = (user: any, accessToken: string) => ({
  accessToken,
  user: {
    id: user.id,
    username: user.username,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    permissions: user.permissions,
    dataScope: user.dataScope,
  },
});

export class AuthController {
  public async login(req: Request, res: Response) {
    try {
      const parseResult = loginSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: parseResult.error.errors[0]?.message || 'Dữ liệu đăng nhập không hợp lệ',
          },
          timestamp: new Date().toISOString(),
        });
      }

      const { username, email, password } = parseResult.data;
      const identifier = (username || email || '').trim();
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { username: { equals: identifier, mode: 'insensitive' } },
            { email: { equals: identifier, mode: 'insensitive' } },
          ],
        },
      });

      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Tài khoản hoặc mật khẩu không chính xác, hoặc tài khoản đã bị khóa.',
          },
          timestamp: new Date().toISOString(),
        });
      }

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          error: { code: 'INVALID_CREDENTIALS', message: 'Tài khoản hoặc mật khẩu không chính xác.' },
          timestamp: new Date().toISOString(),
        });
      }

      const tokenPayload = {
        userId: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        permissions: user.permissions,
      };
      const accessToken = tokenService.generateAccessToken(tokenPayload);
      const rawRefreshToken = tokenService.generateRefreshToken(user.id);
      const tokenHash = tokenService.hashToken(rawRefreshToken);

      await prisma.refreshToken.create({
        data: { userId: user.id, tokenHash, expiresAt: new Date(Date.now() + REFRESH_COOKIE_MAX_AGE) },
      });
      setRefreshCookie(res, rawRefreshToken);

      return res.status(200).json({
        success: true,
        data: mapUserResponse(user, accessToken),
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error('[AuthController.login] Lỗi hệ thống:', err);
      return res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: 'Không thể đăng nhập. Lỗi máy chủ.' },
        timestamp: new Date().toISOString(),
      });
    }
  }

  public async refresh(req: Request, res: Response) {
    try {
      const rawToken = req.cookies?.[COOKIE_NAME] || req.body?.refreshToken;

      if (!rawToken) {
        return res.status(401).json({
          success: false,
          error: { code: 'REFRESH_TOKEN_REQUIRED', message: 'Không tìm thấy Refresh Token.' },
          timestamp: new Date().toISOString(),
        });
      }

      const decoded = tokenService.verifyRefreshToken(rawToken);
      if (!decoded) {
        return res.status(401).json({
          success: false,
          error: { code: 'REFRESH_TOKEN_INVALID', message: 'Refresh Token không hợp lệ hoặc đã hết hạn.' },
          timestamp: new Date().toISOString(),
        });
      }

      const tokenHash = tokenService.hashToken(rawToken);
      const savedToken = await prisma.refreshToken.findFirst({
        where: {
          tokenHash,
          revokedAt: null,
          expiresAt: { gt: new Date() },
        },
        include: { user: true },
      });

      if (!savedToken || !savedToken.user || !savedToken.user.isActive) {
        return res.status(401).json({
          success: false,
          error: { code: 'REFRESH_TOKEN_REVOKED', message: 'Phiên làm việc đã bị thu hồi hoặc không tồn tại.' },
          timestamp: new Date().toISOString(),
        });
      }

      await prisma.refreshToken.update({
        where: { id: savedToken.id },
        data: { revokedAt: new Date() },
      });

      const user = savedToken.user;
      const tokenPayload = {
        userId: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        permissions: user.permissions,
      };
      const newAccessToken = tokenService.generateAccessToken(tokenPayload);
      const newRawRefreshToken = tokenService.generateRefreshToken(user.id);
      const newTokenHash = tokenService.hashToken(newRawRefreshToken);

      await prisma.refreshToken.create({
        data: { userId: user.id, tokenHash: newTokenHash, expiresAt: new Date(Date.now() + REFRESH_COOKIE_MAX_AGE) },
      });
      setRefreshCookie(res, newRawRefreshToken);

      return res.status(200).json({
        success: true,
        data: mapUserResponse(user, newAccessToken),
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error('[AuthController.refresh] Lỗi hệ thống:', err);
      return res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: 'Lỗi cấp lại token.' },
        timestamp: new Date().toISOString(),
      });
    }
  }

  public async logout(req: Request, res: Response) {
    try {
      const rawToken = req.cookies?.[COOKIE_NAME] || req.body?.refreshToken;

      if (rawToken) {
        const tokenHash = tokenService.hashToken(rawToken);
        await prisma.refreshToken.updateMany({
          where: { tokenHash, revokedAt: null },
          data: { revokedAt: new Date() },
        });
      }

      res.clearCookie(COOKIE_NAME, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });

      return res.status(200).json({
        success: true,
        message: 'Đăng xuất thành công.',
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error('[AuthController.logout] Lỗi hệ thống:', err);
      return res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: 'Lỗi khi đăng xuất.' },
        timestamp: new Date().toISOString(),
      });
    }
  }

  public async me(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Chưa đăng nhập.' },
          timestamp: new Date().toISOString(),
        });
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: {
          id: true,
          username: true,
          email: true,
          fullName: true,
          role: true,
          permissions: true,
          dataScope: true,
          isActive: true,
          createdAt: true,
        },
      });

      if (!user || !user.isActive) {
        return res.status(404).json({
          success: false,
          error: { code: 'USER_NOT_FOUND', message: 'Tài khoản không tồn tại hoặc đã bị khóa.' },
          timestamp: new Date().toISOString(),
        });
      }

      return res.status(200).json({
        success: true,
        data: user,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error('[AuthController.me] Lỗi hệ thống:', err);
      return res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: 'Không thể lấy thông tin người dùng.' },
        timestamp: new Date().toISOString(),
      });
    }
  }
}

export const authController = new AuthController();
export default authController;


/**
 * Backend/src/services/auth/tokenService.ts
 *
 * Dịch vụ tạo, ký, xác thực và băm Token bảo mật (JWT & Refresh Token Rotation):
 * - Lưu trữ Refresh Token băm SHA-256 trong cơ sở dữ liệu để chống rò rỉ token.
 * - Tuân thủ AGENTS.md Rule 4 & Rule 7.1 (< 300 LOC).
 */

import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { UserRole } from '@prisma/client';

export interface TokenUserPayload {
  userId: string;
  username: string;
  fullName: string;
  role: UserRole;
  permissions: string[];
}

export class TokenService {
  /**
   * Tạo Access Token thời hạn ngắn (15 phút)
   */
  public generateAccessToken(user: TokenUserPayload): string {
    return jwt.sign(
      {
        userId: user.userId,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        permissions: user.permissions,
      },
      env.JWT_ACCESS_SECRET,
      { expiresIn: env.JWT_ACCESS_EXPIRES_IN as any }
    );
  }

  /**
   * Tạo Refresh Token thời hạn dài (7 ngày)
   */
  public generateRefreshToken(userId: string): string {
    return jwt.sign(
      { userId, tokenId: crypto.randomUUID() },
      env.JWT_REFRESH_SECRET,
      { expiresIn: env.JWT_REFRESH_EXPIRES_IN as any }
    );
  }

  /**
   * Băm Refresh Token bằng SHA-256 trước khi lưu vào PostgreSQL
   */
  public hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Xác thực Access Token
   */
  public verifyAccessToken(token: string): TokenUserPayload | null {
    try {
      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as any;
      return {
        userId: decoded.userId,
        username: decoded.username,
        fullName: decoded.fullName,
        role: decoded.role,
        permissions: decoded.permissions || [],
      };
    } catch {
      return null;
    }
  }

  /**
   * Xác thực Refresh Token
   */
  public verifyRefreshToken(token: string): { userId: string } | null {
    try {
      const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as any;
      return { userId: decoded.userId };
    } catch {
      return null;
    }
  }
}

export const tokenService = new TokenService();
export default tokenService;

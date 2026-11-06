/**
 * Backend/src/middlewares/authMiddleware.ts
 *
 * Middleware xác thực Access Token JWT và Phân quyền vai trò (RBAC):
 * - Hỗ trợ phân quyền dựa trên Vai trò (requireRoles) và Mảng quyền (requirePermissions).
 * - Middleware làm sạch dữ liệu chi phí tài chính (sanitizeCostData) cho FIELD_TECH.
 * - Tuân thủ AGENTS.md Rule 4 & Rule 7.1 (< 300 LOC).
 */

import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { tokenService, TokenUserPayload } from '../services/auth/tokenService';

// Mở rộng kiểu dữ liệu Express Request để đính kèm thông tin User sau khi xác thực
declare global {
  namespace Express {
    interface Request {
      user?: TokenUserPayload;
    }
  }
}

/**
 * Middleware kiểm tra và giải mã Access Token JWT
 */
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Yêu cầu đăng nhập. Không tìm thấy Access Token trong header.',
      },
      timestamp: new Date().toISOString(),
    });
  }

  const payload = tokenService.verifyAccessToken(token);
  if (!payload) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'TOKEN_EXPIRED_OR_INVALID',
        message: 'Phiên đăng nhập đã hết hạn hoặc token không hợp lệ.',
      },
      timestamp: new Date().toISOString(),
    });
  }

  req.user = payload;
  return next();
};

/**
 * Middleware kiểm tra vai trò người dùng (Role-based Access Control)
 */
export const requireRoles = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Yêu cầu đăng nhập để truy cập tài nguyên này.',
        },
        timestamp: new Date().toISOString(),
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Truy cập bị từ chối. Vai trò [${req.user.role}] không có quyền thực hiện hành động này.`,
        },
        timestamp: new Date().toISOString(),
      });
    }

    return next();
  };
};

/**
 * Middleware kiểm tra mảng quyền hạn chi tiết (Permission-based Access Control)
 */
export const requirePermissions = (requiredPermissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Yêu cầu đăng nhập.' },
        timestamp: new Date().toISOString(),
      });
    }

    const userPerms = req.user.permissions || [];
    const hasAll = userPerms.includes('all') || req.user.role === 'ADMIN';
    if (hasAll) {
      return next();
    }

    const hasRequired = requiredPermissions.every((perm) => userPerms.includes(perm));
    if (!hasRequired) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN_PERMISSION',
          message: `Từ chối truy cập. Tài khoản của bạn thiếu quyền bắt buộc: [${requiredPermissions.join(', ')}].`,
        },
        timestamp: new Date().toISOString(),
      });
    }

    return next();
  };
};

/**
 * Middleware kiểm duyệt và ẩn chi phí tài chính đối với Kỹ thuật viên (FIELD_TECH)
 * Tuân thủ bảo mật: Role FIELD_TECH mặc định không có quyền xem chi phí tiền tệ (cost:view).
 */
export const sanitizeCostData = (req: Request, res: Response, next: NextFunction) => {
  const originalJson = res.json.bind(res);

  res.json = (body: any) => {
    const user = req.user;
    const canViewCost =
      !user ||
      user.role === 'ADMIN' ||
      user.role === 'ASSET_HR' ||
      (user.permissions && (user.permissions.includes('cost:view') || user.permissions.includes('all')));

    if (!canViewCost && body) {
      const scrubObject = (obj: any): any => {
        if (!obj || typeof obj !== 'object') return obj;
        if (Array.isArray(obj)) return obj.map(scrubObject);

        const clean = { ...obj };
        const financialKeys = [
          'partsCostVnd',
          'laborCostVnd',
          'totalCostVnd',
          'monoRatePerPage',
          'colorRatePerPage',
          'techHourlyRate',
          'cost',
          'spentVnd',
          'budgetVnd',
        ];

        for (const key of financialKeys) {
          if (key in clean) {
            clean[key] = null;
          }
        }

        for (const k of Object.keys(clean)) {
          if (typeof clean[k] === 'object' && clean[k] !== null) {
            clean[k] = scrubObject(clean[k]);
          }
        }
        return clean;
      };

      body = scrubObject(body);
    }

    return originalJson(body);
  };

  return next();
};

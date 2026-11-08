/**
 * Backend/src/middlewares/authMiddleware.test.ts
 *
 * Kiểm thử Middleware Phân quyền RBAC 3 vai trò & Bảo vệ bí mật tài chính (TASK-BE-03 & TASK-BE-17):
 * - Đảm bảo chỉ 3 vai trò chuẩn: ADMIN, FIELD_TECH, ASSET_HR.
 * - Kiểm tra từ chối truy cập 403 FORBIDDEN khi sai vai trò.
 * - Đảm bảo Admin có toàn quyền truy cập.
 * - Tuân thủ AGENTS.md Rule 4 & Rule 7.1 (< 300 LOC).
 */

import { describe, it, expect, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { requireRoles } from './authMiddleware';

describe('authMiddleware RBAC (TASK-BE-03)', () => {
  const createMockReqRes = (user?: any) => {
    const req = { user } as Request;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response;
    const next = vi.fn() as NextFunction;
    return { req, res, next };
  };

  it('phải chặn 401 khi request chưa được xác thực (req.user = undefined)', () => {
    const middleware = requireRoles(['ADMIN']);
    const { req, res, next } = createMockReqRes(undefined);

    middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('phải chặn 403 khi FIELD_TECH truy cập tài nguyên của ADMIN hoặc ASSET_HR', () => {
    const middleware = requireRoles(['ADMIN', 'ASSET_HR']);
    const { req, res, next } = createMockReqRes({
      userId: 'tech-01',
      username: 'tech_nam',
      role: 'FIELD_TECH',
      permissions: ['tasks:execute'],
    });

    middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('phải cho phép ADMIN truy cập tài nguyên được bảo vệ', () => {
    const middleware = requireRoles(['ADMIN']);
    const { req, res, next } = createMockReqRes({
      userId: 'admin-01',
      username: 'admin_an',
      role: 'ADMIN',
      permissions: ['users:manage'],
    });

    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('phải cho phép ASSET_HR truy cập tài nguyên tài chính/kho', () => {
    const middleware = requireRoles(['ADMIN', 'ASSET_HR']);
    const { req, res, next } = createMockReqRes({
      userId: 'hr-01',
      username: 'asset_ha',
      role: 'ASSET_HR',
      permissions: ['cost:view'],
    });

    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});


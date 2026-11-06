/**
 * Backend/src/tests/authMiddleware.test.ts
 *
 * Kiểm thử Middleware Bảo mật & Phân quyền RBAC (TASK-BE-06):
 * - Phân quyền vai trò (requireRoles) và mảng quyền (requirePermissions).
 * - Kiểm duyệt và ẩn sạch chi phí tiền tệ (sanitizeCostData) đối với FIELD_TECH.
 * - Tuân thủ AGENTS.md Rule 4 & Rule 7.1 (< 300 LOC).
 */

import { describe, it, expect, vi } from 'vitest';
import { requireRoles, requirePermissions, sanitizeCostData } from '../middlewares/authMiddleware';

describe('authMiddleware - requireRoles & requirePermissions', () => {
  it('từ chối 401 khi request chưa đăng nhập', () => {
    const req: any = {};
    const res: any = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();

    const middleware = requireRoles(['ADMIN']);
    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('từ chối 403 khi vai trò không khớp danh sách cho phép', () => {
    const req: any = { user: { role: 'FIELD_TECH', permissions: [] } };
    const res: any = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();

    const middleware = requireRoles(['ADMIN']);
    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('cho phép ADMIN hoặc user có quyền "all" vượt qua requirePermissions', () => {
    const req: any = { user: { role: 'ADMIN', permissions: ['all'] } };
    const res: any = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const next = vi.fn();

    const middleware = requirePermissions(['csv:import_errors']);
    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});

describe('authMiddleware - sanitizeCostData', () => {
  it('tự động ẩn các trường chi phí tiền tệ khi người dùng là FIELD_TECH (không có cost:view)', () => {
    const req: any = {
      user: { role: 'FIELD_TECH', permissions: ['tasks:execute', 'worklog:create'] },
    };
    let responseBody: any = null;
    const res: any = {
      json: (data: any) => {
        responseBody = data;
        return res;
      },
    };
    const next = vi.fn();

    sanitizeCostData(req, res, next);

    const payload = {
      id: 'TASK-001',
      title: 'Thay bao lụa sấy',
      partsCostVnd: 4500000,
      laborCostVnd: 350000,
      totalCostVnd: 4850000,
      status: 'In_Progress',
    };

    res.json(payload);

    expect(responseBody.id).toBe('TASK-001');
    expect(responseBody.status).toBe('In_Progress');
    expect(responseBody.partsCostVnd).toBeNull();
    expect(responseBody.laborCostVnd).toBeNull();
    expect(responseBody.totalCostVnd).toBeNull();
  });

  it('giữ nguyên dữ liệu tài chính khi người dùng là ADMIN hoặc ASSET_HR', () => {
    const req: any = {
      user: { role: 'ASSET_HR', permissions: ['cost:view'] },
    };
    let responseBody: any = null;
    const res: any = {
      json: (data: any) => {
        responseBody = data;
        return res;
      },
    };
    const next = vi.fn();

    sanitizeCostData(req, res, next);

    const payload = {
      partsCostVnd: 4500000,
      totalCostVnd: 4850000,
    };

    res.json(payload);

    expect(responseBody.partsCostVnd).toBe(4500000);
    expect(responseBody.totalCostVnd).toBe(4850000);
  });
});

/**
 * Backend/src/controllers/auth/userAdminController.ts
 *
 * Controller quản trị tài khoản người dùng & Phân quyền RBAC (`/api/v1/settings/users`):
 * - Tích hợp 100% Prisma ORM & bcrypt (10 rounds).
 * - Hỗ trợ: Danh sách thành viên, Tạo tài khoản mới, Cập nhật trạng thái/phạm vi nhánh-tầng, Đổi mật khẩu.
 * - Tự động thu hồi RefreshToken khi khóa tài khoản hoặc đặt lại mật khẩu.
 * - Tuân thủ AGENTS.md Rule 4 & Rule 8 (< 300 LOC).
 */

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';
import { prisma } from '../../lib/prisma';

const DEFAULT_PERMISSIONS_BY_ROLE: Record<UserRole, string[]> = {
  ADMIN: [
    'csv:import_printers',
    'csv:import_errors',
    'csv:export_cost',
    'cost:view',
    'printers:relocate',
    'tasks:create',
    'tasks:approve',
    'users:manage',
  ],
  FIELD_TECH: ['tasks:execute', 'worklog:create', 'attachments:upload', 'printers:view'],
  ASSET_HR: ['csv:export_cost', 'cost:view', 'printers:view', 'sla:view'],
};

function getRoleNameVi(role: UserRole): string {
  if (role === 'FIELD_TECH') return 'Kỹ thuật viên NOC & Hiện trường';
  if (role === 'ASSET_HR') return 'Chuyên viên Tài sản & Kế toán HR';
  return 'Quản trị viên Hệ thống (Admin)';
}

function mapUserToManagedDto(u: any) {
  const scope: any = u.dataScope && typeof u.dataScope === 'object' ? u.dataScope : {};
  const defaultBranches = ['Trụ sở chính'];
  const branchScope =
    Array.isArray(scope.branchScope) && scope.branchScope.length > 0 ? scope.branchScope : defaultBranches;
  const floorsScope =
    Array.isArray(scope.floorsScope) && scope.floorsScope.length > 0 ? scope.floorsScope : ['Tất cả các tầng'];

  return {
    id: u.id,
    username: u.username,
    name: u.fullName || u.username,
    fullName: u.fullName || u.username,
    email: u.email,
    role: u.role,
    roleNameVi: getRoleNameVi(u.role),
    branchScope,
    floorsScope,
    status: u.isActive ? ('ACTIVE' as const) : ('INACTIVE' as const),
    isActive: Boolean(u.isActive),
    createdAt: u.createdAt,
  };
}

export class UserAdminController {
  // GET /api/v1/settings/technicians
  async getTechnicians(_req: Request, res: Response) {
    try {
      const techs = await prisma.user.findMany({
        where: { isActive: true, role: { in: ['FIELD_TECH', 'ADMIN'] } },
        orderBy: [{ role: 'desc' }, { fullName: 'asc' }],
      });
      return res.status(200).json(
        techs.map((u) => {
          const dto = mapUserToManagedDto(u);
          return {
            id: dto.id,
            name: dto.fullName,
            role: dto.role,
            branchScope: dto.branchScope,
            floorsScope: dto.floorsScope,
          };
        })
      );
    } catch (err: any) {
      console.error('[UserAdminController.getTechnicians] Lỗi:', err);
      return res.status(500).json({ error: 'Không thể tải danh sách kỹ thuật viên', message: err.message });
    }
  }

  // GET /api/v1/settings/users
  async getUsers(_req: Request, res: Response) {
    try {
      const users = await prisma.user.findMany({
        orderBy: { createdAt: 'asc' },
      });
      return res.status(200).json(users.map(mapUserToManagedDto));
    } catch (err: any) {
      console.error('[UserAdminController.getUsers] Lỗi:', err);
      return res.status(500).json({ error: 'Không thể tải danh sách người dùng', message: err.message });
    }
  }

  // POST /api/v1/settings/users
  async createUser(req: Request, res: Response) {
    try {
      const { name, fullName, email, username, password, role, branchScope, floorsScope } = req.body;
      const resolvedName = String(fullName || name || '').trim();
      const resolvedEmail = String(email || '').trim().toLowerCase();
      const resolvedPassword = String(password || '');

      if (!resolvedName) {
        return res.status(400).json({ error: 'Vui lòng nhập họ và tên nhân sự.' });
      }
      if (!resolvedEmail || !resolvedEmail.includes('@')) {
        return res.status(400).json({ error: 'Vui lòng nhập địa chỉ email hợp lệ.' });
      }
      if (resolvedPassword.length < 6) {
        return res.status(400).json({ error: 'Mật khẩu khởi tạo phải có tối thiểu 6 ký tự.' });
      }

      const validRole: UserRole =
        role === 'ADMIN' || role === 'ASSET_HR' || role === 'FIELD_TECH' ? role : 'FIELD_TECH';

      const baseUsername = String(username || resolvedEmail.split('@')[0] || 'user')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9._-]/g, '_');

      const existing = await prisma.user.findFirst({
        where: {
          OR: [{ email: { equals: resolvedEmail, mode: 'insensitive' } }, { username: baseUsername }],
        },
      });
      if (existing) {
        return res.status(409).json({ error: 'Email hoặc tên đăng nhập đã tồn tại trong hệ thống.' });
      }

      const passwordHash = await bcrypt.hash(resolvedPassword, 10);
      const defaultBranches = ['Trụ sở chính'];

      const created = await prisma.user.create({
        data: {
          username: baseUsername,
          email: resolvedEmail,
          fullName: resolvedName,
          passwordHash,
          role: validRole,
          permissions: DEFAULT_PERMISSIONS_BY_ROLE[validRole],
          isActive: true,
          dataScope: {
            branchScope: Array.isArray(branchScope) && branchScope.length > 0 ? branchScope : defaultBranches,
            floorsScope: Array.isArray(floorsScope) && floorsScope.length > 0 ? floorsScope : ['Tất cả các tầng'],
          },
        },
      });

      return res.status(201).json(mapUserToManagedDto(created));
    } catch (err: any) {
      console.error('[UserAdminController.createUser] Lỗi tạo tài khoản:', err);
      return res.status(500).json({ error: 'Không thể tạo tài khoản người dùng mới', message: err.message });
    }
  }

  // PATCH /api/v1/settings/users/:id
  async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { role, permissions, isActive, status, branchScope, floorsScope, name, fullName } = req.body;

      const existing = await prisma.user.findUnique({ where: { id } });
      if (!existing) {
        return res.status(404).json({ error: 'Không tìm thấy tài khoản người dùng.' });
      }

      const prevScope: any = existing.dataScope && typeof existing.dataScope === 'object' ? existing.dataScope : {};
      const nextScope = {
        ...prevScope,
        ...(Array.isArray(branchScope) ? { branchScope } : {}),
        ...(Array.isArray(floorsScope) ? { floorsScope } : {}),
      };

      const nextIsActive =
        status !== undefined
          ? status === 'ACTIVE'
          : isActive !== undefined
          ? Boolean(isActive)
          : existing.isActive;

      const nextRole: UserRole =
        role === 'ADMIN' || role === 'FIELD_TECH' || role === 'ASSET_HR' ? role : existing.role;

      const updated = await prisma.user.update({
        where: { id },
        data: {
          fullName: (fullName ?? name)?.trim() || undefined,
          role: nextRole,
          permissions:
            Array.isArray(permissions)
              ? permissions
              : role
              ? DEFAULT_PERMISSIONS_BY_ROLE[nextRole]
              : undefined,
          isActive: nextIsActive,
          dataScope: nextScope,
        },
      });

      if (!nextIsActive) {
        await prisma.refreshToken.updateMany({
          where: { userId: id, revokedAt: null },
          data: { revokedAt: new Date() },
        });
      }

      return res.status(200).json(mapUserToManagedDto(updated));
    } catch (err: any) {
      console.error('[UserAdminController.updateUser] Lỗi cập nhật:', err);
      return res.status(500).json({ error: 'Không thể cập nhật tài khoản người dùng', message: err.message });
    }
  }

  // PATCH /api/v1/settings/users/:id/password
  async changePassword(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;

      if (!newPassword || String(newPassword).length < 6) {
        return res.status(400).json({ error: 'Mật khẩu mới phải có tối thiểu 6 ký tự.' });
      }

      const existing = await prisma.user.findUnique({ where: { id } });
      if (!existing) {
        return res.status(404).json({ error: 'Không tìm thấy tài khoản người dùng.' });
      }

      const passwordHash = await bcrypt.hash(String(newPassword), 10);
      await prisma.$transaction([
        prisma.user.update({ where: { id }, data: { passwordHash } }),
        prisma.refreshToken.updateMany({
          where: { userId: id, revokedAt: null },
          data: { revokedAt: new Date() },
        }),
      ]);

      return res.status(200).json({ success: true, message: 'Đã cập nhật mật khẩu thành công.' });
    } catch (err: any) {
      console.error('[UserAdminController.changePassword] Lỗi đổi mật khẩu:', err);
      return res.status(500).json({ error: 'Không thể đổi mật khẩu người dùng', message: err.message });
    }
  }
}

export const userAdminController = new UserAdminController();


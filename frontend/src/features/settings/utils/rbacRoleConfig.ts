/**
 * Frontend/src/features/settings/utils/rbacRoleConfig.ts
 *
 * Cấu hình chuẩn 3 Vai trò RBAC đồng bộ với Backend UserAdminController.
 */

export type RbacRoleCode = 'ADMIN' | 'FIELD_TECH' | 'ASSET_HR';

export interface RbacRoleMeta {
  code: RbacRoleCode;
  shortLabel: string;
  titleVi: string;
  description: string;
  badgeClass: string;
  accentRingClass: string;
}

export const RBAC_ROLES: RbacRoleMeta[] = [
  {
    code: 'ADMIN',
    shortLabel: 'Admin',
    titleVi: 'Quản trị viên Hệ thống (Admin)',
    description: 'Toàn quyền cấu hình hệ thống, quản lý tài khoản RBAC, phê duyệt tác vụ & nhập CSV.',
    badgeClass: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200/70 dark:border-rose-900/50',
    accentRingClass: 'border-rose-400 bg-rose-50/70 dark:bg-rose-950/30 dark:border-rose-700',
  },
  {
    code: 'FIELD_TECH',
    shortLabel: 'Kỹ thuật viên',
    titleVi: 'Kỹ thuật viên NOC & Hiện trường',
    description: 'Tiếp nhận sự cố, thực thi phiếu bảo trì, ghi nhật ký công việc & đính kèm hiện trường.',
    badgeClass: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-200/70 dark:border-indigo-900/50',
    accentRingClass: 'border-indigo-400 bg-indigo-50/70 dark:bg-indigo-950/30 dark:border-indigo-700',
  },
  {
    code: 'ASSET_HR',
    shortLabel: 'Tài sản & HR',
    titleVi: 'Chuyên viên Tài sản & Kế toán HR',
    description: 'Theo dõi danh sách máy in, chi phí vận hành, báo cáo SLA & xuất dữ liệu đối soát CSV.',
    badgeClass: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200/70 dark:border-emerald-900/50',
    accentRingClass: 'border-emerald-400 bg-emerald-50/70 dark:bg-emerald-950/30 dark:border-emerald-700',
  },
];

export function getUserInitials(name: string): string {
  const parts = name.split(' ').filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

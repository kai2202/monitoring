/**
 * Frontend/src/mocks/mockRbac.ts
 *
 * Dữ liệu mô phỏng tài khoản và cấu hình phân quyền 3 vai trò chuẩn mực của FleetMonitor:
 * 1. Fleet Admin / Manager (ADMIN) — Quản lý toàn quyền, KPI chiến lược.
 * 2. NOC / IT Technician (NOC_TECH) — Chẩn đoán, xử lý sự cố, Task Stepper.
 * 3. HR / Operations (HR_OPS) — Giám sát sản lượng in, định mức phòng ban, chi phí vật tư.
 */

import { UserProfile, RoleDefinition, UserRole } from '../types/rbac';

export const mockRoleDefinitions: Record<UserRole, RoleDefinition> = {
  ADMIN: {
    role: 'ADMIN',
    label: 'Fleet Admin (Quản lý Cấp cao)',
    description: 'Toàn quyền cấu hình, quản trị tài khoản, xem toàn bộ KPI chiến lược, SLA và ngân sách.',
    badgeBg: '#fef3c7',
    badgeColor: '#b45309',
    badgeBorder: '#fde68a',
    permissions: [
      'system:config',
      'system:manage_users',
      'system:approve_actions',
      'printers:view',
      'printers:diagnose',
      'printers:edit_location',
      'incidents:manage',
      'tasks:create',
      'tasks:update_stepper',
      'tasks:complete',
      'analytics:view_basic',
      'analytics:view_advanced',
      'analytics:custom_compare',
      'supplies:view',
      'supplies:order_request',
      'reports:export',
    ],
  },
  NOC_TECH: {
    role: 'NOC_TECH',
    label: 'NOC Technician (Kỹ sư Vận hành)',
    description: 'Chuyên trách xử lý sự cố kỹ thuật, thực thi Stepper công việc, tra cứu từ điển mã lỗi.',
    badgeBg: '#e0f2fe',
    badgeColor: '#0369a1',
    badgeBorder: '#bae6fd',
    permissions: [
      'printers:view',
      'printers:diagnose',
      'printers:edit_location',
      'incidents:manage',
      'tasks:create',
      'tasks:update_stepper',
      'tasks:complete',
      'analytics:view_basic',
      'supplies:view',
      'supplies:order_request',
    ],
  },
  HR_OPS: {
    role: 'HR_OPS',
    label: 'HR / Operations (Hành chính Nhân sự)',
    description: 'Giám sát sản lượng trang in, định mức in phòng ban, phân bổ máy in và chi phí tiêu hao.',
    badgeBg: '#ecfdf5',
    badgeColor: '#047857',
    badgeBorder: '#a7f3d0',
    permissions: [
      'printers:view',
      'analytics:view_basic',
      'analytics:view_advanced',
      'analytics:custom_compare',
      'supplies:view',
      'reports:export',
    ],
  },
};

export const mockUsers: Record<UserRole, UserProfile> = {
  ADMIN: {
    id: 'usr-admin-01',
    username: 'huy.tran',
    fullName: 'Trần Quốc Huy',
    email: 'huy.tran@fleetmonitor.internal',
    role: 'ADMIN',
    roleLabel: 'Giám đốc Hạ tầng & Quản trị máy in',
    department: 'Ban Giám đốc & Hạ tầng IT',
    avatarText: 'QH',
    avatarColor: '#d97706',
    permissions: mockRoleDefinitions.ADMIN.permissions,
    lastLogin: 'Hôm nay, 08:30',
  },
  NOC_TECH: {
    id: 'usr-noc-02',
    username: 'nam.le',
    fullName: 'Lê Hoàng Nam',
    email: 'nam.le@fleetmonitor.internal',
    role: 'NOC_TECH',
    roleLabel: 'Kỹ sư Trưởng Trung tâm Vận hành NOC',
    department: 'Trung tâm Vận hành Mạng & Thiết bị',
    avatarText: 'HN',
    avatarColor: '#0284c7',
    permissions: mockRoleDefinitions.NOC_TECH.permissions,
    lastLogin: 'Hôm nay, 08:15',
  },
  HR_OPS: {
    id: 'usr-hr-03',
    username: 'phuong.nguyen',
    fullName: 'Nguyễn Mai Phương',
    email: 'phuong.nguyen@fleetmonitor.internal',
    role: 'HR_OPS',
    roleLabel: 'Trưởng ban Hành chính & Quản lý Chi phí',
    department: 'Phòng Hành chính Nhân sự & Kế toán Quản trị',
    avatarText: 'MP',
    avatarColor: '#059669',
    permissions: mockRoleDefinitions.HR_OPS.permissions,
    lastLogin: 'Hôm nay, 09:00',
  },
};

const STORAGE_KEY = 'fleetmonitor_active_role';

export const rbacStorage = {
  getActiveRole(): UserRole {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'ADMIN' || stored === 'NOC_TECH' || stored === 'HR_OPS') {
        return stored;
      }
    } catch {
      // Fallback
    }
    return 'ADMIN'; // Mặc định mở đầu là Fleet Admin
  },

  setActiveRole(role: UserRole) {
    try {
      localStorage.setItem(STORAGE_KEY, role);
    } catch {
      // Ignore
    }
  },

  getActiveUser(): UserProfile {
    const role = this.getActiveRole();
    return mockUsers[role];
  },
};

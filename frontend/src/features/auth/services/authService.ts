/**
 * Frontend/src/features/auth/services/authService.ts
 *
 * Mock Service xác thực với 3 nhóm vai trò chuẩn doanh nghiệp:
 * 1) ADMIN: Quản trị viên Hệ thống (IT & NOC)
 * 2) FIELD_TECH: Kỹ thuật viên Bảo trì Hiện trường
 * 3) ASSET_HR: HR / Quản lý Tài sản & Kiểm kê Hành chính
 *
 * Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import { AuthUser, LoginCredentials, UserRole } from '../../../types/auth';

const ADMIN_USER: AuthUser = {
  id: 'usr-001',
  username: 'admin',
  fullName: 'Nguyễn Văn An',
  email: 'an.nguyen@fleetmonitor.vn',
  role: 'ADMIN',
  roleNameVi: 'Quản trị viên Hệ thống (IT & NOC)',
  avatarInitials: 'AN',
  dataScope: {
    departmentName: 'Toàn hệ thống (~100 máy, 5 Tầng)',
  },
  token: 'mock-jwt-token-admin',
};

const FIELD_TECH_USER: AuthUser = {
  id: 'usr-002',
  username: 'tech_nam',
  fullName: 'Lê Hoàng Nam',
  email: 'nam.le@fleetmonitor.vn',
  role: 'FIELD_TECH',
  roleNameVi: 'Kỹ thuật viên Hiện trường',
  avatarInitials: 'LN',
  dataScope: {
    departmentName: 'Lệnh bảo trì & Sửa chữa phần cứng',
  },
  token: 'mock-jwt-token-field-tech',
};

const ASSET_HR_USER: AuthUser = {
  id: 'usr-003',
  username: 'hr_kiemke',
  fullName: 'Phạm Thu Hà',
  email: 'ha.pham@fleetmonitor.vn',
  role: 'ASSET_HR',
  roleNameVi: 'HR / Kiểm kê Tài sản & Hành chính',
  avatarInitials: 'PH',
  dataScope: {
    departmentName: 'Kiểm kê tài sản & Chi phí thuê máy',
  },
  token: 'mock-jwt-token-asset-hr',
};

export const MOCK_USERS: Record<UserRole, AuthUser> = {
  ADMIN: ADMIN_USER,
  FIELD_TECH: FIELD_TECH_USER,
  ASSET_HR: ASSET_HR_USER,
  // Alias tương thích
  FLEET_MANAGER: ADMIN_USER,
  NOC_ENGINEER: ADMIN_USER,
  FIELD_TECHNICIAN: FIELD_TECH_USER,
  DEPARTMENT_HEAD: ASSET_HR_USER,
};

export class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    await new Promise((r) => setTimeout(r, 120)); // Giả lập độ trễ xác thực 120ms

    const normalizedUser = credentials.username.trim().toLowerCase();

    if (normalizedUser === 'admin' || normalizedUser === 'noc' || normalizedUser === 'it') {
      return MOCK_USERS.ADMIN;
    }
    if (normalizedUser === 'tech' || normalizedUser === 'tech_nam' || normalizedUser === 'nam') {
      return MOCK_USERS.FIELD_TECH;
    }
    if (normalizedUser === 'hr' || normalizedUser === 'hr_kiemke' || normalizedUser === 'ketoan' || normalizedUser === 'ha') {
      return MOCK_USERS.ASSET_HR;
    }

    // Mặc định đăng nhập quyền Admin
    return MOCK_USERS.ADMIN;
  }

  getUserByRole(role: UserRole): AuthUser {
    return MOCK_USERS[role] || MOCK_USERS.ADMIN;
  }
}

export const authService = new AuthService();

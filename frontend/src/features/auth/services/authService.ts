/**
 * Frontend/src/features/auth/services/authService.ts
 *
 * Dịch vụ Xác thực Người dùng & Quản lý Phiên (AuthService):
 * - Hỗ trợ song song 2 chế độ theo `DATA_SOURCE` (`mock` vs `api`):
 *   + `mock`: Xác thực tức thì với 3 vai trò mô phỏng (ADMIN, FIELD_TECH, ASSET_HR).
 *   + `api`: Gọi trực tiếp REST API Backend (`/auth/login`, `/auth/logout`, `/auth/me`)
 *     với JWT Access Token + HTTP-Only Refresh Cookie Rotation.
 * - Tuân thủ AGENTS.md Rule 4 & Rule 7.1 (< 300 LOC).
 */

import { DATA_SOURCE } from '../../../config/dataSource';
import {
  getStoredAccessToken,
  requestApi,
  setInMemoryAccessToken,
} from '../../../services/providers/api/apiClient';
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
  FLEET_MANAGER: ADMIN_USER,
  NOC_ENGINEER: ADMIN_USER,
  FIELD_TECHNICIAN: FIELD_TECH_USER,
  DEPARTMENT_HEAD: ASSET_HR_USER,
};

function getRoleNameVi(role: UserRole): string {
  if (role === 'FIELD_TECH' || role === 'FIELD_TECHNICIAN') {
    return 'Kỹ thuật viên Hiện trường';
  }
  if (role === 'ASSET_HR' || role === 'DEPARTMENT_HEAD') {
    return 'HR / Kiểm kê Tài sản & Hành chính';
  }
  return 'Quản trị viên Hệ thống (IT & NOC)';
}

function buildAvatarInitials(fullName?: string, username?: string): string {
  const clean = (fullName || username || 'FM').trim();
  const words = clean.replace(/\(.*?\)/g, '').trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
}

export function mapBackendUserToAuthUser(rawUser: any, accessToken?: string): AuthUser {
  const role: UserRole = rawUser?.role || 'ADMIN';
  return {
    id: rawUser.id,
    username: rawUser.username,
    fullName: rawUser.fullName || rawUser.username,
    email: rawUser.email || '',
    role,
    roleNameVi: getRoleNameVi(role),
    avatarInitials: buildAvatarInitials(rawUser.fullName, rawUser.username),
    permissions: Array.isArray(rawUser.permissions) ? rawUser.permissions : [],
    dataScope: rawUser.dataScope || {},
    token: accessToken,
  };
}

export class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    if (DATA_SOURCE === 'api') {
      const identifier = (credentials.email || credentials.username || '').trim();
      const isEmail = identifier.includes('@');
      const payload = {
        ...(isEmail ? { email: identifier } : { username: identifier }),
        password: credentials.password || '',
      };

      const res = await requestApi<{ accessToken: string; user: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      return mapBackendUserToAuthUser(res.user, res.accessToken);
    }

    await new Promise((r) => setTimeout(r, 120));
    const normalizedUser = (credentials.username || credentials.email || '').trim().toLowerCase();

    if (normalizedUser.includes('tech') || normalizedUser.includes('nam')) {
      return MOCK_USERS.FIELD_TECH;
    }
    if (normalizedUser.includes('hr') || normalizedUser.includes('ketoan') || normalizedUser.includes('ha')) {
      return MOCK_USERS.ASSET_HR;
    }
    return MOCK_USERS.ADMIN;
  }

  async logout(): Promise<void> {
    if (DATA_SOURCE === 'api') {
      try {
        await requestApi('/auth/logout', { method: 'POST' });
      } catch {
        // Bỏ qua lỗi mạng khi đăng xuất để luôn dọn sạch phiên cục bộ
      } finally {
        setInMemoryAccessToken(null);
      }
    }
  }

  async getCurrentSession(existingToken?: string): Promise<AuthUser | null> {
    if (DATA_SOURCE !== 'api') return null;
    try {
      const rawUser = await requestApi<any>('/auth/me');
      const activeToken = getStoredAccessToken() || existingToken;
      return mapBackendUserToAuthUser(rawUser, activeToken || undefined);
    } catch {
      return null;
    }
  }

  getUserByRole(role: UserRole): AuthUser {
    return MOCK_USERS[role] || MOCK_USERS.ADMIN;
  }
}

export const authService = new AuthService();

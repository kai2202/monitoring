/**
 * Frontend/src/features/auth/services/authService.ts
 *
 * Dịch vụ Xác thực Người dùng & Quản lý Phiên (AuthService):
 * - Hỗ trợ song song 2 chế độ theo `DATA_SOURCE` (`mock` vs `api`):
 *   + `mock`: Xác thực tức thì với 2 vai trò mô phỏng (ADMIN, FIELD_TECH).
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
import { MOCK_AUTH_USERS } from '../../../mocks/auth/mockAuthUsers';

export const MOCK_USERS = MOCK_AUTH_USERS;

function getRoleNameVi(role: UserRole): string {
  if (role === 'FIELD_TECH') {
    return 'Kỹ thuật viên Hiện trường';
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

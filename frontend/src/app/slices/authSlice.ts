/**
 * Frontend/src/app/slices/authSlice.ts
 *
 * Quản trị trạng thái Xác thực & Phân quyền người dùng (RBAC State):
 * - Chế độ `DATA_SOURCE === 'api'` (Mặc định): Clean Slate tuyệt đối, bắt buộc xác thực JWT/Cookie thật
 *   trước khi vào ứng dụng; không bao giờ tự nạp tài khoản giả lập hay cho phép đổi vai trò trên UI.
 * - Tuân thủ AGENTS.md Rule 4, Rule 5 & Rule 7.1 (< 300 LOC).
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DATA_SOURCE } from '../../config/dataSource';
import { setInMemoryAccessToken } from '../../services/providers/api/apiClient';
import { AuthState, AuthUser, UserRole } from '../../types/auth';
import { MOCK_USERS } from '../../features/auth/services/authService';

const STORAGE_KEY = 'fleetmonitor_auth_user';

const loadInitialUser = (): AuthUser | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AuthUser;
      if (DATA_SOURCE === 'api') {
        if (!parsed?.token || parsed.token.startsWith('mock-jwt-token-')) {
          localStorage.removeItem(STORAGE_KEY);
          return null;
        }
        setInMemoryAccessToken(parsed.token);
      }
      return parsed;
    }
  } catch (err) {
    console.error('Không thể đọc phiên đăng nhập từ localStorage:', err);
  }

  if (DATA_SOURCE === 'api') {
    return null;
  }

  return MOCK_USERS.FLEET_MANAGER;
};

const initialUser = loadInitialUser();

const initialState: AuthState = {
  user: initialUser,
  isAuthenticated: Boolean(initialUser),
  isLoading: false,
  isBootstrapping: DATA_SOURCE === 'api',
  error: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<AuthUser>) => {
      state.isLoading = false;
      state.isBootstrapping = false;
      state.isAuthenticated = true;
      state.user = action.payload;
      state.error = null;
      if (action.payload.token) {
        setInMemoryAccessToken(action.payload.token);
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(action.payload));
      } catch (err) {
        console.error('Lỗi khi lưu phiên đăng nhập:', err);
      }
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.isBootstrapping = false;
      state.error = action.payload;
    },
    finishBootstrap: (state) => {
      state.isBootstrapping = false;
    },
    updateAccessToken: (state, action: PayloadAction<string>) => {
      setInMemoryAccessToken(action.payload);
      if (state.user) {
        state.user.token = action.payload;
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(state.user));
        } catch {
          // Ignore storage write errors
        }
      }
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isBootstrapping = false;
      state.error = null;
      setInMemoryAccessToken(null);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (err) {
        console.error('Lỗi khi xóa phiên đăng nhập:', err);
      }
    },
    switchRole: (state, action: PayloadAction<UserRole>) => {
      if (DATA_SOURCE === 'api') return;
      const targetUser = MOCK_USERS[action.payload];
      if (targetUser) {
        state.user = targetUser;
        state.isAuthenticated = true;
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(targetUser));
        } catch (err) {
          console.error('Lỗi khi cập nhật vai trò:', err);
        }
      }
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  finishBootstrap,
  updateAccessToken,
  logout,
  switchRole,
} = authSlice.actions;
export default authSlice.reducer;

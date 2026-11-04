/**
 * Frontend/src/app/slices/authSlice.ts
 *
 * Quản trị trạng thái Xác thực & Phân quyền người dùng (RBAC State).
 * Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, AuthUser, UserRole } from '../../types/auth';
import { MOCK_USERS } from '../../features/auth/services/authService';

const STORAGE_KEY = 'fleetmonitor_auth_user';

const loadInitialUser = (): AuthUser | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Không thể đọc phiên đăng nhập từ localStorage:', err);
  }
  // Mặc định đăng nhập với Fleet Manager cho phiên đầu tiên
  return MOCK_USERS.FLEET_MANAGER;
};

const initialUser = loadInitialUser();

const initialState: AuthState = {
  user: initialUser,
  isAuthenticated: Boolean(initialUser),
  isLoading: false,
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
      state.isAuthenticated = true;
      state.user = action.payload;
      state.error = null;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(action.payload));
      } catch (err) {
        console.error('Lỗi khi lưu phiên đăng nhập:', err);
      }
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (err) {
        console.error('Lỗi khi xóa phiên đăng nhập:', err);
      }
    },
    switchRole: (state, action: PayloadAction<UserRole>) => {
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

export const { loginStart, loginSuccess, loginFailure, logout, switchRole } = authSlice.actions;
export default authSlice.reducer;


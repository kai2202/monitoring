/**
 * Frontend/src/types/auth.ts
 *
 * Kiểu dữ liệu xác thực & phân quyền 4 cấp của FleetMonitor (RBAC).
 * Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

export type UserRole =
  | 'ADMIN'              // Quản trị viên Hệ thống (IT & NOC - Toàn quyền)
  | 'FIELD_TECH'          // Kỹ thuật viên Bảo trì Hiện trường (Xử lý Lệnh bảo trì & Stepper)
  | 'ASSET_HR'           // HR / Quản trị Hành chính & Kiểm kê Tài sản
  | 'FLEET_MANAGER'      // Alias tương thích
  | 'NOC_ENGINEER'       // Alias tương thích
  | 'FIELD_TECHNICIAN'   // Alias tương thích
  | 'DEPARTMENT_HEAD';   // Alias tương thích

export interface UserDataScope {
  departmentIds?: string[];
  departmentName?: string;
  floorIds?: string[];
  floorName?: string;
}

export interface AuthUser {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  roleNameVi: string;
  avatarInitials: string;
  permissions?: string[];
  dataScope: UserDataScope;
  token?: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isBootstrapping?: boolean;
  error: string | null;
}

export interface LoginCredentials {
  username: string;
  email?: string;
  password?: string;
}


/**
 * Frontend/src/mocks/auth/mockAuthUsers.ts
 *
 * Dữ liệu người dùng & hồ sơ chọn vai trò mô phỏng cho chế độ Mock (`DATA_SOURCE === 'mock'`).
 * Đồng bộ tên, email và phạm vi quản lý với mockUsers.ts & 22 máy in chuẩn.
 */

import { faUserShield, faWrench, faFileLines } from '../../shared/icons';
import { AuthUser, UserRole } from '../../types/auth';

export interface PredefinedRoleProfile {
  role: UserRole;
  username: string;
  fullName: string;
  email: string;
  title: string;
  badge: string;
  color: string;
  icon: any;
}

const ADMIN_USER: AuthUser = {
  id: 'usr-001',
  username: 'admin',
  fullName: 'Nguyễn Văn An',
  email: 'admin@fleetmonitor.vn',
  role: 'ADMIN',
  roleNameVi: 'Quản trị viên Hệ thống (IT & NOC)',
  avatarInitials: 'AN',
  dataScope: {
    departmentName: 'Toàn hệ thống (22 máy, 4 Chi nhánh)',
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

export const MOCK_AUTH_USERS: Record<UserRole, AuthUser> = {
  ADMIN: ADMIN_USER,
  FIELD_TECH: FIELD_TECH_USER,
  ASSET_HR: ASSET_HR_USER,
  FLEET_MANAGER: ADMIN_USER,
  NOC_ENGINEER: ADMIN_USER,
  FIELD_TECHNICIAN: FIELD_TECH_USER,
  DEPARTMENT_HEAD: ASSET_HR_USER,
};

export const MOCK_ROLE_PROFILES: PredefinedRoleProfile[] = [
  {
    role: 'ADMIN',
    username: 'admin',
    fullName: 'Nguyễn Văn An',
    email: 'admin@fleetmonitor.vn',
    title: 'Quản trị viên Hệ thống (IT & NOC 24/7)',
    badge: 'Toàn quyền Quản trị',
    color: '#0284c7',
    icon: faUserShield,
  },
  {
    role: 'FIELD_TECH',
    username: 'tech_nam',
    fullName: 'Lê Hoàng Nam',
    email: 'nam.le@fleetmonitor.vn',
    title: 'Kỹ thuật viên Hiện trường (Field Tech)',
    badge: 'Thực thi SOP & Bảo trì',
    color: '#f59e0b',
    icon: faWrench,
  },
  {
    role: 'ASSET_HR',
    username: 'hr_kiemke',
    fullName: 'Phạm Thu Hà',
    email: 'ha.pham@fleetmonitor.vn',
    title: 'HR / Kiểm kê Tài sản & Chi phí',
    badge: 'Kiểm kê & Hợp đồng SLA',
    color: '#ec4899',
    icon: faFileLines,
  },
];

/**
 * Frontend/src/types/rbac.ts
 *
 * Kiểu dữ liệu TypeScript chuẩn mực cho Mô hình Phân quyền Vai trò (RBAC) của FleetMonitor:
 * - 3 Vai trò chính: Fleet Admin (ADMIN), Kỹ sư NOC (NOC_TECH), Hành chính/HR (HR_OPS).
 * - Quyền hạn chi tiết (Granular Permissions) bảo vệ từng hành động kỹ thuật và nghiệp vụ.
 */

export type UserRole = 'ADMIN' | 'NOC_TECH' | 'HR_OPS';

export type Permission =
  // Quản trị & Cấu hình
  | 'system:config'
  | 'system:manage_users'
  | 'system:approve_actions'
  // Kỹ thuật & Máy in
  | 'printers:view'
  | 'printers:diagnose'
  | 'printers:edit_location'
  | 'incidents:manage'
  | 'tasks:create'
  | 'tasks:update_stepper'
  | 'tasks:complete'
  // Báo cáo & Tài nguyên
  | 'analytics:view_basic'
  | 'analytics:view_advanced'
  | 'analytics:custom_compare'
  | 'supplies:view'
  | 'supplies:order_request'
  | 'reports:export';

export interface UserProfile {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  roleLabel: string;
  department: string;
  avatarText: string;
  avatarColor: string;
  permissions: Permission[];
  lastLogin: string;
}

export interface RoleDefinition {
  role: UserRole;
  label: string;
  description: string;
  badgeBg: string;
  badgeColor: string;
  badgeBorder: string;
  permissions: Permission[];
}

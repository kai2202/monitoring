/**
 * Frontend/src/mocks/settings/mockUsers.ts
 *
 * Dữ liệu người dùng giả lập phục vụ phân hệ Phân quyền & Quản trị (RBAC).
 * Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

export interface MockManagedUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'FIELD_TECH' | 'ASSET_HR';
  roleNameVi: string;
  branchScope: string[];
  floorsScope: string[];
  status: 'ACTIVE' | 'INACTIVE';
}

export const mockUsers: MockManagedUser[] = [
  {
    id: 'u-admin-01',
    name: 'Nguyễn Văn An',
    email: 'admin@fleetmonitor.vn',
    role: 'ADMIN',
    roleNameVi: 'Quản trị viên Hệ thống (Admin)',
    branchScope: ['Trụ sở chính (HQ)', 'Chi nhánh Miền Nam', 'Chi nhánh Miền Trung'],
    floorsScope: ['Tất cả 7 tầng'],
    status: 'ACTIVE',
  },
  {
    id: 'u-tech-02',
    name: 'Lê Hoàng Nam',
    email: 'nam.le@fleetmonitor.vn',
    role: 'FIELD_TECH',
    roleNameVi: 'Kỹ thuật viên NOC & Hiện trường',
    branchScope: ['Trụ sở chính (HQ)', 'Chi nhánh Miền Nam'],
    floorsScope: ['Tầng 1', 'Tầng 2', 'Tầng 3', 'Tầng 4', 'Tầng 5'],
    status: 'ACTIVE',
  },
  {
    id: 'u-hr-03',
    name: 'Phạm Thu Hà',
    email: 'ha.pham@fleetmonitor.vn',
    role: 'ASSET_HR',
    roleNameVi: 'Chuyên viên Tài sản & Kế toán HR',
    branchScope: ['Trụ sở chính (HQ)'],
    floorsScope: ['Tất cả 7 tầng'],
    status: 'ACTIVE',
  },
];


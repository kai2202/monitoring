/**
 * Frontend/src/mocks/locations/mockLocations.ts
 *
 * Dữ liệu giả lập Danh mục Trụ sở, Sơ đồ Tầng & Phòng Ban (Mock Locations & Departments):
 * - Phục vụ chế độ DATA_SOURCE === 'mock'.
 * - Khi chuyển sang DATA_SOURCE === 'api', ứng dụng chuyển về trạng thái Clean Slate
 *   (rỗng hoàn toàn) cho đến khi người dùng tạo mới hoặc đồng bộ từ backend.
 * - Tuân thủ AGENTS.md Rule 5 & Rule 7.1 (< 300 LOC).
 */

export interface MockBranchLocation {
  id: string;
  name: string;
  code: string;
  address?: string;
  isHq?: boolean;
  floors: string[];
}

export const MOCK_BRANCHES: MockBranchLocation[] = [
  {
    id: 'br-hq',
    name: 'Trụ sở chính (HQ)',
    code: 'HQ',
    address: 'Tòa nhà FleetCenter - 120 Nguyễn Thị Minh Khai, Q.1',
    isHq: true,
    floors: ['Tầng 1', 'Tầng 2', 'Tầng 3', 'Tầng 4', 'Tầng 5'],
  },
  {
    id: 'br-south',
    name: 'Chi nhánh Miền Nam',
    code: 'MN',
    address: 'Khu Văn phòng Công nghệ - Q.7, TP.HCM',
    isHq: false,
    floors: ['Tầng 1', 'Tầng 2', 'Tầng 3'],
  },
  {
    id: 'br-central',
    name: 'Chi nhánh Miền Trung',
    code: 'MT',
    address: '248 Bạch Đằng, Q.Hải Châu, Đà Nẵng',
    isHq: false,
    floors: ['Tầng 1', 'Tầng 2'],
  },
  {
    id: 'br-wh',
    name: 'Kho Thiết Bị Dự Phòng',
    code: 'WH-01',
    address: 'Khu Lưu Kho Thiết Bị & Vật Tư Tập Trung',
    isHq: false,
    floors: ['Kho Tổng'],
  },
];

export const MOCK_DEPARTMENTS: string[] = [
  'Ban Giám Đốc',
  'Phòng Tài Chính Kế Toán',
  'Phòng Hành Chính Nhân Sự',
  'Phòng Marketing & Kinh Doanh',
  'Trung Tâm Vận Hành Kỹ Thuật (NOC)',
  'Phòng Dự Án & R&D',
  'Khu Vực In Ấn Chung',
  'Kho Lưu Trữ Thiết Bị',
];


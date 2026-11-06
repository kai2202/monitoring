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
    code: 'HQ-HN',
    address: 'Tòa nhà Central Plaza, 7 Tầng, Hà Nội',
    isHq: true,
    floors: ['Tầng 1', 'Tầng 2', 'Tầng 3', 'Tầng 4', 'Tầng 5', 'Tầng 6', 'Tầng 7'],
  },
  {
    id: 'br-hcm',
    name: 'Chi nhánh Miền Nam',
    code: 'BR-SGN',
    address: 'Quận 1, TP. Hồ Chí Minh',
    isHq: false,
    floors: ['Tầng Trệt', 'Tầng 1', 'Tầng 2', 'Tầng 3'],
  },
  {
    id: 'br-dad',
    name: 'Chi nhánh Miền Trung',
    code: 'BR-DAD',
    address: 'Hải Châu, TP. Đà Nẵng',
    isHq: false,
    floors: ['Tầng 1', 'Tầng 2'],
  },
  {
    id: 'br-wh',
    name: 'Kho Thiết Bị Dự Phòng',
    code: 'WH-01',
    address: 'Khu Công Nghệ Cao, Hà Nội',
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


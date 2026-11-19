/**
 * Frontend/src/mocks/sla/mockSLAData.ts
 *
 * Mock Data Tập Trung Cho Phân Hệ SLA & Chi Phí (Central SLA & Cost Mock Data):
 * - Bộ chỉ số hiệu suất SLA & KPI ngân sách in ấn hạm đội.
 * - Danh mục phân bổ chi phí in ấn theo 5 phòng ban trọng điểm.
 * - Ma trận sự cố 5 hàng (tầng) x 7 cột (tuần) và kho mẫu sự cố kỹ thuật.
 * - Tuân thủ AGENTS.md Rule 5 & Rule 7.1 (< 300 LOC).
 */

import { DepartmentCostAllocationItem, SLAOverviewKPIs } from '../../types/analyticsUI';
import { ComparisonKPIsResponse } from '../../types/api';
import { Printer } from '../../types/printer';

export interface MockIncidentItem {
  device: string;
  location: string;
  desc: string;
  time: string;
  mttrMinutes: number;
  severity: 'critical' | 'warning' | 'normal';
}

export const mockSLAKpis: SLAOverviewKPIs = {
  fleetUptime: 95.5,
  targetUptime: 98.0,
  avgMtbfHours: 468,
  avgMttrMinutes: 36,
  jamRatePercent: 0.9,
  totalPrintCost: 79400000,
  avgCostPerPage: 142,
};

export const mockDepartmentCosts: DepartmentCostAllocationItem[] = [
  {
    departmentId: 'fl-1',
    departmentName: 'Tầng 1 · Kế toán, Nhân sự & Kho vận',
    floorName: 'Tầng 1',
    managerName: 'Nguyễn Văn An',
    monoPages: 48000,
    colorPages: 14500,
    monoCost: 7200000,
    colorCost: 11600000,
    repairCost: 11200000,
    suppliesCost: 6850000,
    otherCost: 1200000,
    costItems: [
      { id: 'c1', category: 'repair', title: 'Thay cụm sấy Fuser Ricoh MP C6004 (prt-001)', note: 'Phiếu TSK-2026-001', amountVnd: 7250000 },
      { id: 'c2', category: 'repair', title: 'Kiểm tra kết nối & nguồn Canon MF445dw (prt-008)', note: 'Phiếu TSK-2026-003', amountVnd: 3950000 },
      { id: 'c3', category: 'supplies', title: 'Hộp mực Ricoh MP C6004 Black & MP 3055', note: 'Xuất kho tháng 11', amountVnd: 4900000 },
      { id: 'c4', category: 'supplies', title: 'Cụm trống Drum Unit Tầng 1', note: 'Xuất kho ngày 14/11', amountVnd: 1950000 },
      { id: 'c5', category: 'other', title: 'Vệ sinh bảo trì định kỳ Tầng 1', note: 'Hợp đồng tháng 11', amountVnd: 1200000 },
    ],
    totalCost: 19250000,
    percentageShare: 24.2,
    deviceCount: 4,
    color: '#2563eb',
  },
  {
    departmentId: 'fl-2',
    departmentName: 'Tầng 2 · Kinh doanh, Marketing & Vận hành',
    floorName: 'Tầng 2',
    managerName: 'Trần Thị Bình',
    monoPages: 39000,
    colorPages: 16000,
    monoCost: 5850000,
    colorCost: 12800000,
    repairCost: 5400000,
    suppliesCost: 8900000,
    otherCost: 1100000,
    costItems: [
      { id: 'c6', category: 'repair', title: 'Sửa đèn quét ADF SC101 Ricoh MP C6004 (prt-005)', note: 'Phiếu TSK-2026-004', amountVnd: 1200000 },
      { id: 'c7', category: 'repair', title: 'Bảo dưỡng cụm kéo giấy Canon C5535i (prt-007)', note: 'Định kỳ', amountVnd: 4200000 },
      { id: 'c8', category: 'supplies', title: 'Bộ mực CMYK Ricoh & Canon Tầng 2', note: 'Xuất kho tháng 11', amountVnd: 8900000 },
      { id: 'c9', category: 'other', title: 'Phí kiểm định & hiệu chuẩn màu sắc', note: 'Dịch vụ ngoài', amountVnd: 1100000 },
    ],
    totalCost: 15400000,
    percentageShare: 19.4,
    deviceCount: 3,
    color: '#0ea5e9',
  },
  {
    departmentId: 'fl-3',
    departmentName: 'Tầng 3 · Thiết kế, Pháp chế & Dự án',
    floorName: 'Tầng 3',
    managerName: 'Lê Hoàng Nam',
    monoPages: 24000,
    colorPages: 22000,
    monoCost: 3600000,
    colorCost: 17600000,
    repairCost: 4100000,
    suppliesCost: 11200000,
    otherCost: 1450000,
    costItems: [
      { id: 'c10', category: 'repair', title: 'Xử lý kẹt giấy Tray 2 HP PageWide 556xh (prt-011)', note: 'Phiếu TSK-2026-006', amountVnd: 3350000 },
      { id: 'c11', category: 'repair', title: 'Bảo trì định kỳ HP LaserJet M608 (prt-010)', note: 'Phiếu TSK-2026-007', amountVnd: 750000 },
      { id: 'c12', category: 'supplies', title: 'Mực khổ lớn Canon PRO-541 & HP 26X', note: 'Xuất kho tháng 11', amountVnd: 11200000 },
      { id: 'c13', category: 'other', title: 'Cân chỉnh ICC Profile máy in thiết kế', note: 'Định kỳ quý 4', amountVnd: 1450000 },
    ],
    totalCost: 16750000,
    percentageShare: 21.1,
    deviceCount: 3,
    color: '#ec4899',
  },
  {
    departmentId: 'fl-4',
    departmentName: 'Tầng 4 · Ban Giám Đốc',
    floorName: 'Tầng 4',
    managerName: 'Đặng Hoàng Minh',
    monoPages: 11000,
    colorPages: 6200,
    monoCost: 1650000,
    colorCost: 4960000,
    repairCost: 4800000,
    suppliesCost: 3900000,
    otherCost: 800000,
    costItems: [
      { id: 'c14', category: 'repair', title: 'Xử lý lỗi quá nhiệt sấy E000-0001 Canon C5535i (prt-006)', note: 'Phiếu TSK-2026-002', amountVnd: 4800000 },
      { id: 'c15', category: 'supplies', title: 'Hộp mực chính hãng Canon NPG-71 (K + C)', note: 'Xuất kho ngày 13/11', amountVnd: 3900000 },
      { id: 'c16', category: 'other', title: 'Phí bảo dưỡng ưu tiên SLA Ban Giám Đốc', note: 'Định kỳ tháng 11', amountVnd: 800000 },
    ],
    totalCost: 9500000,
    percentageShare: 12.0,
    deviceCount: 1,
    color: '#8b5cf6',
  },
  {
    departmentId: 'fl-5',
    departmentName: 'Tầng 5 · Trung tâm Chế bản In ấn',
    floorName: 'Tầng 5',
    managerName: 'Phạm Thu Hà',
    monoPages: 52000,
    colorPages: 33000,
    monoCost: 7800000,
    colorCost: 26400000,
    repairCost: 3600000,
    suppliesCost: 13500000,
    otherCost: 1400000,
    costItems: [
      { id: 'c17', category: 'repair', title: 'Thay trục lăn Transfer Roller Ricoh Pro C7200s (prt-004)', note: 'Bảo trì công suất cao', amountVnd: 3600000 },
      { id: 'c18', category: 'supplies', title: 'Mực công nghiệp CMYK dung lượng lớn', note: 'Xuất kho tháng 11', amountVnd: 13500000 },
      { id: 'c19', category: 'other', title: 'Kiểm định chất lượng in chế bản', note: 'Định kỳ tháng 11', amountVnd: 1400000 },
    ],
    totalCost: 18500000,
    percentageShare: 23.3,
    deviceCount: 1,
    color: '#10b981',
  },
];

export const mockIncidentHeatmapWeeks = [
  'Tuần 1',
  'Tuần 2',
  'Tuần 3',
  'Tuần 4',
  'Tuần 5',
  'Tuần 6',
  'Tuần 7',
];

export const mockIncidentMatrixCounts: number[][] = [
  [0, 0, 1, 0, 3, 0, 0], // Tầng 1 (Kế toán) - 1 vụ W3, 3 vụ W5 (Hotspot)
  [0, 2, 1, 0, 0, 0, 0], // Tầng 2 (Marketing) - 2 vụ W2, 1 vụ W3
  [0, 0, 1, 10, 0, 0, 0], // Tầng 3 (Kỹ thuật) - 1 vụ W3, 10 vụ W4 (Điểm nóng nghiêm trọng)
  [0, 0, 1, 0, 0, 0, 0], // Tầng 4 (Ban Giám Đốc) - 1 vụ W3
  [0, 0, 0, 0, 0, 1, 0], // Tầng 5 (Nhân sự) - 1 vụ W6
  [0, 0, 1, 0, 0, 0, 0], // Tầng 6 (Hành chính) - 1 vụ W3
  [0, 0, 1, 0, 0, 0, 0], // Tầng 7 (NOC) - 1 vụ W3
];

export const mockIncidentDetailMap: Record<string, MockIncidentItem[]> = {
  'f1_2': [
    { device: 'Ricoh MP C6004', location: 'Tầng 1 • Kế toán', desc: 'SC541-00 Đứt mạch cảm biến nhiệt cụm sấy', time: '14:20 T2', mttrMinutes: 45, severity: 'critical' },
  ],
  'f2_2': [
    { device: 'Canon iR C3226i', location: 'Tầng 2 • Marketing', desc: 'Kẹt giấy khay nạp 2 (Tray 2 Pick Roller)', time: '09:35 T5', mttrMinutes: 38, severity: 'warning' },
  ],
  'f3_2': [
    { device: 'Xerox VersaLink C7020', location: 'Tầng 3 • Kỹ thuật', desc: 'Mực thải gần đầy (Waste Toner 92%)', time: '11:15 T3', mttrMinutes: 30, severity: 'warning' },
  ],
  'f4_2': [
    { device: 'Konica bizhub C360i', location: 'Tầng 4 • Giám đốc', desc: 'Kẹt giấy khay nạp ADF', time: '16:40 T6', mttrMinutes: 42, severity: 'warning' },
  ],
  'f5_2': [
    { device: 'Brother MFC-L8690', location: 'Tầng 5 • Pháp chế', desc: 'Trống quang học mờ ảnh (Drum life 12%)', time: '10:05 T4', mttrMinutes: 32, severity: 'warning' },
  ],
  'f6_2': [
    { device: 'HP LaserJet E82650', location: 'Tầng 6 • Hành chính', desc: 'Kẹt giấy cụm đảo mặt Duplex Unit', time: '08:50 T2', mttrMinutes: 36, severity: 'warning' },
  ],
  'f7_2': [
    { device: 'Ricoh IM C6000', location: 'Tầng 7 • NOC', desc: 'Cảnh báo nhiệt độ sấy cao tạm thời', time: '15:10 T5', mttrMinutes: 25, severity: 'warning' },
  ],
};

export const mockCommonIncidentTemplates = [
  { desc: 'Kẹt giấy cụm sấy nhiệt (Fuser Jam)', severity: 'critical' as const, mttrMinutes: 42 },
  { desc: 'Cảnh báo nhiệt độ sấy quá ngưỡng (Fuser High Temp)', severity: 'critical' as const, mttrMinutes: 35 },
  { desc: 'Kẹt giấy khay nạp 2 (Tray 2 Pick Roller)', severity: 'warning' as const, mttrMinutes: 28 },
  { desc: 'Mực thải gần đầy (Waste Toner > 90%)', severity: 'warning' as const, mttrMinutes: 20 },
  { desc: 'Lỗi nạp giấy tự động ADF (Document Feeder)', severity: 'warning' as const, mttrMinutes: 32 },
  { desc: 'Trống quang học Drum mòn (Drum Life < 10%)', severity: 'critical' as const, mttrMinutes: 45 },
  { desc: 'Kẹt giấy cụm đảo mặt Duplex Unit', severity: 'warning' as const, mttrMinutes: 30 },
  { desc: 'Cảm biến quang học che khuất bụi giấy', severity: 'warning' as const, mttrMinutes: 18 },
  { desc: 'SC-542 Lỗi trở nhiệt sấy ống lồng fuser', severity: 'critical' as const, mttrMinutes: 50 },
  { desc: 'Lỗi mô-tơ phân phối giấy chính (Main Motor)', severity: 'critical' as const, mttrMinutes: 65 },
];

export function generateMockCellIncidents(
  key: string,
  floorLabel: string,
  count: number,
  existingDetails?: Record<string, MockIncidentItem[]>
): MockIncidentItem[] {
  if (existingDetails && existingDetails[key] && existingDetails[key].length > 0) {
    return existingDetails[key];
  }
  if (mockIncidentDetailMap[key] && mockIncidentDetailMap[key].length > 0) {
    return mockIncidentDetailMap[key];
  }
  if (count <= 0) return [];

  const days = ['T2', 'T3', 'T4', 'T5', 'T6'];
  const printers = ['Ricoh IM C6000', 'Canon iR C3226i', 'HP LaserJet E82650', 'Xerox VersaLink C7020', 'Konica bizhub C360i'];

  return Array.from({ length: count }, (_, i) => {
    const tmpl = mockCommonIncidentTemplates[i % mockCommonIncidentTemplates.length];
    const dev = printers[i % printers.length];
    const day = days[i % days.length];
    const hour = 8 + ((i * 2) % 10);
    const min = (i * 17) % 60;
    return {
      device: `${dev} (${floorLabel.split(' ')[0]})`,
      location: floorLabel,
      desc: tmpl.desc,
      time: `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')} ${day}`,
      mttrMinutes: tmpl.mttrMinutes,
      severity: tmpl.severity,
    };
  });
}

export function generateMockComparisonKPIs(printers: Printer[]): ComparisonKPIsResponse {
  return printers.map((p) => {
    const vol = p.thirtyDayVolume ?? 15400;
    return {
      printerId: p.id,
      printerName: p.name,
      model: p.model,
      brand: p.mfr || 'Ricoh',
      floor: p.floor || 'Tầng 1',
      department: p.department || 'Văn phòng',
      color: '#2563eb',
      totalPages: vol,
      ppmActual: 31,
      ppmNominal: 35,
      uptimePercent: p.connectionStatus === 'Online' ? 99.6 : 85.0,
      mtbfHours: 480,
      failureCount: p.health === 'Critical' ? 3 : p.health === 'Warning' ? 1 : 0,
      downtimeHours: p.connectionStatus === 'Online' ? 2.5 : 36.0,
      production: {
        monoPages: Math.round(vol * 0.7),
        colorPages: Math.round(vol * 0.3),
        colorRatioPercent: 30,
        avgDailyPages: Math.round(vol / 30),
      },
      speed: { firstPageOutSeconds: 6.2, warmupTimeSeconds: 18 },
      reliability: { mttrHours: 0.75, paperJamCount: 1, hardwareFaultCount: 0, lastIncidentTime: '2 ngày trước' },
      availability: { maintenanceCount: 2, scheduledDowntimeHours: 4, unscheduledDowntimeHours: 1 },
      consumables: {
        tonerBlackPercent: p.supplies?.black ?? 80,
        tonerCyanPercent: p.supplies?.cyan ?? 85,
        tonerMagentaPercent: p.supplies?.magenta ?? 75,
        tonerYellowPercent: p.supplies?.yellow ?? 90,
        drumLifePercent: 70,
        wasteTonerBoxStatus: 'OK',
      },
    };
  });
}

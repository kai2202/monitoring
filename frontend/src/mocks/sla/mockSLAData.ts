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
  fleetUptime: 99.4,
  targetUptime: 99.0,
  avgMtbfHours: 512,
  avgMttrMinutes: 34,
  jamRatePercent: 0.8,
  totalPrintCost: 84250000,
  avgCostPerPage: 135,
};

export const mockDepartmentCosts: DepartmentCostAllocationItem[] = [
  {
    departmentId: 'd1',
    departmentName: 'Kế toán & Tài chính',
    monoPages: 45000,
    colorPages: 12000,
    monoCost: 6750000,
    colorCost: 12000000,
    totalCost: 18750000,
    percentageShare: 22.3,
    deviceCount: 8,
    color: '#2563eb',
  },
  {
    departmentId: 'd2',
    departmentName: 'Kỹ thuật & R&D',
    monoPages: 62000,
    colorPages: 8000,
    monoCost: 9300000,
    colorCost: 8000000,
    totalCost: 17300000,
    percentageShare: 20.5,
    deviceCount: 10,
    color: '#0ea5e9',
  },
  {
    departmentId: 'd3',
    departmentName: 'Marketing & Media',
    monoPages: 18000,
    colorPages: 35000,
    monoCost: 2700000,
    colorCost: 35000000,
    totalCost: 37700000,
    percentageShare: 44.8,
    deviceCount: 6,
    color: '#ec4899',
  },
  {
    departmentId: 'd4',
    departmentName: 'Ban Giám Đốc',
    monoPages: 12000,
    colorPages: 4000,
    monoCost: 1800000,
    colorCost: 4000000,
    totalCost: 5800000,
    percentageShare: 6.9,
    deviceCount: 3,
    color: '#f59e0b',
  },
  {
    departmentId: 'd5',
    departmentName: 'Nhân sự & Hành chính',
    monoPages: 28000,
    colorPages: 3000,
    monoCost: 4200000,
    colorCost: 2500000,
    totalCost: 6700000,
    percentageShare: 8.0,
    deviceCount: 5,
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

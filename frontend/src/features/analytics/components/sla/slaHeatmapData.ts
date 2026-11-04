/**
 * Frontend/src/features/analytics/components/sla/slaHeatmapData.ts
 *
 * Dữ liệu Ma trận Điểm nóng Sự cố (Incident Hotspot Matrix Data):
 * - 5 Hàng (Khu vực / Tầng) x 7 Cột (Tuần 1 - Tuần 7).
 * - Chi tiết thiết bị, lỗi, MTBF, MTTR cho từng ô ma trận.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

export interface MatrixCellIncident {
  device: string;
  location: string;
  desc: string;
  time: string;
  mttrMinutes: number;
  severity: 'critical' | 'warning' | 'normal';
}

export interface MatrixCellData {
  floorId: string;
  floorLabel: string;
  weekLabel: string;
  incidentCount: number;
  mtbfHours: number;
  jamRatePercent: number;
  incidents: MatrixCellIncident[];
}

export interface FloorRowDef {
  id: string;
  name: string;
  shortName: string;
  room: string;
}

export const HEATMAP_FLOORS: FloorRowDef[] = [
  { id: 'f1', name: 'Tầng 1', shortName: 'T1', room: 'Kế toán & Tài chính' },
  { id: 'f2', name: 'Tầng 2', shortName: 'T2', room: 'Marketing & Truyền thông' },
  { id: 'f3', name: 'Tầng 3', shortName: 'T3', room: 'Kỹ thuật & R&D' },
  { id: 'f4', name: 'Tầng 4', shortName: 'T4', room: 'Ban Giám Đốc' },
  { id: 'f5', name: 'Tầng 5', shortName: 'T5', room: 'Nhân sự & Pháp chế' },
];

export const HEATMAP_WEEKS: string[] = [
  'Tuần 1',
  'Tuần 2',
  'Tuần 3',
  'Tuần 4',
  'Tuần 5',
  'Tuần 6',
  'Tuần 7',
];

// Ma trận sự cố 5 hàng x 7 tuần: [floorIndex][weekIndex] = count
export const INCIDENT_MATRIX_COUNTS: number[][] = [
  [2, 0, 0, 1, 0, 1, 0], // Tầng 1: Kế toán (Điểm nóng tuần 1: 2 vụ)
  [1, 0, 0, 1, 0, 0, 0], // Tầng 2: Marketing (Tuần 1: 1 vụ, Tuần 4: 1 vụ)
  [0, 1, 0, 0, 0, 1, 0], // Tầng 3: Kỹ thuật (Tuần 2: 1 vụ, Tuần 6: 1 vụ)
  [0, 1, 0, 0, 1, 0, 0], // Tầng 4: Ban Giám Đốc (Tuần 2: 1 vụ, Tuần 5: 1 vụ)
  [0, 0, 1, 0, 0, 0, 0], // Tầng 5: Pháp chế (Tuần 3: 1 vụ)
];

// Bảng chi tiết sự cố theo ô ma trận key: `${floorId}_${weekIdx}`
const INCIDENTS_DETAIL_MAP: Record<string, MatrixCellIncident[]> = {
  'f1_0': [
    { device: 'HP LaserJet M554dn', location: 'Tầng 1 • Kế toán', desc: 'Kẹt giấy cụm sấy nhiệt (Fuser)', time: '14:20 T2', mttrMinutes: 44, severity: 'critical' },
    { device: 'HP LaserJet E82650', location: 'Tầng 1 • Kế toán', desc: 'Cảnh báo nhiệt độ sấy cao', time: '16:05 T4', mttrMinutes: 28, severity: 'warning' },
  ],
  'f1_3': [
    { device: 'HP LaserJet E82650', location: 'Tầng 1 • Kế toán', desc: 'Kẹt giấy cửa hông duplex', time: '08:50 T2', mttrMinutes: 36, severity: 'warning' },
  ],
  'f1_5': [
    { device: 'HP LaserJet M554dn', location: 'Tầng 1 • Kế toán', desc: 'Kẹt giấy khay chính khay 1', time: '09:40 T2', mttrMinutes: 35, severity: 'warning' },
  ],
  'f2_0': [
    { device: 'Canon iR C3226i', location: 'Tầng 2 • Marketing', desc: 'Lỗi nạp giấy khay 2 (Pick Roller)', time: '09:35 T5', mttrMinutes: 38, severity: 'warning' },
  ],
  'f2_3': [
    { device: 'Canon iR C3226i', location: 'Tầng 2 • Marketing', desc: 'Sensor nhận diện giấy bám bụi', time: '15:10 T5', mttrMinutes: 25, severity: 'warning' },
  ],
  'f3_1': [
    { device: 'Xerox VersaLink C7020', location: 'Tầng 3 • Kỹ thuật', desc: 'Mực thải gần đầy (Waste Toner 92%)', time: '11:15 T3', mttrMinutes: 30, severity: 'warning' },
  ],
  'f3_5': [
    { device: 'Xerox VersaLink C7020', location: 'Tầng 3 • Kỹ thuật', desc: 'Cần vệ sinh thanh gạt cao su Drum', time: '14:50 T4', mttrMinutes: 32, severity: 'warning' },
  ],
  'f4_1': [
    { device: 'Konica bizhub C360i', location: 'Tầng 4 • Giám đốc', desc: 'Kẹt giấy khay nạp ADF', time: '16:40 T6', mttrMinutes: 42, severity: 'warning' },
  ],
  'f4_4': [
    { device: 'Konica bizhub C360i', location: 'Tầng 4 • Giám đốc', desc: 'Cảnh báo nhiệt độ sấy cao tạm thời', time: '13:20 T3', mttrMinutes: 28, severity: 'warning' },
  ],
  'f5_2': [
    { device: 'Brother MFC-L8690', location: 'Tầng 5 • Pháp chế', desc: 'Trống quang học mờ ảnh (Drum life 12%)', time: '10:05 T4', mttrMinutes: 32, severity: 'warning' },
  ],
};

export const getMatrixCellData = (floorIndex: number, weekIndex: number): MatrixCellData => {
  const floor = HEATMAP_FLOORS[floorIndex] || HEATMAP_FLOORS[0];
  const weekLabel = HEATMAP_WEEKS[weekIndex] || 'Tuần 1';
  const count = INCIDENT_MATRIX_COUNTS[floorIndex]?.[weekIndex] ?? 0;
  const key = `${floor.id}_${weekIndex}`;
  const incidents = INCIDENTS_DETAIL_MAP[key] || [];

  // Tính MTBF & tỷ lệ kẹt theo mức độ sự cố
  const baseMtbf = 540 - count * 40;
  const jamRate = count === 0 ? 0.4 : count === 1 ? 1.2 : 2.2;

  return {
    floorId: floor.id,
    floorLabel: `${floor.name} (${floor.room})`,
    weekLabel,
    incidentCount: count,
    mtbfHours: baseMtbf,
    jamRatePercent: jamRate,
    incidents,
  };
};


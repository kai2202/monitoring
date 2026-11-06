/**
 * Frontend/src/features/analytics/components/sla/slaHeatmapData.ts
 *
 * Kiểu Dữ Liệu & Tiện Ích Ma Trận Điểm Nóng Sự Cố (Incident Hotspot Matrix Types & Helpers):
 * - Hoàn toàn không phụ thuộc mock data (Zero-Coupling với src/mocks/).
 * - Clean Slate Architecture: Khi không có dữ liệu tầng từ locationService, trả về [] thay vì tự gán 5 tầng mẫu.
 * - Tuân thủ AGENTS.md Rule 5 & Rule 7.1 (< 300 LOC).
 */

import React from 'react';
import { locationService } from '@/services';

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

export const DEFAULT_HEATMAP_WEEKS = ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4', 'Tuần 5', 'Tuần 6', 'Tuần 7'];

export const getDynamicHeatmapFloors = (branchName?: string): FloorRowDef[] => {
  const floorNames = locationService.getFloorsByBranch(branchName);

  if (floorNames.length === 0) {
    return [];
  }

  const defaultRooms: Record<string, string> = {
    'Tầng 1': 'Kế toán & Tài chính',
    'Tầng 2': 'Marketing & Truyền thông',
    'Tầng 3': 'Kỹ thuật & R&D',
    'Tầng 4': 'Ban Giám Đốc',
    'Tầng 5': 'Nhân sự & Pháp chế',
    'Tầng 6': 'Hành chính tổng hợp',
    'Tầng 7': 'Hội trường & NOC',
    'Tầng Trệt': 'Lễ tân & CSKH',
    'Kho Tổng': 'Trung tâm hậu cần',
  };

  return floorNames.map((flName, idx) => ({
    id: `f${idx + 1}`,
    name: flName,
    shortName: flName.replace('Tầng ', 'T'),
    room: defaultRooms[flName] || 'Khu vực làm việc',
  }));
};

const SAMPLE_INCIDENT_DESCS = [
  'Kẹt giấy cụm sấy nhiệt (Fuser Jam)',
  'Lỗi nạp giấy tự động ADF khay nạp trên',
  'Mực thải gần đầy (Waste Toner > 90%)',
  'Cảm biến quang học che khuất bụi giấy',
  'SC-542 Lỗi trở nhiệt sấy ống lồng fuser',
  'Kẹt giấy khay nạp 2 (Tray 2 Pick Roller)',
  'Trống quang học Drum mòn (Drum Life < 10%)',
  'Kẹt giấy cụm đảo mặt Duplex Unit',
  'Lỗi mô-tơ phân phối giấy chính (Main Motor)',
  'Cảnh báo nhiệt độ sấy quá ngưỡng (Fuser High Temp)',
];

export function generateCellIncidentsFallback(
  floor: FloorRowDef,
  count: number
): MatrixCellIncident[] {
  if (count <= 0) return [];
  return Array.from({ length: count }, (_, i) => ({
    device: `Máy in ${floor.shortName}-${String(i + 1).padStart(2, '0')}`,
    location: `${floor.name} (${floor.room})`,
    desc: SAMPLE_INCIDENT_DESCS[i % SAMPLE_INCIDENT_DESCS.length],
    time: `${String(8 + ((i * 2) % 10)).padStart(2, '0')}:${String((i * 13) % 60).padStart(2, '0')} ${['T2', 'T3', 'T4', 'T5', 'T6'][i % 5]}`,
    mttrMinutes: 25 + ((i * 7) % 35),
    severity: i === 0 || i % 4 === 0 ? 'critical' : 'warning',
  }));
}

export function getHeatmapCellVisual(count: number, isSelected: boolean): React.CSSProperties {
  let bg = 'rgba(241, 245, 249, 0.65)';
  let border = 'var(--border-color, #e2e8f0)';
  let text = 'var(--text-muted, #94a3b8)';

  if (count === 1) {
    bg = '#fef3c7';
    border = '#fde68a';
    text = '#b45309';
  } else if (count >= 2 && count < 5) {
    bg = '#ffe4e6';
    border = '#fda4af';
    text = '#e11d48';
  } else if (count >= 5) {
    bg = '#fee2e2';
    border = '#ef4444';
    text = '#991b1b';
  }

  return {
    backgroundColor: bg,
    border: isSelected ? '2px solid #e11d48' : `1px solid ${border}`,
    color: text,
    transform: isSelected ? 'scale(1.08)' : 'scale(1)',
    boxShadow: count >= 5
      ? '0 0 10px rgba(239, 68, 68, 0.45)'
      : isSelected
      ? '0 4px 12px rgba(225, 29, 72, 0.25)'
      : 'none',
    zIndex: isSelected ? 3 : 1,
  };
}

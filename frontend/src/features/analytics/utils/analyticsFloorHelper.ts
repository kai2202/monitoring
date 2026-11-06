/**
 * Frontend/src/features/analytics/utils/analyticsFloorHelper.ts
 *
 * Tiện ích Tổng Hợp Sản Lượng Động Theo Tầng & Chi Nhánh:
 * - Dữ liệu tính toán trực tiếp từ danh sách thiết bị thực tế (DeviceProductionItem[]).
 * - Clean Slate Architecture: Khi không có dữ liệu tầng hoặc thiết bị, trả về mảng rỗng []
 *   thay vì tự ý gán mảng mặc định ['Tầng 1', 'Tầng 2',...].
 * - Tuân thủ AGENTS.md Rule 5 & Rule 7.1 (< 300 LOC).
 */

import { FloorSummaryItem } from '@/types/analyticsUI';
import { DeviceProductionItem } from '@/types/api';
import { locationService } from '@/services';

const FLOOR_COLORS = [
  '#2563eb', // Blue
  '#06b6d4', // Cyan
  '#8b5cf6', // Violet
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#ec4899', // Pink
  '#6366f1', // Indigo
  '#14b8a6', // Teal
];

export function getDynamicFloorSummaries(
  branchName: string,
  devices: DeviceProductionItem[] = []
): FloorSummaryItem[] {
  const floors = locationService.getFloorsByBranch(branchName);

  let activeFloors = floors;
  if (activeFloors.length === 0 && devices.length > 0) {
    const set = new Set<string>();
    devices.forEach((d) => {
      if (d.floorName) set.add(d.floorName);
    });
    activeFloors = Array.from(set);
  }

  // Trạng thái Clean Slate: Rỗng hoàn toàn nếu chưa có tầng hoặc thiết bị
  if (activeFloors.length === 0) {
    return [];
  }

  let grandTotal = 0;
  const raw = activeFloors.map((flName, idx) => {
    const devs = devices.filter(
      (d) => d.floorName === flName || d.floorId === `floor-${idx + 1}`
    );
    const vol = devs.reduce((acc, d) => acc + (d.totalVol || 0), 0);
    grandTotal += vol;

    return {
      floorId: `floor-${idx + 1}`,
      floorName: flName,
      deviceCount: devs.length,
      totalVolume: vol,
      color: FLOOR_COLORS[idx % FLOOR_COLORS.length],
    };
  });

  return raw.map((r) => ({
    ...r,
    sharePercentage: grandTotal > 0 ? Math.round((r.totalVolume / grandTotal) * 100) : 0,
  }));
}

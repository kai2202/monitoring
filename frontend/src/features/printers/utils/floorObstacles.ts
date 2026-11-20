/**
 * Frontend/src/features/printers/utils/floorObstacles.ts
 *
 * Quản lý cấu trúc mặt bằng kiến trúc AutoCAD (Tường, Cửa mở, Bàn làm việc, Lối đi, Cột):
 * - Lưu trữ trạng thái cấu trúc theo từng tầng vào LocalStorage.
 * - Tự động gộp wallEdges tại các góc vuông, cột sát tường và giao lộ vách ngăn.
 * - Dãy bàn tối đa 2 hàng đấu lưng nhau, luôn có lối đi/ghế ngồi hợp lý.
 */

import { FloorObstacle, FloorObstacleType } from '@/types/printer';
import { DATA_SOURCE } from '@/config/dataSource';

const STORAGE_PREFIX = 'fleetmonitor_floor_obstacles_v6_';

function createRange(
  floor: string,
  type: FloorObstacleType,
  label: string,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  wallEdges?: ('top' | 'bottom' | 'left' | 'right')[],
  team?: string
): FloorObstacle[] {
  const result: FloorObstacle[] = [];
  const minX = Math.min(startX, endX);
  const maxX = Math.max(startX, endX);
  const minY = Math.min(startY, endY);
  const maxY = Math.max(startY, endY);
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      result.push({
        id: `${type}-${x}-${y}-${floor}`,
        floor,
        gridX: x,
        gridY: y,
        type,
        label,
        ...(team ? { team } : {}),
        ...(wallEdges ? { wallEdges } : type === 'wall' ? { wallEdges: ['top', 'bottom'] } : {}),
      });
    }
  }
  return result;
}

/** Gộp các obstacle trùng tọa độ để giữ đủ wallEdges ở 4 góc vuông và bọc tường quanh cột */
function mergeObstacles(items: FloorObstacle[]): FloorObstacle[] {
  const map = new Map<string, FloorObstacle>();
  for (const item of items) {
    const key = `${item.gridX},${item.gridY}`;
    const existing = map.get(key);
    if (!existing) {
      map.set(key, { ...item, wallEdges: item.wallEdges ? [...item.wallEdges] : undefined });
      continue;
    }
    const mergedEdges = Array.from(
      new Set([...(existing.wallEdges || []), ...(item.wallEdges || [])])
    );
    const preferred = item.type !== 'wall' ? item : existing;
    map.set(key, {
      ...preferred,
      ...(mergedEdges.length > 0 ? { wallEdges: mergedEdges } : {}),
    });
  }
  return Array.from(map.values());
}

const DEFAULT_SEEDS: Record<string, FloorObstacle[]> = {
  'Tầng trệt': mergeObstacles([
    // 1. Tường bao kiến trúc (gộp góc vuông tự động)
    ...createRange('Tầng trệt', 'wall', 'Tường bao trên', 0, 0, 19, 0, ['top']),
    ...createRange('Tầng trệt', 'wall', 'Tường bao dưới', 0, 9, 19, 9, ['bottom']),
    ...createRange('Tầng trệt', 'wall', 'Tường biên trái', 0, 0, 0, 9, ['left']),
    ...createRange('Tầng trệt', 'wall', 'Tường biên phải', 19, 0, 19, 9, ['right']),

    // 2. Tường ngăn phòng & hành lang
    ...createRange('Tầng trệt', 'wall', 'Vách ngăn Khu A & B', 9, 0, 9, 3, ['right']),
    ...createRange('Tầng trệt', 'wall', 'Vách ngăn Khu C & D', 9, 5, 9, 9, ['right']),
    ...createRange('Tầng trệt', 'wall', 'Tường hành lang trên', 0, 3, 3, 3, ['bottom']),
    ...createRange('Tầng trệt', 'wall', 'Tường hành lang trên', 5, 3, 9, 3, ['bottom']),
    ...createRange('Tầng trệt', 'wall', 'Tường hành lang trên', 10, 3, 13, 3, ['bottom']),
    ...createRange('Tầng trệt', 'wall', 'Tường hành lang trên', 15, 3, 19, 3, ['bottom']),
    ...createRange('Tầng trệt', 'wall', 'Tường hành lang dưới', 0, 5, 3, 5, ['top']),
    ...createRange('Tầng trệt', 'wall', 'Tường hành lang dưới', 5, 5, 9, 5, ['top']),
    ...createRange('Tầng trệt', 'wall', 'Tường hành lang dưới', 10, 5, 13, 5, ['top']),
    ...createRange('Tầng trệt', 'wall', 'Tường hành lang dưới', 15, 5, 19, 5, ['top']),

    // 3. Cửa mở vào từng phòng
    { id: 'door-4-3-tt', floor: 'Tầng trệt', gridX: 4, gridY: 3, type: 'door', label: 'Cửa Phòng Lễ tân' },
    { id: 'door-14-3-tt', floor: 'Tầng trệt', gridX: 14, gridY: 3, type: 'door', label: 'Cửa Phòng Kế toán' },
    { id: 'door-4-5-tt', floor: 'Tầng trệt', gridX: 4, gridY: 5, type: 'door', label: 'Cửa Phòng Kỹ thuật' },
    { id: 'door-14-5-tt', floor: 'Tầng trệt', gridX: 14, gridY: 5, type: 'door', label: 'Cửa Phòng Tổng vụ' },

    // 4. Hành lang chính
    ...createRange('Tầng trệt', 'walkway', 'Hành lang chính', 0, 4, 19, 4),

    // 5. Dãy bàn làm việc 2 hàng đấu lưng (có lối đi xung quanh)
    ...createRange('Tầng trệt', 'desk', 'Bàn Lễ tân & Đón tiếp', 2, 1, 6, 2, undefined, 'Phòng Hành chính - Nhân sự'),
    ...createRange('Tầng trệt', 'desk', 'Dãy Bàn Kế toán', 12, 1, 16, 2, undefined, 'Phòng Kế toán Tài chính'),
    ...createRange('Tầng trệt', 'desk', 'Dãy Bàn Kỹ thuật', 2, 7, 6, 8, undefined, 'Đội Kỹ thuật CNTT (IT)'),
    ...createRange('Tầng trệt', 'desk', 'Dãy Bàn Tổng vụ & Kho', 12, 7, 16, 8, undefined, 'Ban Quản trị Tổng vụ'),

    // 6. Cột chịu lực sát tường/góc (được bọc bởi tường bao)
    { id: 'pillar-0-0-tt', floor: 'Tầng trệt', gridX: 0, gridY: 0, type: 'pillar', label: 'Cột góc C1' },
    { id: 'pillar-19-0-tt', floor: 'Tầng trệt', gridX: 19, gridY: 0, type: 'pillar', label: 'Cột góc C2' },
    { id: 'pillar-0-9-tt', floor: 'Tầng trệt', gridX: 0, gridY: 9, type: 'pillar', label: 'Cột góc C3' },
    { id: 'pillar-19-9-tt', floor: 'Tầng trệt', gridX: 19, gridY: 9, type: 'pillar', label: 'Cột góc C4' },
    { id: 'pillar-9-0-tt', floor: 'Tầng trệt', gridX: 9, gridY: 0, type: 'pillar', label: 'Cột trục giữa trên' },
    { id: 'pillar-9-9-tt', floor: 'Tầng trệt', gridX: 9, gridY: 9, type: 'pillar', label: 'Cột trục giữa dưới' },
  ]),

  'Tầng 1': mergeObstacles([
    ...createRange('Tầng 1', 'wall', 'Tường bao trên', 0, 0, 19, 0, ['top']),
    ...createRange('Tầng 1', 'wall', 'Tường bao dưới', 0, 9, 19, 9, ['bottom']),
    ...createRange('Tầng 1', 'wall', 'Tường biên trái', 0, 0, 0, 9, ['left']),
    ...createRange('Tầng 1', 'wall', 'Tường biên phải', 19, 0, 19, 9, ['right']),
    ...createRange('Tầng 1', 'wall', 'Vách ngăn Khu A & B', 9, 0, 9, 3, ['right']),
    ...createRange('Tầng 1', 'wall', 'Vách ngăn Khu C & D', 9, 5, 9, 9, ['right']),
    ...createRange('Tầng 1', 'wall', 'Tường hành lang trên', 0, 3, 3, 3, ['bottom']),
    ...createRange('Tầng 1', 'wall', 'Tường hành lang trên', 5, 3, 9, 3, ['bottom']),
    ...createRange('Tầng 1', 'wall', 'Tường hành lang trên', 10, 3, 13, 3, ['bottom']),
    ...createRange('Tầng 1', 'wall', 'Tường hành lang trên', 15, 3, 19, 3, ['bottom']),
    ...createRange('Tầng 1', 'wall', 'Tường hành lang dưới', 0, 5, 3, 5, ['top']),
    ...createRange('Tầng 1', 'wall', 'Tường hành lang dưới', 5, 5, 9, 5, ['top']),
    ...createRange('Tầng 1', 'wall', 'Tường hành lang dưới', 10, 5, 13, 5, ['top']),
    ...createRange('Tầng 1', 'wall', 'Tường hành lang dưới', 15, 5, 19, 5, ['top']),
    { id: 'door-4-3-t1', floor: 'Tầng 1', gridX: 4, gridY: 3, type: 'door', label: 'Cửa P.Kinh doanh' },
    { id: 'door-14-3-t1', floor: 'Tầng 1', gridX: 14, gridY: 3, type: 'door', label: 'Cửa P.Tài chính' },
    { id: 'door-4-5-t1', floor: 'Tầng 1', gridX: 4, gridY: 5, type: 'door', label: 'Cửa P.Marketing' },
    { id: 'door-14-5-t1', floor: 'Tầng 1', gridX: 14, gridY: 5, type: 'door', label: 'Cửa P.Nhân sự' },
    ...createRange('Tầng 1', 'walkway', 'Hành lang', 0, 4, 19, 4),
    ...createRange('Tầng 1', 'desk', 'Bàn Kinh doanh', 2, 1, 6, 2, undefined, 'Khối Vận hành Kinh doanh'),
    ...createRange('Tầng 1', 'desk', 'Bàn Tài chính', 12, 1, 16, 2, undefined, 'Phòng Kế toán Tài chính'),
    ...createRange('Tầng 1', 'desk', 'Bàn Marketing', 2, 7, 6, 8, undefined, 'Khối Vận hành Kinh doanh'),
    ...createRange('Tầng 1', 'desk', 'Bàn Nhân sự', 12, 7, 16, 8, undefined, 'Phòng Hành chính - Nhân sự'),
    { id: 'pillar-0-0-t1', floor: 'Tầng 1', gridX: 0, gridY: 0, type: 'pillar', label: 'Cột góc C1' },
    { id: 'pillar-19-0-t1', floor: 'Tầng 1', gridX: 19, gridY: 0, type: 'pillar', label: 'Cột góc C2' },
    { id: 'pillar-0-9-t1', floor: 'Tầng 1', gridX: 0, gridY: 9, type: 'pillar', label: 'Cột góc C3' },
    { id: 'pillar-19-9-t1', floor: 'Tầng 1', gridX: 19, gridY: 9, type: 'pillar', label: 'Cột góc C4' },
  ]),

  'Tầng 2': mergeObstacles([
    ...createRange('Tầng 2', 'wall', 'Tường bao trên', 0, 0, 19, 0, ['top']),
    ...createRange('Tầng 2', 'wall', 'Tường bao dưới', 0, 9, 19, 9, ['bottom']),
    ...createRange('Tầng 2', 'wall', 'Tường biên trái', 0, 0, 0, 9, ['left']),
    ...createRange('Tầng 2', 'wall', 'Tường biên phải', 19, 0, 19, 9, ['right']),
    ...createRange('Tầng 2', 'wall', 'Tường ngăn dọc trên', 9, 0, 9, 3, ['right']),
    ...createRange('Tầng 2', 'wall', 'Tường ngăn dọc dưới', 9, 5, 9, 9, ['right']),
    { id: 'door-9-4-t2', floor: 'Tầng 2', gridX: 9, gridY: 4, type: 'door', label: 'Cửa thông phòng' },
    ...createRange('Tầng 2', 'walkway', 'Hành lang mở', 0, 4, 8, 4),
    ...createRange('Tầng 2', 'walkway', 'Hành lang mở', 10, 4, 19, 4),
    // Tối đa 2 hàng bàn mỗi cụm để có lối ngồi & lối đi ở giữa
    ...createRange('Tầng 2', 'desk', 'Dãy Bàn R&D 01', 2, 1, 7, 2, undefined, 'Đội Kỹ thuật CNTT (IT)'),
    ...createRange('Tầng 2', 'desk', 'Dãy Bàn R&D 02', 11, 1, 17, 2, undefined, 'Đội Kỹ thuật CNTT (IT)'),
    ...createRange('Tầng 2', 'desk', 'Dãy Bàn Lab Test', 2, 6, 7, 7, undefined, 'Ban Quản trị Tổng vụ'),
    ...createRange('Tầng 2', 'desk', 'Dãy Bàn Server', 11, 6, 17, 7, undefined, 'Đội Kỹ thuật CNTT (IT)'),
    { id: 'pillar-0-0-t2', floor: 'Tầng 2', gridX: 0, gridY: 0, type: 'pillar', label: 'Cột góc C1' },
    { id: 'pillar-19-0-t2', floor: 'Tầng 2', gridX: 19, gridY: 0, type: 'pillar', label: 'Cột góc C2' },
    { id: 'pillar-0-9-t2', floor: 'Tầng 2', gridX: 0, gridY: 9, type: 'pillar', label: 'Cột góc C3' },
    { id: 'pillar-19-9-t2', floor: 'Tầng 2', gridX: 19, gridY: 9, type: 'pillar', label: 'Cột góc C4' },
  ]),
};

const DIMS_PREFIX = 'fleetmonitor_floor_dims_v1_';
const DEFAULT_DIMS = { rows: 10, cols: 20 };

function buildKey(floor: string, branch?: string): string {
  return branch ? `${branch}::${floor}` : floor;
}

export function getFloorDimensions(floor: string, branch?: string): { rows: number; cols: number } {
  try {
    const raw = localStorage.getItem(`${DIMS_PREFIX}${buildKey(floor, branch)}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.rows === 'number' && typeof parsed.cols === 'number') {
        return { rows: Math.max(5, Math.min(30, parsed.rows)), cols: Math.max(5, Math.min(40, parsed.cols)) };
      }
    }
  } catch { /* fallback */ }
  return DEFAULT_DIMS;
}

export function saveFloorDimensions(floor: string, dims: { rows: number; cols: number }, branch?: string): void {
  try {
    localStorage.setItem(`${DIMS_PREFIX}${buildKey(floor, branch)}`, JSON.stringify(dims));
  } catch { /* ignore */ }
}

export function getFloorObstacles(floor: string, branch?: string): FloorObstacle[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${buildKey(floor, branch)}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch { /* fallback */ }
  if (DATA_SOURCE !== 'mock') return [];
  const seed = DEFAULT_SEEDS[floor] || DEFAULT_SEEDS['Tầng trệt'] || [];
  return seed.map((item) => ({ ...item, floor }));
}

export function saveFloorObstacles(floor: string, obstacles: FloorObstacle[], branch?: string): void {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${buildKey(floor, branch)}`, JSON.stringify(obstacles));
  } catch { /* ignore */ }
}

export function resetFloorObstacles(floor: string, branch?: string): FloorObstacle[] {
  saveFloorDimensions(floor, DEFAULT_DIMS, branch);
  if (DATA_SOURCE !== 'mock') {
    saveFloorObstacles(floor, [], branch);
    return [];
  }
  const seed = DEFAULT_SEEDS[floor] || DEFAULT_SEEDS['Tầng trệt'] || [];
  const next = seed.map((item) => ({ ...item, floor }));
  saveFloorObstacles(floor, next, branch);
  return next;
}

export function clearFloorLayout(floor: string, branch?: string): void {
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${buildKey(floor, branch)}`);
    localStorage.removeItem(`${DIMS_PREFIX}${buildKey(floor, branch)}`);
  } catch { /* ignore */ }
}

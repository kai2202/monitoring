/**
 * Frontend/src/features/analytics/components/supplies/SuppliesFilterToolbar.tsx
 *
 * Thanh điều khiển gọn nhẹ cho Tab /analytics/supplies:
 * - Bộ lọc vị trí tầng động từ locationService hoặc availableFloors.
 * - Hiển thị trạng thái đang lọc (từ KPI Card / Chart) kèm nút Bỏ lọc nhanh.
 * - Nút mở "Nhật ký cấp phát" đối soát lịch sử bảo trì.
 */

import React, { useMemo } from 'react';
import { FontAwesomeIcon, faClockRotateLeft } from '../../../../shared/icons';
import { FloorTabId } from '../../../../types/analyticsUI';
import { locationService } from '../../../../services';

export type SuppliesFilterMode = 'all' | 'critical' | 'warning' | 'normal' | 'waste_warning';

interface SuppliesFilterToolbarProps {
  statusFilter: SuppliesFilterMode;
  onStatusFilterChange: (status: SuppliesFilterMode) => void;
  activeFloor: FloorTabId;
  onFloorChange: (floor: FloorTabId) => void;
  availableFloors?: string[];
  summaryText?: string;
  onOpenHistoryDrawer?: () => void;
  historyCount?: number;
}

const FILTER_LABELS: Record<Exclude<SuppliesFilterMode, 'all'>, { label: string; badgeClass: string }> = {
  critical: {
    label: 'Khẩn cấp (<15%)',
    badgeClass: 'text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-800 bg-rose-50/70 dark:bg-rose-950/40',
  },
  warning: {
    label: 'Cần lưu ý (<25%)',
    badgeClass: 'text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/40',
  },
  waste_warning: {
    label: 'Mực thải sắp đầy',
    badgeClass: 'text-orange-600 dark:text-orange-400 border-orange-300 dark:border-orange-800 bg-orange-50/70 dark:bg-orange-950/40',
  },
  normal: {
    label: 'An toàn (≥25%)',
    badgeClass: 'text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/40',
  },
};

export const SuppliesFilterToolbar: React.FC<SuppliesFilterToolbarProps> = ({
  statusFilter,
  onStatusFilterChange,
  activeFloor,
  onFloorChange,
  availableFloors,
  summaryText,
  onOpenHistoryDrawer,
  historyCount = 0,
}) => {
  const floorTabs = useMemo(() => {
    const rawFloors =
      availableFloors && availableFloors.length > 0
        ? availableFloors
        : locationService.getFloorsByBranch();

    if (rawFloors.length === 0) {
      return [{ id: 'all' as FloorTabId, label: 'Toàn tòa nhà' }];
    }

    return [
      { id: 'all' as FloorTabId, label: 'Toàn tòa nhà' },
      ...rawFloors.map((flName, idx) => ({
        id: `floor-${idx + 1}` as FloorTabId,
        label: flName,
      })),
    ];
  }, [availableFloors]);

  const activeMeta = statusFilter !== 'all' ? FILTER_LABELS[statusFilter] : null;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
      {/* Trái: Bộ lọc vị trí tầng + Badge trạng thái đang lọc */}
      <div className="flex items-center gap-2.5 flex-wrap">
        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
          Khu vực:
        </span>
        <div className="inline-flex items-center p-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/70 gap-1 flex-wrap">
          {floorTabs.map((fl) => {
            const isActive = activeFloor === fl.id;
            return (
              <button
                key={fl.id}
                type="button"
                onClick={() => onFloorChange(fl.id)}
                className={`px-3 py-1 rounded-md text-xs transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 font-bold shadow-xs border-slate-200/60 dark:border-slate-700'
                    : 'bg-transparent text-slate-500 dark:text-slate-400 font-medium hover:text-slate-800 dark:hover:text-slate-200 border-transparent'
                }`}
              >
                {fl.label}
              </button>
            );
          })}
        </div>

        {activeMeta && (
          <button
            type="button"
            onClick={() => onStatusFilterChange('all')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border cursor-pointer transition-colors ${activeMeta.badgeClass}`}
            title="Bấm để bỏ lọc trạng thái"
          >
            <span>Đang lọc: {activeMeta.label}</span>
            <span className="text-xs leading-none">×</span>
          </button>
        )}
      </div>

      {/* Phải: Tóm tắt phạm vi & Nút Nhật Ký Cấp Phát */}
      <div className="flex items-center gap-3">
        {summaryText && (
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 hidden sm:block">
            {summaryText}
          </div>
        )}

        {onOpenHistoryDrawer && (
          <button
            type="button"
            onClick={onOpenHistoryDrawer}
            className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FontAwesomeIcon icon={faClockRotateLeft} className="text-xs text-blue-500" />
            <span>Nhật ký cấp phát</span>
            {historyCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-extrabold">
                {historyCount}
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default SuppliesFilterToolbar;

/**
 * Frontend/src/features/analytics/components/linechart/PrintVolumeFloorBreakdown.tsx
 *
 * Bảng Đối Soát Phân Bổ Sản Lượng Theo Tầng (Layout Chân Thẻ Ảnh 1):
 * - Hiển thị danh sách các tầng kèm số trang in thực tế và thanh tỷ trọng %.
 * - Hỗ trợ Interactive Cross-filtering: Click vào từng tầng để lọc biểu đồ trực tiếp.
 * - Tuân thủ AGENTS.md Rule 5 & Rule 7.1 (< 300 LOC, 100% FontAwesome).
 */

import React from 'react';
import { FloorTabId } from '../../../../types/analyticsUI';
import { FontAwesomeIcon, faRotate, faBuilding } from '../../../../shared/icons';

export interface FloorVolumeItem {
  id: FloorTabId;
  label: string;
  department: string;
  volume: number;
  percentage: number;
  printerCount: number;
}

export interface PrintVolumeFloorBreakdownProps {
  floors: FloorVolumeItem[];
  activeFloorId: FloorTabId;
  onSelectFloor: (floorId: FloorTabId) => void;
  totalVolume: number;
}

export const PrintVolumeFloorBreakdown: React.FC<PrintVolumeFloorBreakdownProps> = ({
  floors,
  activeFloorId,
  onSelectFloor,
  totalVolume: _totalVolume,
}) => {
  return (
    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={faBuilding} className="text-xs text-slate-400" />
          <span className="text-[11.5px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Phân Bổ Sản Lượng Theo Tầng
          </span>
        </div>

        {activeFloorId !== 'all' && (
          <button
            type="button"
            onClick={() => onSelectFloor('all')}
            className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 transition-colors"
          >
            <FontAwesomeIcon icon={faRotate} className="text-[9.5px]" />
            <span>Xem tất cả tầng</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        {floors.map((floor) => {
          const isSelected = activeFloorId === floor.id;

          return (
            <div
              key={floor.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelectFloor(isSelected ? 'all' : floor.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectFloor(isSelected ? 'all' : floor.id);
                }
              }}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer select-none flex flex-col justify-between gap-1.5 ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 shadow-xs ring-1 ring-blue-500/20'
                  : 'border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11.5px] font-bold text-slate-900 dark:text-slate-100">
                  {floor.label}
                </span>
                <span className="text-[10px] font-semibold text-slate-400">
                  {floor.printerCount} máy
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <span className="font-mono text-[13px] font-black text-slate-800 dark:text-slate-200">
                  {floor.volume.toLocaleString('vi-VN')}
                  <span className="text-[10px] font-normal text-slate-400 font-sans ml-1">trang</span>
                </span>
                <span className="font-mono text-[11px] font-bold text-blue-600 dark:text-blue-400">
                  {floor.percentage}%
                </span>
              </div>

              {/* Progress mini bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(4, floor.percentage))}%` }}
                />
              </div>

              <span className="text-[10px] text-slate-400 truncate">
                {floor.department}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

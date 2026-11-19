/**
 * Frontend/src/features/analytics/components/linechart/LineChartSubBar.tsx
 *
 * Thanh Điều Khiển Phụ (Sub-Bar) cho Biểu đồ Biến Động Sản Lượng:
 * - Chọn tầng, chọn máy in và chú giải đường vẽ gọn gàng bằng Tailwind CSS.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React from 'react';
import { FontAwesomeIcon, faPrint, faChevronDown } from '../../../../shared/icons';
import { FloorTabId } from '../../../../types/analyticsUI';

interface LineChartSubBarProps {
  activeFloorTab: FloorTabId;
  onSelectFloorTab: (floorId: FloorTabId) => void;
  floorLabel: string;
  activePrintersCount: number;
  totalFloorPrintersCount: number;
  onOpenFilterModal: () => void;
}

export const LineChartSubBar: React.FC<LineChartSubBarProps> = ({
  activeFloorTab,
  onSelectFloorTab,
  floorLabel,
  activePrintersCount,
  totalFloorPrintersCount,
  onOpenFilterModal,
}) => {
  return (
    <div className="flex items-center justify-between flex-wrap gap-3">
      <div className="flex items-center flex-wrap gap-2">
        {/* Floor Tabs */}
        <div className="inline-flex items-center p-1 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 gap-0.5 overflow-x-auto">
          {[
            { id: 'all' as FloorTabId, label: 'Tất cả' },
            { id: 'floor-1' as FloorTabId, label: 'T1' },
            { id: 'floor-2' as FloorTabId, label: 'T2' },
            { id: 'floor-3' as FloorTabId, label: 'T3' },
            { id: 'floor-4' as FloorTabId, label: 'T4' },
            { id: 'floor-5' as FloorTabId, label: 'T5' },
          ].map((tab) => {
            const isActive = activeFloorTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectFloorTab(tab.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Nút mở Modal Chọn Máy In */}
        <button
          type="button"
          onClick={onOpenFilterModal}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/70 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
        >
          <FontAwesomeIcon icon={faPrint} className="text-[11px] text-blue-600 dark:text-blue-400" />
          <span>
            <strong className="font-semibold">{floorLabel}</strong> ({activePrintersCount}/{totalFloorPrintersCount})
          </span>
          <FontAwesomeIcon icon={faChevronDown} className="text-[10px] text-slate-400" />
        </button>
      </div>

      {/* Chú giải đường vẽ (Legend) */}
      <div className="flex items-center gap-4 text-[11.5px] flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-0.5 rounded-full bg-blue-600" />
          <span className="font-semibold text-slate-700 dark:text-slate-200">Kỳ này</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="w-4 border-t-2 border-dashed border-amber-500" />
          <span className="font-medium text-slate-600 dark:text-slate-300">Kỳ trước</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-600 ring-3 ring-blue-600/20" />
          <span className="font-medium text-slate-600 dark:text-slate-300">Đỉnh tải</span>
        </div>
      </div>
    </div>
  );
};

export default LineChartSubBar;

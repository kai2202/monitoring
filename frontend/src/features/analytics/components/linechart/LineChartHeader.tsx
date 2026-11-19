/**
 * Frontend/src/features/analytics/components/linechart/LineChartHeader.tsx
 *
 * Tiêu Đề & Thanh Điều Khiển Biểu Đồ Biến Động Sản Lượng (Layout Header Ảnh 1):
 * - Tiêu đề, mô tả và cụm nút đổi mốc thời gian [24h | 7 ngày | 30 ngày].
 * - Nút chọn thiết bị mở modal chọn máy in.
 * - Chú giải đường cong (Legend: Kỳ này vs Kỳ trước).
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC, 100% FontAwesome).
 */

import React from 'react';
import { AnalyticsTimeframe } from '../../../../types/analyticsUI';
import { FontAwesomeIcon, faPrint, faChevronDown } from '../../../../shared/icons';

interface LineChartHeaderProps {
  timeframe: AnalyticsTimeframe;
  onTimeframeChange?: (t: AnalyticsTimeframe) => void;
  floorLabel: string;
  activePrintersCount: number;
  totalFloorPrintersCount: number;
  onOpenFilterModal: () => void;
}

export const LineChartHeader: React.FC<LineChartHeaderProps> = ({
  timeframe,
  onTimeframeChange,
  floorLabel,
  activePrintersCount,
  totalFloorPrintersCount,
  onOpenFilterModal,
}) => {
  const isAllPrintersActive =
    activePrintersCount === totalFloorPrintersCount && totalFloorPrintersCount > 0;

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 flex-wrap">
      {/* 1. Tiêu đề và chú thích */}
      <div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-xs shadow-blue-600/50" />
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 m-0">
            Biến Động Sản Lượng In
          </h2>
        </div>
        <p className="text-[11.5px] text-slate-500 dark:text-slate-400 mt-0.5 mb-0">
          Đối chiếu lượng trang in theo thời gian giữa kỳ hiện tại và kỳ trước
        </p>
      </div>

      {/* 2. Cụm điều khiển góc phải (Timeframe + Picker + Legend) */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500 pr-2 border-r border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-blue-600 rounded-full inline-block" />
            <span className="text-slate-700 dark:text-slate-300">Kỳ này</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 border-b-2 border-dashed border-amber-500 inline-block" />
            <span className="text-slate-500">Kỳ trước</span>
          </div>
        </div>

        {/* Nút lọc thời gian [24h | 7 ngày | 30 ngày] */}
        <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-xl">
          {[
            { id: 'hourly' as AnalyticsTimeframe, label: '24 giờ' },
            { id: '7days' as AnalyticsTimeframe, label: '7 ngày' },
            { id: '30days' as AnalyticsTimeframe, label: '30 ngày' },
          ].map((tf) => (
            <button
              key={tf.id}
              type="button"
              onClick={() => onTimeframeChange && onTimeframeChange(tf.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                timeframe === tf.id
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>

        {/* Nút chọn thiết bị */}
        <button
          type="button"
          onClick={onOpenFilterModal}
          className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 transition-all shadow-xs ${
            isAllPrintersActive
              ? 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50'
              : 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
          }`}
        >
          <FontAwesomeIcon icon={faPrint} className="text-[10px]" />
          <span>
            {isAllPrintersActive
              ? `${floorLabel} (${totalFloorPrintersCount})`
              : `Đã chọn (${activePrintersCount}/${totalFloorPrintersCount})`}
          </span>
          <FontAwesomeIcon icon={faChevronDown} className="text-[9px] opacity-70 ml-0.5" />
        </button>
      </div>
    </div>
  );
};

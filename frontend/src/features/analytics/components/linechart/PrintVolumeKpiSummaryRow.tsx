/**
 * Frontend/src/features/analytics/components/linechart/PrintVolumeKpiSummaryRow.tsx
 *
 * Hàng 3 Chỉ Số KPI Tóm Tắt Sản Lượng (Layout Thẻ 'Amount spent' Ảnh 1):
 * - 1. Tổng sản lượng kỳ này (% tăng/giảm so với kỳ trước).
 * - 2. Đỉnh tải cao nhất (Thời điểm đạt đỉnh).
 * - 3. Sản lượng trung bình ngày (Trạng thái tải).
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC, 100% FontAwesome).
 */

import React from 'react';
import { FontAwesomeIcon, faArrowTrendUp, faArrowTrendDown } from '../../../../shared/icons';

export interface PrintVolumeKpiSummaryRowProps {
  currentTotalVolume: number;
  growthPercent: number;
  peakVolume: number;
  peakLabel: string;
  dailyAverage: number;
  timeframeLabel?: string;
}

export const PrintVolumeKpiSummaryRow: React.FC<PrintVolumeKpiSummaryRowProps> = ({
  currentTotalVolume,
  growthPercent,
  peakVolume,
  peakLabel,
  dailyAverage,
  timeframeLabel = 'kỳ trước',
}) => {
  const isPositive = growthPercent >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-800 bg-slate-50/60 dark:bg-slate-800/40 rounded-2xl border border-slate-200/70 dark:border-slate-800 p-3 sm:p-4 gap-3 sm:gap-0">
      {/* 1. Tổng sản lượng */}
      <div className="sm:pr-4 flex flex-col justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Tổng Sản Lượng
        </span>
        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="text-2xl font-black font-mono text-slate-900 dark:text-slate-100 tracking-tight">
            {currentTotalVolume.toLocaleString('vi-VN')}
          </span>
          <span className="text-xs font-semibold text-slate-400">trang</span>
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-bold ${
              isPositive
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            <FontAwesomeIcon icon={isPositive ? faArrowTrendUp : faArrowTrendDown} className="text-[10px]" />
            <span>{isPositive ? `+${growthPercent}%` : `${growthPercent}%`}</span>
          </span>
          <span className="text-[11px] text-slate-400">so với {timeframeLabel}</span>
        </div>
      </div>

      {/* 2. Đỉnh tải cao nhất */}
      <div className="sm:px-4 flex flex-col justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Đỉnh Tải Cao Nhất
        </span>
        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="text-2xl font-black font-mono text-blue-600 dark:text-blue-400 tracking-tight">
            {peakVolume.toLocaleString('vi-VN')}
          </span>
          <span className="text-xs font-semibold text-slate-400">trang</span>
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
          {peakLabel ? `Đạt đỉnh: ${peakLabel}` : 'Thời điểm tải tối đa'}
        </div>
      </div>

      {/* 3. Sản lượng trung bình ngày */}
      <div className="sm:pl-4 flex flex-col justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Trung Bình Ngày
        </span>
        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="text-2xl font-black font-mono text-slate-900 dark:text-slate-100 tracking-tight">
            {dailyAverage.toLocaleString('vi-VN')}
          </span>
          <span className="text-xs font-semibold text-slate-400">trang/ngày</span>
        </div>
        <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
          • Vận hành ổn định
        </div>
      </div>
    </div>
  );
};

/**
 * Frontend/src/features/analytics/components/linechart/LineChartTooltip.tsx
 *
 * Floating Tooltip cho Biểu đồ Biến Động Sản Lượng In:
 * - Hiển thị sản lượng kỳ này, kỳ trước (đồng bộ màu #f59e0b), tỷ lệ & chênh lệch tuyệt đối,
 *   và phạm vi số thiết bị đang theo dõi (tối ưu cho quy mô 40+ máy in).
 * - Tự động đổi hướng (flip) khi rê chuột gần cạnh mép biểu đồ.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC) & Rule 5 (Dữ liệu trung thực).
 */

import React from 'react';
import { AnalyticsTimeframe } from '../../../../types/analyticsUI';
import { FontAwesomeIcon, faArrowTrendUp, faArrowTrendDown, faPrint } from '../../../../shared/icons';

export interface LineChartTooltipProps {
  hoverIndex: number;
  timeframe: AnalyticsTimeframe;
  currentVal: number;
  prevVal: number;
  dataPointCount: number;
  svgWidth: number;
  xPos: number;
  activePrintersCount?: number;
}

export const LineChartTooltip: React.FC<LineChartTooltipProps> = ({
  hoverIndex,
  timeframe,
  currentVal,
  prevVal,
  dataPointCount,
  svgWidth,
  xPos,
  activePrintersCount = 0,
}) => {
  let curDate = '';

  if (timeframe === '30days') {
    curDate = `Ngày ${hoverIndex + 1} tháng này`;
  } else if (timeframe === '7days') {
    const days = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];
    curDate = `${days[hoverIndex] || `T${hoverIndex + 2}`} tuần này`;
  } else {
    const hourStr = String(hoverIndex).padStart(2, '0');
    curDate = `${hourStr}:00 hôm nay`;
  }

  const diff = currentVal - prevVal;
  const diffPercent = prevVal > 0 ? Number(((diff / prevVal) * 100).toFixed(1)) : 0;
  const isPositive = diff >= 0;

  return (
    <div
      style={{
        position: 'absolute',
        left: `${(xPos / svgWidth) * 100}%`,
        top: '16px',
        transform:
          hoverIndex > dataPointCount * 0.72
            ? 'translateX(-105%)'
            : hoverIndex < dataPointCount * 0.28
            ? 'translateX(5%)'
            : 'translateX(-50%)',
        backgroundColor: 'var(--bg-card, #ffffff)',
        border: '1px solid var(--border-color, #e2e8f0)',
        borderRadius: '16px',
        padding: '12px 16px',
        boxShadow: '0 12px 28px -4px rgba(0, 0, 0, 0.12), 0 4px 10px -2px rgba(0, 0, 0, 0.05)',
        zIndex: 100,
        pointerEvents: 'none',
        minWidth: '225px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Header mốc thời gian */}
      <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-200/80 dark:border-slate-800">
        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
          {curDate}
        </span>
        <span
          className={`inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded-full ${
            isPositive
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
              : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
          }`}
        >
          <FontAwesomeIcon icon={isPositive ? faArrowTrendUp : faArrowTrendDown} className="text-[9px]" />
          <span>{isPositive ? `+${diffPercent}%` : `${diffPercent}%`}</span>
        </span>
      </div>

      {/* Kỳ hiện tại */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
          <span className="text-[11.5px] text-slate-500 dark:text-slate-400">Kỳ này:</span>
        </div>
        <strong className="text-[13px] font-extrabold text-blue-600 dark:text-blue-400 font-mono">
          {currentVal.toLocaleString('vi-VN')} trang
        </strong>
      </div>

      {/* Kỳ đối chiếu (đồng bộ màu #f59e0b) */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
          <span className="text-[11.5px] text-slate-500 dark:text-slate-400">Kỳ trước:</span>
        </div>
        <strong className="text-xs font-semibold text-slate-700 dark:text-slate-200 font-mono">
          {prevVal.toLocaleString('vi-VN')} trang
        </strong>
      </div>

      {/* Footer: Chênh lệch tuyệt đối & Phạm vi số máy */}
      <div className="mt-0.5 pt-2 border-t border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 text-[11px]">
        <span className="text-slate-500 dark:text-slate-400 inline-flex items-center gap-1.5">
          <FontAwesomeIcon icon={faPrint} className="text-[10px] text-slate-400" />
          <span>{activePrintersCount} máy in</span>
        </span>
        <span
          className={`font-mono font-bold ${
            isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
          }`}
        >
          {diff >= 0 ? `+${diff.toLocaleString('vi-VN')}` : diff.toLocaleString('vi-VN')} tr
        </span>
      </div>
    </div>
  );
};

export default LineChartTooltip;

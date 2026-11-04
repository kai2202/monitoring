/**
 * Frontend/src/features/analytics/components/linechart/LineChartTooltip.tsx
 *
 * Floating Tooltip cho Biểu đồ Xu Hướng Sản Lượng & Đỉnh Tải:
 * - Hiển thị sản lượng kỳ này, kỳ trước, tỷ lệ chênh lệch (%) và máy in đóng góp tải lớn nhất.
 * - Tự động đổi hướng (flip) khi rê chuột gần cạnh mép màn hình.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC) & Rule 5 (Dữ liệu trung thực).
 */

import React from 'react';
import { AnalyticsTimeframe } from '../../../../types/analyticsUI';
import { FontAwesomeIcon, faArrowTrendUp, faArrowTrendDown } from '../../../../shared/icons';

export interface TopPrinterContribution {
  name: string;
  percent: number;
}

export interface LineChartTooltipProps {
  hoverIndex: number;
  timeframe: AnalyticsTimeframe;
  currentVal: number;
  prevVal: number;
  dataPointCount: number;
  svgWidth: number;
  xPos: number;
  topPrinter?: TopPrinterContribution | null;
}

export const LineChartTooltip: React.FC<LineChartTooltipProps> = ({
  hoverIndex,
  timeframe,
  currentVal,
  prevVal,
  dataPointCount,
  svgWidth,
  xPos,
  topPrinter,
}) => {
  // Format nhãn thời gian
  let curDate = '';
  let prevDate = '';

  if (timeframe === '30days') {
    curDate = `Ngày ${hoverIndex + 1} tháng này`;
    prevDate = `Ngày ${hoverIndex + 1} tháng trước`;
  } else if (timeframe === '7days') {
    const days = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];
    curDate = `${days[hoverIndex] || `T${hoverIndex + 2}`} tuần này`;
    prevDate = `${days[hoverIndex] || `T${hoverIndex + 2}`} tuần trước`;
  } else {
    const hourStr = String(hoverIndex).padStart(2, '0');
    curDate = `${hourStr}:00 hôm nay`;
    prevDate = `${hourStr}:00 hôm qua`;
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
        minWidth: '220px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Header mốc thời gian */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color, #e2e8f0)', paddingBottom: '6px' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted, #64748b)' }}>
          {curDate}
        </span>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px',
            fontSize: '10.5px',
            fontWeight: 700,
            color: isPositive ? '#16a34a' : '#ef4444',
            backgroundColor: isPositive ? 'rgba(22, 163, 74, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            padding: '1px 6px',
            borderRadius: '9999px',
          }}
        >
          <FontAwesomeIcon icon={isPositive ? faArrowTrendUp : faArrowTrendDown} style={{ fontSize: '9px' }} />
          <span>{isPositive ? `+${diffPercent}%` : `${diffPercent}%`}</span>
        </span>
      </div>

      {/* Kỳ hiện tại */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2563eb', flexShrink: 0 }} />
          <span style={{ fontSize: '11.5px', color: 'var(--text-muted, #64748b)' }}>Kỳ này:</span>
        </div>
        <strong style={{ fontSize: '13px', fontWeight: 800, color: '#2563eb', fontFamily: "'JetBrains Mono', monospace" }}>
          {currentVal.toLocaleString('vi-VN')} trang
        </strong>
      </div>

      {/* Kỳ đối chiếu */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#94a3b8', flexShrink: 0 }} />
          <span style={{ fontSize: '11.5px', color: 'var(--text-muted, #64748b)' }}>Kỳ trước:</span>
        </div>
        <strong style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary, #475569)', fontFamily: "'JetBrains Mono', monospace" }}>
          {prevVal.toLocaleString('vi-VN')} trang
        </strong>
      </div>

      {/* Thiết bị tải cao nhất tại thời điểm này */}
      {topPrinter && (
        <div style={{ marginTop: '2px', paddingTop: '6px', borderTop: '1px dashed var(--border-color, #e2e8f0)', fontSize: '10.5px', color: 'var(--text-muted, #64748b)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>
            ⚡ {topPrinter.name}
          </span>
          <span style={{ fontWeight: 700, color: '#2563eb', flexShrink: 0 }}>
            {topPrinter.percent}% tải
          </span>
        </div>
      )}
    </div>
  );
};

export default LineChartTooltip;


/**
 * Frontend/src/features/analytics/components/linechart/LineChartHeader.tsx
 *
 * Tiêu Đề & Chỉ Số Tổng Sản Lượng (Dense Modern Metric Header):
 * - Thẻ chỉ số tổng sản lượng in kích thước lớn (JetBrains Mono).
 * - Badge tăng trưởng so với kỳ đối chiếu kèm icon xu hướng.
 * - Thanh chuyển đổi chu kỳ (30 ngày, 7 ngày, 24 giờ) dạng pills bo tròn chuẩn Bento.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React from 'react';
import { FontAwesomeIcon, faArrowTrendUp, faArrowTrendDown } from '../../../../shared/icons';
import { AnalyticsTimeframe } from '../../../../types/analyticsUI';

interface LineChartHeaderProps {
  currentTotalVolume: number;
  growthPercent: number;
  timeframe: AnalyticsTimeframe;
  onTimeframeChange: (tf: AnalyticsTimeframe) => void;
}

export const LineChartHeader: React.FC<LineChartHeaderProps> = ({
  currentTotalVolume,
  growthPercent,
  timeframe,
  onTimeframeChange,
}) => {
  const isPositive = growthPercent >= 0;

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '16px',
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#2563eb',
              boxShadow: '0 0 8px rgba(37, 99, 235, 0.5)',
            }}
          />
          <h2 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary, #0f172a)', margin: 0 }}>
            Xu Hướng Sản Lượng &amp; Đỉnh Tải
          </h2>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-muted, #64748b)', margin: '4px 0 0 0' }}>
          Biến động sản lượng in theo thời gian và đối chiếu kỳ trước
        </p>

        <div style={{ marginTop: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: '32px',
                fontWeight: 900,
                color: 'var(--text-primary, #0f172a)',
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: '-0.5px',
                lineHeight: 1.15,
              }}
            >
              {currentTotalVolume.toLocaleString('vi-VN')}
            </span>
            <span style={{ fontSize: '13px', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>
              trang
            </span>

            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                color: isPositive ? '#16a34a' : '#ef4444',
                backgroundColor: isPositive ? 'rgba(22, 163, 74, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                padding: '3px 10px',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: 700,
                marginLeft: '4px',
              }}
            >
              <FontAwesomeIcon icon={isPositive ? faArrowTrendUp : faArrowTrendDown} style={{ fontSize: '11px' }} />
              <span>{isPositive ? `+${growthPercent}%` : `${growthPercent}%`}</span>
              <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-muted, #64748b)', marginLeft: '2px' }}>
                so với kỳ đối chiếu trước đó
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Timeframe pills */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'var(--bg-subtle, #f8fafc)',
          padding: '3px',
          borderRadius: '9999px',
          border: '1px solid var(--border-color, #e2e8f0)',
          gap: '2px',
        }}
      >
        {[
          { id: '30days' as AnalyticsTimeframe, label: '30 ngày' },
          { id: '7days' as AnalyticsTimeframe, label: '7 ngày' },
          { id: 'hourly' as AnalyticsTimeframe, label: '24 giờ' },
        ].map((tf) => {
          const isActive = timeframe === tf.id;
          return (
            <button
              key={tf.id}
              type="button"
              onClick={() => onTimeframeChange(tf.id)}
              style={{
                padding: '6px 16px',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: isActive ? 700 : 500,
                backgroundColor: isActive ? 'var(--bg-card, #ffffff)' : 'transparent',
                color: isActive ? '#2563eb' : 'var(--text-muted, #64748b)',
                border: 'none',
                boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {tf.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default LineChartHeader;

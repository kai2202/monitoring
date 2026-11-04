/**
 * Frontend/src/features/analytics/components/sla/SLADualAxisComboChart.tsx
 *
 * Card Shell chứa Dual-Axis Stacked Combo Chart (Growth Accounting Style):
 * - Thể hiện mối tương quan giữa thời gian vận hành (MTBF), bảo trì (MTTR) và tỷ lệ lỗi vặt.
 * - Chú giải 3 thành phần trực quan: MTBF (Cột Xanh), MTTR (Cột Tím), Tỷ lệ lỗi (Đường Hổ phách).
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React from 'react';
import { SLAComboDataPoint } from '../../../../types/analyticsUI';
import { SLADualAxisChartSvg } from './SLADualAxisChartSvg';

interface SLADualAxisComboChartProps {
  series: SLAComboDataPoint[];
}

export const SLADualAxisComboChart: React.FC<SLADualAxisComboChartProps> = ({ series }) => {
  return (
    <div
      style={{
        padding: '24px 26px',
        borderRadius: '24px',
        backgroundColor: 'var(--bg-card, #ffffff)',
        border: '1px solid var(--border-color, #e2e8f0)',
        boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        height: '100%',
      }}
    >
      {/* 1. Header & Chú giải */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
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
            <h2 style={{ fontSize: '16.5px', fontWeight: 800, color: 'var(--text-primary, #0f172a)', margin: 0 }}>
              SLA Hạm Đội &amp; Tương Quan Lỗi Vặt (Stacked Combo)
            </h2>
          </div>
          <p style={{ fontSize: '11.5px', color: 'var(--text-muted, #64748b)', margin: '4px 0 0 0' }}>
            Trục trái: Giờ vận hành (MTBF + MTTR) • Trục phải: Tỷ lệ kẹt giấy &amp; lỗi vặt (%) theo từng tuần
          </p>
        </div>

        {/* Chú giải 3 thành phần */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', fontSize: '11px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '9px', height: '9px', borderRadius: '3px', backgroundColor: '#2563eb' }} />
            <span style={{ color: 'var(--text-secondary, #475569)', fontWeight: 600 }}>MTBF Chạy ổn định</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '9px', height: '9px', borderRadius: '3px', backgroundColor: '#8b5cf6' }} />
            <span style={{ color: 'var(--text-secondary, #475569)', fontWeight: 600 }}>MTTR Bảo dưỡng</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b', border: '2px solid #ffffff', boxShadow: '0 0 0 1px #f59e0b' }} />
            <span style={{ color: '#d97706', fontWeight: 700 }}>Tỷ lệ lỗi vặt (%)</span>
          </div>
        </div>
      </div>

      {/* 2. SVG Chart Area */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        <SLADualAxisChartSvg series={series} />
      </div>
    </div>
  );
};

export default SLADualAxisComboChart;

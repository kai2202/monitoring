/**
 * Frontend/src/features/analytics/components/supplies/SuppliesSummaryBentoCards.tsx
 *
 * 3 Thẻ thống kê tổng quan Bento: Cảnh báo khẩn cấp, Cần lưu ý, Hạn cạn kiệt sớm nhất.
 * - Hỗ trợ Interactive Quick-Filter (bấm thẻ để lọc trực tiếp Bảng 1 & Bảng 2).
 * - Tuân thủ AGENTS.md Rule 7.1: FontAwesome duy nhất, < 300 LOC.
 */

import React from 'react';
import { FontAwesomeIcon, faFire, faClock, faArrowTrendDown } from '../../../../shared/icons';
import { SuppliesFilterMode } from './SuppliesFilterToolbar';

export interface SuppliesSummaryBentoCardsProps {
  criticalCount: number;
  warningCount: number;
  soonestEmptyDays: number;
  onSelectFilter?: (mode: SuppliesFilterMode) => void;
  activeFilter?: SuppliesFilterMode;
}

export const SuppliesSummaryBentoCards: React.FC<SuppliesSummaryBentoCardsProps> = ({
  criticalCount,
  warningCount,
  soonestEmptyDays,
  onSelectFilter,
  activeFilter = 'all',
}) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '16px',
      }}
    >
      {/* KPI 1: Khẩn cấp (<15%) */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => onSelectFilter && onSelectFilter(activeFilter === 'critical' ? 'all' : 'critical')}
        onKeyDown={(e) => e.key === 'Enter' && onSelectFilter && onSelectFilter(activeFilter === 'critical' ? 'all' : 'critical')}
        style={{
          padding: '18px 22px',
          borderRadius: '20px',
          backgroundColor: activeFilter === 'critical' ? 'rgba(254, 242, 242, 0.9)' : 'var(--bg-card, #ffffff)',
          border: activeFilter === 'critical' ? '2px solid #ef4444' : '1px solid rgba(239, 68, 68, 0.25)',
          boxShadow: activeFilter === 'critical'
            ? '0 4px 14px rgba(239, 68, 68, 0.18)'
            : '0 2px 8px -2px rgba(239, 68, 68, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: onSelectFilter ? 'pointer' : 'default',
          transition: 'all 0.18s ease',
        }}
      >
        <div>
          <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: 700 }}>
            Khẩn cấp (&lt; 15%)
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
            <span
              style={{
                fontSize: '28px',
                fontWeight: 900,
                color: '#ef4444',
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {criticalCount}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted, #64748b)' }}>linh kiện</span>
          </div>
          <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: 600 }}>
            Cần thay thế trong 4-7 ngày tới
          </span>
        </div>
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '14px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ef4444',
            flexShrink: 0,
          }}
        >
          <FontAwesomeIcon icon={faFire} style={{ fontSize: '20px' }} />
        </div>
      </div>

      {/* KPI 2: Cần lưu ý (<25%) */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => onSelectFilter && onSelectFilter(activeFilter === 'warning' ? 'all' : 'warning')}
        onKeyDown={(e) => e.key === 'Enter' && onSelectFilter && onSelectFilter(activeFilter === 'warning' ? 'all' : 'warning')}
        style={{
          padding: '18px 22px',
          borderRadius: '20px',
          backgroundColor: activeFilter === 'warning' ? 'rgba(254, 252, 232, 0.9)' : 'var(--bg-card, #ffffff)',
          border: activeFilter === 'warning' ? '2px solid #f59e0b' : '1px solid rgba(245, 158, 11, 0.25)',
          boxShadow: activeFilter === 'warning'
            ? '0 4px 14px rgba(245, 158, 11, 0.18)'
            : '0 2px 8px -2px rgba(245, 158, 11, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: onSelectFilter ? 'pointer' : 'default',
          transition: 'all 0.18s ease',
        }}
      >
        <div>
          <span style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 700 }}>
            Cần lưu ý (&lt; 25%)
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
            <span
              style={{
                fontSize: '28px',
                fontWeight: 900,
                color: '#f59e0b',
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {warningCount}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted, #64748b)' }}>linh kiện</span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)' }}>
            Dự trù đặt hàng phụ tùng kho đệm
          </span>
        </div>
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '14px',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#f59e0b',
            flexShrink: 0,
          }}
        >
          <FontAwesomeIcon icon={faClock} style={{ fontSize: '20px' }} />
        </div>
      </div>

      {/* KPI 3: Hạn cạn kiệt sớm nhất */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => onSelectFilter && onSelectFilter('all')}
        onKeyDown={(e) => e.key === 'Enter' && onSelectFilter && onSelectFilter('all')}
        style={{
          padding: '18px 22px',
          borderRadius: '20px',
          backgroundColor: activeFilter === 'all' ? 'var(--bg-card, #ffffff)' : 'var(--bg-card, #ffffff)',
          border: '1px solid var(--border-color, #e2e8f0)',
          boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: onSelectFilter ? 'pointer' : 'default',
          transition: 'all 0.18s ease',
        }}
      >
        <div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>
            Cạn kiệt sớm nhất
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
            <span
              style={{
                fontSize: '28px',
                fontWeight: 900,
                color: '#2563eb',
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {soonestEmptyDays}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted, #64748b)' }}>ngày nữa</span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)' }}>
            Toner Yellow (M554dn - Tầng 1)
          </span>
        </div>
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '14px',
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#2563eb',
            flexShrink: 0,
          }}
        >
          <FontAwesomeIcon icon={faArrowTrendDown} style={{ fontSize: '20px' }} />
        </div>
      </div>
    </div>
  );
};

export default SuppliesSummaryBentoCards;

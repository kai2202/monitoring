/**
 * Frontend/src/components/dashboard/FleetKpiCards.tsx
 *
 * 4 Thẻ KPI Hạm Đội Dashboard theo chuẩn Bento Minimalist:
 * - Nền phẳng viền mảnh (#e2e8f0), số liệu font JetBrains Mono nổi bật.
 * - Tuân thủ AGENTS.md Rule 5: MetricValue = number | null, hiển thị '—' khi null.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React from 'react';
import {
  FontAwesomeIcon,
  faPrint,
  faWifi,
  faTriangleExclamation,
  faBox,
  faArrowUpRightFromSquare,
} from '../../shared/icons';
import { NavTabId } from '../layout/Sidebar';
import { MetricValue } from '../../types/dashboardTelemetry';

export type KpiFilterType = 'all' | 'offline' | 'critical' | 'low_supplies' | null;

export interface FleetKpiData {
  totalPrinters: number;
  onlineCount: MetricValue;
  offlineCount: MetricValue;
  unknownCount: MetricValue;
  onlineRate: MetricValue;
  activeAlertsCount: MetricValue;
  criticalAlertsCount: MetricValue;
  warningAlertsCount: MetricValue;
  lowSuppliesCount: MetricValue;
}

export interface FleetKpiCardsProps {
  data: FleetKpiData;
  activeFilter: KpiFilterType;
  onSelectFilter: (filter: KpiFilterType) => void;
  onNavigateModule: (tab: NavTabId) => void;
  isLoading?: boolean;
}

export const FleetKpiCards: React.FC<FleetKpiCardsProps> = ({
  data,
  activeFilter,
  onSelectFilter,
  onNavigateModule,
  isLoading = false,
}) => {
  const isCriticalSafe = data.criticalAlertsCount !== null && data.criticalAlertsCount === 0;

  const cards = [
    {
      id: 'critical' as KpiFilterType,
      title: 'Sự cố phần cứng',
      value: isLoading ? '—' : data.criticalAlertsCount !== null ? `${data.criticalAlertsCount} máy` : '—',
      badgeText: data.criticalAlertsCount !== null ? (isCriticalSafe ? 'An toàn' : 'Khẩn cấp') : 'Chưa có dữ liệu',
      badgeColor: isCriticalSafe ? '#16a34a' : '#ef4444',
      badgeBg: isCriticalSafe ? '#ecfdf5' : '#ffe4e6',
      badgeBorder: isCriticalSafe ? '#a7f3d0' : '#fda4af',
      iconBg: 'rgba(239, 68, 68, 0.08)',
      icon: <FontAwesomeIcon icon={faTriangleExclamation} style={{ fontSize: '17px', color: '#ef4444' }} />,
      targetTab: 'printers' as NavTabId,
    },
    {
      id: 'offline' as KpiFilterType,
      title: 'Tỷ lệ khả dụng',
      value: isLoading ? '—' : data.onlineRate !== null ? `${data.onlineRate}%` : '—',
      badgeText: data.onlineCount !== null ? `${data.onlineCount}/${data.totalPrinters || 0} Trực tuyến` : '— Trực tuyến',
      badgeColor: '#2563eb',
      badgeBg: 'rgba(37, 99, 235, 0.08)',
      badgeBorder: 'rgba(37, 99, 235, 0.25)',
      iconBg: 'rgba(37, 99, 235, 0.08)',
      icon: <FontAwesomeIcon icon={faWifi} style={{ fontSize: '17px', color: '#2563eb' }} />,
      targetTab: 'printers' as NavTabId,
    },
    {
      id: 'all' as KpiFilterType,
      title: 'Tổng số thiết bị',
      value: isLoading ? '—' : `${data.totalPrinters} máy`,
      badgeText: 'Toàn hạm đội',
      badgeColor: '#0284c7',
      badgeBg: 'rgba(2, 132, 199, 0.08)',
      badgeBorder: 'rgba(2, 132, 199, 0.25)',
      iconBg: 'rgba(2, 132, 199, 0.08)',
      icon: <FontAwesomeIcon icon={faPrint} style={{ fontSize: '17px', color: '#0284c7' }} />,
      targetTab: 'printers' as NavTabId,
    },
    {
      id: 'low_supplies' as KpiFilterType,
      title: 'Vật tư cần chú ý',
      value: isLoading ? '—' : data.lowSuppliesCount !== null ? `${data.lowSuppliesCount} máy` : '—',
      badgeText: '≤ 10% CMYK',
      badgeColor: '#d97706',
      badgeBg: '#fef3c7',
      badgeBorder: '#fde68a',
      iconBg: 'rgba(217, 119, 6, 0.08)',
      icon: <FontAwesomeIcon icon={faBox} style={{ fontSize: '17px', color: '#d97706' }} />,
      targetTab: 'analytics-supplies' as NavTabId,
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
        gap: '16px',
        width: '100%',
      }}
    >
      {cards.map((card) => {
        const isSelected = activeFilter === card.id;

        return (
          <div
            key={card.id || 'kpi-card'}
            onClick={() => onSelectFilter(isSelected ? null : card.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectFilter(isSelected ? null : card.id);
              }
            }}
            style={{
              padding: '18px 20px',
              borderRadius: '18px',
              backgroundColor: 'var(--bg-card, #ffffff)',
              border: isSelected ? '1.5px solid #2563eb' : '1px solid var(--border-color, #e2e8f0)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              transition: 'all 0.18s ease',
              position: 'relative',
              userSelect: 'none',
              minWidth: 0,
              boxShadow: isSelected
                ? '0 0 0 3px rgba(37, 99, 235, 0.12), 0 4px 12px rgba(0, 0, 0, 0.05)'
                : '0 1px 3px rgba(0, 0, 0, 0.04)',
            }}
          >
            {/* Icon Block */}
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: card.iconBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {card.icon}
            </div>

            {/* Metrics & Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary, #475569)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {card.title}
                </span>

                <button
                  type="button"
                  title="Chuyển sang phân hệ chuyên trách"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigateModule(card.targetTab);
                  }}
                  style={{
                    border: 'none',
                    background: 'none',
                    padding: '2px 4px',
                    borderRadius: '4px',
                    color: 'var(--text-muted, #94a3b8)',
                    cursor: 'pointer',
                    fontSize: '11px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginTop: '4px' }}>
                <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary, #0f172a)', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '-0.3px' }}>
                  {card.value}
                </span>

                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '6px',
                    backgroundColor: card.badgeBg,
                    color: card.badgeColor,
                    border: `1px solid ${card.badgeBorder}`,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {card.badgeText}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FleetKpiCards;

/**
 * Frontend/src/components/dashboard/FleetKpiCards.tsx
 *
 * 4 Thẻ KPI Hạm Đội Dashboard theo chuẩn Bento Minimalist:
 * - Nền phẳng viền mảnh (#e2e8f0), số liệu font JetBrains Mono nổi bật.
 * - Thống nhất bảng màu thương hiệu #2563eb.
 * - Khắc phục triệt để hardcoded: ${data.onlineCount}/${data.totalPrinters} Trực tuyến.
 * - Điều hướng chuẩn xác thẻ Vật tư sang /analytics/supplies.
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

export type KpiFilterType = 'all' | 'offline' | 'critical' | 'low_supplies' | null;

export interface FleetKpiData {
  totalPrinters: number;
  onlineCount: number;
  offlineCount: number;
  unknownCount: number;
  onlineRate: number;
  activeAlertsCount: number;
  criticalAlertsCount: number;
  warningAlertsCount: number;
  lowSuppliesCount: number;
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
  const cards = [
    {
      id: 'critical' as KpiFilterType,
      title: 'Sự cố phần cứng',
      value: isLoading ? '—' : `${data.criticalAlertsCount} máy`,
      badgeText: data.criticalAlertsCount > 0 ? 'Khẩn cấp' : 'An toàn',
      badgeColor: data.criticalAlertsCount > 0 ? '#ef4444' : '#16a34a',
      badgeBg: data.criticalAlertsCount > 0 ? '#ffe4e6' : '#ecfdf5',
      badgeBorder: data.criticalAlertsCount > 0 ? '#fda4af' : '#a7f3d0',
      iconBg: 'rgba(239, 68, 68, 0.08)',
      icon: <FontAwesomeIcon icon={faTriangleExclamation} style={{ fontSize: '17px', color: '#ef4444' }} />,
      targetTab: 'printers' as NavTabId,
    },
    {
      id: 'offline' as KpiFilterType,
      title: 'Tỷ lệ khả dụng',
      value: isLoading ? '—' : `${data.onlineRate}%`,
      badgeText: `${data.onlineCount}/${data.totalPrinters || 0} Trực tuyến`,
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
      value: isLoading ? '—' : `${data.lowSuppliesCount} máy`,
      badgeText: '≤ 10% CMYK',
      badgeColor: '#d97706',
      badgeBg: '#fef3c7',
      badgeBorder: '#fde68a',
      iconBg: 'rgba(217, 119, 6, 0.08)',
      icon: <FontAwesomeIcon icon={faBox} style={{ fontSize: '17px', color: '#d97706' }} />,
      targetTab: 'analytics-supplies' as NavTabId, // Trỏ chuẩn xác sang Tab Vật tư
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '16px',
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
              boxShadow: isSelected
                ? '0 0 0 3px rgba(37, 99, 235, 0.12), 0 4px 12px rgba(0, 0, 0, 0.05)'
                : '0 1px 3px rgba(0, 0, 0, 0.04)',
              transform: isSelected ? 'translateY(-1px)' : 'none',
            }}
          >
            {/* Squircle Icon Badge */}
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: card.iconBg,
                border: '1px solid rgba(0, 0, 0, 0.04)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {card.icon}
            </div>

            {/* Content: Title & JetBrains Mono Bold Value */}
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-muted, #64748b)' }}>
                {card.title}
              </span>
              <span
                style={{
                  fontSize: '22px',
                  fontWeight: 800,
                  fontFamily: "'JetBrains Mono', monospace",
                  color: 'var(--text-primary, #0f172a)',
                  letterSpacing: '-0.3px',
                }}
              >
                {card.value}
              </span>
            </div>

            {/* Pill Badge & Navigate Button */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  fontSize: '10.5px',
                  fontWeight: 700,
                  backgroundColor: card.badgeBg,
                  color: card.badgeColor,
                  border: `1px solid ${card.badgeBorder}`,
                  whiteSpace: 'nowrap',
                }}
              >
                {card.badgeText}
              </span>

              <button
                type="button"
                title={`Mở phân hệ ${card.title}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigateModule(card.targetTab);
                }}
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '7px',
                  backgroundColor: 'var(--bg-subtle, #f8fafc)',
                  border: '1px solid var(--border-color, #e2e8f0)',
                  color: 'var(--text-muted, #64748b)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#2563eb';
                  e.currentTarget.style.borderColor = '#2563eb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-muted, #64748b)';
                  e.currentTarget.style.borderColor = 'var(--border-color, #e2e8f0)';
                }}
              >
                <FontAwesomeIcon icon={faArrowUpRightFromSquare} style={{ fontSize: '10px' }} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FleetKpiCards;

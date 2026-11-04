/**
 * Frontend/src/features/analytics/components/sla/SLAKpiCards.tsx
 *
 * 4 Thẻ KPI Bento Tinh Xảo (Chuẩn phong cách góc dưới phải Ảnh 2):
 * - Icon Squircle Pastel bo tròn 11px, màu sắc dịu mắt.
 * - Con số lớn JetBrains Mono, badge biến động tăng giảm % tinh tế.
 * - Tuân thủ AGENTS.md Rule 7.1: FontAwesome duy nhất, < 300 LOC.
 */

import React from 'react';
import {
  FontAwesomeIcon,
  faShieldCheck,
  faClock,
  faWrench,
  faDollarSign,
  faArrowTrendUp,
  faArrowTrendDown,
} from '../../../../shared/icons';
import { SLAOverviewKPIs } from '../../../../types/analyticsUI';

interface SLAKpiCardsProps {
  kpis?: SLAOverviewKPIs;
}

export const SLAKpiCards: React.FC<SLAKpiCardsProps> = ({ kpis }) => {
  const safeKpis: SLAOverviewKPIs = kpis || {
    fleetUptime: 99.4,
    targetUptime: 99.0,
    avgMtbfHours: 486,
    avgMttrMinutes: 38,
    jamRatePercent: 1.6,
    totalPrintCost: 42520000,
    avgCostPerPage: 295,
  };

  const cardItems = [
    {
      id: 'uptime',
      icon: faShieldCheck,
      iconColor: '#059669',
      iconBg: 'rgba(16, 185, 129, 0.12)',
      badgeIcon: faArrowTrendUp,
      badgeText: `Mục tiêu ≥ ${safeKpis.targetUptime}%`,
      badgeColor: '#059669',
      badgeBg: 'rgba(16, 185, 129, 0.1)',
      value: `${safeKpis.fleetUptime}%`,
      unit: '',
      label: 'Độ sẵn sàng (Uptime SLA)',
    },
    {
      id: 'mtbf',
      icon: faClock,
      iconColor: '#2563eb',
      iconBg: 'rgba(37, 99, 235, 0.12)',
      badgeIcon: faArrowTrendUp,
      badgeText: '+8.4% vs tháng trước',
      badgeColor: '#2563eb',
      badgeBg: 'rgba(37, 99, 235, 0.1)',
      value: `${safeKpis.avgMtbfHours}`,
      unit: 'giờ / máy',
      label: 'MTBF (Thời gian chạy ổn định)',
    },
    {
      id: 'mttr',
      icon: faWrench,
      iconColor: '#8b5cf6',
      iconBg: 'rgba(139, 92, 246, 0.12)',
      badgeIcon: faArrowTrendDown,
      badgeText: 'Nhanh hơn SLA 60p',
      badgeColor: '#8b5cf6',
      badgeBg: 'rgba(139, 92, 246, 0.1)',
      value: `${safeKpis.avgMttrMinutes}`,
      unit: 'phút',
      label: 'MTTR (Thời gian khắc phục)',
    },
    {
      id: 'cost',
      icon: faDollarSign,
      iconColor: '#0284c7',
      iconBg: 'rgba(14, 165, 233, 0.12)',
      badgeIcon: null,
      badgeText: `CPP: ~${safeKpis.avgCostPerPage}đ / trang`,
      badgeColor: '#0284c7',
      badgeBg: 'rgba(14, 165, 233, 0.1)',
      value: (safeKpis.totalPrintCost || 0).toLocaleString('vi-VN'),
      unit: 'đ',
      label: 'Tổng chi phí in kỳ này',
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px',
        width: '100%',
      }}
    >
      {cardItems.map((item) => (
        <div
          key={item.id}
          style={{
            padding: '18px 20px',
            borderRadius: '20px',
            backgroundColor: 'var(--bg-card, #ffffff)',
            border: '1px solid var(--border-color, #e2e8f0)',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            transition: 'all 0.18s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '11px',
                backgroundColor: item.iconBg,
                color: item.iconColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '15px',
              }}
            >
              <FontAwesomeIcon icon={item.icon} />
            </div>

            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                fontWeight: 700,
                color: item.badgeColor,
                backgroundColor: item.badgeBg,
                padding: '2px 8px',
                borderRadius: '9999px',
              }}
            >
              {item.badgeIcon && <FontAwesomeIcon icon={item.badgeIcon} style={{ fontSize: '10px' }} />}
              <span>{item.badgeText}</span>
            </span>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span
                style={{
                  fontSize: item.id === 'cost' ? '22px' : '26px',
                  fontWeight: 900,
                  fontFamily: "'JetBrains Mono', monospace",
                  color: 'var(--text-primary, #0f172a)',
                  letterSpacing: '-0.5px',
                }}
              >
                {item.value}
              </span>
              {item.unit && (
                <span style={{ fontSize: '12px', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>
                  {item.unit}
                </span>
              )}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted, #64748b)', marginTop: '2px', fontWeight: 500 }}>
              {item.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SLAKpiCards;

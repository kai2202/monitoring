import React from 'react';
import {
  FontAwesomeIcon,
  faArrowTrendUp,
  faBox,
  faShieldCheck,
} from '../../../shared/icons';
import { AnalyticsSubTab } from '../../../types/analyticsUI';
import { MOCK_CONSUMABLE_ALERTS } from '../../../mocks/mockAnalyticsUIData';

interface AnalyticsSubNavBarProps {
  currentTab: AnalyticsSubTab;
  onSelectTab: (tab: AnalyticsSubTab) => void;
}

export const AnalyticsSubNavBar: React.FC<AnalyticsSubNavBarProps> = ({ currentTab, onSelectTab }) => {
  const criticalCount = MOCK_CONSUMABLE_ALERTS.filter((a) => a.currentPercent < 15).length;

  const tabs = [
    { id: 'overview' as AnalyticsSubTab, label: 'Tổng quan & Sản lượng', icon: faArrowTrendUp },
    { id: 'supplies' as AnalyticsSubTab, label: 'Dự báo vật tư & Linh kiện', icon: faBox, badge: criticalCount },
    { id: 'sla-cost' as AnalyticsSubTab, label: 'Hiệu suất SLA & Chi phí', icon: faShieldCheck },
  ];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        padding: '8px 12px',
        borderRadius: '20px',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 18px',
                borderRadius: '9999px',
                fontSize: '13px',
                fontWeight: isActive ? 700 : 500,
                backgroundColor: isActive ? 'rgba(37, 99, 235, 0.12)' : 'transparent',
                color: isActive ? '#2563eb' : 'var(--text-secondary)',
                border: isActive ? '1px solid rgba(37, 99, 235, 0.3)' : '1px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: isActive ? '0 1px 3px rgba(37, 99, 235, 0.1)' : 'none',
              }}
            >
              <FontAwesomeIcon icon={tab.icon} style={{ fontSize: '14px', color: isActive ? '#2563eb' : 'var(--text-muted)' }} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span
                  style={{
                    padding: '2px 7px',
                    borderRadius: '9999px',
                    fontSize: '10.5px',
                    fontWeight: 800,
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};


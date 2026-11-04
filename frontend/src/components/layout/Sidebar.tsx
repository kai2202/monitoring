/**
 * Frontend/src/components/layout/Sidebar.tsx
 *
 * Thanh điều hướng chính của FleetMonitor theo chuẩn Soft Modern SaaS:
 * - 100% FontAwesome Icons (AGENTS.md Rule 7.1).
 * - Cây phân nhánh (Treeview Connector Lines) trực quan theo mockup.
 * - Module hóa cao độ, chia nhỏ thành SidebarNavItem & SidebarNavGroup (<300 dòng/file).
 */

import React, { useState, useEffect } from 'react';
import {
  FontAwesomeIcon,
  faPrint,
  faTableColumns,
  faChartLine,
  faGear,
  faChevronLeft,
  faChevronRight,
} from '../../shared/icons';
import { SidebarNavItem } from './SidebarNavItem';
import { SidebarNavGroup, SubItemConfig } from './SidebarNavGroup';

export type NavTabId =
  | 'dashboard'
  | 'printers'
  | 'printers-timeline'
  | 'printers-history'
  | 'analytics'
  | 'analytics-supplies'
  | 'analytics-sla-cost'
  | 'settings';

export interface SidebarProps {
  activeTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
}) => {
  const [isPrintersOpen, setIsPrintersOpen] = useState(true);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(true);

  const isPrinterActive =
    activeTab === 'printers' ||
    activeTab === 'printers-timeline' ||
    activeTab === 'printers-history';

  const isAnalyticsActive =
    activeTab === 'analytics' ||
    activeTab === 'analytics-supplies' ||
    activeTab === 'analytics-sla-cost';

  useEffect(() => {
    if (isPrinterActive && !isPrintersOpen) setIsPrintersOpen(true);
  }, [isPrinterActive]);

  useEffect(() => {
    if (isAnalyticsActive && !isAnalyticsOpen) setIsAnalyticsOpen(true);
  }, [isAnalyticsActive]);

  const printerSubItems: SubItemConfig[] = [
    { id: 'printers', label: 'Danh sách', badge: 35 },
    { id: 'printers-timeline', label: 'Lịch trình' },
    { id: 'printers-history', label: 'Bảo trì' },
  ];

  const analyticsSubItems: SubItemConfig[] = [
    { id: 'analytics', label: 'Sản lượng in' },
    { id: 'analytics-supplies', label: 'Vật tư', badge: 4 },
    { id: 'analytics-sla-cost', label: 'SLA & Chi phí' },
  ];

  return (
    <aside
      style={{
        width: collapsed ? '72px' : '260px',
        backgroundColor: 'var(--bg-sidebar, #ffffff)',
        borderRight: '1px solid var(--border-color, #e2e8f0)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        userSelect: 'none',
        flexShrink: 0,
        zIndex: 20,
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          height: '68px',
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          borderBottom: '1px solid var(--border-color, #e2e8f0)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '11px',
              backgroundColor: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.35)',
              flexShrink: 0,
            }}
          >
            <FontAwesomeIcon icon={faPrint} size="sm" />
          </div>
          {!collapsed && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 800, fontSize: '15px', color: 'var(--text-primary, #0f172a)', letterSpacing: '-0.3px' }}>
                FleetMonitor
              </span>
              <span style={{ fontSize: '10.5px', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>
                Enterprise NOC
              </span>
            </div>
          )}
        </div>

        {!collapsed && (
          <button
            type="button"
            onClick={onToggleCollapse}
            title="Thu gọn menu"
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted, #64748b)',
              backgroundColor: 'var(--bg-subtle, rgba(0, 0, 0, 0.04))',
              border: '1px solid var(--border-color, #e2e8f0)',
              cursor: 'pointer',
              fontSize: '11px',
            }}
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto' }}>
        {!collapsed && (
          <span style={{ padding: '0 8px 4px 8px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted, #94a3b8)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Menu
          </span>
        )}

        <SidebarNavItem
          id="dashboard"
          label="Dashboard"
          icon={faTableColumns}
          activeTab={activeTab}
          collapsed={collapsed}
          onSelectTab={onSelectTab}
        />

        <SidebarNavGroup
          label="Máy in"
          icon={faPrint}
          isOpen={isPrintersOpen}
          onToggleOpen={() => setIsPrintersOpen((prev) => !prev)}
          collapsed={collapsed}
          activeTab={activeTab}
          subItems={printerSubItems}
          onSelectTab={onSelectTab}
        />

        <SidebarNavGroup
          label="Phân tích"
          icon={faChartLine}
          isOpen={isAnalyticsOpen}
          onToggleOpen={() => setIsAnalyticsOpen((prev) => !prev)}
          collapsed={collapsed}
          activeTab={activeTab}
          subItems={analyticsSubItems}
          onSelectTab={onSelectTab}
        />

        <SidebarNavItem
          id="settings"
          label="Cấu hình"
          icon={faGear}
          activeTab={activeTab}
          collapsed={collapsed}
          onSelectTab={onSelectTab}
        />
      </nav>

      {/* Footer Profile */}
      <div
        style={{
          padding: '16px',
          borderTop: '1px solid var(--border-color, #e2e8f0)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#e0e7ff',
              color: '#4338ca',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '12px',
              flexShrink: 0,
              border: '2px solid #ffffff',
              boxShadow: '0 2px 5px rgba(0,0,0,0.06)',
            }}
          >
            OP
          </div>
          {!collapsed && (
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary, #0f172a)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Người vận hành
              </span>
              <span style={{ fontSize: '10.5px', color: 'var(--text-muted, #64748b)' }}>
                Kỹ sư NOC
              </span>
            </div>
          )}
        </div>

        {collapsed && (
          <button
            type="button"
            onClick={onToggleCollapse}
            title="Mở rộng menu"
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted, #64748b)',
              backgroundColor: 'var(--bg-subtle, rgba(0, 0, 0, 0.04))',
              border: '1px solid var(--border-color, #e2e8f0)',
              cursor: 'pointer',
              fontSize: '10px',
            }}
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;

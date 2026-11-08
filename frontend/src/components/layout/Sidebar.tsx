/**
 * Frontend/src/components/layout/Sidebar.tsx
 *
 * Thanh điều hướng chính của FleetMonitor theo chuẩn Soft Modern SaaS:
 * - Phân quyền hiển thị Menu tự động theo UserRole (Fleet Manager, NOC, Tech, Dept Head).
 * - 100% FontAwesome Icons (AGENTS.md Rule 7.1).
 * - Cây phân nhánh (Treeview Connector Lines) trực quan.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import {
  FontAwesomeIcon,
  faPrint,
  faTableColumns,
  faChartLine,
  faGear,
  faChevronLeft,
  faBox,
  faFileLines,
} from '../../shared/icons';
import { SidebarNavItem } from './SidebarNavItem';
import { SidebarNavGroup, SubItemConfig } from './SidebarNavGroup';
import { SidebarProfileFooter } from './SidebarProfileFooter';

export type NavTabId =
  | 'dashboard'
  | 'printers'
  | 'printers-timeline'
  | 'printers-history'
  | 'analytics'
  | 'analytics-supplies'
  | 'analytics-sla-cost'
  | 'inventory'
  | 'procurement'
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
  const { user } = useSelector((state: RootState) => state.auth);
  const role = user?.role || 'ADMIN';

  // Điều kiện hiển thị phân hệ theo 3 vai trò chuẩn hoá (/grill-me consensus)
  const isFieldTech = role === 'FIELD_TECH' || role === 'FIELD_TECHNICIAN';
  const isAssetHr = role === 'ASSET_HR' || role === 'DEPARTMENT_HEAD';
  const isAdmin = !isFieldTech && !isAssetHr;

  const canAccessDashboard = true;
  const canAccessAnalytics = true;
  const canAccessInventory = true; // Cả 3 vai trò đều xem Kho vật tư
  const canAccessProcurement = !isFieldTech; // Chỉ Admin và Asset HR xem/lập đơn PO mua sắm
  const canAccessSettings = isAdmin;

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

  const printerSubItems: SubItemConfig[] = useMemo(() => {
    if (isFieldTech) {
      return [{ id: 'printers-timeline', label: 'Lịch trình bảo trì' }, { id: 'printers-history', label: 'Lệnh bảo trì' }, { id: 'printers', label: 'Danh sách máy' }];
    }
    if (isAssetHr) {
      return [{ id: 'printers', label: 'Danh mục tài sản', badge: 35 }, { id: 'printers-history', label: 'Đối soát KPI & Bảo trì' }, { id: 'printers-timeline', label: 'Lịch bảo dưỡng' }];
    }
    return [{ id: 'printers', label: 'Danh sách', badge: 35 }, { id: 'printers-timeline', label: 'Lịch trình' }, { id: 'printers-history', label: 'Bảo trì' }];
  }, [isFieldTech, isAssetHr]);

  const analyticsSubItems: SubItemConfig[] = useMemo(() => {
    if (isFieldTech) {
      return [{ id: 'analytics', label: 'Sản lượng in' }, { id: 'analytics-supplies', label: 'Vật tư', badge: 4 }];
    }
    if (isAssetHr) {
      return [{ id: 'analytics', label: 'Sản lượng in' }, { id: 'analytics-supplies', label: 'Vật tư D-Day', badge: 4 }, { id: 'analytics-sla-cost', label: 'Hạch toán chi phí' }];
    }
    return [{ id: 'analytics', label: 'Sản lượng in' }, { id: 'analytics-supplies', label: 'Vật tư', badge: 4 }, { id: 'analytics-sla-cost', label: 'SLA & Chi phí' }];
  }, [isFieldTech, isAssetHr]);

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
          padding: collapsed ? '0 12px' : '0 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          borderBottom: '1px solid var(--border-color, #e2e8f0)',
        }}
      >
        <div
          onClick={collapsed ? onToggleCollapse : undefined}
          title={collapsed ? 'Nhấn để mở rộng thanh menu' : undefined}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: collapsed ? 'pointer' : 'default' }}
        >
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
      <nav
        className="custom-scrollbar"
        style={{
          flex: 1,
          padding: collapsed ? '16px 8px' : '16px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          overflowY: 'auto',
        }}
      >
        {!collapsed && (
          <span style={{ padding: '0 8px 4px 8px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted, #94a3b8)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Menu
          </span>
        )}

        {/* Dashboard */}
        {canAccessDashboard && (
          <SidebarNavItem
            id="dashboard"
            label="Dashboard"
            icon={faTableColumns}
            activeTab={activeTab}
            collapsed={collapsed}
            onSelectTab={onSelectTab}
          />
        )}

        {/* Máy in: Hiển thị cho toàn bộ vai trò */}
        <SidebarNavGroup
          label={role === 'FIELD_TECHNICIAN' ? 'Bảo trì máy in' : 'Máy in'}
          icon={faPrint}
          isOpen={isPrintersOpen}
          onToggleOpen={() => setIsPrintersOpen((prev) => !prev)}
          collapsed={collapsed}
          activeTab={activeTab}
          subItems={printerSubItems}
          onSelectTab={onSelectTab}
        />

        {/* Phân tích */}
        {canAccessAnalytics && (
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
        )}

        {/* Kho vật tư: Cả 3 vai trò đều dùng (KTV xuất kho, Admin/HR quản lý) */}
        {canAccessInventory && (
          <SidebarNavItem
            id="inventory"
            label="Kho vật tư"
            icon={faBox}
            activeTab={activeTab}
            collapsed={collapsed}
            onSelectTab={onSelectTab}
          />
        )}

        {/* Mua sắm (PO): Hiển thị cho Admin và Asset HR */}
        {canAccessProcurement && (
          <SidebarNavItem
            id="procurement"
            label="Mua sắm (PO)"
            icon={faFileLines}
            activeTab={activeTab}
            collapsed={collapsed}
            onSelectTab={onSelectTab}
          />
        )}

        {/* Cấu hình: Chỉ hiển thị cho Fleet Manager và Kỹ sư NOC */}
        {canAccessSettings && (
          <SidebarNavItem
            id="settings"
            label="Cấu hình"
            icon={faGear}
            activeTab={activeTab}
            collapsed={collapsed}
            onSelectTab={onSelectTab}
          />
        )}
      </nav>

      {/* Footer Profile & Quick Role Switcher */}
      <SidebarProfileFooter collapsed={collapsed} onToggleCollapse={onToggleCollapse} />
    </aside>
  );
};

export default Sidebar;

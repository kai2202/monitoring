/**
 * Frontend/src/components/layout/Sidebar.tsx
 *
 * Thanh điều hướng chính của FleetMonitor theo phong cách phẳng hiện đại (Linear/Vercel):
 * - Brand Header 58px đồng bộ với Top Header.
 * - Phân nhóm mục điều hướng rõ ràng, bỏ badge số hardcode (tuân thủ AGENTS.md Rule 5.1).
 * - Phân quyền hiển thị Menu tự động theo UserRole.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC, FontAwesome chuẩn).
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
  faBox,
  faFileLines,
} from '../../shared/icons';
import { SidebarNavItem } from './SidebarNavItem';
import { SidebarNavGroup, SubItemConfig } from './SidebarNavGroup';
import { SidebarProfileFooter } from './SidebarProfileFooter';

export type NavTabId =
  | 'dashboard'
  | 'printers'
  | 'printers-inventory'
  | 'printers-timeline'
  | 'printers-history'
  | 'analytics'
  | 'analytics-sla-cost'
  | 'inventory'
  | 'procurement'
  | 'settings';

export interface SidebarProps {
  activeTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  onToggleCollapse,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const collapsed = !isHovered;
  const { user } = useSelector((state: RootState) => state.auth);
  const role = user?.role || 'ADMIN';

  const isFieldTech = role === 'FIELD_TECH' || role === 'FIELD_TECHNICIAN';
  const isAssetHr = role === 'ASSET_HR' || role === 'DEPARTMENT_HEAD';
  const isAdmin = !isFieldTech && !isAssetHr;

  const canAccessProcurement = !isFieldTech;
  const canAccessSettings = isAdmin;

  const [isPrintersOpen, setIsPrintersOpen] = useState(true);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(true);

  const isPrinterActive =
    activeTab === 'printers' ||
    activeTab === 'printers-inventory' ||
    activeTab === 'printers-timeline' ||
    activeTab === 'printers-history';

  const isAnalyticsActive =
    activeTab === 'analytics' ||
    activeTab === 'analytics-sla-cost';

  useEffect(() => {
    if (isPrinterActive && !isPrintersOpen) setIsPrintersOpen(true);
  }, [isPrinterActive, isPrintersOpen]);

  useEffect(() => {
    if (isAnalyticsActive && !isAnalyticsOpen) setIsAnalyticsOpen(true);
  }, [isAnalyticsActive, isAnalyticsOpen]);

  const printerSubItems: SubItemConfig[] = useMemo(() => {
    if (isFieldTech) {
      return [
        { id: 'printers-timeline', label: 'Lịch trình bảo trì' },
        { id: 'printers-history', label: 'Lệnh bảo trì' },
        { id: 'printers-inventory', label: 'Sơ đồ tầng' },
        { id: 'printers', label: 'Danh sách máy' },
      ];
    }
    if (isAssetHr) {
      return [
        { id: 'printers-inventory', label: 'Sơ đồ tầng & Tổng vụ' },
        { id: 'printers', label: 'Danh mục tài sản' },
        { id: 'printers-history', label: 'Đối soát KPI & Bảo trì' },
        { id: 'printers-timeline', label: 'Lịch bảo dưỡng' },
      ];
    }
    return [
      { id: 'printers', label: 'Danh sách' },
      { id: 'printers-inventory', label: 'Sơ đồ tầng & Tổng vụ' },
      { id: 'printers-timeline', label: 'Lịch trình' },
      { id: 'printers-history', label: 'Lệnh bảo trì' },
    ];
  }, [isFieldTech, isAssetHr]);

  const analyticsSubItems: SubItemConfig[] = useMemo(() => {
    if (isFieldTech) {
      return [
        { id: 'analytics', label: 'Sản lượng in' },
      ];
    }
    if (isAssetHr) {
      return [
        { id: 'analytics', label: 'Sản lượng in' },
        { id: 'analytics-sla-cost', label: 'Chi phí phòng ban' },
      ];
    }
    return [
      { id: 'analytics', label: 'Sản lượng in' },
      { id: 'analytics-sla-cost', label: 'SLA & Chi phí' },
    ];
  }, [isFieldTech, isAssetHr]);

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        width: isHovered ? '252px' : '72px',
        backgroundColor: 'var(--bg-sidebar, #ffffff)',
        borderRight: '1px solid var(--border-color, #e2e8f0)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s ease',
        boxShadow: isHovered ? '8px 0 28px -6px rgba(15, 23, 42, 0.14)' : 'none',
        userSelect: 'none',
        zIndex: 50,
        overflow: 'hidden',
      }}
    >
      {/* Brand Header 58px đồng bộ Header */}
      <div
        style={{ borderBottom: '1px solid var(--border-color, #e2e8f0)' }}
        className={`h-[58px] shrink-0 flex items-center gap-2.5 ${
          isHovered ? 'px-4 justify-start' : 'px-0 justify-center'
        }`}
      >
        <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
          <FontAwesomeIcon icon={faPrint} className="text-xs" />
        </div>
        {isHovered && (
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-sm text-slate-900 dark:text-slate-100 tracking-tight truncate">
              FleetMonitor
            </span>
            <span className="text-[10.5px] font-medium text-slate-400 truncate">
              Enterprise NOC
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav
        className={`custom-scrollbar flex-1 overflow-y-auto flex flex-col gap-1 ${
          collapsed ? 'px-2.5 py-3' : 'px-3 py-3'
        }`}
      >
        {!collapsed && (
          <span className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Tổng quan
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

        {!collapsed && (
          <span className="px-3 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Vận hành
          </span>
        )}
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
        <SidebarNavItem
          id="inventory"
          label="Kho & Dự báo vật tư"
          icon={faBox}
          activeTab={activeTab}
          collapsed={collapsed}
          onSelectTab={onSelectTab}
        />
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

        {!collapsed && (
          <span className="px-3 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Phân tích &amp; Hệ thống
          </span>
        )}
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

      <SidebarProfileFooter collapsed={collapsed} onToggleCollapse={onToggleCollapse} />
    </aside>
  );
};

export default Sidebar;

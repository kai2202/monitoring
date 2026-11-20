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

  const isFieldTech = role === 'FIELD_TECH';
  const isAdmin = !isFieldTech;

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
        { id: 'printers', label: 'Danh sách máy in' },
        { id: 'printers-inventory', label: 'Sơ đồ tầng' },
      ];
    }
    return [
      { id: 'printers', label: 'Danh sách máy in' },
      { id: 'printers-inventory', label: 'Sơ đồ tầng' },
      { id: 'printers-timeline', label: 'Lịch trình bảo trì' },
      { id: 'printers-history', label: 'Lệnh bảo trì' },
    ];
  }, [isFieldTech]);

  const analyticsSubItems: SubItemConfig[] = useMemo(() => {
    if (isFieldTech) {
      return [
        { id: 'analytics', label: 'Xu hướng sản lượng in' },
      ];
    }
    return [
      { id: 'analytics', label: 'Xu hướng sản lượng in' },
      { id: 'analytics-sla-cost', label: 'SLA & Chi phí' },
    ];
  }, [isFieldTech]);

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md ring-1 ring-slate-900/[0.04] dark:ring-white/[0.06]"
      style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        width: isHovered ? '252px' : '72px',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s ease',
        boxShadow: isHovered ? '12px 0 32px -8px rgba(15, 23, 42, 0.14)' : 'none',
        userSelect: 'none',
        zIndex: 50,
        overflow: 'hidden',
      }}
    >
      {/* Brand Header 58px đồng bộ Header */}
      <div
        className={`h-[58px] shrink-0 flex items-center gap-2.5 ${
          isHovered ? 'px-4 justify-start' : 'px-0 justify-center'
        }`}
      >
        <div className="w-8 h-8 rounded-xl bg-blue-600 shadow-sm shadow-blue-600/20 text-white flex items-center justify-center shrink-0">
          <FontAwesomeIcon icon={faPrint} className="text-xs" />
        </div>
        {isHovered && (
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-sm text-slate-900 dark:text-slate-100 tracking-tight truncate">
              FleetMonitor
            </span>
            <span className="text-[10.5px] font-medium text-slate-400 truncate">
              Quản lý máy in
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav
        className={`custom-scrollbar flex-1 overflow-y-auto flex flex-col gap-1 ${
          collapsed ? 'px-2.5 py-2' : 'px-3 py-2'
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
          label={isFieldTech ? 'Bảo trì máy in' : 'Máy in'}
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
          label="Kho vật tư"
          icon={faBox}
          activeTab={activeTab}
          collapsed={collapsed}
          onSelectTab={onSelectTab}
        />

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
            label="Cấu hình hệ thống"
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

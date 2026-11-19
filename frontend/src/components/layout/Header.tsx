/**
 * Frontend/src/components/layout/Header.tsx
 *
 * Thanh tiêu đề trên cùng (58px đồng bộ với Sidebar Brand Header):
 * - Breadcrumb đầy đủ cho mọi route trong hệ thống.
 * - Ô tìm kiếm, trạng thái Zabbix Live, Theme Toggle và nút Đồng Bộ Zabbix dạng rounded-lg sắc nét.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC, FontAwesome chuẩn).
 */

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../app/store';
import {
  FontAwesomeIcon,
  faRotate,
  faSun,
  faMoon,
  faMagnifyingGlass,
  faXmark,
} from '../../shared/icons';
import { NavTabId } from './Sidebar';
import { HeaderNotifications } from './HeaderNotifications';

export interface HeaderProps {
  activeTab: NavTabId;
  isDark: boolean;
  onToggleTheme: () => void;
  onManualRefresh?: () => void;
  isRefreshing?: boolean;
  lastSyncTime?: string | null;
  onSearch?: (query: string) => void;
}

const ROUTE_BREADCRUMBS: Record<NavTabId, { group?: string; label: string }> = {
  dashboard: { label: 'Dashboard' },
  printers: { group: 'Máy in', label: 'Danh sách máy in' },
  'printers-inventory': { group: 'Máy in', label: 'Sơ đồ tầng & Tổng vụ' },
  'printers-timeline': { group: 'Máy in', label: 'Lịch trình bảo trì' },
  'printers-history': { group: 'Máy in', label: 'Lệnh bảo trì' },
  analytics: { group: 'Phân tích', label: 'Sản lượng in' },
  'analytics-sla-cost': { group: 'Phân tích', label: 'SLA & Chi phí' },
  inventory: { group: 'Vận hành', label: 'Kho & Dự báo vật tư' },
  procurement: { group: 'Vận hành', label: 'Mua sắm (PO)' },
  settings: { group: 'Hệ thống', label: 'Cấu hình' },
};

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  isDark,
  onToggleTheme,
  onManualRefresh,
  isRefreshing = false,
  lastSyncTime,
  onSearch,
}) => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const greetingName = user?.fullName || 'Người vận hành';
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const breadcrumb = ROUTE_BREADCRUMBS[activeTab] || { label: 'Dashboard' };

  return (
    <header
      style={{
        backgroundColor: 'var(--bg-header, #ffffff)',
        borderBottom: '1px solid var(--border-color, #e2e8f0)',
      }}
      className="h-[58px] px-4 lg:px-6 flex items-center justify-between gap-3 shrink-0 z-10 select-none min-w-0"
    >
      {/* Left: Breadcrumb & Greeting */}
      <div className="flex items-center gap-2.5 min-w-0 overflow-hidden">
        <div className="flex items-center gap-1.5 text-xs min-w-0 truncate">
          {breadcrumb.group && (
            <>
              <span className="font-medium text-slate-400 truncate">{breadcrumb.group}</span>
              <span className="text-slate-300">/</span>
            </>
          )}
          <span className="font-bold text-slate-900 dark:text-slate-100 text-sm tracking-tight truncate">
            {breadcrumb.label}
          </span>
        </div>

        <span className="hidden xl:inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-500 dark:text-slate-400 shrink-0">
          Xin chào, {greetingName}
        </span>
      </div>

      {/* Right: Search, Zabbix Live, Notifications, Theme & Sync */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Search Input */}
        <div
          className={`hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded-lg border transition-all ${
            isSearchFocused
              ? 'w-60 bg-white dark:bg-slate-900 border-blue-500 ring-2 ring-blue-500/15'
              : 'w-44 lg:w-52 bg-slate-50/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
          }`}
        >
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className={`text-[11px] ${isSearchFocused ? 'text-blue-600' : 'text-slate-400'}`}
          />
          <input
            type="text"
            placeholder="Tìm máy in, IP..."
            value={searchQuery}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchQuery.trim()) {
                if (onSearch) {
                  onSearch(searchQuery.trim());
                } else {
                  navigate(`/printers/list?q=${encodeURIComponent(searchQuery.trim())}`);
                }
              }
            }}
            className="w-full bg-transparent border-none outline-none text-xs text-slate-800 dark:text-slate-100 min-w-0"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                onSearch?.('');
              }}
              className="bg-transparent border-none p-0 cursor-pointer text-slate-400 hover:text-slate-600"
            >
              <FontAwesomeIcon icon={faXmark} className="text-[10px]" />
            </button>
          )}
        </div>

        {/* Zabbix Live Status Badge */}
        <div
          title={lastSyncTime ? `Zabbix Live Polling (Đồng bộ lúc ${lastSyncTime})` : 'Zabbix Live 60s Fast Polling'}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold whitespace-nowrap ${
            isRefreshing
              ? 'bg-blue-50 border-blue-200 text-blue-600'
              : 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200/80 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isRefreshing ? 'bg-blue-600 animate-pulse' : 'bg-emerald-500'
            }`}
          />
          <span className="hidden sm:inline">{isRefreshing ? 'Đang đồng bộ...' : 'Zabbix Live'}</span>
        </div>

        <HeaderNotifications />

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={onToggleTheme}
          title={isDark ? 'Chuyển sang Giao diện Sáng' : 'Chuyển sang Giao diện Tối'}
          className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center cursor-pointer transition-colors text-xs shrink-0"
        >
          <FontAwesomeIcon icon={isDark ? faSun : faMoon} color={isDark ? '#f59e0b' : undefined} />
        </button>

        {/* Manual Sync Button */}
        <button
          type="button"
          onClick={onManualRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-semibold border-none cursor-pointer transition-colors whitespace-nowrap shrink-0"
        >
          <FontAwesomeIcon icon={faRotate} spin={isRefreshing} className="text-[11px]" />
          <span className="hidden sm:inline">Đồng Bộ Zabbix</span>
        </button>
      </div>
    </header>
  );
};

export default Header;

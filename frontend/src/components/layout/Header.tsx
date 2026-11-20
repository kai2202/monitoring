/**
 * Frontend/src/components/layout/Header.tsx
 *
 * Thanh tiêu đề trên cùng (58px đồng bộ với Sidebar Brand Header):
 * - Tiêu đề trang hiện tại gọn gàng + lời chào người dùng (không breadcrumb '/').
 * - Thiết kế chuẩn Dribbble: Search pill mềm, cụm thông báo, theme toggle và pill vai trò/avatar.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC, FontAwesome chuẩn).
 */

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../app/store';
import {
  FontAwesomeIcon,
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

const ROUTE_TITLES: Record<NavTabId, string> = {
  dashboard: 'Dashboard',
  printers: 'Danh sách máy in',
  'printers-inventory': 'Sơ đồ tầng',
  'printers-timeline': 'Lịch trình bảo trì',
  'printers-history': 'Lệnh bảo trì',
  analytics: 'Xu hướng sản lượng in',
  'analytics-sla-cost': 'SLA & Chi phí',
  inventory: 'Kho vật tư',
  settings: 'Cấu hình hệ thống',
};

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  isDark,
  onToggleTheme,
  onSearch,
}) => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const greetingName = user?.fullName || 'Người vận hành';
  const isFieldTech = user?.role === 'FIELD_TECH';
  const initials = user?.avatarInitials || (isFieldTech ? 'KT' : 'AD');
  const roleLabel = isFieldTech ? 'KTV' : 'Admin';

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const pageTitle = ROUTE_TITLES[activeTab] || 'Dashboard';

  return (
    <header className="h-[58px] px-4 lg:px-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-xs ring-1 ring-slate-900/[0.04] dark:ring-white/[0.06] flex items-center justify-between gap-3 shrink-0 z-10 select-none min-w-0">
      {/* Left: Page Title & Soft Greeting */}
      <div className="flex items-center gap-3 min-w-0 overflow-hidden">
        <h1 className="text-[15px] font-bold text-slate-900 dark:text-slate-100 tracking-tight truncate m-0">
          {pageTitle}
        </h1>

        <span className="hidden xl:inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-100/80 dark:bg-slate-800/70 text-[11px] font-medium text-slate-500 dark:text-slate-400 shrink-0">
          Xin chào, {greetingName}
        </span>
      </div>

      {/* Right: Soft Search Pill, Notifications, Theme Toggle & User Role Pill */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Search Pill */}
        <div
          className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${
            isSearchFocused
              ? 'w-64 bg-white dark:bg-slate-950 shadow-xs ring-2 ring-blue-500/20'
              : 'w-48 lg:w-56 bg-slate-100/80 dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-800'
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
            className="w-full bg-transparent border-none outline-none text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 min-w-0"
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

        <HeaderNotifications />

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={onToggleTheme}
          title={isDark ? 'Chuyển sang Giao diện Sáng' : 'Chuyển sang Giao diện Tối'}
          className="w-8 h-8 rounded-full bg-slate-100/80 hover:bg-slate-200/70 dark:bg-slate-800/70 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center cursor-pointer transition-colors text-xs shrink-0"
        >
          <FontAwesomeIcon icon={isDark ? faSun : faMoon} color={isDark ? '#f59e0b' : undefined} />
        </button>

        {/* Compact Avatar & Role Pill */}
        <div
          title={`${greetingName} (${roleLabel})`}
          className="hidden sm:inline-flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full bg-slate-100/80 dark:bg-slate-800/70 shrink-0"
        >
          <span
            className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center ${
              isFieldTech
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                : 'bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300'
            }`}
          >
            {initials}
          </span>
          <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">{roleLabel}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;

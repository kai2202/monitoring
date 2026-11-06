/**
 * Frontend/src/components/layout/Header.tsx
 *
 * Thanh tiêu đề trên cùng của FleetMonitor theo chuẩn Soft Modern SaaS (Dribbble/Figma style):
 * - 100% FontAwesome Icons (AGENTS.md Rule 7.1).
 * - Lời chào & Tên phân hệ nổi bật: "Xin chào, Kỹ sư NOC!"
 * - Ô tìm kiếm dạng Pill bo tròn mượt mà.
 * - Huy hiệu trạng thái Zabbix Live dạng pill thanh thoát.
 * - Nút bấm hành động bo tròn toàn phần (rounded-full).
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

export interface HeaderProps {
  activeTab: NavTabId;
  isDark: boolean;
  onToggleTheme: () => void;
  onManualRefresh?: () => void;
  isRefreshing?: boolean;
  lastSyncTime?: string | null;
  onSearch?: (query: string) => void;
}

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
  const greetingName = user?.fullName || (user as any)?.name || 'Người vận hành';
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  let currentGroup = '';
  let currentLabel = 'Dashboard';

  if (activeTab === 'printers') {
    currentGroup = 'Máy in';
    currentLabel = 'Danh mục máy in';
  } else if (activeTab === 'printers-timeline') {
    currentGroup = 'Máy in';
    currentLabel = 'Lịch trình tiến độ';
  } else if (activeTab === 'printers-history') {
    currentGroup = 'Máy in';
    currentLabel = 'Lệnh bảo trì';
  } else if (activeTab === 'analytics') {
    currentGroup = 'Phân tích';
    currentLabel = 'Tổng quan & Sản lượng';
  } else if (activeTab === 'analytics-supplies') {
    currentGroup = 'Phân tích';
    currentLabel = 'Dự báo vật tư';
  } else if (activeTab === 'analytics-sla-cost') {
    currentGroup = 'Phân tích';
    currentLabel = 'Hiệu suất SLA & Chi phí';
  } else if (activeTab === 'settings') {
    currentLabel = 'Cấu hình';
  }

  return (
    <header
      style={{
        height: '68px',
        backgroundColor: 'var(--bg-header, #ffffff)',
        borderBottom: '1px solid var(--border-color, #e2e8f0)',
        padding: '0 clamp(12px, 2vw, 28px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        zIndex: 10,
        userSelect: 'none',
        gap: '12px',
        minWidth: 0,
      }}
    >
      {/* Left: Greeting & Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, overflow: 'hidden' }}>
        <h1
          style={{
            fontSize: 'clamp(14px, 1.4vw, 18px)',
            fontWeight: 700,
            color: 'var(--text-primary, #0f172a)',
            margin: 0,
            letterSpacing: '-0.3px',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
          }}
        >
          Xin chào, {greetingName}!
        </h1>
        <div
          className="hidden sm:flex"
          style={{
            alignItems: 'center',
            gap: '6px',
            fontSize: '12.5px',
            color: 'var(--text-muted, #64748b)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          <span>/</span>
          {currentGroup && (
            <>
              <span style={{ fontWeight: 500, color: 'var(--text-muted, #64748b)' }}>{currentGroup}</span>
              <span>/</span>
            </>
          )}
          <span style={{ fontWeight: 600, color: 'var(--text-secondary, #334155)' }}>
            {currentLabel}
          </span>
        </div>
      </div>

      {/* Right: Pill Search, Live status & Primary Action Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(6px, 1vw, 14px)', flexShrink: 0 }}>
        {/* Pill Search Input */}
        <div
          className="hidden md:flex"
          style={{
            alignItems: 'center',
            gap: '8px',
            backgroundColor: isSearchFocused ? 'var(--bg-card, #ffffff)' : 'var(--bg-subtle, rgba(0, 0, 0, 0.03))',
            border: isSearchFocused ? '1px solid #2563eb' : '1px solid var(--border-color, #e2e8f0)',
            borderRadius: '9999px',
            padding: '7px 14px',
            width: isSearchFocused ? 'clamp(160px, 18vw, 260px)' : 'clamp(120px, 14vw, 220px)',
            boxShadow: isSearchFocused ? '0 0 0 3px rgba(37, 99, 235, 0.15)' : 'none',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <span style={{ color: isSearchFocused ? '#2563eb' : 'var(--text-muted, #94a3b8)', display: 'flex', alignItems: 'center' }}>
            <FontAwesomeIcon icon={faMagnifyingGlass} size="xs" />
          </span>
          <input
            type="text"
            placeholder="Tìm kiếm..."
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
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '12px',
              color: 'var(--text-primary, #0f172a)',
              width: '100%',
              minWidth: 0,
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                if (onSearch) onSearch('');
              }}
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--text-muted, #94a3b8)' }}
            >
              <FontAwesomeIcon icon={faXmark} style={{ fontSize: '10px' }} />
            </button>
          )}
        </div>

        {/* Status Pill Badge */}
        <div
          title={lastSyncTime ? `Zabbix Live Polling (Đồng bộ lúc ${lastSyncTime})` : 'Zabbix Live 60s Fast Polling'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 10px',
            borderRadius: '9999px',
            fontSize: '11px',
            fontWeight: 600,
            backgroundColor: isRefreshing ? 'rgba(37, 99, 235, 0.12)' : 'var(--status-online-bg, rgba(22, 163, 74, 0.1))',
            color: isRefreshing ? '#2563eb' : 'var(--status-online, #16a34a)',
            border: isRefreshing ? '1px solid rgba(37, 99, 235, 0.35)' : '1px solid var(--status-online-border, rgba(22, 163, 74, 0.2))',
            backdropFilter: 'blur(8px)',
            boxShadow: isRefreshing ? '0 0 10px rgba(37, 99, 235, 0.25)' : 'var(--status-online-glow, none)',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap',
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: isRefreshing ? '#2563eb' : 'var(--status-online, #16a34a)',
              boxShadow: isRefreshing ? '0 0 6px #2563eb' : '0 0 4px #16a34a',
              animation: isRefreshing ? 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none',
            }}
          />
          <span className="hidden xs:inline">{isRefreshing ? 'Đang đồng bộ...' : 'Zabbix Live'}</span>
        </div>

        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={onToggleTheme}
          title={isDark ? 'Chuyển sang Giao diện Sáng (Soft Modern Pastel)' : 'Chuyển sang Giao diện Tối (Deep Midnight Navy)'}
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-subtle, rgba(0, 0, 0, 0.04))',
            border: '1px solid var(--border-color, #e2e8f0)',
            color: 'var(--text-secondary, #475569)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
            fontSize: '13px',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.08) rotate(12deg)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}
        >
          <FontAwesomeIcon icon={isDark ? faSun : faMoon} color={isDark ? '#f59e0b' : undefined} />
        </button>

        {/* Primary Action Button */}
        <button
          type="button"
          onClick={onManualRefresh}
          disabled={isRefreshing}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 14px',
            borderRadius: '9999px',
            backgroundColor: 'var(--bg-btn-primary, #0f172a)',
            color: 'var(--text-btn-primary, #ffffff)',
            fontSize: '12px',
            fontWeight: 600,
            border: 'var(--border-btn-primary, none)',
            cursor: 'pointer',
            boxShadow: isDark ? '0 0 16px rgba(2, 132, 199, 0.3)' : '0 4px 14px rgba(24, 27, 42, 0.15)',
            transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => { if (!isRefreshing) e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}
        >
          <FontAwesomeIcon icon={faRotate} spin={isRefreshing} size="xs" />
          <span className="hidden sm:inline">Đồng Bộ Zabbix</span>
        </button>
      </div>
    </header>
  );
};

export default Header;

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

import React from 'react';
import {
  FontAwesomeIcon,
  faRotate,
  faSun,
  faMoon,
  faMagnifyingGlass,
} from '../../shared/icons';
import { NavTabId } from './Sidebar';

export interface HeaderProps {
  activeTab: NavTabId;
  isDark: boolean;
  onToggleTheme: () => void;
  onManualRefresh?: () => void;
  isRefreshing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  isDark,
  onToggleTheme,
  onManualRefresh,
  isRefreshing = false,
}) => {
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
        padding: '0 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        zIndex: 10,
        userSelect: 'none',
      }}
    >
      {/* Left: Greeting & Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <h1 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary, #0f172a)', margin: 0, letterSpacing: '-0.3px' }}>
          Xin chào, Kỹ sư NOC!
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: 'var(--text-muted, #64748b)' }}>
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Pill Search Input */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--bg-subtle, rgba(0, 0, 0, 0.03))',
            border: '1px solid var(--border-color, #e2e8f0)',
            borderRadius: '9999px',
            padding: '7px 14px',
            width: '220px',
            transition: 'all 0.15s ease',
          }}
        >
          <span style={{ color: 'var(--text-muted, #94a3b8)', display: 'flex', alignItems: 'center' }}>
            <FontAwesomeIcon icon={faMagnifyingGlass} size="xs" />
          </span>
          <input
            type="text"
            placeholder="Tìm kiếm..."
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '12px',
              color: 'var(--text-primary, #0f172a)',
              width: '100%',
            }}
          />
        </div>

        {/* Status Pill Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 12px',
            borderRadius: '9999px',
            fontSize: '11.5px',
            fontWeight: 600,
            backgroundColor: 'var(--status-online-bg, rgba(22, 163, 74, 0.1))',
            color: 'var(--status-online, #16a34a)',
            border: '1px solid var(--status-online-border, rgba(22, 163, 74, 0.2))',
            backdropFilter: 'blur(8px)',
            boxShadow: 'var(--status-online-glow, none)',
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: 'var(--status-online, #16a34a)',
            }}
          />
          <span>Zabbix Live</span>
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
            transition: 'all 0.15s ease',
            fontSize: '13px',
          }}
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
            padding: '8px 18px',
            borderRadius: '9999px',
            backgroundColor: 'var(--bg-btn-primary, #0f172a)',
            color: 'var(--text-btn-primary, #ffffff)',
            fontSize: '12.5px',
            fontWeight: 600,
            border: 'var(--border-btn-primary, none)',
            cursor: 'pointer',
            boxShadow: isDark ? '0 0 16px rgba(2, 132, 199, 0.3)' : '0 4px 14px rgba(24, 27, 42, 0.15)',
            transition: 'all 0.15s ease',
          }}
        >
          <FontAwesomeIcon icon={faRotate} spin={isRefreshing} size="xs" />
          <span>Đồng Bộ Zabbix</span>
        </button>
      </div>
    </header>
  );
};

export default Header;

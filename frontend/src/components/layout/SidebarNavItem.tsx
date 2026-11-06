import React from 'react';
import { FontAwesomeIcon, IconProp } from '../../shared/icons';
import { NavTabId } from './Sidebar';

export interface SidebarNavItemProps {
  id: NavTabId;
  label: string;
  icon: IconProp;
  activeTab: NavTabId;
  collapsed: boolean;
  onSelectTab: (tab: NavTabId) => void;
}

/**
 * Frontend/src/components/layout/SidebarNavItem.tsx
 *
 * Menu item độc lập chuẩn FontAwesome & Soft Modern Squircle Badge.
 * Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */
export const SidebarNavItem: React.FC<SidebarNavItemProps> = ({
  id,
  label,
  icon,
  activeTab,
  collapsed,
  onSelectTab,
}) => {
  const isActive = activeTab === id;

  return (
    <button
      type="button"
      onClick={() => onSelectTab(id)}
      title={collapsed ? label : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'flex-start',
        gap: collapsed ? 0 : '12px',
        padding: collapsed ? '8px 0' : '8px 10px',
        borderRadius: '14px',
        backgroundColor: isActive ? 'var(--bg-hover, rgba(37, 99, 235, 0.08))' : 'transparent',
        color: isActive ? 'var(--brand-500, #2563eb)' : 'var(--text-secondary, #475569)',
        border: isActive ? '1.5px solid var(--border-accent, rgba(147, 197, 253, 0.85))' : '1.5px solid transparent',
        fontWeight: isActive ? 700 : 500,
        fontSize: '14px',
        textAlign: 'left',
        width: '100%',
        cursor: 'pointer',
        transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: isActive ? '0 2px 8px rgba(37, 99, 235, 0.08)' : 'none',
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = 'var(--bg-subtle, rgba(0, 0, 0, 0.03))';
          e.currentTarget.style.color = 'var(--text-primary, #0f172a)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = 'var(--text-secondary, #475569)';
        }
      }}
    >
      {/* Squircle Icon Badge */}
      <div
        style={{
          width: '34px',
          height: '34px',
          borderRadius: '10px',
          backgroundColor: isActive ? '#ffffff' : 'var(--bg-card, #ffffff)',
          border: '1px solid var(--border-color, rgba(226, 232, 240, 0.8))',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isActive ? '#2563eb' : 'var(--text-muted, #64748b)',
          flexShrink: 0,
          transition: 'all 0.18s ease',
        }}
      >
        <FontAwesomeIcon icon={icon} size="sm" />
      </div>

      {!collapsed && (
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {label}
        </span>
      )}
    </button>
  );
};

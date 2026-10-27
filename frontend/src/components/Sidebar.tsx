import React from 'react';
import {
  LayoutDashboard,
  Printer,
  Droplets,
  AlertTriangle,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon
} from 'lucide-react';
import { TabType, ThemeMode } from '../types/printer';

interface SidebarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  printerCount: number;
  lowSuppliesCount: number;
  activeIncidentsCount: number;
  mobileOpen: boolean;
  theme?: ThemeMode;
  onToggleTheme?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  printerCount,
  lowSuppliesCount,
  activeIncidentsCount,
  mobileOpen,
  theme,
  onToggleTheme
}) => {
  const navItems = [
    {
      id: 'dashboard' as TabType,
      label: 'Bảng điều khiển',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'printers' as TabType,
      label: 'Máy in',
      icon: Printer,
      badge: {
        text: `${printerCount}`,
        color: 'var(--status-info-bg)',
        textColor: 'var(--status-info)',
        border: 'var(--status-info-border)'
      }
    },
    {
      id: 'supplies' as TabType,
      label: 'Vật tư tiêu hao',
      icon: Droplets,
      badge: lowSuppliesCount > 0 ? {
        text: `${lowSuppliesCount}`,
        color: 'var(--status-warning-bg)',
        textColor: 'var(--status-warning)',
        border: 'var(--status-warning-border)'
      } : null
    },
    {
      id: 'incidents' as TabType,
      label: 'Sự cố',
      icon: AlertTriangle,
      badge: activeIncidentsCount > 0 ? {
        text: `${activeIncidentsCount}`,
        color: 'var(--status-offline-bg)',
        textColor: 'var(--status-offline)',
        border: 'var(--status-offline-border)'
      } : null
    },
    {
      id: 'analytics' as TabType,
      label: 'Thống kê sử dụng',
      icon: BarChart3,
      badge: null
    }
  ];

  return (
    <aside
      className="sidebar-container"
      style={{
        width: collapsed ? '68px' : '230px',
        backgroundColor: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'width 0.28s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.22s ease, border-color 0.22s ease',
        zIndex: 20,
        flexShrink: 0,
        userSelect: 'none',
        position: 'relative'
      }}
    >
      {/* Top Section: Brand Logo & Navigation */}
      <div>
        {/* Brand Logo at Top of Sidebar */}
        <div
          style={{
            padding: '1rem 0.55rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            borderBottom: '1px solid var(--border-color)',
            marginBottom: '0.5rem',
            height: '64px',
            boxSizing: 'border-box',
            overflow: 'hidden'
          }}
        >
          {/* Fixed Icon Column for Logo */}
          <div
            style={{
              width: '50px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <img
              src="/logo.svg"
              alt="PrintMonitor Logo"
              style={{
                width: '42px',
                height: '28px',
                objectFit: 'contain',
                filter: 'drop-shadow(0 0 10px rgba(56, 189, 248, 0.25))'
              }}
            />
          </div>

          {/* Brand Title (Smooth fade transition without reflow) */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              opacity: collapsed ? 0 : 1,
              transform: collapsed ? 'translateX(-8px)' : 'translateX(0)',
              pointerEvents: collapsed ? 'none' : 'auto',
              visibility: collapsed ? 'hidden' : 'visible',
              transition: collapsed
                ? 'opacity 0.14s ease, transform 0.14s ease, visibility 0s 0.14s'
                : 'opacity 0.22s ease 0.08s, transform 0.22s ease 0.08s, visibility 0s 0s'
            }}
          >
            <span
              style={{
                fontWeight: 800,
                fontSize: '0.98rem',
                letterSpacing: '0.04em',
                color: 'var(--text-primary)',
                lineHeight: 1.1,
                whiteSpace: 'nowrap'
              }}
            >
              PRINTMONITOR
            </span>
            <span
              style={{
                fontSize: '0.62rem',
                color: 'var(--brand-500)',
                fontFamily: 'JetBrains Mono',
                fontWeight: 700,
                letterSpacing: '0.05em',
                whiteSpace: 'nowrap'
              }}
            >
              DEVICE MANAGEMENT
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <div style={{ padding: '0.5rem 0.55rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <div
                key={item.id}
                className="sidebar-nav-item"
                style={{ position: 'relative', width: '100%', height: '44px' }}
              >
                <button
                  onClick={() => onSelectTab(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    width: '100%',
                    height: '44px',
                    padding: 0,
                    borderRadius: '0.65rem',
                    border: 'none',
                    backgroundColor: isActive ? 'var(--brand-50)' : 'transparent',
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background-color 0.18s ease, color 0.18s ease',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.85rem',
                    outline: 'none',
                    position: 'relative',
                    boxShadow: 'none',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }
                  }}
                >
                  {/* Active Indicator Accent Bar */}
                  {isActive && (
                    <span
                      style={{
                        position: 'absolute',
                        left: '0px',
                        top: '18%',
                        bottom: '18%',
                        width: '3.5px',
                        borderRadius: '0 4px 4px 0',
                        backgroundColor: 'var(--brand-500)',
                        boxShadow: '0 0 8px var(--brand-500)'
                      }}
                    />
                  )}

                  {/* Fixed Icon Column (50px width, exactly centered in collapsed state) */}
                  <div
                    style={{
                      width: '50px',
                      height: '44px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Icon
                      size={19}
                      strokeWidth={isActive ? 2.2 : 1.8}
                      style={{
                        color: isActive ? 'var(--brand-500)' : 'var(--text-muted)',
                        filter: isActive ? 'drop-shadow(0 0 6px rgba(56, 189, 248, 0.4))' : 'none'
                      }}
                    />
                  </div>

                  {/* Label and Badge (Fade transition delayed until space is available) */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flex: 1,
                      minWidth: 0,
                      paddingRight: '0.75rem',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      opacity: collapsed ? 0 : 1,
                      transform: collapsed ? 'translateX(-8px)' : 'translateX(0)',
                      pointerEvents: collapsed ? 'none' : 'auto',
                      visibility: collapsed ? 'hidden' : 'visible',
                      transition: collapsed
                        ? 'opacity 0.14s ease, transform 0.14s ease, visibility 0s 0.14s'
                        : 'opacity 0.22s ease 0.08s, transform 0.22s ease 0.08s, visibility 0s 0s'
                    }}
                  >
                    <span
                      style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontSize: '0.85rem'
                      }}
                    >
                      {item.label}
                    </span>
                    {item.badge && (
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontFamily: 'JetBrains Mono',
                          fontWeight: 700,
                          padding: '0.15rem 0.45rem',
                          borderRadius: '9999px',
                          backgroundColor: item.badge.color,
                          color: item.badge.textColor,
                          border: `1px solid ${item.badge.border}`,
                          lineHeight: 1,
                          flexShrink: 0,
                          marginLeft: '0.45rem'
                        }}
                      >
                        {item.badge.text}
                      </span>
                    )}
                  </div>
                </button>

                {/* Floating Tooltip in Collapsed Mode */}
                {collapsed && (
                  <div className="sidebar-tooltip">
                    <span>{item.label}</span>
                    {item.badge && (
                      <span
                        style={{
                          fontSize: '0.65rem',
                          fontFamily: 'JetBrains Mono',
                          fontWeight: 700,
                          padding: '0.1rem 0.35rem',
                          borderRadius: '9999px',
                          backgroundColor: item.badge.color,
                          color: item.badge.textColor,
                          border: `1px solid ${item.badge.border}`
                        }}
                      >
                        {item.badge.text}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Controls: Theme Toggle & Sidebar Collapse */}
      <div
        style={{
          padding: '0.75rem 0.55rem',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.35rem'
        }}
      >
        {/* Theme Mode Toggle Button */}
        {onToggleTheme && (
          <div className="sidebar-nav-item" style={{ position: 'relative', width: '100%', height: '40px' }}>
            <button
              onClick={onToggleTheme}
              style={{
                width: '100%',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                padding: 0,
                fontSize: '0.78rem',
                color: 'var(--text-secondary)',
                borderRadius: '0.55rem',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                overflow: 'hidden',
                transition: 'background-color 0.18s ease, color 0.18s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              <div
                style={{
                  width: '50px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                {theme === 'light' ? (
                  <Moon size={16} style={{ color: 'var(--brand-500)', flexShrink: 0 }} />
                ) : (
                  <Sun size={16} style={{ color: '#fbbf24', flexShrink: 0 }} />
                )}
              </div>
              <span
                style={{
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  opacity: collapsed ? 0 : 1,
                  transform: collapsed ? 'translateX(-8px)' : 'translateX(0)',
                  pointerEvents: collapsed ? 'none' : 'auto',
                  visibility: collapsed ? 'hidden' : 'visible',
                  transition: collapsed
                    ? 'opacity 0.14s ease, transform 0.14s ease, visibility 0s 0.14s'
                    : 'opacity 0.22s ease 0.08s, transform 0.22s ease 0.08s, visibility 0s 0s'
                }}
              >
                {theme === 'light' ? 'Giao diện Tối' : 'Giao diện Sáng'}
              </span>
            </button>
            {collapsed && (
              <div className="sidebar-tooltip">
                <span>{theme === 'light' ? 'Giao diện Tối' : 'Giao diện Sáng'}</span>
              </div>
            )}
          </div>
        )}

        {/* Sidebar Collapse/Expand Button */}
        <div className="sidebar-nav-item" style={{ position: 'relative', width: '100%', height: '40px' }}>
          <button
            onClick={onToggleCollapse}
            style={{
              width: '100%',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              padding: 0,
              fontSize: '0.78rem',
              color: 'var(--text-secondary)',
              borderRadius: '0.55rem',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              overflow: 'hidden',
              transition: 'background-color 0.18s ease, color 0.18s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            <div
              style={{
                width: '50px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              {collapsed ? (
                <ChevronRight size={17} style={{ color: 'var(--brand-500)', flexShrink: 0 }} />
              ) : (
                <ChevronLeft size={17} style={{ flexShrink: 0 }} />
              )}
            </div>
            <span
              style={{
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                opacity: collapsed ? 0 : 1,
                transform: collapsed ? 'translateX(-8px)' : 'translateX(0)',
                pointerEvents: collapsed ? 'none' : 'auto',
                visibility: collapsed ? 'hidden' : 'visible',
                transition: collapsed
                  ? 'opacity 0.14s ease, transform 0.14s ease, visibility 0s 0.14s'
                  : 'opacity 0.22s ease 0.08s, transform 0.22s ease 0.08s, visibility 0s 0s'
              }}
            >
              Thu gọn Menu
            </span>
          </button>
          {collapsed && (
            <div className="sidebar-tooltip">
              <span>Mở rộng thanh điều hướng</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

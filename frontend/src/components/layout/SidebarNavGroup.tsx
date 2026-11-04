import React from 'react';
import { FontAwesomeIcon, IconProp, faCaretDown, faCaretRight } from '../../shared/icons';
import { NavTabId } from './Sidebar';

export interface SubItemConfig {
  id: NavTabId;
  label: string;
  badge?: number;
}

export interface SidebarNavGroupProps {
  label: string;
  icon: IconProp;
  iconBg?: string;
  iconColor?: string;
  isOpen: boolean;
  onToggleOpen: () => void;
  collapsed: boolean;
  activeTab: NavTabId;
  subItems: SubItemConfig[];
  onSelectTab: (tab: NavTabId) => void;
}

/**
 * Frontend/src/components/layout/SidebarNavGroup.tsx
 *
 * Menu nhóm Cây phân nhánh (Treeview Connector Branch) chuẩn Mockup:
 * - Squircle badge 10px bo tròn cho icon cha.
 * - Trục dọc buông từ đáy Squircle badge.
 * - Khi sub-item active: Trục buông màu XANH DƯƠNG từ trên xuống và uốn cong 90 độ (curved elbow)
 *   vào khung pill bo tròn viền xanh mềm mại.
 * - Đoạn phía dưới sub-item active tiếp tục buông màu xám nhạt tới các mục kế tiếp.
 * Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */
export const SidebarNavGroup: React.FC<SidebarNavGroupProps> = ({
  label,
  icon,
  isOpen,
  onToggleOpen,
  collapsed,
  activeTab,
  subItems,
  onSelectTab,
}) => {
  const activeIndex = subItems.findIndex((s) => s.id === activeTab);
  const isGroupActive = activeIndex >= 0;

  // Chiều cao mỗi hàng sub-item (bao gồm khoảng cách) để tính tọa độ uốn cong
  const ROW_HEIGHT = 40;
  const HALF_ROW = 19;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', position: 'relative' }}>
      {/* 1. Nút Nhóm Cha (Parent Header) */}
      <button
        type="button"
        onClick={() => {
          if (collapsed) {
            onSelectTab(subItems[0].id);
          } else {
            onToggleOpen();
          }
        }}
        title={collapsed ? label : undefined}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 10px',
          borderRadius: '14px',
          backgroundColor: isGroupActive && !isOpen ? 'rgba(37, 99, 235, 0.05)' : 'transparent',
          border: '1px solid transparent',
          cursor: 'pointer',
          width: '100%',
          transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--bg-subtle, rgba(0, 0, 0, 0.03))';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = isGroupActive && !isOpen ? 'rgba(37, 99, 235, 0.05)' : 'transparent';
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Squircle Icon Badge bo tròn 10px chuẩn Mockup */}
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              backgroundColor: 'var(--bg-card, #ffffff)',
              border: '1px solid var(--border-color, rgba(226, 232, 240, 0.8))',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isGroupActive ? '#2563eb' : 'var(--text-muted, #64748b)',
              flexShrink: 0,
              transition: 'all 0.18s ease',
            }}
          >
            <FontAwesomeIcon icon={icon} size="sm" />
          </div>

          {!collapsed && (
            <span
              style={{
                fontSize: '14.5px',
                fontWeight: 600,
                color: isGroupActive ? 'var(--text-primary, #0f172a)' : 'var(--text-secondary, #475569)',
                letterSpacing: '-0.01em',
              }}
            >
              {label}
            </span>
          )}
        </div>

        {/* Mũi tên Caret đặc */}
        {!collapsed && (
          <span
            style={{
              color: 'var(--text-muted, #94a3b8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '18px',
              height: '18px',
              fontSize: '11px',
              transition: 'transform 0.2s ease',
            }}
          >
            <FontAwesomeIcon icon={isOpen ? faCaretDown : faCaretRight} />
          </span>
        )}
      </button>

      {/* 2. Cây Phân Nhánh và Sub-items (Treeview Connector) */}
      {!collapsed && isOpen && (
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            paddingLeft: '27px', // Tâm Squircle badge: pad 10px + 17px = 27px
            marginTop: '2px',
            marginBottom: '4px',
          }}
        >
          {/* Trục chính dọc nền xám nhạt buông suốt danh sách */}
          <div
            style={{
              position: 'absolute',
              left: '27px',
              top: '-10px',
              bottom: '18px',
              width: '1.5px',
              backgroundColor: 'var(--border-color, rgba(203, 213, 225, 0.7))',
              zIndex: 1,
            }}
          />

          {/* Đường dẫn XANH DƯƠNG từ icon cha buông xuống và uốn cong 90° vào item Active */}
          {activeIndex >= 0 && (
            <div
              style={{
                position: 'absolute',
                left: '27px',
                top: '-10px',
                width: '14px',
                height: `${activeIndex * ROW_HEIGHT + HALF_ROW + 10}px`,
                borderLeft: '2px solid #3b82f6',
                borderBottom: '2px solid #3b82f6',
                borderBottomLeftRadius: '14px',
                zIndex: 3,
                pointerEvents: 'none',
              }}
            />
          )}

          {subItems.map((sub, index) => {
            const isSubActive = index === activeIndex;

            return (
              <div
                key={sub.id}
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: '14px',
                  height: '36px',
                  zIndex: 2,
                }}
              >
                {/* Vạch ngang nhánh mờ nối từ trục dọc vào sub-item (nếu không phải item active) */}
                {!isSubActive && (
                  <div
                    style={{
                      position: 'absolute',
                      left: '0px',
                      top: '50%',
                      width: '12px',
                      height: '1.5px',
                      backgroundColor: 'var(--border-color, rgba(203, 213, 225, 0.7))',
                      zIndex: 1,
                    }}
                  />
                )}

                {/* Khung Pill Sub-item chuẩn Mockup */}
                <button
                  type="button"
                  onClick={() => onSelectTab(sub.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: isSubActive ? '7px 14px' : '7px 10px',
                    borderRadius: '14px',
                    backgroundColor: isSubActive
                      ? 'rgba(239, 246, 255, 0.95)'
                      : 'transparent',
                    color: isSubActive ? '#2563eb' : 'var(--text-secondary, #475569)',
                    border: isSubActive
                      ? '1.5px solid rgba(147, 197, 253, 0.9)'
                      : '1.5px solid transparent',
                    fontWeight: isSubActive ? 700 : 500,
                    fontSize: '13.5px',
                    textAlign: 'left',
                    width: '100%',
                    cursor: 'pointer',
                    transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: isSubActive
                      ? '0 2px 8px rgba(37, 99, 235, 0.08)'
                      : 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSubActive) {
                      e.currentTarget.style.color = 'var(--text-primary, #0f172a)';
                      e.currentTarget.style.fontWeight = '600';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSubActive) {
                      e.currentTarget.style.color = 'var(--text-secondary, #475569)';
                      e.currentTarget.style.fontWeight = '500';
                    }
                  }}
                >
                  <span
                    style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {sub.label}
                  </span>

                  {sub.badge !== undefined && (
                    <span
                      style={{
                        padding: '1px 7px',
                        fontSize: '10.5px',
                        fontWeight: 700,
                        borderRadius: '9999px',
                        backgroundColor: isSubActive ? 'rgba(37, 99, 235, 0.15)' : 'var(--bg-subtle, rgba(0, 0, 0, 0.04))',
                        color: isSubActive ? '#2563eb' : 'var(--text-muted, #64748b)',
                        fontFamily: "'JetBrains Mono', monospace",
                        marginLeft: '6px',
                      }}
                    >
                      {sub.badge}
                    </span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SidebarNavGroup;

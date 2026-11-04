/**
 * Frontend/src/components/layout/SidebarProfileFooter.tsx
 *
 * Khối hồ sơ người dùng & chuyển đổi vai trò ở đáy Sidebar:
 * - Hiển thị Avatar, Tên đầy đủ, Vai trò tiếng Việt.
 * - Nút chuyển đổi vai trò nhanh (Demo Role Switcher) và nút Đăng xuất.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../app/store';
import { logout, switchRole } from '../../app/slices/authSlice';
import { UserRole } from '../../types/auth';
import {
  FontAwesomeIcon,
  faRightFromBracket,
  faUserShield,
  faChevronRight,
} from '../../shared/icons';

interface SidebarProfileFooterProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const SidebarProfileFooter: React.FC<SidebarProfileFooterProps> = ({
  collapsed,
  onToggleCollapse,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleSwitchRole = (role: UserRole) => {
    dispatch(switchRole(role));
    setIsMenuOpen(false);
    if (role === 'FIELD_TECHNICIAN') {
      navigate('/printers/timeline');
    } else {
      navigate('/dashboard');
    }
  };

  if (!user) return null;

  return (
    <div
      style={{
        padding: '14px 16px',
        borderTop: '1px solid var(--border-color, #e2e8f0)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        gap: '8px',
        position: 'relative',
      }}
    >
      {/* User Info & Avatar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          minWidth: 0,
          cursor: 'pointer',
        }}
        onClick={() => !collapsed && setIsMenuOpen((prev) => !prev)}
        title="Nhấn để đổi vai trò phân quyền"
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: user.role === 'FLEET_MANAGER' ? '#dbeafe' : user.role === 'NOC_ENGINEER' ? '#cffafe' : user.role === 'FIELD_TECHNICIAN' ? '#fef3c7' : '#fce7f3',
            color: user.role === 'FLEET_MANAGER' ? '#1d4ed8' : user.role === 'NOC_ENGINEER' ? '#0891b2' : user.role === 'FIELD_TECHNICIAN' ? '#b45309' : '#be185d',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '12.5px',
            flexShrink: 0,
            border: '2px solid #ffffff',
            boxShadow: '0 2px 5px rgba(0,0,0,0.06)',
          }}
        >
          {user.avatarInitials}
        </div>

        {!collapsed && (
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <span
              style={{
                fontSize: '12.5px',
                fontWeight: 700,
                color: 'var(--text-primary, #0f172a)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user.fullName}
            </span>
            <span
              style={{
                fontSize: '10.5px',
                color: 'var(--text-muted, #64748b)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user.roleNameVi}
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {!collapsed ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            title="Chuyển vai trò"
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted, #64748b)',
              backgroundColor: isMenuOpen ? 'var(--border-color, #e2e8f0)' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            <FontAwesomeIcon icon={faUserShield} />
          </button>

          <button
            type="button"
            onClick={handleLogout}
            title="Đăng xuất"
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ef4444',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            <FontAwesomeIcon icon={faRightFromBracket} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onToggleCollapse}
          title="Mở rộng menu"
          style={{
            width: '26px',
            height: '26px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted, #64748b)',
            backgroundColor: 'var(--bg-subtle, rgba(0, 0, 0, 0.04))',
            border: '1px solid var(--border-color, #e2e8f0)',
            cursor: 'pointer',
            fontSize: '10px',
          }}
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      )}

      {/* Popover Switch Role Menu */}
      {isMenuOpen && !collapsed && (
        <div
          style={{
            position: 'absolute',
            bottom: '68px',
            left: '12px',
            right: '12px',
            backgroundColor: 'var(--bg-card, #ffffff)',
            borderRadius: '14px',
            border: '1px solid var(--border-color, #e2e8f0)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
            padding: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            zIndex: 50,
          }}
        >
          <div style={{ padding: '4px 8px', fontSize: '10.5px', fontWeight: 800, color: 'var(--text-muted, #94a3b8)', textTransform: 'uppercase' }}>
            Đổi vai trò phân quyền
          </div>
          {[
            { role: 'ADMIN' as UserRole, label: 'Admin Hệ Thống (Toàn quyền)', color: '#2563eb' },
            { role: 'FIELD_TECH' as UserRole, label: 'Kỹ Thuật Viên Hiện Trường', color: '#f59e0b' },
            { role: 'ASSET_HR' as UserRole, label: 'HR / Kiểm Kê Tài Sản & CP', color: '#ec4899' },
          ].map((item) => (
            <button
              key={item.role}
              type="button"
              onClick={() => handleSwitchRole(item.role)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 10px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: user.role === item.role ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                color: user.role === item.role ? item.color : 'var(--text-primary, #0f172a)',
                fontSize: '11.5px',
                fontWeight: user.role === item.role ? 700 : 500,
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: item.color }} />
              <span style={{ flex: 1 }}>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};


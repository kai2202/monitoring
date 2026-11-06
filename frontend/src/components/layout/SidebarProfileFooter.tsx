/**
 * Frontend/src/components/layout/SidebarProfileFooter.tsx
 *
 * Khối hồ sơ người dùng xác thực ở đáy Sidebar:
 * - Hiển thị Avatar viết tắt, Họ tên, Vai trò tiếng Việt và Email/Tên tài khoản.
 * - Loại bỏ hoàn toàn bộ chuyển đổi vai trò giả lập (Demo Role Switcher).
 * - Nút Đăng xuất thu hồi Refresh Token trên máy chủ và xóa phiên cục bộ.
 * - Tuân thủ AGENTS.md Rule 4 & Rule 7.1 (< 300 LOC).
 */

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../app/store';
import { logout } from '../../app/slices/authSlice';
import { authService } from '../../features/auth/services/authService';
import {
  FontAwesomeIcon,
  faRightFromBracket,
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

  const handleLogout = async () => {
    setIsMenuOpen(false);
    await authService.logout();
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  if (!user) return null;

  const isTech = user.role === 'FIELD_TECH' || user.role === 'FIELD_TECHNICIAN';
  const isHr = user.role === 'ASSET_HR' || user.role === 'DEPARTMENT_HEAD';
  const avatarBg = isTech ? '#fef3c7' : isHr ? '#fce7f3' : '#dbeafe';
  const avatarColor = isTech ? '#b45309' : isHr ? '#be185d' : '#1d4ed8';

  return (
    <div
      style={{
        padding: collapsed ? '14px 0' : '14px 16px',
        borderTop: '1px solid var(--border-color, #e2e8f0)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        gap: collapsed ? 0 : '8px',
        position: 'relative',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Thông tin phiên người dùng */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          gap: '10px',
          minWidth: 0,
          cursor: collapsed ? 'pointer' : 'default',
        }}
        onClick={() => collapsed && setIsMenuOpen((prev) => !prev)}
        title={collapsed ? `${user.fullName} (${user.roleNameVi})` : user.email || user.username}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: avatarBg,
            color: avatarColor,
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

      {/* Nút Đăng xuất trực tiếp khi mở rộng Sidebar */}
      {!collapsed && (
        <button
          type="button"
          onClick={handleLogout}
          title="Đăng xuất khỏi hệ thống"
          style={{
            width: '30px',
            height: '30px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ef4444',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: '12.5px',
            flexShrink: 0,
          }}
        >
          <FontAwesomeIcon icon={faRightFromBracket} />
        </button>
      )}

      {/* Menu nhỏ khi Sidebar đang thu gọn (72px) */}
      {collapsed && isMenuOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '16px',
            left: '78px',
            width: '230px',
            backgroundColor: 'var(--bg-card, #ffffff)',
            borderRadius: '14px',
            border: '1px solid var(--border-color, #e2e8f0)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
            padding: '10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            zIndex: 9999,
          }}
        >
          <div style={{ padding: '4px 6px', borderBottom: '1px solid var(--border-color, #f1f5f9)', paddingBottom: '8px' }}>
            <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary, #0f172a)' }}>
              {user.fullName}
            </div>
            <div style={{ fontSize: '10.5px', color: 'var(--text-muted, #64748b)', marginTop: '2px' }}>
              {user.roleNameVi}
            </div>
            <button
              type="button"
              onClick={() => {
                setIsMenuOpen(false);
                onToggleCollapse();
              }}
              style={{
                marginTop: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 8px',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-subtle, #f8fafc)',
                border: '1px solid var(--border-color, #e2e8f0)',
                fontSize: '11px',
                fontWeight: 600,
                color: '#2563eb',
                cursor: 'pointer',
                width: '100%',
              }}
            >
              <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: '10px' }} />
              <span>Mở rộng thanh bên</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '7px 8px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: 'transparent',
              color: '#ef4444',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <FontAwesomeIcon icon={faRightFromBracket} />
            <span>Đăng xuất</span>
          </button>
        </div>
      )}
    </div>
  );
};

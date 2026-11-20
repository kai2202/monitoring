/**
 * Frontend/src/components/layout/SidebarProfileFooter.tsx
 *
 * Khối hồ sơ người dùng xác thực ở đáy Sidebar:
 * - Avatar rounded-lg gọn gàng, Họ tên, Vai trò tiếng Việt.
 * - Nút Đăng xuất thu hồi Refresh Token trên máy chủ và xóa phiên cục bộ.
 * - Tuân thủ AGENTS.md Rule 4 & Rule 7.1 (< 300 LOC).
 */

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../app/store';
import { logout } from '../../app/slices/authSlice';
import { authService } from '../../features/auth/services/authService';
import { FontAwesomeIcon, faRightFromBracket, faChevronRight } from '../../shared/icons';

interface SidebarProfileFooterProps {
  collapsed: boolean;
  onToggleCollapse?: () => void;
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

  const isTech = user.role === 'FIELD_TECH';
  const avatarCls = isTech
    ? 'bg-amber-100 text-amber-800'
    : 'bg-blue-100 text-blue-700';

  return (
    <div
      style={{ borderTop: '1px solid var(--border-color, #e2e8f0)' }}
      className={`relative w-full flex items-center ${
        collapsed ? 'justify-center py-3' : 'justify-between gap-2 px-3 py-3'
      }`}
    >
      <div
        onClick={() => collapsed && setIsMenuOpen((prev) => !prev)}
        title={collapsed ? `${user.fullName} (${user.roleNameVi})` : user.email || user.username}
        className={`flex items-center gap-2.5 min-w-0 ${collapsed ? 'justify-center cursor-pointer' : ''}`}
      >
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${avatarCls}`}
        >
          {user.avatarInitials}
        </div>

        {!collapsed && (
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
              {user.fullName}
            </span>
            <span className="text-[10.5px] text-slate-500 dark:text-slate-400 truncate">
              {user.roleNameVi}
            </span>
          </div>
        )}
      </div>

      {!collapsed && (
        <button
          type="button"
          onClick={handleLogout}
          title="Đăng xuất khỏi hệ thống"
          className="w-7 h-7 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 flex items-center justify-center bg-transparent border-none cursor-pointer text-xs shrink-0 transition-colors"
        >
          <FontAwesomeIcon icon={faRightFromBracket} />
        </button>
      )}

      {collapsed && isMenuOpen && (
        <div
          style={{
            backgroundColor: 'var(--bg-card, #ffffff)',
            border: '1px solid var(--border-color, #e2e8f0)',
          }}
          className="fixed bottom-4 left-[78px] w-56 rounded-xl shadow-xl p-2.5 flex flex-col gap-1.5 z-[9999]"
        >
          <div className="px-1.5 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{user.fullName}</div>
            <div className="text-[10.5px] text-slate-500 mt-0.5">{user.roleNameVi}</div>
            {onToggleCollapse && (
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onToggleCollapse();
                }}
                className="mt-2 w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[11px] font-semibold text-blue-600 cursor-pointer"
              >
                <FontAwesomeIcon icon={faChevronRight} className="text-[10px]" />
                <span>Mở rộng thanh bên</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-rose-50 text-rose-600 text-xs font-semibold border-none bg-transparent cursor-pointer text-left"
          >
            <FontAwesomeIcon icon={faRightFromBracket} />
            <span>Đăng xuất</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default SidebarProfileFooter;

/**
 * Frontend/src/features/settings/components/RbacUserRow.tsx
 *
 * Dòng dữ liệu thành viên trong bảng RBAC (4 cột: Thành viên, Vai trò, Trạng thái, Thao tác):
 * - Cụm nút Thao tác hợp nhất (Split Action: Quản lý + Menu mở rộng ⋮) thay thế 4 nút rời rạc.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  FontAwesomeIcon,
  faUserGear,
  faEllipsisVertical,
  faKey,
  faLock,
  faCircleCheck,
  faTrashCan,
  faPenToSquare,
} from '@/shared/icons';
import { ManagedUser } from '@/types/settings';
import { RBAC_ROLES, getUserInitials } from '../utils/rbacRoleConfig';
import { UserManageTab } from './modals/UserManageModal';

export interface RbacUserRowProps {
  user: ManagedUser;
  onManage: (user: ManagedUser, tab: UserManageTab) => void;
  onToggleStatus: (userId: string) => void;
  onDelete: (user: ManagedUser) => void;
}

export const RbacUserRow: React.FC<RbacUserRowProps> = ({
  user,
  onManage,
  onToggleStatus,
  onDelete,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [menuOpen]);

  const roleMeta = RBAC_ROLES.find((r) => r.code === user.role) || RBAC_ROLES[1];

  return (
    <tr className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
      {/* Thành viên */}
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center border border-slate-200/80 dark:border-slate-700 shrink-0">
            {getUserInitials(user.name)}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-slate-800 dark:text-slate-100 truncate">{user.name}</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">{user.email}</div>
          </div>
        </div>
      </td>

      {/* Vai trò */}
      <td className="py-3.5 px-4">
        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border whitespace-nowrap ${roleMeta.badgeClass}`}>
          {user.roleNameVi}
        </span>
      </td>

      {/* Trạng thái */}
      <td className="py-3.5 px-4">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap ${
            user.status === 'ACTIVE'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
          {user.status === 'ACTIVE' ? 'Đang hoạt động' : 'Tạm khóa'}
        </span>
      </td>

      {/* Thao tác hợp nhất (Split Action + Menu) */}
      <td className="py-3.5 px-4 text-right">
        <div className="relative inline-flex items-center" ref={menuRef}>
          <div className="inline-flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xs overflow-hidden">
            <button
              type="button"
              onClick={() => onManage(user, 'profile')}
              className="px-3 py-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/50 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <FontAwesomeIcon icon={faUserGear} className="text-[11px] text-indigo-500" />
              <span>Quản lý</span>
            </button>
            <span className="w-px h-4 bg-slate-200 dark:bg-slate-700" />
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label={`Thao tác khác cho ${user.name}`}
              aria-expanded={menuOpen}
              className="px-2.5 py-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <FontAwesomeIcon icon={faEllipsisVertical} className="text-[11px]" />
            </button>
          </div>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full mt-1.5 w-48 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-700 shadow-xl py-1.5 z-50 text-left animate-in fade-in zoom-in-95 duration-150"
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => { setMenuOpen(false); onManage(user, 'profile'); }}
                className="w-full px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 cursor-pointer"
              >
                <FontAwesomeIcon icon={faPenToSquare} className="text-[11px] text-slate-400 w-3.5" />
                <span>Sửa hồ sơ &amp; vai trò</span>
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => { setMenuOpen(false); onManage(user, 'security'); }}
                className="w-full px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 cursor-pointer"
              >
                <FontAwesomeIcon icon={faKey} className="text-[11px] text-purple-500 w-3.5" />
                <span>Đổi mật khẩu</span>
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => { setMenuOpen(false); onToggleStatus(user.id); }}
                className="w-full px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 cursor-pointer"
              >
                <FontAwesomeIcon
                  icon={user.status === 'ACTIVE' ? faLock : faCircleCheck}
                  className={`text-[11px] w-3.5 ${user.status === 'ACTIVE' ? 'text-amber-500' : 'text-emerald-500'}`}
                />
                <span>{user.status === 'ACTIVE' ? 'Tạm khóa tài khoản' : 'Kích hoạt tài khoản'}</span>
              </button>
              <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
              <button
                type="button"
                role="menuitem"
                onClick={() => { setMenuOpen(false); onDelete(user); }}
                className="w-full px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2.5 cursor-pointer"
              >
                <FontAwesomeIcon icon={faTrashCan} className="text-[11px] w-3.5" />
                <span>Xóa vĩnh viễn</span>
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};

export default RbacUserRow;

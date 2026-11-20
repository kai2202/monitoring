/**
 * Frontend/src/features/settings/components/UserRbacManagerCard.tsx
 *
 * Quản Trị Người Dùng & Phân Quyền (RBAC):
 * - Header gồm tiêu đề & nút Tạo tài khoản mới.
 * - Hàng KPI Overview tương tác được (click để lọc nhanh theo Vai trò / Trạng thái).
 * - Bộ lọc đa tầng: Vai trò + Trạng thái + Tìm kiếm tức thì.
 * - Bảng thành viên 4 cột gọn gàng với cụm Split Action hợp nhất (RbacUserRow).
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC, FontAwesome duy nhất).
 */

import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import {
  FontAwesomeIcon,
  faUserShield,
  faUserPlus,
  faMagnifyingGlass,
  faUser,
  faCircleCheck,
  faXmark,
} from '@/shared/icons';
import { settingsService } from '@/services';
import { ManagedUser } from '@/types/settings';
import { RbacUserRow } from './RbacUserRow';
import {
  UserManageModal,
  UserManageTab,
  UserCreateModal,
  UserDeleteModal,
} from './modals';

export type { ManagedUser };

export interface UserRbacManagerCardProps {
  initialUsers?: ManagedUser[];
}

export const UserRbacManagerCard: React.FC<UserRbacManagerCardProps> = ({ initialUsers }) => {
  const [users, setUsers] = useState<ManagedUser[]>(initialUsers || []);
  const [isLoading, setIsLoading] = useState<boolean>(!initialUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'FIELD_TECH'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  const [manageTarget, setManageTarget] = useState<{ user: ManagedUser; tab: UserManageTab } | null>(null);
  const [deleteTargetUser, setDeleteTargetUser] = useState<ManagedUser | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (initialUsers) {
      setUsers(initialUsers);
      setIsLoading(false);
      return;
    }
    let isMounted = true;
    settingsService.getUsers().then((res) => {
      if (isMounted) {
        setUsers(res);
        setIsLoading(false);
      }
    }).catch(() => {
      if (isMounted) setIsLoading(false);
    });
    return () => { isMounted = false; };
  }, [initialUsers]);

  const kpis = useMemo(() => {
    const total = users.length;
    const admins = users.filter((u) => u.role === 'ADMIN').length;
    const techs = users.filter((u) => u.role === 'FIELD_TECH').length;
    const active = users.filter((u) => u.status === 'ACTIVE').length;
    return { total, admins, techs, active };
  }, [users]);

  const filteredUsers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return users.filter((u) => {
      const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
      const matchStatus = statusFilter === 'ALL' || u.status === statusFilter;
      return matchSearch && matchRole && matchStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  const hasActiveFilter = roleFilter !== 'ALL' || statusFilter !== 'ALL' || searchQuery.trim() !== '';

  const handleCreateUser = (newUser: ManagedUser) => {
    setUsers((prev) => [newUser, ...prev]);
    toast.success(`Đã tạo thành công tài khoản cho ${newUser.name} (${newUser.email})`);
  };

  const handleUserUpdated = (updated: ManagedUser, message: string) => {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    toast.success(message);
  };

  const handleToggleStatus = async (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;
    const newStatus = target.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const updated = await settingsService.updateUser(userId, { status: newStatus });
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
      toast.info(newStatus === 'ACTIVE' ? `Đã kích hoạt lại tài khoản ${updated.name}` : `Đã tạm khóa tài khoản ${updated.name}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Không thể thay đổi trạng thái tài khoản');
    }
  };

  const handleDeleteSuccess = (deletedId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== deletedId));
    toast.success('Đã xóa vĩnh viễn tài khoản khỏi hệ thống');
  };

  const resetFilters = () => {
    setRoleFilter('ALL');
    setStatusFilter('ALL');
    setSearchQuery('');
  };

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-5">
      {/* 1. Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-sm">
            <FontAwesomeIcon icon={faUserShield} className="text-base" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">Quản Trị Người Dùng &amp; Phân Quyền (RBAC)</h2>
            <p className="text-[11.5px] text-slate-500 dark:text-slate-400 mt-0.5">Quản trị danh sách tài khoản 3 vai trò và trạng thái truy cập hệ thống</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-600/20 flex items-center gap-2 transition-colors cursor-pointer"
        >
          <FontAwesomeIcon icon={faUserPlus} className="text-xs" />
          <span>Tạo tài khoản</span>
        </button>
      </div>

      {/* 2. Interactive KPI Bento Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { key: 'ALL', label: 'Tổng User', value: kpis.total, sub: null, active: roleFilter === 'ALL' && statusFilter === 'ALL', onClick: resetFilters, icon: <FontAwesomeIcon icon={faUser} />, badgeClass: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200' },
          { key: 'ADMIN', label: 'Quản trị viên', value: kpis.admins, sub: null, active: roleFilter === 'ADMIN', onClick: () => setRoleFilter(roleFilter === 'ADMIN' ? 'ALL' : 'ADMIN'), icon: 'AD', badgeClass: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400' },
          { key: 'FIELD_TECH', label: 'Kỹ thuật viên', value: kpis.techs, sub: null, active: roleFilter === 'FIELD_TECH', onClick: () => setRoleFilter(roleFilter === 'FIELD_TECH' ? 'ALL' : 'FIELD_TECH'), icon: 'KT', badgeClass: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400' },
          { key: 'ACTIVE', label: 'Đang hoạt động', value: kpis.active, sub: `/ ${kpis.total}`, active: statusFilter === 'ACTIVE', onClick: () => setStatusFilter(statusFilter === 'ACTIVE' ? 'ALL' : 'ACTIVE'), icon: <FontAwesomeIcon icon={faCircleCheck} />, badgeClass: 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400' },
        ].map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={item.onClick}
            className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
              item.active
                ? 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-300 dark:border-indigo-700 ring-1 ring-indigo-300/60'
                : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/70 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${item.badgeClass}`}>
              {item.icon}
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">{item.label}</div>
              <div className="text-base font-black text-slate-900 dark:text-slate-100 leading-tight">
                {item.value} {item.sub && <span className="text-[11px] font-medium text-slate-400">{item.sub}</span>}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* 3. Toolbar: Role Filter + Status Filter + Search */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 overflow-x-auto max-w-full">
          {(['ALL', 'ADMIN', 'FIELD_TECH'] as const).map((r) => {
            const label = r === 'ALL' ? 'Tất cả' : r === 'ADMIN' ? 'Quản trị viên' : 'Kỹ thuật viên';
            const count = r === 'ALL' ? users.length : users.filter((u) => u.role === r).length;
            const isSelected = roleFilter === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  isSelected ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                <span>{label}</span>
                <span className={`text-[10px] px-1.5 rounded-full font-bold ${
                  isSelected ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400' : 'bg-slate-200/60 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            aria-label="Lọc theo trạng thái tài khoản"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE')}
            className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="INACTIVE">Tạm khóa</option>
          </select>

          <div className="relative w-60">
            <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
            <input
              type="text"
              placeholder="Tìm theo tên, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none focus:border-indigo-500"
            />
          </div>

          {hasActiveFilter && (
            <button
              type="button"
              onClick={resetFilters}
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 cursor-pointer"
            >
              <FontAwesomeIcon icon={faXmark} className="text-[11px]" />
              <span>Xóa lọc</span>
            </button>
          )}
        </div>
      </div>

      {/* 4. User Table */}
      <div className="overflow-x-auto lg:overflow-visible rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-[10.5px] uppercase tracking-wider">
              <th className="py-3 px-4">Thành Viên (User)</th>
              <th className="py-3 px-4">Vai Trò (Role)</th>
              <th className="py-3 px-4">Trạng Thái</th>
              <th className="py-3 px-4 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-400 text-xs">
                  Đang tải danh sách tài khoản...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-400 text-xs">
                  Không tìm thấy tài khoản nào khớp với bộ lọc hiện tại.
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => (
                <RbacUserRow
                  key={u.id}
                  user={u}
                  onManage={(targetUser, tab) => setManageTarget({ user: targetUser, tab })}
                  onToggleStatus={handleToggleStatus}
                  onDelete={setDeleteTargetUser}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <UserManageModal
        user={manageTarget?.user ?? null}
        initialTab={manageTarget?.tab ?? 'profile'}
        onClose={() => setManageTarget(null)}
        onUpdated={handleUserUpdated}
        onPasswordChanged={(target) => toast.success(`Đã đổi mật khẩu cho ${target.email}`)}
      />
      <UserCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateUser={handleCreateUser}
      />
      <UserDeleteModal
        user={deleteTargetUser}
        onClose={() => setDeleteTargetUser(null)}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
};

export default UserRbacManagerCard;

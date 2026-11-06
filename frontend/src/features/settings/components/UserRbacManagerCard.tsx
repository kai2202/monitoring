/**
 * Frontend/src/features/settings/components/UserRbacManagerCard.tsx
 *
 * Quản Trị Người Dùng & Phân Quyền (RBAC):
 * - Áp dụng thiết kế danh sách quyền truy cập thành viên từ Image 2.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import {
  FontAwesomeIcon,
  faUserShield,
  faKey,
  faBuilding,
  faUserPlus,
  faMagnifyingGlass,
  faLock,
  faCircleCheck,
} from '@/shared/icons';
import { settingsService } from '@/services';
import { ManagedUser } from '@/types/settings';
import { UserPasswordChangeModal, UserScopeAssignModal, UserCreateModal } from './modals';

export type { ManagedUser };

export interface UserRbacManagerCardProps {
  initialUsers?: ManagedUser[];
}

export const UserRbacManagerCard: React.FC<UserRbacManagerCardProps> = ({ initialUsers }) => {
  const [users, setUsers] = useState<ManagedUser[]>(initialUsers || []);
  const [isLoading, setIsLoading] = useState<boolean>(!initialUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'FIELD_TECH' | 'ASSET_HR'>('ALL');
  const [pwdTargetUser, setPwdTargetUser] = useState<ManagedUser | null>(null);
  const [scopeTargetUser, setScopeTargetUser] = useState<ManagedUser | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (initialUsers) {
      setUsers(initialUsers);
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

  const filteredUsers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return users.filter((u) => {
      const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [users, searchQuery, roleFilter]);

  const handlePasswordSuccess = (target: ManagedUser) => {
    toast.success(`Đã đổi mật khẩu thành công cho tài khoản ${target.email}`);
  };

  const handleCreateUser = (newUser: ManagedUser) => {
    setUsers((prev) => [newUser, ...prev]);
    toast.success(`Đã tạo thành công tài khoản cho ${newUser.name} (${newUser.email})`);
  };

  const handleSaveScope = async (userId: string, branches: string[], floors: string[]) => {
    try {
      const updated = await settingsService.updateUser(userId, { branchScope: branches, floorsScope: floors });
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
      toast.success(`Đã cập nhật phạm vi giám sát cho ${updated.name}`);
    } catch (err: any) {
      toast.error(err?.message || 'Không thể lưu phạm vi giám sát của tài khoản');
    }
  };

  const handleToggleStatus = async (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;
    const newStatus = target.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const updated = await settingsService.updateUser(userId, { status: newStatus });
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
      toast.info(newStatus === 'ACTIVE' ? `Đã kích hoạt lại tài khoản ${updated.name}` : `Đã tạm khóa tài khoản ${updated.name}`);
    } catch (err: any) {
      toast.error(err?.message || 'Không thể thay đổi trạng thái tài khoản');
    }
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ').filter(Boolean);
    if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-sm">
            <FontAwesomeIcon icon={faUserShield} className="text-base" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">Quản Trị Người Dùng &amp; Phân Quyền (RBAC)</h2>
            <p className="text-[11.5px] text-slate-500 dark:text-slate-400 mt-0.5">Quản lý tài khoản 3 vai trò và phân bổ phạm vi Chi nhánh / Tầng (HQ 7 Tầng &amp; Vệ tinh)</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-colors"
        >
          <FontAwesomeIcon icon={faUserPlus} className="text-xs" />
          <span>+ Tạo tài khoản mới</span>
        </button>
      </div>

      {/* Toolbar: Role Pill Filter & Search (Image 2 style) */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
          {(['ALL', 'ADMIN', 'FIELD_TECH', 'ASSET_HR'] as const).map((r) => {
            const label = r === 'ALL' ? 'Tất cả' : r === 'ADMIN' ? 'Quản trị viên' : r === 'FIELD_TECH' ? 'Kỹ thuật viên' : 'Chuyên viên HR';
            const count = r === 'ALL' ? users.length : users.filter((u) => u.role === r).length;
            const isSelected = roleFilter === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isSelected ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-slate-800'
                }`}
              >
                <span>{label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isSelected ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400' : 'bg-slate-200/60 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative w-64">
          <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
          <input
            type="text"
            placeholder="Tìm theo tên, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* User Table (Image 2 Member List Cards) */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-[10.5px] uppercase tracking-wider">
              <th className="py-3 px-4">Thành Viên (User)</th>
              <th className="py-3 px-4">Vai Trò (Role)</th>
              <th className="py-3 px-4">Phạm Vi Chi Nhánh &amp; Tầng</th>
              <th className="py-3 px-4">Trạng Thái</th>
              <th className="py-3 px-4 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                  Không tìm thấy tài khoản nào khớp với bộ lọc hiện tại.
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => {
                const roleBadgeClass =
                  u.role === 'ADMIN'
                    ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200/60'
                    : u.role === 'FIELD_TECH'
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-200/60'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200/60';
                return (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-[11px] flex items-center justify-center border border-slate-200/80 dark:border-slate-700">
                          {getInitials(u.name)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800 dark:text-slate-100">{u.name}</div>
                          <div className="text-[11px] text-slate-600 dark:text-slate-300 font-mono">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border ${roleBadgeClass}`}>
                        {u.roleNameVi}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[11.5px] text-slate-700 dark:text-slate-200 font-medium">
                          🏢 {u.branchScope.join(', ')}
                        </span>
                        <span className="text-[10.5px] text-slate-600 dark:text-slate-300">
                          📍 {u.floorsScope.join(', ')}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold ${
                        u.status === 'ACTIVE' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${u.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {u.status === 'ACTIVE' ? 'Đang hoạt động' : 'Tạm khóa'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => setPwdTargetUser(u)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-[11px] transition-colors flex items-center gap-1"
                        >
                          <FontAwesomeIcon icon={faKey} className="text-[10px] text-purple-500" />
                          <span>Đổi MK</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setScopeTargetUser(u)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 font-semibold text-[11px] transition-colors flex items-center gap-1"
                        >
                          <FontAwesomeIcon icon={faBuilding} className="text-[10px]" />
                          <span>Gán nhánh</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(u.id)}
                          className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-colors flex items-center gap-1 ${
                            u.status === 'ACTIVE' ? 'bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 text-rose-600' : 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600'
                          }`}
                        >
                          <FontAwesomeIcon icon={u.status === 'ACTIVE' ? faLock : faCircleCheck} className="text-[10px]" />
                          <span>{u.status === 'ACTIVE' ? 'Khóa' : 'Mở'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <UserPasswordChangeModal user={pwdTargetUser} onClose={() => setPwdTargetUser(null)} onSuccess={handlePasswordSuccess} />
      <UserScopeAssignModal user={scopeTargetUser} onClose={() => setScopeTargetUser(null)} onSave={handleSaveScope} />
      <UserCreateModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onCreateUser={handleCreateUser} />
    </div>
  );
};

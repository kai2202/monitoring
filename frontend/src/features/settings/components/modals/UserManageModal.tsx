/**
 * Frontend/src/features/settings/components/modals/UserManageModal.tsx
 *
 * Modal Quản Lý Tài Khoản Hợp Nhất (2 Tabs):
 * - Tab 1: Hồ sơ & Vai trò (Sửa tên, đổi Role, bật/tắt trạng thái).
 * - Tab 2: Đổi mật khẩu (Đặt lại mật khẩu mới).
 */

import React, { useState, useEffect } from 'react';
import { ModalPortal } from '@/shared/modals';
import {
  FontAwesomeIcon,
  faXmark,
  faUserGear,
  faUser,
  faKey,
  faLock,
  faEye,
  faEyeSlash,
  faCheck,
  faShieldHalved,
  faTriangleExclamation,
  faCircleCheck,
} from '@/shared/icons';
import { settingsService } from '@/services';
import { ManagedUser } from '@/types/settings';
import { RBAC_ROLES, RbacRoleCode, getUserInitials } from '../../utils/rbacRoleConfig';

export type UserManageTab = 'profile' | 'security';

export interface UserManageModalProps {
  user: ManagedUser | null;
  initialTab?: UserManageTab;
  onClose: () => void;
  onUpdated: (updated: ManagedUser, message: string) => void;
  onPasswordChanged: (user: ManagedUser) => void;
}

export const UserManageModal: React.FC<UserManageModalProps> = ({
  user,
  initialTab = 'profile',
  onClose,
  onUpdated,
  onPasswordChanged,
}) => {
  const [activeTab, setActiveTab] = useState<UserManageTab>(initialTab);
  const [name, setName] = useState('');
  const [role, setRole] = useState<RbacRoleCode>('FIELD_TECH');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setActiveTab(initialTab);
      setName(user.name);
      setRole(user.role);
      setStatus(user.status);
      setNewPassword('');
      setConfirmPassword('');
      setShowPassword(false);
      setErrorMsg(null);
    }
  }, [user, initialTab]);

  if (!user) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg('Vui lòng nhập họ và tên nhân sự.');
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await settingsService.updateUser(user.id, {
        name: name.trim(),
        role,
        status,
      });
      onUpdated(updated, `Đã cập nhật hồ sơ & vai trò cho ${updated.name}`);
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Không thể lưu thay đổi. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('Mật khẩu mới phải có tối thiểu 6 ký tự.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không khớp.');
      return;
    }

    setIsSubmitting(true);
    try {
      await settingsService.changeUserPassword(user.id, newPassword);
      onPasswordChanged(user);
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Không thể đổi mật khẩu. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleMeta = RBAC_ROLES.find((r) => r.code === user.role) || RBAC_ROLES[1];

  return (
    <ModalPortal>
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[1100] p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 w-full max-w-lg max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Header + User Summary */}
        <div className="p-5 pb-4 border-b border-slate-100 dark:border-slate-800 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold text-sm flex items-center justify-center border border-indigo-200/60 dark:border-indigo-800/60 shrink-0">
                {getUserInitials(user.name)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{user.name}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${roleMeta.badgeClass}`}>
                    {roleMeta.shortLabel}
                  </span>
                </div>
                <p className="text-[11.5px] text-slate-500 dark:text-slate-400 font-mono truncate mt-0.5">{user.email}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng"
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            >
              <FontAwesomeIcon icon={faXmark} className="text-xs" />
            </button>
          </div>

          {/* 2-Tab Switcher */}
          <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
            {[
              { id: 'profile' as const, label: 'Hồ sơ & Vai trò', icon: faUserGear },
              { id: 'security' as const, label: 'Đổi mật khẩu', icon: faKey },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => { setActiveTab(tab.id); setErrorMsg(null); }}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <FontAwesomeIcon icon={tab.icon} className="text-[11px]" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <form
          onSubmit={activeTab === 'security' ? handleSavePassword : handleSaveProfile}
          className="flex flex-col flex-1 min-h-0"
        >
          <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-4">
            {activeTab === 'profile' ? (
              <>
                <div className="rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/70 px-3.5 py-2.5 focus-within:border-indigo-500 flex items-center justify-between">
                  <div className="flex-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                      Họ và tên nhân sự *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-transparent text-xs font-semibold text-slate-900 dark:text-slate-100 outline-none mt-0.5"
                    />
                  </div>
                  <FontAwesomeIcon icon={faUser} className="text-slate-400 text-xs ml-2" />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faShieldHalved} className="text-indigo-500 text-[10px]" />
                    Vai trò tác nghiệp (RBAC)
                  </label>
                  <div className="flex flex-col gap-2">
                    {RBAC_ROLES.map((r) => {
                      const selected = role === r.code;
                      return (
                        <button
                          key={r.code}
                          type="button"
                          onClick={() => setRole(r.code)}
                          className={`text-left px-3.5 py-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            selected
                              ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 dark:border-indigo-500 ring-1 ring-indigo-500/25'
                              : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold text-slate-800 dark:text-slate-100">{r.titleVi}</div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{r.description}</div>
                          </div>
                          <span
                            className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                              selected
                                ? 'bg-indigo-600 border-indigo-600 text-white'
                                : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900'
                            }`}
                          >
                            {selected && <FontAwesomeIcon icon={faCheck} className="text-[10px] leading-none" />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60">
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-100">Trạng thái tài khoản</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">Cho phép hoặc tạm ngưng quyền đăng nhập hệ thống</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStatus(status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      status === 'ACTIVE'
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                        : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                    }`}
                  >
                    <FontAwesomeIcon icon={status === 'ACTIVE' ? faCircleCheck : faLock} className="text-[11px]" />
                    <span>{status === 'ACTIVE' ? 'Đang hoạt động' : 'Đang tạm khóa'}</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/70 px-3.5 py-2.5 focus-within:border-purple-500 flex items-center justify-between">
                  <div className="flex-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                      Mật khẩu mới (Tối thiểu 6 ký tự) *
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-transparent text-xs text-slate-900 dark:text-slate-100 outline-none mt-0.5 font-mono"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                  >
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="text-xs" />
                  </button>
                </div>

                <div className="rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/70 px-3.5 py-2.5 focus-within:border-purple-500">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                    Xác nhận mật khẩu mới *
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-transparent text-xs text-slate-900 dark:text-slate-100 outline-none mt-0.5 font-mono"
                  />
                </div>
              </>
            )}

            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/70 dark:border-rose-900/50 text-[11.5px] text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-2">
                <FontAwesomeIcon icon={faTriangleExclamation} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/60 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Đóng
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-5 py-2 rounded-xl text-white text-xs font-bold shadow-sm flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-60 ${
                activeTab === 'security' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              <FontAwesomeIcon icon={faCheck} className="text-xs" />
              <span>
                {isSubmitting
                  ? 'Đang lưu...'
                  : activeTab === 'security'
                  ? 'Cập nhật mật khẩu'
                  : 'Lưu thay đổi'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
    </ModalPortal>
  );
};

export default UserManageModal;

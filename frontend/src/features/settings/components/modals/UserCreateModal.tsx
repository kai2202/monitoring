/**
 * Frontend/src/features/settings/components/modals/UserCreateModal.tsx
 *
 * Modal Tạo Tài Khoản Người Dùng Mới (Admin Only):
 * - Gồm Thông tin cơ bản (Họ tên, Email, Mật khẩu khởi tạo) + 3 Role Cards.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC, FontAwesome duy nhất).
 */

import React, { useState } from 'react';
import { ModalPortal } from '@/shared/modals';
import {
  FontAwesomeIcon,
  faUserPlus,
  faXmark,
  faCheck,
  faUser,
  faEye,
  faEyeSlash,
  faEnvelope,
  faShieldHalved,
  faTriangleExclamation,
} from '@/shared/icons';
import { settingsService } from '@/services';
import { ManagedUser } from '@/types/settings';
import { RBAC_ROLES, RbacRoleCode } from '../../utils/rbacRoleConfig';

export interface UserCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateUser: (user: ManagedUser) => void;
}

export const UserCreateModal: React.FC<UserCreateModalProps> = ({
  isOpen,
  onClose,
  onCreateUser,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<RbacRoleCode>('FIELD_TECH');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Vui lòng nhập họ và tên nhân sự.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('Mật khẩu khởi tạo phải có tối thiểu 6 ký tự.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const createdUser = await settingsService.createUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
      });
      onCreateUser(createdUser);
      setName('');
      setEmail('');
      setPassword('');
      setRole('FIELD_TECH');
      onClose();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Không thể tạo tài khoản người dùng. Vui lòng kiểm tra lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalPortal>
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[1100] p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 w-full max-w-lg max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-sm">
              <FontAwesomeIcon icon={faUserPlus} className="text-base" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Tạo Tài Khoản Người Dùng Mới
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Cấp quyền truy cập hệ thống FleetMonitor cho nhân sự
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <FontAwesomeIcon icon={faXmark} className="text-xs" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/70 px-3.5 py-2 focus-within:border-indigo-500 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="VD: Trần Quốc Tuấn"
                    className="w-full bg-transparent text-xs text-slate-900 dark:text-slate-100 outline-none mt-0.5 placeholder:text-slate-400"
                  />
                </div>
                <FontAwesomeIcon icon={faUser} className="text-slate-400 text-xs ml-2" />
              </div>

              <div className="rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/70 px-3.5 py-2 focus-within:border-indigo-500 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                    Email đăng nhập *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tuan.tran@fleetmonitor.vn"
                    className="w-full bg-transparent text-xs text-slate-900 dark:text-slate-100 outline-none mt-0.5 placeholder:text-slate-400 font-mono"
                  />
                </div>
                <FontAwesomeIcon icon={faEnvelope} className="text-slate-400 text-xs ml-2" />
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/70 px-3.5 py-2 focus-within:border-indigo-500 flex items-center justify-between">
              <div className="flex-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Mật khẩu khởi tạo (Tối thiểu 6 ký tự) *
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent text-xs text-slate-900 dark:text-slate-100 outline-none mt-0.5 placeholder:text-slate-400 font-mono"
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

            {/* Role Cards */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <FontAwesomeIcon icon={faShieldHalved} className="text-indigo-500 text-[10px]" />
                Vai trò tác nghiệp *
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
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">{r.description}</p>
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

            {errorMessage && (
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/70 dark:border-rose-900/50 text-[11.5px] text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-2">
                <FontAwesomeIcon icon={faTriangleExclamation} className="shrink-0" />
                <span>{errorMessage}</span>
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
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-xs font-bold shadow-sm flex items-center gap-2 transition-colors cursor-pointer"
            >
              <FontAwesomeIcon icon={faCheck} className="text-xs" />
              <span>{isSubmitting ? 'Đang tạo tài khoản...' : 'Xác nhận tạo tài khoản'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
    </ModalPortal>
  );
};

export default UserCreateModal;

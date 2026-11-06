/**
 * Frontend/src/features/settings/components/modals/UserCreateModal.tsx
 *
 * Modal Tạo Tài Khoản Người Dùng Mới (Admin Only):
 * - Áp dụng thiết kế thẻ Access Member (Image 2) và Nested Floating Labels (Image 4).
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React, { useState } from 'react';
import { FontAwesomeIcon, faUserPlus, faXmark, faCheck, faUser, faLock, faEye, faEnvelope, faShieldHalved } from '@/shared/icons';
import { settingsService } from '@/services';
import { ManagedUser } from '../UserRbacManagerCard';

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
  const [role, setRole] = useState<'ADMIN' | 'FIELD_TECH' | 'ASSET_HR'>('FIELD_TECH');
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
        branchScope: role === 'ADMIN' ? ['Trụ sở chính (HQ)', 'Chi nhánh Miền Nam'] : ['Trụ sở chính (HQ)'],
        floorsScope: ['Tất cả 7 tầng'],
      });
      onCreateUser(createdUser);
      setName('');
      setEmail('');
      setPassword('');
      setRole('FIELD_TECH');
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Không thể tạo tài khoản người dùng. Vui lòng kiểm tra lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[1100] p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 w-full max-w-md p-6 shadow-2xl flex flex-col gap-4">
        
        {/* Header - Image 2 Access Modal Style */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-sm">
              <FontAwesomeIcon icon={faUserPlus} className="text-base" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Tạo Tài Khoản Người Dùng Mới
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Cấp quyền truy cập FleetMonitor cho nhân sự vận hành
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-700 dark:text-slate-400 flex items-center justify-center transition-colors"
          >
            <FontAwesomeIcon icon={faXmark} className="text-xs" />
          </button>
        </div>

        {/* Form Controls - Image 4 Nested Label Containers */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Full Name */}
          <div className="rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/70 px-3.5 py-2 transition-all focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10 flex items-center justify-between">
            <div className="flex-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block">
                Họ Và Tên Nhân Sự *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Trần Quốc Tuấn"
                className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-100 outline-none mt-0.5 placeholder:text-slate-400"
              />
            </div>
            <FontAwesomeIcon icon={faUser} className="text-slate-400 text-xs ml-2" />
          </div>

          {/* Email */}
          <div className="rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/70 px-3.5 py-2 transition-all focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10 flex items-center justify-between">
            <div className="flex-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block">
                Email Đăng Nhập Hệ Thống *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tuan.tran@fleetmonitor.vn"
                className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-100 outline-none mt-0.5 placeholder:text-slate-400 font-mono"
              />
            </div>
            <FontAwesomeIcon icon={faEnvelope} className="text-slate-400 text-xs ml-2" />
          </div>

          {/* Initial Password with Toggle (Image 4) */}
          <div className="rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/70 px-3.5 py-2 transition-all focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10 flex items-center justify-between">
            <div className="flex-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block">
                Mật Khẩu Khởi Tạo (Tối Thiểu 6 Ký Tự) *
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-100 outline-none mt-0.5 placeholder:text-slate-400 font-mono"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 transition-colors"
            >
              <FontAwesomeIcon icon={showPassword ? faEye : faLock} className="text-xs" />
            </button>
          </div>

          {/* Role Selector */}
          <div className="rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/70 px-3.5 py-2 transition-all focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block flex items-center gap-1.5">
              <FontAwesomeIcon icon={faShieldHalved} className="text-indigo-600 dark:text-indigo-400 text-[10px]" />
              Vai Trò Tác Nghiệp (Role) *
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none mt-0.5 cursor-pointer"
            >
              <option value="FIELD_TECH" className="bg-white dark:bg-slate-900">Kỹ thuật viên NOC &amp; Hiện trường (FIELD_TECH)</option>
              <option value="ASSET_HR" className="bg-white dark:bg-slate-900">Chuyên viên Tài sản &amp; Kế toán HR (ASSET_HR)</option>
              <option value="ADMIN" className="bg-white dark:bg-slate-900">Quản trị viên Hệ thống IT &amp; NOC (ADMIN)</option>
            </select>
          </div>

          {errorMessage && (
            <div className="text-[11.5px] text-rose-500 font-semibold px-1">
              ⚠️ {errorMessage}
            </div>
          )}

          {/* Footer - Image 1 Action Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-colors"
            >
              <FontAwesomeIcon icon={faCheck} className="text-xs" />
              <span>{isSubmitting ? 'Đang tạo tài khoản...' : 'Xác nhận tạo tài khoản'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default UserCreateModal;

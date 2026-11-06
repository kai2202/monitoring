/**
 * Frontend/src/features/settings/components/modals/UserPasswordChangeModal.tsx
 *
 * Modal Đổi Mật Khẩu Người Dùng (Admin Only):
 * - Áp dụng thiết kế thẻ bảo mật (Image 2) và Nested Floating Labels (Image 4).
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React, { useState } from 'react';
import { FontAwesomeIcon, faXmark, faKey, faLock, faEye, faCheck } from '@/shared/icons';
import { settingsService } from '@/services';
import { ManagedUser } from '../UserRbacManagerCard';

export interface UserPasswordChangeModalProps {
  user: ManagedUser | null;
  onClose: () => void;
  onSuccess: (user: ManagedUser) => void;
}

export const UserPasswordChangeModal: React.FC<UserPasswordChangeModalProps> = ({
  user,
  onClose,
  onSuccess,
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pwdMessage, setPwdMessage] = useState<string | null>(null);

  if (!user) return null;

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setPwdMessage('Mật khẩu mới phải có tối thiểu 6 ký tự.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdMessage('Mật khẩu xác nhận không khớp.');
      return;
    }
    setPwdMessage(null);
    setIsSubmitting(true);
    try {
      await settingsService.changeUserPassword(user.id, newPassword);
      setNewPassword('');
      setConfirmPassword('');
      onSuccess(user);
      onClose();
    } catch (err: any) {
      setPwdMessage(err?.message || 'Không thể cập nhật mật khẩu. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[1100] p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 w-full max-w-sm p-6 shadow-2xl flex flex-col gap-4">
        
        {/* Header - Image 2 Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-sm">
              <FontAwesomeIcon icon={faKey} className="text-sm" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Đổi Mật Khẩu
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-[200px]">
                Tài khoản: <strong className="text-slate-700 dark:text-slate-200">{user.name}</strong>
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

        {/* Form Controls - Image 4 Nested Labels */}
        <form onSubmit={handleSavePassword} className="flex flex-col gap-3">
          <div className="rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/70 px-3.5 py-2 transition-all focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/10 flex items-center justify-between">
            <div className="flex-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block">
                Mật Khẩu Mới (Tối Thiểu 6 Ký Tự)
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-100 outline-none mt-0.5 placeholder:text-slate-400 font-mono"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
            >
              <FontAwesomeIcon icon={showPassword ? faEye : faLock} className="text-xs" />
            </button>
          </div>

          <div className="rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/70 px-3.5 py-2 transition-all focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/10">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block">
              Xác Nhận Mật Khẩu Mới
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-100 outline-none mt-0.5 placeholder:text-slate-400 font-mono"
            />
          </div>

          {pwdMessage && (
            <div className="text-[11.5px] text-rose-500 font-semibold px-1">
              ⚠️ {pwdMessage}
            </div>
          )}

          {/* Footer - Image 1 Action Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
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
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white text-xs font-bold shadow-md shadow-purple-600/20 flex items-center gap-1.5 transition-colors"
            >
              <FontAwesomeIcon icon={faCheck} className="text-xs" />
              <span>{isSubmitting ? 'Đang lưu...' : 'Lưu mật khẩu'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default UserPasswordChangeModal;

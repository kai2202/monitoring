/**
 * Frontend/src/features/settings/components/modals/UserDeleteModal.tsx
 *
 * Modal Xác Nhận Xóa Vĩnh Viễn Tài Khoản Người Dùng:
 * - Hiển thị thẻ xem trước tài khoản (Avatar, Tên, Email, Vai trò) + Cảnh báo thu hồi quyền.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC, FontAwesome duy nhất).
 */

import React, { useState } from 'react';
import { ModalPortal } from '@/shared/modals';
import {
  FontAwesomeIcon,
  faXmark,
  faTrashCan,
  faTriangleExclamation,
} from '@/shared/icons';
import { settingsService } from '@/services';
import { ManagedUser } from '@/types/settings';
import { RBAC_ROLES, getUserInitials } from '../../utils/rbacRoleConfig';

export interface UserDeleteModalProps {
  user: ManagedUser | null;
  onClose: () => void;
  onSuccess: (deletedUserId: string) => void;
}

export const UserDeleteModal: React.FC<UserDeleteModalProps> = ({
  user,
  onClose,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!user) return null;

  const roleMeta = RBAC_ROLES.find((r) => r.code === user.role) || RBAC_ROLES[1];

  const handleDelete = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await settingsService.deleteUser(user.id);
      onSuccess(user.id);
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Không thể xóa tài khoản. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalPortal>
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[1100] p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 w-full max-w-md p-6 shadow-2xl flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-sm">
              <FontAwesomeIcon icon={faTrashCan} className="text-sm" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Xóa Vĩnh Viễn Tài Khoản
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Xác nhận thu hồi toàn bộ quyền truy cập hệ thống
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

        {/* User Preview Card */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center border border-slate-200 dark:border-slate-700 shrink-0">
              {getUserInitials(user.name)}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{user.name}</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">{user.email}</div>
            </div>
          </div>
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${roleMeta.badgeClass}`}>
            {roleMeta.shortLabel}
          </span>
        </div>

        {/* Warning Banner */}
        <div className="p-3.5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200/70 dark:border-rose-900/50 flex items-start gap-3">
          <FontAwesomeIcon icon={faTriangleExclamation} className="text-rose-600 dark:text-rose-400 text-sm mt-0.5 shrink-0" />
          <div className="text-xs text-rose-800 dark:text-rose-300 leading-relaxed">
            Hành động này không thể hoàn tác. Nhân sự này sẽ bị đăng xuất ngay lập tức và không thể truy cập vào FleetMonitor. Nếu chỉ muốn ngưng quyền tạm thời, hãy dùng chức năng <strong>Tạm khóa</strong>.
          </div>
        </div>

        {errorMsg && (
          <div className="text-xs font-semibold text-rose-600 dark:text-rose-400 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50">
            {errorMsg}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-all cursor-pointer disabled:opacity-60"
          >
            <FontAwesomeIcon icon={faTrashCan} className="text-xs" />
            <span>{isSubmitting ? 'Đang xóa...' : 'Xác nhận xóa vĩnh viễn'}</span>
          </button>
        </div>
      </div>
    </div>
    </ModalPortal>
  );
};

export default UserDeleteModal;

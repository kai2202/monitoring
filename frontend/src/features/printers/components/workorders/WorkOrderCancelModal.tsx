/**
 * Frontend/src/features/printers/components/workorders/WorkOrderCancelModal.tsx
 *
 * Modal Hủy Lệnh Bảo Trì (Admin Only):
 * - Chuyển lệnh sang trạng thái Cancelled kèm lý do bắt buộc để lưu Audit Trail.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC, FontAwesome chuẩn).
 */

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { RootState } from '../../../../app/store';
import { FontAwesomeIcon, faBan, faXmark } from '../../../../shared/icons';
import { Task } from '../../../../types/task';
import { taskService } from '../../../../services';

export interface WorkOrderCancelModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onCancelSuccess?: (cancelledTask: Task) => void;
}

const QUICK_CANCEL_REASONS = [
  'Thiết bị tự khôi phục',
  'Tạo nhầm lệnh',
  'Trùng lặp với lệnh khác',
];

export const WorkOrderCancelModal: React.FC<WorkOrderCancelModalProps> = ({
  task,
  isOpen,
  onClose,
  onCancelSuccess,
}) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setReason('');
      setErrorMsg('');
    }
  }, [isOpen, task?.id]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen || !task) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setErrorMsg('Vui lòng nhập lý do hủy lệnh bảo trì.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const updated = await taskService.updateTaskStatus(task.id, {
        status: 'Cancelled',
        comment: `[ADMIN HỦY LỆNH]: ${reason.trim()}`,
        author: user?.fullName || 'Quản trị viên',
      });
      toast.success(`Đã hủy lệnh bảo trì ${task.id}`);
      onCancelSuccess?.(updated);
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Không thể hủy lệnh bảo trì.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div
      onClick={() => !isSubmitting && onClose()}
      className="fixed inset-0 z-[99999] bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[460px] rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center shrink-0">
              <FontAwesomeIcon icon={faBan} className="text-sm" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 m-0">Hủy Lệnh Bảo Trì</h2>
                <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                  {task.id}
                </span>
              </div>
              <p className="text-[11.5px] text-slate-500 m-0 mt-0.5">Lệnh sẽ ngừng xử lý và chuyển sang trạng thái Đã hủy</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-7 h-7 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 flex items-center justify-center bg-transparent border-none cursor-pointer"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-5 flex flex-col gap-3.5">
            {errorMsg && (
              <div className="px-3 py-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            <div className="px-3.5 py-2.5 rounded-lg bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/70 border-l-4 border-l-rose-500 flex flex-col gap-1 text-xs">
              <div className="font-semibold text-slate-900 dark:text-slate-100 truncate" title={task.title}>
                {task.title}
              </div>
              <div className="text-slate-500 flex items-center gap-2 flex-wrap">
                <span>Thiết bị: <strong className="text-slate-700 dark:text-slate-300">{task.printerName}</strong></span>
                <span>•</span>
                <span>Mã lỗi: <strong className="font-mono text-slate-700 dark:text-slate-300">{task.errorCode || 'Bảo dưỡng định kỳ'}</strong></span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Lý do hủy lệnh <span className="text-rose-500">*</span>
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {QUICK_CANCEL_REASONS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setReason(item)}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
                      reason === item
                        ? 'bg-rose-50 border-rose-300 text-rose-700'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <textarea
                rows={3}
                placeholder="Nhập lý do hủy lệnh..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 resize-none focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-3 bg-slate-50/80 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer"
            >
              Giữ lại
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white text-xs font-semibold inline-flex items-center gap-1.5 border-none cursor-pointer"
            >
              <FontAwesomeIcon icon={faBan} className="text-[11px]" />
              <span>{isSubmitting ? 'Đang hủy...' : 'Xác nhận hủy'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default WorkOrderCancelModal;

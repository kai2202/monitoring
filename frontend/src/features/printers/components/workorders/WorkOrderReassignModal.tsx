/**
 * Frontend/src/features/printers/components/workorders/WorkOrderReassignModal.tsx
 *
 * Modal Chuyển Giao KTV Phụ Trách Lệnh Bảo Trì (Admin Only):
 * - Chọn kỹ thuật viên mới từ danh sách KTV hiện trường.
 * - Hỗ trợ chọn nhanh lý do hoặc nhập chi tiết để lưu Audit Trail.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC, FontAwesome chuẩn).
 */

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { RootState } from '../../../../app/store';
import { FontAwesomeIcon, faUserGear, faXmark, faCheck } from '../../../../shared/icons';
import { useAvailableTechnicians } from '../../../../shared/hooks/useAvailableTechnicians';
import { Task } from '../../../../types/task';
import { taskService } from '../../../../services';

export interface WorkOrderReassignModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onReassignSuccess?: (updatedTask: Task) => void;
}

const QUICK_REASONS = [
  'Chuyển ca trực',
  'KTV đang xử lý ca khẩn cấp khác',
  'Phân công đúng KTV phụ trách khu vực',
];

export const WorkOrderReassignModal: React.FC<WorkOrderReassignModalProps> = ({
  task,
  isOpen,
  onClose,
  onReassignSuccess,
}) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const {
    technicians,
    assigneeId: selectedTechId,
    assignee: newAssignee,
    setAssignee: setNewAssignee,
    selectTechnicianById,
  } = useAvailableTechnicians({ enabled: isOpen, excludeName: task?.assignee });

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
    if (!newAssignee.trim()) {
      setErrorMsg('Vui lòng chọn hoặc nhập tên kỹ thuật viên phụ trách.');
      return;
    }
    if (!reason.trim()) {
      setErrorMsg('Vui lòng nhập lý do chuyển giao kỹ thuật viên.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const updated = await taskService.reassignTask(task.id, {
        newAssignee: newAssignee.trim(),
        assigneeId: selectedTechId || undefined,
        reason: reason.trim(),
        author: user?.fullName || 'Quản trị viên',
      });
      toast.success(`Đã chuyển giao lệnh ${task.id} cho ${newAssignee.trim()}`);
      onReassignSuccess?.(updated);
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Không thể chuyển giao lệnh bảo trì.');
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
        className="w-full max-w-[480px] rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center shrink-0">
              <FontAwesomeIcon icon={faUserGear} className="text-sm" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 m-0">Chuyển Giao KTV</h2>
                <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                  {task.id}
                </span>
              </div>
              <p className="text-[11.5px] text-slate-500 m-0 mt-0.5">Chọn kỹ thuật viên tiếp nhận lệnh bảo trì</p>
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

            <div className="px-3.5 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex flex-col gap-1 text-xs">
              <div className="font-semibold text-slate-900 dark:text-slate-100 truncate" title={task.title}>
                {task.title}
              </div>
              <div className="text-slate-500 flex items-center gap-2 flex-wrap">
                <span>Thiết bị: <strong className="text-slate-700 dark:text-slate-300">{task.printerName}</strong></span>
                <span>•</span>
                <span>Đang giao: <strong className="text-amber-600">{task.assignee || 'Chưa phân công'}</strong></span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Kỹ thuật viên tiếp nhận <span className="text-rose-500">*</span>
              </label>
              {technicians.length > 0 ? (
                <select
                  value={selectedTechId}
                  onChange={(e) => selectTechnicianById(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  {technicians.map((tech) => (
                    <option key={tech.id} value={tech.id} disabled={tech.name === task.assignee}>
                      {tech.name} ({tech.branchScope.join(', ')}) {tech.name === task.assignee ? '— Hiện tại' : ''}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="Nhập họ tên kỹ thuật viên tiếp nhận..."
                  value={newAssignee}
                  onChange={(e) => setNewAssignee(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                />
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Lý do chuyển giao <span className="text-rose-500">*</span>
                </label>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {QUICK_REASONS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setReason(item)}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
                      reason === item
                        ? 'bg-blue-50 border-blue-300 text-blue-700'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <textarea
                rows={3}
                placeholder="Nhập lý do chuyển giao..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 resize-none focus:outline-none focus:border-blue-500"
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
              Đóng
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-semibold inline-flex items-center gap-1.5 border-none cursor-pointer"
            >
              <FontAwesomeIcon icon={faCheck} className="text-[11px]" />
              <span>{isSubmitting ? 'Đang lưu...' : 'Chuyển giao'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default WorkOrderReassignModal;

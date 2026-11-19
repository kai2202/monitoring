/**
 * Frontend/src/features/analytics/components/sla/MaintenanceTicketModal.tsx
 *
 * Modal Chi Tiết Phiếu Bảo Trì (mở trực tiếp từ Drawer Lịch sử mã lỗi):
 * - Tự động đối soát với taskService.getTasks(); nếu task là bản ghi lịch sử mẫu thì hiển thị đầy đủ từ history item.
 * - Đồng bộ Tailwind + Dark Mode + ModalPortal (z-[1150]) chuẩn hệ thống.
 * - Tuân thủ AGENTS.md Rule 5 & Rule 7.1 (< 300 LOC).
 */

import React, { useEffect, useState } from 'react';
import { ModalPortal } from '@/shared/modals';
import {
  FontAwesomeIcon,
  faXmark,
  faWrench,
  faCircleCheck,
  faClock,
  faPrint,
  faUser,
  faLocationDot,
  faArrowUpRightFromSquare,
} from '@/shared/icons';
import { RecurringErrorItem } from '@/types/api';
import { Task } from '@/types/task';
import { taskService } from '@/services';

export type RecurringErrorHistoryEntry = RecurringErrorItem['history'][number];

export interface MaintenanceTicketTarget {
  taskId: string;
  history: RecurringErrorHistoryEntry;
  errorItem: RecurringErrorItem;
}

export interface MaintenanceTicketModalProps {
  target: MaintenanceTicketTarget | null;
  onClose: () => void;
  onNavigateWorkOrders?: (taskId: string) => void;
}

export const MaintenanceTicketModal: React.FC<MaintenanceTicketModalProps> = ({
  target,
  onClose,
  onNavigateWorkOrders,
}) => {
  const [matchedTask, setMatchedTask] = useState<Task | null>(null);

  useEffect(() => {
    if (!target) {
      setMatchedTask(null);
      return;
    }
    let cancelled = false;
    taskService
      .getTasks()
      .then((list) => {
        if (cancelled) return;
        const found = list.find((t) => t.id === target.taskId) || null;
        setMatchedTask(found);
      })
      .catch(() => {
        if (!cancelled) setMatchedTask(null);
      });
    return () => {
      cancelled = true;
    };
  }, [target]);

  useEffect(() => {
    if (!target) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [target, onClose]);

  if (!target) return null;

  const { taskId, history, errorItem } = target;
  const isCompleted = matchedTask ? matchedTask.status === 'Completed' : Boolean(history.resolvedAt);
  const title = matchedTask?.title || `Xử lý mã lỗi ${errorItem.vendor} ${errorItem.errorCode}`;
  const assignee = matchedTask?.assignee || history.technicianName || 'Chưa phân công';
  const printerName = matchedTask?.printerName || history.printerName;
  const location = matchedTask?.location || history.location || 'Chưa cập nhật';
  const notes = matchedTask?.description || history.actionNotes || errorItem.vietnameseDesc;

  return (
    <ModalPortal>
      <div
        role="dialog"
        aria-modal="true"
        onClick={onClose}
        className="fixed inset-0 z-[1150] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-[520px] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-mono text-[11px] font-bold">
                  {taskId}
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold ${
                    isCompleted
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400'
                      : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400'
                  }`}
                >
                  <FontAwesomeIcon
                    icon={isCompleted ? faCircleCheck : faClock}
                    className="text-[9.5px]"
                  />
                  <span>{isCompleted ? 'Đã hoàn tất' : 'Đang xử lý'}</span>
                </span>
              </div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 mt-1.5 mb-0">
                {title}
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng phiếu bảo trì"
              className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 flex items-center justify-center border-none cursor-pointer transition-colors shrink-0"
            >
              <FontAwesomeIcon icon={faXmark} className="text-xs" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 flex flex-col gap-3.5 text-xs">
            {/* Thông tin thiết bị & nhân sự */}
            <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
              <div className="px-3.5 py-2.5 flex items-center justify-between gap-3">
                <span className="text-slate-500 dark:text-slate-400 inline-flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faPrint} className="text-[11px]" />
                  <span>Thiết bị</span>
                </span>
                <span className="font-bold text-slate-900 dark:text-slate-100 text-right">
                  {printerName}
                  {history.printerIp ? (
                    <span className="font-mono font-normal text-slate-400 ml-1">
                      ({history.printerIp})
                    </span>
                  ) : null}
                </span>
              </div>
              <div className="px-3.5 py-2.5 flex items-center justify-between gap-3">
                <span className="text-slate-500 dark:text-slate-400 inline-flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faLocationDot} className="text-[11px]" />
                  <span>Vị trí</span>
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">
                  {location}
                </span>
              </div>
              <div className="px-3.5 py-2.5 flex items-center justify-between gap-3">
                <span className="text-slate-500 dark:text-slate-400 inline-flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faUser} className="text-[11px]" />
                  <span>Kỹ thuật viên</span>
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">
                  {assignee}
                </span>
              </div>
              <div className="px-3.5 py-2.5 flex items-center justify-between gap-3">
                <span className="text-slate-500 dark:text-slate-400 inline-flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faClock} className="text-[11px]" />
                  <span>Thời gian ghi nhận</span>
                </span>
                <span className="font-mono text-slate-700 dark:text-slate-300 text-right">
                  {new Date(history.detectedAt).toLocaleString('vi-VN')}
                </span>
              </div>
            </div>

            {/* Nội dung xử lý */}
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700 p-3.5">
              <div className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
                <FontAwesomeIcon icon={faWrench} className="text-[10px]" />
                <span>Nội dung kiểm tra &amp; khắc phục</span>
              </div>
              <p className="m-0 text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                {notes}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between gap-2">
            {onNavigateWorkOrders && matchedTask ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateWorkOrders(taskId);
                }}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-[11.5px] font-semibold inline-flex items-center gap-1.5 cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <span>Mở trong Lệnh bảo trì</span>
                <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-[10px]" />
              </button>
            ) : (
              <span className="text-[11px] text-slate-400">
                Mã lỗi: {errorItem.vendor} · {errorItem.errorCode}
              </span>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg border-none bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white text-xs font-bold cursor-pointer transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};

export default MaintenanceTicketModal;

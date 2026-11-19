/**
 * Frontend/src/features/analytics/components/sla/RecurringErrorDetailDrawer.tsx
 *
 * Slide-over Drawer Chi Tiết Lịch Sử Mã Lỗi Phần Cứng (Recurring Error Detail Drawer):
 * - Thiết kế phẳng đồng bộ hệ thống: Header mã lỗi + Strip 3 chỉ số divide-x + Nhật ký xuất hiện.
 * - Lược bỏ card SOP Guidance và nút Tạo Task kiểm tra lỗi theo yêu cầu nghiệp vụ.
 * - Khi bấm "Mở Phiếu Bảo Trì [taskId]" mở MaintenanceTicketModal trực tiếp, không crash.
 * - Tuân thủ AGENTS.md Rule 5, Rule 6 & Rule 7.1 (< 300 LOC, 100% FontAwesome).
 */

import React, { useEffect, useState } from 'react';
import { ModalPortal } from '@/shared/modals';
import {
  FontAwesomeIcon,
  faXmark,
  faPrint,
  faClock,
  faLocationDot,
  faUser,
  faWrench,
  faTriangleExclamation,
  faCircleExclamation,
  faCircleCheck,
  faMicrochip,
  faArrowUpRightFromSquare,
} from '@/shared/icons';
import { RecurringErrorItem } from '@/types/api';
import {
  MaintenanceTicketModal,
  MaintenanceTicketTarget,
} from './MaintenanceTicketModal';

export interface RecurringErrorDetailDrawerProps {
  errorItem: RecurringErrorItem | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenTask?: (taskId: string) => void;
}

export const RecurringErrorDetailDrawer: React.FC<RecurringErrorDetailDrawerProps> = ({
  errorItem,
  isOpen,
  onClose,
  onOpenTask,
}) => {
  const [ticketTarget, setTicketTarget] = useState<MaintenanceTicketTarget | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !ticketTarget) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, ticketTarget, onClose]);

  useEffect(() => {
    if (!isOpen) setTicketTarget(null);
  }, [isOpen]);

  if (!isOpen || !errorItem) return null;

  const isCritical = errorItem.severity === 'critical';
  const historyList = errorItem.history || [];

  return (
    <>
      <ModalPortal>
        <div
          role="dialog"
          aria-modal="true"
          onClick={onClose}
          className="fixed inset-0 z-[1100] bg-slate-900/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[540px] h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Drawer Header */}
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3">
              <div className="flex flex-col gap-1.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[11px] font-extrabold font-mono px-2 py-0.5 rounded-md ${
                      isCritical
                        ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                        : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                    }`}
                  >
                    {errorItem.vendor} · {errorItem.errorCode}
                  </span>
                  <span
                    className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                      isCritical
                        ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                        : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    <FontAwesomeIcon
                      icon={isCritical ? faCircleExclamation : faTriangleExclamation}
                      className="text-[9.5px]"
                    />
                    {isCritical ? 'Nguy cấp' : 'Cảnh báo'}
                  </span>
                  {errorItem.subsystem && (
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 inline-flex items-center gap-1">
                      <FontAwesomeIcon
                        icon={faMicrochip}
                        className="text-blue-600 dark:text-blue-400 text-[10px]"
                      />
                      <span>{errorItem.subsystem}</span>
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-extrabold m-0 text-slate-900 dark:text-slate-100 leading-snug">
                  {errorItem.vietnameseDesc}
                </h3>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Đóng chi tiết mã lỗi"
                className="w-7 h-7 rounded-full border-none bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 cursor-pointer flex items-center justify-center shrink-0 transition-colors"
              >
                <FontAwesomeIcon icon={faXmark} className="text-xs" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 custom-scrollbar">
              {/* Strip 3 chỉ số phẳng divide-x */}
              <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 grid grid-cols-3 divide-x divide-slate-100 dark:divide-slate-800 overflow-hidden shrink-0">
                <div className="px-3.5 py-2.5">
                  <span className="text-[10.5px] font-semibold text-slate-500 dark:text-slate-400 block">
                    Tổng lần lặp
                  </span>
                  <span className="text-base font-black font-mono text-rose-600 dark:text-rose-400">
                    {errorItem.occurrenceCount}
                  </span>
                </div>
                <div className="px-3.5 py-2.5">
                  <span className="text-[10.5px] font-semibold text-slate-500 dark:text-slate-400 block">
                    Máy ảnh hưởng
                  </span>
                  <span className="text-base font-black font-mono text-blue-600 dark:text-blue-400">
                    {errorItem.topAffectedPrinters?.length || 0} máy
                  </span>
                </div>
                <div className="px-3.5 py-2.5">
                  <span className="text-[10.5px] font-semibold text-slate-500 dark:text-slate-400 block">
                    Nhật ký chi tiết
                  </span>
                  <span className="text-base font-black font-mono text-slate-900 dark:text-slate-100">
                    {historyList.length} lần
                  </span>
                </div>
              </div>

              {/* Timeline of Occurrences */}
              <div className="flex flex-col gap-2.5">
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Nhật Ký Lịch Sử Xuất Hiện ({historyList.length})
                </span>

                {historyList.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                    Chưa ghi nhận chi tiết lần xuất hiện nào.
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
                    {historyList.map((h, idx) => (
                      <div key={h.id || idx} className="p-3.5 flex flex-col gap-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center text-xs shrink-0">
                              <FontAwesomeIcon icon={faPrint} />
                            </div>
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                {h.printerName}
                              </span>
                              {h.printerIp && (
                                <span className="text-[10.5px] font-mono text-slate-400 ml-1.5">
                                  ({h.printerIp})
                                </span>
                              )}
                            </div>
                          </div>

                          <span
                            className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 shrink-0 ${
                              h.resolvedAt
                                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400'
                                : 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            <FontAwesomeIcon
                              icon={h.resolvedAt ? faCircleCheck : faClock}
                              className="text-[9px]"
                            />
                            {h.resolvedAt ? 'Đã khắc phục' : 'Đang xử lý'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <FontAwesomeIcon icon={faClock} className="text-[10px]" />
                            <span>{new Date(h.detectedAt).toLocaleString('vi-VN')}</span>
                          </div>
                          {h.location && (
                            <div className="flex items-center gap-1.5 min-w-0">
                              <FontAwesomeIcon
                                icon={faLocationDot}
                                className="text-[10px] shrink-0"
                              />
                              <span className="truncate">{h.location}</span>
                            </div>
                          )}
                          {h.technicianName && (
                            <div className="flex items-center gap-1.5">
                              <FontAwesomeIcon icon={faUser} className="text-[10px]" />
                              <span>
                                KTV:{' '}
                                <strong className="text-slate-700 dark:text-slate-200">
                                  {h.technicianName}
                                </strong>
                              </span>
                            </div>
                          )}
                        </div>

                        {h.actionNotes && (
                          <div className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-[11.5px] text-slate-700 dark:text-slate-300">
                            {h.actionNotes}
                          </div>
                        )}

                        {h.taskId && (
                          <div className="flex justify-end pt-0.5">
                            <button
                              type="button"
                              onClick={() =>
                                setTicketTarget({
                                  taskId: h.taskId!,
                                  history: h,
                                  errorItem,
                                })
                              }
                              className="px-2.5 py-1 rounded-md border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-[11px] font-bold cursor-pointer inline-flex items-center gap-1.5 hover:bg-blue-100/70 transition-colors"
                            >
                              <FontAwesomeIcon icon={faWrench} className="text-[10px]" />
                              <span>Mở Phiếu Bảo Trì [{h.taskId}]</span>
                              <FontAwesomeIcon
                                icon={faArrowUpRightFromSquare}
                                className="text-[9px]"
                              />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Drawer Footer (tinh gọn chỉ còn Đóng) */}
            <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex justify-end">
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

      {/* Modal Phiếu Bảo Trì mở trực tiếp ngay tại chỗ */}
      <MaintenanceTicketModal
        target={ticketTarget}
        onClose={() => setTicketTarget(null)}
        onNavigateWorkOrders={(taskId) => {
          onClose();
          onOpenTask?.(taskId);
        }}
      />
    </>
  );
};

export default RecurringErrorDetailDrawer;

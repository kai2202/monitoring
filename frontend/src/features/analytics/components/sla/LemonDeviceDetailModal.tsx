/**
 * Frontend/src/features/analytics/components/sla/LemonDeviceDetailModal.tsx
 *
 * Modal Chi Tiết Sự Cố & Chi Phí Sửa Chữa Thiết Bị (Lemon Device Detail Modal):
 * - Thiết kế phẳng đồng bộ với bảng SLA & Chi phí: Strip KPI 3 ô chia cột divide-x + bảng thông số gọn.
 * - Hỗ trợ Dark Mode + ModalPortal (z-[1100]).
 * - Tuân thủ AGENTS.md Rule 5 & Rule 7.1 (< 300 LOC).
 */

import React, { useEffect } from 'react';
import { ModalPortal } from '@/shared/modals';
import {
  FontAwesomeIcon,
  faXmark,
  faPrint,
  faFileCircleCheck,
  faTriangleExclamation,
} from '@/shared/icons';
import { LemonPrinterItem } from '@/types/api';

export interface LemonDeviceDetailModalProps {
  printer: LemonPrinterItem | null;
  isOpen: boolean;
  onClose: () => void;
  onRequestReplacement: (printer: LemonPrinterItem) => void;
}

export const LemonDeviceDetailModal: React.FC<LemonDeviceDetailModalProps> = ({
  printer,
  isOpen,
  onClose,
  onRequestReplacement,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen || !printer) return null;

  const avgCostPerIncident =
    printer.incidentCount > 0 ? Math.round(printer.totalRepairCostVnd / printer.incidentCount) : 0;
  const isCandidate = printer.isLemonWarning || printer.incidentCount >= 5;

  return (
    <ModalPortal>
      <div
        role="dialog"
        aria-modal="true"
        onClick={onClose}
        className="fixed inset-0 z-[1100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-[500px] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header gọn chuẩn hệ thống */}
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0 text-xs mt-0.5">
                <FontAwesomeIcon icon={faPrint} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="m-0 text-sm font-extrabold text-slate-900 dark:text-slate-100 truncate">
                    {printer.name}
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                      isCandidate
                        ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'
                        : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400'
                    }`}
                  >
                    {isCandidate && (
                      <FontAwesomeIcon icon={faTriangleExclamation} className="text-[9px]" />
                    )}
                    <span>
                      {printer.connectionStatus} · {printer.health}
                    </span>
                  </span>
                </div>
                <p className="mt-0.5 mb-0 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {printer.mfr} · {printer.model}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng chi tiết thiết bị"
              className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 flex items-center justify-center border-none cursor-pointer transition-colors shrink-0"
            >
              <FontAwesomeIcon icon={faXmark} className="text-xs" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 flex flex-col gap-4">
            {/* Strip KPI phẳng 3 ô divide-x */}
            <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 grid grid-cols-3 divide-x divide-slate-100 dark:divide-slate-800 overflow-hidden">
              <div className="px-3.5 py-3">
                <div className="text-[10.5px] font-semibold text-slate-500 dark:text-slate-400">
                  Tổng sự cố
                </div>
                <div
                  className={`text-lg font-black font-mono mt-0.5 ${
                    isCandidate
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {printer.incidentCount} lần
                </div>
              </div>
              <div className="px-3.5 py-3">
                <div className="text-[10.5px] font-semibold text-slate-500 dark:text-slate-400">
                  Chi phí sửa chữa
                </div>
                <div className="text-base font-black font-mono text-slate-900 dark:text-slate-100 mt-1">
                  {printer.totalRepairCostVnd.toLocaleString('vi-VN')} đ
                </div>
              </div>
              <div className="px-3.5 py-3">
                <div className="text-[10.5px] font-semibold text-slate-500 dark:text-slate-400">
                  TB / sự cố
                </div>
                <div className="text-base font-black font-mono text-slate-700 dark:text-slate-200 mt-1">
                  {Math.round(avgCostPerIncident / 1000).toLocaleString('vi-VN')} k
                </div>
              </div>
            </div>

            {/* Bảng thông số vận hành phẳng */}
            <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              <div className="px-3.5 py-2.5 flex items-center justify-between gap-3">
                <span className="text-slate-500 dark:text-slate-400">Vị trí lắp đặt</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 text-right">
                  {printer.floor} · {printer.department}
                </span>
              </div>
              <div className="px-3.5 py-2.5 flex items-center justify-between gap-3">
                <span className="text-slate-500 dark:text-slate-400">Đội quản lý</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">
                  {printer.managingTeam || 'Chưa gán'}
                </span>
              </div>
              <div className="px-3.5 py-2.5 flex items-center justify-between gap-3">
                <span className="text-slate-500 dark:text-slate-400">Người phụ trách</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">
                  {printer.custodianName || 'Chưa gán'}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between gap-2.5">
            <button
              type="button"
              onClick={() => {
                onClose();
                onRequestReplacement(printer);
              }}
              className="px-3.5 py-1.5 rounded-lg border border-rose-200 dark:border-rose-800/70 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <FontAwesomeIcon icon={faFileCircleCheck} />
              <span>Lập Đề Xuất Thay Thế</span>
            </button>
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

export default LemonDeviceDetailModal;

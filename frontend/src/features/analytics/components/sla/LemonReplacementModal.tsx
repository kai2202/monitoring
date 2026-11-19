/**
 * Frontend/src/features/analytics/components/sla/LemonReplacementModal.tsx
 *
 * Modal Lập Đề Xuất Thay Thế / Đại Tu Thiết Bị (Lemon Device Replacement Proposal):
 * - Đồng bộ Tailwind + Dark Mode + ModalPortal (z-[1100]) chuẩn hệ thống.
 * - Hỗ trợ phím Escape & click backdrop để đóng.
 * - Tuân thủ AGENTS.md Rule 5 & Rule 7.1 (< 300 LOC).
 */

import React, { useState, useEffect } from 'react';
import { ModalPortal } from '@/shared/modals';
import {
  FontAwesomeIcon,
  faXmark,
  faFileCircleCheck,
  faTriangleExclamation,
} from '@/shared/icons';
import { LemonPrinterItem } from '@/types/api';

export interface ReplacementProposalPayload {
  printer: LemonPrinterItem;
  actionType: 'replace_new' | 'relocate_backup' | 'major_overhaul';
  priority: 'P1_Urgent' | 'P2_High' | 'P3_Medium';
  estimatedBudgetVnd: string;
  notes: string;
}

export interface LemonReplacementModalProps {
  printer: LemonPrinterItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmitProposal: (payload: ReplacementProposalPayload) => void;
}

export const LemonReplacementModal: React.FC<LemonReplacementModalProps> = ({
  printer,
  isOpen,
  onClose,
  onSubmitProposal,
}) => {
  const [actionType, setActionType] = useState<'replace_new' | 'relocate_backup' | 'major_overhaul'>(
    'replace_new'
  );
  const [priority, setPriority] = useState<'P1_Urgent' | 'P2_High' | 'P3_Medium'>('P2_High');
  const [estimatedBudgetVnd, setEstimatedBudgetVnd] = useState('35.000.000');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setActionType('replace_new');
    setPriority(printer && printer.incidentCount >= 8 ? 'P1_Urgent' : 'P2_High');
    setNotes('');
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, printer, onClose]);

  if (!isOpen || !printer) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitProposal({
      printer,
      actionType,
      priority,
      estimatedBudgetVnd,
      notes,
    });
    onClose();
  };

  return (
    <ModalPortal>
      <div
        role="dialog"
        aria-modal="true"
        onClick={onClose}
        className="fixed inset-0 z-[1100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      >
        <form
          onSubmit={handleSubmit}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-[520px] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 text-xs">
                <FontAwesomeIcon icon={faFileCircleCheck} />
              </div>
              <div className="min-w-0">
                <h3 className="m-0 text-sm font-extrabold text-slate-900 dark:text-slate-100 truncate">
                  Lập Đề Xuất Thay Thế Thiết Bị
                </h3>
                <p className="mt-0.5 mb-0 text-[11.5px] text-slate-500 dark:text-slate-400 truncate">
                  Tạo phiếu đánh giá &amp; đề xuất mua sắm / điều chuyển
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng biểu mẫu đề xuất"
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 flex items-center justify-center border-none cursor-pointer transition-colors shrink-0"
            >
              <FontAwesomeIcon icon={faXmark} className="text-xs" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 flex flex-col gap-3.5">
            {/* Tóm tắt máy in */}
            <div className="px-3.5 py-3 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/70 dark:border-rose-900/50 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[13px] font-extrabold text-slate-900 dark:text-slate-100 truncate">
                  {printer.name}
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 truncate">
                  {printer.model} • {printer.floor} ({printer.department})
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs font-extrabold text-rose-600 dark:text-rose-400 inline-flex items-center gap-1">
                  <FontAwesomeIcon icon={faTriangleExclamation} className="text-[11px]" />
                  <span>{printer.incidentCount} sự cố</span>
                </div>
                <div className="text-[11px] font-bold font-mono text-slate-700 dark:text-slate-200">
                  {printer.totalRepairCostVnd.toLocaleString('vi-VN')} đ
                </div>
              </div>
            </div>

            {/* Phương án */}
            <div>
              <label className="block text-[11.5px] font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                Phương án đề xuất
              </label>
              <select
                value={actionType}
                onChange={(e) => setActionType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
              >
                <option value="replace_new">Đề xuất Vendor đổi máy thay thế</option>
                <option value="relocate_backup">Điều chuyển máy dự phòng thay thế tạm thời</option>
                <option value="major_overhaul">Sửa chữa / Đại tu cụm cơ phát sinh</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11.5px] font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                  Mức độ ưu tiên
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
                >
                  <option value="P1_Urgent">P1 — Khẩn cấp</option>
                  <option value="P2_High">P2 — Ưu tiên cao</option>
                  <option value="P3_Medium">P3 — Theo kế hoạch</option>
                </select>
              </div>
              <div>
                <label className="block text-[11.5px] font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                  Ngân sách dự kiến (VNĐ)
                </label>
                <input
                  type="text"
                  value={estimatedBudgetVnd}
                  onChange={(e) => setEstimatedBudgetVnd(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs font-mono border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11.5px] font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                Lý do &amp; Ghi chú kỹ thuật
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ví dụ: Chi phí sửa chữa 3 tháng vượt 40% giá trị máy, thường xuyên kẹt giấy cụm kéo..."
                className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500 resize-y"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 text-xs font-semibold cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Huỷ
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl border-none bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer transition-colors"
            >
              Gửi Đề Xuất Thay Thế
            </button>
          </div>
        </form>
      </div>
    </ModalPortal>
  );
};

export default LemonReplacementModal;

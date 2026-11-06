/**
 * Frontend/src/features/printers/components/modals/PrinterRelocateModal.tsx
 *
 * Modal Điều Chuyển Vị Trí Máy In (Admin Only):
 * - Áp dụng thiết kế thẻ General Access (Image 2) và Nested Floating Labels (Image 4).
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React, { useState, useMemo } from 'react';
import { FontAwesomeIcon, faLocationDot, faBuilding, faCheck, faXmark, faWrench, faArrowRight } from '@/shared/icons';
import { Printer } from '@/types/printer';
import { locationService } from '@/services';

export interface PrinterRelocateModalProps {
  printer: Printer | null;
  isOpen: boolean;
  onClose: () => void;
  onRelocateSuccess: (printerId: string, updatedLocation: { branch: string; floor: string; department: string; fullLocation: string; reason: string }) => void;
}

export const PrinterRelocateModal: React.FC<PrinterRelocateModalProps> = ({
  printer,
  isOpen,
  onClose,
  onRelocateSuccess,
}) => {
  const availableBranches = locationService.getBranchNames();
  const availableDepartments = useMemo(() => locationService.getDepartments(), []);
  const [targetBranch, setTargetBranch] = useState(printer?.branch || availableBranches[0] || '');
  const floorList = locationService.getFloorsByBranch(targetBranch);
  const [targetFloor, setTargetFloor] = useState(printer?.floor || floorList[0] || '');
  const [targetDepartment, setTargetDepartment] = useState(printer?.department || availableDepartments[0] || '');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !printer) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setErrorMessage('Vui lòng nhập lý do điều chuyển thiết bị.');
      return;
    }
    setIsSubmitting(true);
    setErrorMessage(null);

    const fullLocation = `${targetBranch} - ${targetFloor} (${targetDepartment})`;
    setTimeout(() => {
      onRelocateSuccess(printer.id, {
        branch: targetBranch,
        floor: targetFloor,
        department: targetDepartment,
        fullLocation,
        reason: reason.trim(),
      });
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[1200] p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 w-full max-w-lg p-6 shadow-2xl flex flex-col gap-5">
        
        {/* Header - Image 1 & 2 squircle pattern */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-sm">
              <FontAwesomeIcon icon={faLocationDot} className="text-base" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  Điều Chuyển Vị Trí Máy In
                </h3>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {printer.id}
                </span>
              </div>
              <p className="text-[11.5px] text-slate-500 dark:text-slate-400 mt-0.5">
                Thiết bị: <strong className="text-slate-700 dark:text-slate-200">{printer.name}</strong> • {printer.model}
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

        {/* Current Location Card - Image 2 Access Card Style */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xs">
              <FontAwesomeIcon icon={faLocationDot} />
            </div>
            <div>
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block">Vị Trí Hiện Tại</span>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {printer.location || 'Chưa thiết lập'}
              </span>
            </div>
          </div>
          <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-200/70 dark:bg-slate-700/70 text-slate-600 dark:text-slate-300">
            {printer.branch || 'HQ'}
          </span>
        </div>

        {/* Form Controls - Image 4 Nested Label Containers */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {/* Target Branch */}
          <div className="rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/70 px-3.5 py-2 transition-all focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block flex items-center gap-1.5">
              <FontAwesomeIcon icon={faBuilding} className="text-indigo-600 dark:text-indigo-400 text-[10px]" />
              Chi Nhánh Tiếp Nhận
            </label>
            <select
              value={targetBranch}
              onChange={(e) => {
                setTargetBranch(e.target.value);
                const nextFloors = locationService.getFloorsByBranch(e.target.value);
                if (nextFloors.length > 0) setTargetFloor(nextFloors[0]);
              }}
              className="w-full bg-transparent text-xs font-medium text-slate-800 dark:text-slate-100 outline-none mt-0.5 cursor-pointer"
            >
              {availableBranches.map((b) => (
                <option key={b} value={b} className="bg-white dark:bg-slate-900">{b}</option>
              ))}
            </select>
          </div>

          {/* Floor & Department (2-col grid) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/70 px-3.5 py-2 transition-all focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block">
                Tầng / Khu Vực
              </label>
              <select
                value={targetFloor}
                onChange={(e) => setTargetFloor(e.target.value)}
                className="w-full bg-transparent text-xs font-medium text-slate-800 dark:text-slate-100 outline-none mt-0.5 cursor-pointer"
              >
                {floorList.map((f) => (
                  <option key={f} value={f} className="bg-white dark:bg-slate-900">{f}</option>
                ))}
              </select>
            </div>

            <div className="rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/70 px-3.5 py-2 transition-all focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block">
                Phòng Ban Phụ Trách
              </label>
              {availableDepartments.length > 0 ? (
                <select
                  value={targetDepartment}
                  onChange={(e) => setTargetDepartment(e.target.value)}
                  className="w-full bg-transparent text-xs font-medium text-slate-800 dark:text-slate-100 outline-none mt-0.5 cursor-pointer"
                >
                  {availableDepartments.map((d) => (
                    <option key={d} value={d} className="bg-white dark:bg-slate-900">{d}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="Nhập tên phòng ban tiếp nhận"
                  value={targetDepartment}
                  onChange={(e) => setTargetDepartment(e.target.value)}
                  className="w-full bg-transparent text-xs font-medium text-slate-800 dark:text-slate-100 outline-none mt-0.5"
                />
              )}
            </div>
          </div>

          {/* Reason */}
          <div className="rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/70 px-3.5 py-2 transition-all focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block flex items-center gap-1.5">
              <FontAwesomeIcon icon={faWrench} className="text-amber-500 text-[10px]" />
              Lý Do Điều Chuyển &amp; Căn Cứ Quyết Định
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="VD: Điều chuyển theo yêu cầu tái cơ cấu văn phòng của HR & Ban Giám Đốc..."
              className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-100 outline-none mt-1 resize-none placeholder:text-slate-400"
            />
          </div>

          {errorMessage && (
            <div className="text-[11.5px] text-rose-500 font-semibold px-1">
              {errorMessage}
            </div>
          )}

          {/* Footer - Image 1 clean action footer */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/25 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faCheck} className="text-xs" />
              <span>{isSubmitting ? 'Đang cập nhật...' : 'Xác nhận Điều chuyển'}</span>
              <FontAwesomeIcon icon={faArrowRight} className="text-[10px] opacity-70" />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default PrinterRelocateModal;

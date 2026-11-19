/**
 * Frontend/src/features/analytics/components/supplies/BulkSuppliesConfirmModal.tsx
 *
 * Modal Xác Nhận Kỹ Thuật Viên Đã Cấp Phát & Thay Thế Vật Tư Hàng Loạt:
 * - Cho phép KTV ghi nhận hoàn tất thay mực/vật tư cho nhiều máy in cùng lúc.
 * - Lưu thời điểm thực hiện, người thao tác và ghi chú in test thực tế.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC, FontAwesome duy nhất).
 */

import React, { useState } from 'react';
import {
  FontAwesomeIcon,
  faXmark,
  faCheck,
  faBoxesStacked,
  faClipboardCheck,
} from '../../../../shared/icons';
import { PrinterConsumablesOverview } from '../../../../types/analyticsUI';

export interface ReplenishmentLogRecord {
  id: string;
  timestamp: string;
  technician: string;
  notes: string;
  printers: {
    printerId: string;
    printerName: string;
    floor: string;
    itemsReplaced: string[];
  }[];
}

export interface ConsumedSuppliesMap {
  black: number;
  cyan: number;
  magenta: number;
  yellow: number;
  waste_toner: number;
  drum: number;
}

export interface BulkSuppliesConfirmModalProps {
  isOpen: boolean;
  selectedPrinters: PrinterConsumablesOverview[];
  onClose: () => void;
  onConfirm: (log: ReplenishmentLogRecord, consumed: ConsumedSuppliesMap) => void;
}

export const BulkSuppliesConfirmModal: React.FC<BulkSuppliesConfirmModalProps> = ({
  isOpen,
  selectedPrinters,
  onClose,
  onConfirm,
}) => {
  const [technician, setTechnician] = useState('Nguyễn Văn An (KTV Hiện trường)');
  const [notes, setNotes] = useState('Đã thay thế mực mới, vệ sinh khay giấy và in trang test sắc nét.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || selectedPrinters.length === 0) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const consumed: ConsumedSuppliesMap = {
      black: 0,
      cyan: 0,
      magenta: 0,
      yellow: 0,
      waste_toner: 0,
      drum: 0,
    };

    const log: ReplenishmentLogRecord = {
      id: `replenish-${Date.now()}`,
      timestamp: new Date().toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
      technician: technician.trim() || 'Kỹ thuật viên NOC',
      notes: notes.trim(),
      printers: selectedPrinters.map((p) => {
        const items: string[] = [];
        if (p.tonerK < 25) {
          items.push('Mực Đen (K)');
          consumed.black += 1;
        }
        if (p.tonerC < 25) {
          items.push('Mực Xanh (C)');
          consumed.cyan += 1;
        }
        if (p.tonerM < 25) {
          items.push('Mực Đỏ (M)');
          consumed.magenta += 1;
        }
        if (p.tonerY < 25) {
          items.push('Mực Vàng (Y)');
          consumed.yellow += 1;
        }
        if (p.wasteToner === 'Đầy' || p.wasteToner === 'Sắp đầy') {
          items.push('Hộp Mực Thải');
          consumed.waste_toner += 1;
        }
        if (p.drumLife < 25) {
          items.push('Cụm Drum');
          consumed.drum += 1;
        }
        if (items.length === 0) items.push('Kiểm tra tổng thể');
        return {
          printerId: p.printerId,
          printerName: p.printerName,
          floor: p.floor,
          itemsReplaced: items,
        };
      }),
    };

    onConfirm(log, consumed);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[1100] p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 w-full max-w-lg p-6 shadow-2xl flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
              <FontAwesomeIcon icon={faClipboardCheck} className="text-base" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Xác Nhận Đã Cấp Phát &amp; Thay Mực Hàng Loạt
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Ghi nhận hoàn tất bảo trì cho {selectedPrinters.length} máy in được chọn
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
          >
            <FontAwesomeIcon icon={faXmark} className="text-sm" />
          </button>
        </div>

        {/* Selected Printers Checklist Summary */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
            Danh sách thiết bị hoàn tất ({selectedPrinters.length} máy):
          </label>
          <div className="max-h-36 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-2.5 flex flex-col gap-1.5 text-xs">
            {selectedPrinters.map((p) => {
              const items: string[] = [];
              if (p.tonerK < 25) items.push('Mực K');
              if (p.tonerC < 25 || p.tonerM < 25 || p.tonerY < 25) items.push('Mực Màu');
              if (p.wasteToner === 'Đầy' || p.wasteToner === 'Sắp đầy') items.push('Mực Thải');
              if (p.drumLife < 25) items.push('Drum');

              return (
                <div key={p.printerId} className="flex items-center justify-between p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <div className="min-w-0 pr-2">
                    <span className="font-bold text-slate-800 dark:text-slate-100 truncate block">
                      {p.printerName}
                    </span>
                    <span className="text-[10.5px] text-slate-500 dark:text-slate-400">
                      {p.floor} • {p.department}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 shrink-0">
                    {items.length > 0 ? items.join(', ') : 'Kiểm tra'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              Kỹ thuật viên thực hiện
            </label>
            <input
              type="text"
              value={technician}
              onChange={(e) => setTechnician(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              Ghi chú hiện trường (In test, tình trạng hộp mực cũ)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 mt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <FontAwesomeIcon icon={faCheck} className="text-xs" />
              <span>Xác Nhận Hoàn Tất ({selectedPrinters.length} máy)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BulkSuppliesConfirmModal;

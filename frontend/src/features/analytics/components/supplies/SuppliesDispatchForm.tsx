/**
 * Frontend/src/features/analytics/components/supplies/SuppliesDispatchForm.tsx
 *
 * Biểu mẫu nhập liệu Lập Phiếu Cấp Phát & Điều Động Vật Tư:
 * - Pre-filled box thông tin máy in & vật tư cảnh báo.
 * - Form nhập: Mức độ ưu tiên, Số lượng, Kỹ thuật viên, Ghi chú.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React, { useState } from 'react';
import { ConsumableAlertItem } from '../../../../types/analyticsUI';

interface SuppliesDispatchFormProps {
  alertItem: ConsumableAlertItem;
  onSubmit: (payload: {
    alertItem: ConsumableAlertItem;
    priority: 'urgent' | 'normal';
    quantity: number;
    technician: string;
    notes: string;
  }) => void;
  onCancel: () => void;
}

export const SuppliesDispatchForm: React.FC<SuppliesDispatchFormProps> = ({
  alertItem,
  onSubmit,
  onCancel,
}) => {
  const [priority, setPriority] = useState<'urgent' | 'normal'>(
    alertItem.currentPercent < 15 ? 'urgent' : 'normal'
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [technician, setTechnician] = useState<string>('Nguyễn Văn Tuấn (KTV Ca 1)');
  const [notes, setNotes] = useState<string>('Cấp phát thay thế định kỳ theo cảnh báo Days-to-Empty');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      alertItem,
      priority,
      quantity,
      technician,
      notes,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
      {/* Pre-filled Device Box */}
      <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-col gap-2">
        <div className="flex justify-between items-baseline gap-2">
          <strong className="text-[13px] text-slate-900 dark:text-slate-100">
            {alertItem.printerName}
          </strong>
          <span className="text-[11px] text-blue-600 dark:text-blue-400 font-bold shrink-0">
            {alertItem.model}
          </span>
        </div>
        <div className="text-xs text-slate-600 dark:text-slate-400">
          Vị trí: <strong>{alertItem.floor}</strong> ({alertItem.department})
        </div>
        <div className="flex items-center justify-between mt-1 pt-2 border-t border-slate-200/70 dark:border-slate-700/70 text-xs">
          <span className="text-slate-600 dark:text-slate-300">
            Vật tư: <strong>{alertItem.itemName}</strong>
          </span>
          <span
            className={`font-extrabold font-mono ${
              alertItem.currentPercent < 15
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-amber-600 dark:text-amber-400'
            }`}
          >
            Còn {alertItem.currentPercent}% (~{alertItem.daysRemaining} ngày)
          </span>
        </div>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[11.5px] font-bold text-slate-600 dark:text-slate-300 mb-1">
            Mức độ ưu tiên
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as any)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
          >
            <option value="urgent">Khẩn cấp (&lt; 15%)</option>
            <option value="normal">Tiêu chuẩn</option>
          </select>
        </div>

        <div>
          <label className="block text-[11.5px] font-bold text-slate-600 dark:text-slate-300 mb-1">
            Số lượng xuất
          </label>
          <input
            type="number"
            min={1}
            max={10}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 box-border"
          />
        </div>
      </div>

      <div>
        <label className="block text-[11.5px] font-bold text-slate-600 dark:text-slate-300 mb-1">
          Kỹ thuật viên phụ trách
        </label>
        <input
          type="text"
          value={technician}
          onChange={(e) => setTechnician(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 box-border"
        />
      </div>

      <div>
        <label className="block text-[11.5px] font-bold text-slate-600 dark:text-slate-300 mb-1">
          Ghi chú xuất kho &amp; điều động
        </label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 box-border"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2.5 mt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg text-xs font-semibold bg-transparent border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
        >
          Hủy bỏ
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white border-none cursor-pointer transition-colors"
        >
          Xác nhận tạo lệnh cấp phát
        </button>
      </div>
    </form>
  );
};


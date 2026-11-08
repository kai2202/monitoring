/**
 * Frontend/src/features/inventory/components/StockTransactionModal.tsx
 *
 * Modal Xuất / Nhập Kho Vật Tư Tiêu Hao:
 * - Tuân thủ AGENTS.md Rule 4 & Rule 7.1 (< 300 LOC, FontAwesome duy nhất).
 */

import React, { useState } from 'react';
import { FontAwesomeIcon, faXmark, faBox, faCheck } from '../../../shared/icons';
import { InventoryItem, CreateStockTransactionDto } from '../types';

interface StockTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItem?: InventoryItem | null;
  items: InventoryItem[];
  onSubmit: (dto: CreateStockTransactionDto) => Promise<void>;
}

export const StockTransactionModal: React.FC<StockTransactionModalProps> = ({
  isOpen,
  onClose,
  selectedItem,
  items,
  onSubmit,
}) => {
  const [itemId, setItemId] = useState<string>(selectedItem?.id || items[0]?.id || '');
  const [type, setType] = useState<'EXPORT' | 'IMPORT' | 'ADJUSTMENT'>('EXPORT');
  const [quantity, setQuantity] = useState<number>(1);
  const [taskId, setTaskId] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemId || quantity <= 0) return;
    setIsSubmitting(true);
    try {
      await onSubmit({
        itemId,
        type,
        quantity: Number(quantity),
        taskId: taskId.trim() || undefined,
        note: note.trim() || undefined,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <FontAwesomeIcon icon={faBox} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">Ghi Nhận Xuất / Nhập Kho</h2>
              <p className="text-xs text-slate-500 font-medium">Điều chuyển linh kiện vật tư tiêu hao</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Mặt hàng vật tư</label>
            <select
              value={itemId}
              onChange={(e) => setItemId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:border-sky-500"
            >
              {items.map((it) => (
                <option key={it.id} value={it.id}>
                  [{it.sku}] {it.name} (Tồn: {it.currentStock} {it.unit})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Hình thức giao dịch</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:border-sky-500"
              >
                <option value="EXPORT">Xuất kho bảo trì (KTV)</option>
                <option value="IMPORT">Nhập kho bổ sung</option>
                <option value="ADJUSTMENT">Kiểm kê điều chỉnh</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Số lượng</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Mã Lệnh CMMS (Tùy chọn)</label>
            <input
              type="text"
              placeholder="VD: TASK-T1-01 hoặc để trống"
              value={taskId}
              onChange={(e) => setTaskId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Ghi chú vận hành</label>
            <textarea
              rows={2}
              placeholder="Lý do xuất vật tư, máy in tiếp nhận..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:border-sky-500 resize-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-full text-sm font-bold text-white bg-sky-600 hover:bg-sky-700 shadow-md transition-colors flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faCheck} />
              <span>{isSubmitting ? 'Đang lưu...' : 'Xác nhận giao dịch'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockTransactionModal;


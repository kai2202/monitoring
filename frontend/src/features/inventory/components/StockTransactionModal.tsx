/**
 * Frontend/src/features/inventory/components/StockTransactionModal.tsx
 *
 * Modal Xuất / Nhập Kho Vật Tư Tiêu Hao (Thiết kế phẳng hiện đại):
 * - Cho phép xuất theo Task hoặc xuất/nhập tự do kèm ghi chú nhanh.
 * - Hỗ trợ đóng bằng phím Esc hoặc click backdrop.
 * - Tuân thủ AGENTS.md Rule 4 & Rule 7.1 (< 300 LOC, FontAwesome duy nhất).
 */

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FontAwesomeIcon, faXmark, faBox, faCheck, faChevronDown } from '../../../shared/icons';
import { InventoryItem, CreateStockTransactionDto } from '../types';

interface StockTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItem?: InventoryItem | null;
  items: InventoryItem[];
  importOnly?: boolean;
  onSubmit: (dto: CreateStockTransactionDto) => Promise<void>;
}

const QUICK_NOTES = [
  'Thay hộp mực định kỳ',
  'Cấp phát mực cho phòng ban',
  'Nhập bổ sung hộp mực',
];

const inputCls =
  'w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500';
const selectCls = `${inputCls} appearance-none pr-8 cursor-pointer`;

export const StockTransactionModal: React.FC<StockTransactionModalProps> = ({
  isOpen,
  onClose,
  selectedItem,
  items,
  importOnly = false,
  onSubmit,
}) => {
  const [itemId, setItemId] = useState<string>(selectedItem?.id || items[0]?.id || '');
  const [type, setType] = useState<'EXPORT' | 'IMPORT' | 'ADJUSTMENT'>(importOnly ? 'IMPORT' : 'EXPORT');
  const [quantity, setQuantity] = useState<number>(1);
  const [taskId, setTaskId] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setItemId(selectedItem?.id || items[0]?.id || '');
      setType(importOnly ? 'IMPORT' : 'EXPORT');
      setQuantity(1);
      setTaskId('');
      setNote('');
    }
  }, [isOpen, selectedItem, items, importOnly]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, isSubmitting, onClose]);

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

  return createPortal(
    <div
      onClick={() => !isSubmitting && onClose()}
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/60 backdrop-blur-[2px] p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 rounded-xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center shrink-0">
              <FontAwesomeIcon icon={faBox} className="text-sm" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 m-0">
                {importOnly ? 'Nhập Kho Vật Tư' : 'Xuất / Nhập Kho'}
              </h2>
              <p className="text-[11.5px] text-slate-500 m-0 mt-0.5">
                {importOnly
                  ? 'Nhập bổ sung tồn kho (nghiệp vụ xuất kho thực hiện trong Lệnh bảo trì)'
                  : 'Điều chuyển linh kiện hoặc nhập bổ sung tồn kho'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center bg-transparent border-none cursor-pointer"
          >
            <FontAwesomeIcon icon={faXmark} className="text-xs" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-5 flex flex-col gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Mặt hàng vật tư
              </label>
              <div className="relative">
                <select value={itemId} onChange={(e) => setItemId(e.target.value)} className={selectCls} style={{ borderRadius: '8px' }}>
                  {items.map((it) => (
                    <option key={it.id} value={it.id}>
                      {it.name} (Tồn: {it.currentStock} {it.unit})
                    </option>
                  ))}
                </select>
                <FontAwesomeIcon icon={faChevronDown} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400" />
              </div>
            </div>

            <div className={importOnly ? '' : 'grid grid-cols-2 gap-3'}>
              {!importOnly && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Hình thức
                  </label>
                  <div className="relative">
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as 'EXPORT' | 'IMPORT' | 'ADJUSTMENT')}
                      className={selectCls}
                      style={{ borderRadius: '8px' }}
                    >
                      <option value="EXPORT">Xuất kho sử dụng</option>
                      <option value="IMPORT">Nhập kho bổ sung</option>
                      <option value="ADJUSTMENT">Kiểm kê điều chỉnh</option>
                    </select>
                    <FontAwesomeIcon icon={faChevronDown} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400" />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Số lượng nhập
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className={inputCls}
                  style={{ borderRadius: '8px' }}
                />
              </div>
            </div>

            {!importOnly && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Mã Lệnh Bảo Trì (Tùy chọn)
                </label>
                <input
                  type="text"
                  placeholder="VD: TSK-2026-001 (để trống nếu xuất/nhập tự do)"
                  value={taskId}
                  onChange={(e) => setTaskId(e.target.value)}
                  className={inputCls}
                  style={{ borderRadius: '8px' }}
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Ghi chú
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {QUICK_NOTES.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setNote(item)}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
                      note === item
                        ? 'bg-blue-50 border-blue-300 text-blue-700'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <textarea
                rows={2}
                placeholder="Nhập ghi chú xuất/nhập kho..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className={`${inputCls} resize-none`}
                style={{ borderRadius: '8px' }}
              />
            </div>
          </div>

          <div className="px-5 py-3 bg-slate-50/80 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer"
            >
              Đóng
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !itemId}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold inline-flex items-center gap-1.5 border-none cursor-pointer"
            >
              <FontAwesomeIcon icon={faCheck} className="text-[11px]" />
              <span>{isSubmitting ? 'Đang lưu...' : 'Xác nhận'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default StockTransactionModal;

/**
 * Frontend/src/features/procurement/components/CreatePurchaseOrderModal.tsx
 *
 * Modal Lập Đơn Hàng Mua Sắm Vật Tư Tiêu Hao (PO):
 * - Tuân thủ AGENTS.md Rule 4 & Rule 7.1 (< 300 LOC, FontAwesome duy nhất).
 */

import React, { useState } from 'react';
import { FontAwesomeIcon, faXmark, faFileLines, faCheck, faPlus, faTrashCan } from '../../../shared/icons';
import { CreatePurchaseOrderDto, PurchaseOrderItem } from '../types';

interface CreatePurchaseOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (dto: CreatePurchaseOrderDto) => Promise<void>;
}

export const CreatePurchaseOrderModal: React.FC<CreatePurchaseOrderModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [poNumber, setPoNumber] = useState<string>(`PO-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`);
  const [note, setNote] = useState<string>('Đơn đặt mua vật tư định kỳ');
  const [items, setItems] = useState<PurchaseOrderItem[]>([
    { sku: 'MP-C6004-BK', name: 'Hộp mực Ricoh MP C6004 Black', quantity: 5, unitPrice: 850000 },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAddItem = () => {
    setItems([...items, { sku: '', name: '', quantity: 1, unitPrice: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof PurchaseOrderItem, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!poNumber.trim() || items.length === 0) return;
    setIsSubmitting(true);
    try {
      await onSubmit({
        poNumber: poNumber.trim(),
        items,
        note: note.trim() || undefined,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalAmount = items.reduce((sum, it) => sum + (Number(it.quantity) || 1) * (Number(it.unitPrice) || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <FontAwesomeIcon icon={faFileLines} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">Lập Đơn Đặt Hàng (Purchase Order)</h2>
              <p className="text-xs text-slate-500 font-medium">Đơn hàng mua sắm vật tư tiêu hao gửi nhà cung cấp</p>
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

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 overflow-y-auto flex-1 pr-1">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Mã đơn hàng PO</label>
              <input
                type="text"
                required
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Ghi chú đơn hàng</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700">Danh mục mặt hàng đặt mua</label>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
              >
                <FontAwesomeIcon icon={faPlus} />
                <span>Thêm mặt hàng</span>
              </button>
            </div>

            <div className="space-y-2">
              {items.map((it, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <input
                    type="text"
                    placeholder="Mã SKU (VD: MP-C6004-BK)"
                    value={it.sku}
                    onChange={(e) => handleItemChange(idx, 'sku', e.target.value)}
                    className="w-28 px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-mono font-bold bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Tên vật tư"
                    value={it.name}
                    onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                    className="flex-1 px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold bg-white"
                  />
                  <input
                    type="number"
                    min="1"
                    placeholder="SL"
                    value={it.quantity}
                    onChange={(e) => handleItemChange(idx, 'quantity', parseInt(e.target.value, 10) || 1)}
                    className="w-16 px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-bold bg-white text-center"
                  />
                  <input
                    type="number"
                    min="0"
                    placeholder="Đơn giá"
                    value={it.unitPrice}
                    onChange={(e) => handleItemChange(idx, 'unitPrice', parseInt(e.target.value, 10) || 0)}
                    className="w-24 px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-mono bg-white text-right"
                  />
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="text-slate-400 hover:text-red-500 p-1"
                    >
                      <FontAwesomeIcon icon={faTrashCan} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-sky-50 rounded-2xl flex items-center justify-between text-xs">
            <span className="font-bold text-sky-900">Tổng giá trị đơn hàng (Dự toán):</span>
            <span className="font-mono font-black text-sm text-sky-700">
              {totalAmount.toLocaleString('vi-VN')} VNĐ
            </span>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 shadow-md transition-colors flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faCheck} />
              <span>{isSubmitting ? 'Đang tạo...' : 'Xác nhận tạo đơn PO'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePurchaseOrderModal;


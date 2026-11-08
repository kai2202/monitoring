/**
 * Frontend/src/features/inventory/components/InventoryTable.tsx
 *
 * Bảng Danh Mục Vật Tư Tiêu Hao & Trạng Thái Tồn Kho:
 * - Bảo mật RBAC: Ẩn đơn giá VNĐ đối với Kỹ thuật viên (FIELD_TECH).
 * - Cảnh báo đổi màu khi tồn kho <= mức tồn an toàn.
 * - Tuân thủ AGENTS.md Rule 4, Rule 5 & Rule 7.1 (< 300 LOC).
 */

import React, { useState, useMemo } from 'react';
import { FontAwesomeIcon, faMagnifyingGlass, faTriangleExclamation, faRightFromBracket } from '../../../shared/icons';
import { InventoryItem } from '../types';

interface InventoryTableProps {
  items: InventoryItem[];
  isLoading?: boolean;
  canViewCost?: boolean;
  onOpenTransactionModal: (item?: InventoryItem) => void;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({
  items,
  isLoading = false,
  canViewCost = true,
  onOpenTransactionModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const filteredItems = useMemo(() => {
    return items.filter((it) => {
      const matchSearch =
        it.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        it.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        it.compatibleModels.some((m) => m.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchCategory = selectedCategory === 'ALL' || it.category.toUpperCase() === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [items, searchTerm, selectedCategory]);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
      {/* Thanh Lọc & Tìm Kiếm */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 w-full sm:w-72">
          <FontAwesomeIcon icon={faMagnifyingGlass} className="text-slate-400 text-xs" />
          <input
            type="text"
            placeholder="Tìm theo SKU, tên, model máy in..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none text-xs text-slate-800 placeholder-slate-400 font-medium w-full"
          />
        </div>

        <div className="flex items-center gap-2">
          {['ALL', 'TONER', 'DRUM', 'FUSER', 'WASTE_BOX'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                selectedCategory === cat ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'ALL' ? 'Tất cả' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Bảng Dữ Liệu */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/75 border-b border-slate-100 text-[11px] font-black text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">Mã SKU</th>
              <th className="py-3 px-4">Tên Vật Tư</th>
              <th className="py-3 px-4">Danh Mục</th>
              <th className="py-3 px-4">Model Tương Thích</th>
              <th className="py-3 px-4 text-center">Tồn Kho / An Toàn</th>
              <th className="py-3 px-4">Vị Trí Kệ</th>
              {canViewCost && <th className="py-3 px-4 text-right">Đơn Giá Dự Toán</th>}
              <th className="py-3 px-4 text-center">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
            {isLoading ? (
              <tr>
                <td colSpan={canViewCost ? 8 : 7} className="py-8 text-center text-slate-400">
                  Đang tải dữ liệu kho vật tư...
                </td>
              </tr>
            ) : filteredItems.length === 0 ? (
              <tr>
                <td colSpan={canViewCost ? 8 : 7} className="py-8 text-center text-slate-400">
                  Không tìm thấy mặt hàng nào phù hợp
                </td>
              </tr>
            ) : (
              filteredItems.map((it) => {
                const isLow = it.currentStock <= it.safetyStock;
                return (
                  <tr key={it.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-sky-700">{it.sku}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{it.name}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-slate-100 text-slate-600">
                        {it.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {it.compatibleModels?.join(', ') || '—'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <span
                          className={`font-mono font-black ${
                            isLow ? 'text-red-600' : 'text-slate-800'
                          }`}
                        >
                          {it.currentStock} {it.unit}
                        </span>
                        <span className="text-slate-400 text-[10px]">/ {it.safetyStock}</span>
                        {isLow && (
                          <FontAwesomeIcon
                            icon={faTriangleExclamation}
                            className="text-red-500 text-[11px]"
                            title="Tồn kho dưới ngưỡng an toàn!"
                          />
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{it.location}</td>
                    {canViewCost && (
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                        {it.unitCost > 0 ? `${it.unitCost.toLocaleString('vi-VN')} đ` : '—'}
                      </td>
                    )}
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => onOpenTransactionModal(it)}
                        className="px-3 py-1 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 font-bold text-[11px] transition-colors inline-flex items-center gap-1.5"
                      >
                        <FontAwesomeIcon icon={faRightFromBracket} />
                        <span>Xuất/Nhập</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryTable;


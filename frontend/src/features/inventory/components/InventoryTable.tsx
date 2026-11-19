/**
 * Frontend/src/features/inventory/components/InventoryTable.tsx
 *
 * Bảng Danh Mục Vật Tư Tiêu Hao & Trạng Thái Tồn Kho (Thiết kế phẳng rounded-xl):
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
  lowStockOnly?: boolean;
  onToggleLowStock?: () => void;
  onOpenTransactionModal: (item?: InventoryItem) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  ALL: 'Tất cả',
  TONER: 'Mực in',
  WASTE_BOX: 'Hộp mực thải',
  DRUM: 'Trống từ (Hãng)',
  FUSER: 'Cụm sấy (Hãng)',
};

export const InventoryTable: React.FC<InventoryTableProps> = ({
  items,
  isLoading = false,
  canViewCost = true,
  lowStockOnly = false,
  onToggleLowStock,
  onOpenTransactionModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const filteredItems = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    return items.filter((it) => {
      const matchSearch =
        !q ||
        it.sku.toLowerCase().includes(q) ||
        it.name.toLowerCase().includes(q) ||
        it.compatibleModels.some((m) => m.toLowerCase().includes(q));
      const matchCategory = selectedCategory === 'ALL' || it.category.toUpperCase() === selectedCategory;
      const matchLow = !lowStockOnly || it.currentStock <= it.safetyStock;
      return matchSearch && matchCategory && matchLow;
    });
  }, [items, searchTerm, selectedCategory, lowStockOnly]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
      {/* Thanh Lọc & Tìm Kiếm */}
      <div className="px-4 py-3 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 w-full sm:w-72">
          <FontAwesomeIcon icon={faMagnifyingGlass} className="text-slate-400 text-xs" />
          <input
            type="text"
            placeholder="Tìm tên hộp mực, model máy in..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 w-full"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {['ALL', 'TONER', 'DRUM', 'FUSER', 'WASTE_BOX'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-md text-[11.5px] font-semibold border transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white border-slate-900 dark:bg-blue-600 dark:border-blue-600'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              {CATEGORY_LABELS[cat] || cat}
            </button>
          ))}

          {onToggleLowStock && (
            <button
              type="button"
              onClick={onToggleLowStock}
              className={`px-2.5 py-1 rounded-md text-[11.5px] font-semibold border transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                lowStockOnly
                  ? 'bg-rose-50 border-rose-300 text-rose-700'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <FontAwesomeIcon icon={faTriangleExclamation} className="text-[10.5px]" />
              <span>Sắp hết</span>
            </button>
          )}
        </div>
      </div>

      {/* Bảng Dữ Liệu */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-2.5 px-4">Tên Vật Tư / Mực In</th>
              <th className="py-2.5 px-4">Danh Mục</th>
              <th className="py-2.5 px-4">Model Tương Thích</th>
              <th className="py-2.5 px-4 text-center">Tồn / An Toàn</th>
              <th className="py-2.5 px-4">Vị Trí Kệ</th>
              {canViewCost && <th className="py-2.5 px-4 text-right">Đơn Giá / Nguồn Cấp</th>}
              <th className="py-2.5 px-4 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-700 dark:text-slate-300">
            {isLoading ? (
              <tr>
                <td colSpan={canViewCost ? 7 : 6} className="py-8 text-center text-slate-400">
                  Đang tải dữ liệu kho vật tư...
                </td>
              </tr>
            ) : filteredItems.length === 0 ? (
              <tr>
                <td colSpan={canViewCost ? 7 : 6} className="py-8 text-center text-slate-400">
                  Không tìm thấy mặt hàng nào phù hợp.
                </td>
              </tr>
            ) : (
              filteredItems.map((it) => {
                const isLow = it.currentStock <= it.safetyStock;
                const isVendorCovered = ['DRUM', 'FUSER', 'ROLLER'].includes(it.category.toUpperCase());
                return (
                  <tr key={it.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 px-4 font-semibold text-slate-900 dark:text-slate-100">{it.name}</td>
                    <td className="py-2.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10.5px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {CATEGORY_LABELS[it.category.toUpperCase()] || it.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-500 text-[11px]">
                      {it.compatibleModels?.join(', ') || '—'}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <span className={`font-mono font-bold ${isLow ? 'text-rose-600' : 'text-slate-900 dark:text-slate-100'}`}>
                          {it.currentStock}
                        </span>
                        <span className="text-slate-400">/ {it.safetyStock} {it.unit}</span>
                        {isLow && (
                          <FontAwesomeIcon
                            icon={faTriangleExclamation}
                            className="text-rose-500 text-[11px]"
                            title="Dưới ngưỡng tồn kho an toàn"
                          />
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-slate-500 text-[11.5px]">{it.location || '—'}</td>
                    {canViewCost && (
                      <td className="py-2.5 px-4 text-right">
                        {isVendorCovered ? (
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10.5px] font-medium">
                            Theo HĐ thuê / Bảo hành
                          </span>
                        ) : (
                          <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                            {it.unitCost > 0 ? `${it.unitCost.toLocaleString('vi-VN')} đ` : '—'}
                          </span>
                        )}
                      </td>
                    )}
                    <td className="py-2.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => onOpenTransactionModal(it)}
                        className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 text-[11px] font-semibold border-none cursor-pointer inline-flex items-center gap-1 transition-colors"
                      >
                        <FontAwesomeIcon icon={faRightFromBracket} className="text-[10px]" />
                        <span>Xuất / Nhập</span>
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

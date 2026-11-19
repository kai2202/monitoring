/**
 * Frontend/src/features/inventory/components/InventoryTransactionsTable.tsx
 *
 * Bảng Lịch Sử Giao Dịch Xuất / Nhập Kho Vật Tư:
 * - Hiển thị thời gian, loại giao dịch, SKU/tên vật tư, số lượng biến động, tồn sau, mã lệnh (nếu có), người thực hiện và ghi chú.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC, FontAwesome chuẩn).
 */

import React, { useState, useMemo } from 'react';
import { FontAwesomeIcon, faMagnifyingGlass } from '../../../shared/icons';
import { InventoryTransaction } from '../types';

interface InventoryTransactionsTableProps {
  transactions: InventoryTransaction[];
  isLoading?: boolean;
}

const TX_TYPE_CONFIG: Record<string, { label: string; cls: string }> = {
  EXPORT: { label: 'Xuất kho', cls: 'bg-amber-50 text-amber-700 border-amber-200/70' },
  IMPORT: { label: 'Nhập kho', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200/70' },
  ADJUSTMENT: { label: 'Điều chỉnh', cls: 'bg-slate-100 text-slate-700 border-slate-200' },
  RETURN: { label: 'Hoàn kho', cls: 'bg-blue-50 text-blue-700 border-blue-200/70' },
};

export const InventoryTransactionsTable: React.FC<InventoryTransactionsTableProps> = ({
  transactions,
  isLoading = false,
}) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'EXPORT' | 'IMPORT' | 'ADJUSTMENT'>('ALL');

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return transactions.filter((tx) => {
      if (typeFilter !== 'ALL' && tx.type !== typeFilter) return false;
      if (!q) return true;
      return (
        (tx.item?.sku || '').toLowerCase().includes(q) ||
        (tx.item?.name || '').toLowerCase().includes(q) ||
        (tx.taskId || '').toLowerCase().includes(q) ||
        (tx.note || '').toLowerCase().includes(q) ||
        (tx.performedBy?.fullName || tx.performedByName || '').toLowerCase().includes(q)
      );
    });
  }, [transactions, search, typeFilter]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
      {/* Thanh Lọc */}
      <div className="px-4 py-3 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 w-full sm:w-72">
          <FontAwesomeIcon icon={faMagnifyingGlass} className="text-slate-400 text-xs" />
          <input
            type="text"
            placeholder="Tìm tên mực, mã lệnh, người thực hiện..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none outline-none text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 w-full"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: 'ALL' as const, label: 'Tất cả' },
            { id: 'EXPORT' as const, label: 'Xuất kho' },
            { id: 'IMPORT' as const, label: 'Nhập kho' },
            { id: 'ADJUSTMENT' as const, label: 'Điều chỉnh' },
          ].map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setTypeFilter(opt.id)}
              className={`px-2.5 py-1 rounded-md text-[11.5px] font-semibold border transition-colors cursor-pointer ${
                typeFilter === opt.id
                  ? 'bg-slate-900 text-white border-slate-900 dark:bg-blue-600 dark:border-blue-600'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bảng Dữ Liệu */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-2.5 px-4">Thời Gian</th>
              <th className="py-2.5 px-4">Loại</th>
              <th className="py-2.5 px-4">Vật Tư / Mực In</th>
              <th className="py-2.5 px-4 text-center">Biến Động</th>
              <th className="py-2.5 px-4 text-center">Tồn Sau</th>
              <th className="py-2.5 px-4">Mã Lệnh</th>
              <th className="py-2.5 px-4">Người Thực Hiện</th>
              <th className="py-2.5 px-4">Ghi Chú</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-700 dark:text-slate-300">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  Đang tải lịch sử giao dịch...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  Chưa có giao dịch xuất/nhập kho nào.
                </td>
              </tr>
            ) : (
              filtered.map((tx) => {
                const meta = TX_TYPE_CONFIG[tx.type] || { label: tx.type, cls: 'bg-slate-100 text-slate-600 border-slate-200' };
                const performer = tx.performedBy?.fullName || tx.performedByName || 'Hệ thống';
                const qtyText = tx.quantity > 0 ? `+${tx.quantity}` : `${tx.quantity}`;
                return (
                  <tr key={tx.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(tx.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}{' '}
                      • {new Date(tx.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className={`px-2 py-0.5 rounded border text-[10.5px] font-semibold ${meta.cls}`}>
                        {meta.label}
                      </span>
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">{tx.item?.name || tx.itemId}</div>
                    </td>
                    <td className={`py-2.5 px-4 text-center font-mono font-bold ${tx.quantity < 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {qtyText} {tx.item?.unit || ''}
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono font-semibold text-slate-800 dark:text-slate-200">
                      {tx.balanceAfter}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-[11px]">
                      {tx.taskId ? (
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {tx.taskId}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 font-medium text-slate-800 dark:text-slate-200">{performer}</td>
                    <td className="py-2.5 px-4 text-slate-500 max-w-[220px] truncate" title={tx.note || undefined}>
                      {tx.note || '—'}
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

export default InventoryTransactionsTable;

/**
 * Frontend/src/features/analytics/components/sla/CostBreakdownDetailModal.tsx
 *
 * Modal Chi Tiết Khoản Chi Theo Tầng & Quản Lý:
 * - Thiết kế phẳng chuẩn hệ thống: Thanh tỷ trọng 3 đoạn + Strip 3 chỉ số divide-x tương tác lọc + Danh sách divide-y liền mạch.
 * - Render qua ModalPortal (z-[1100]) hỗ trợ đầy đủ Dark Mode.
 * - Tuân thủ AGENTS.md Rule 5 & Rule 7.1 (< 300 LOC).
 */

import React, { useState, useEffect } from 'react';
import { ModalPortal } from '@/shared/modals';
import { FontAwesomeIcon, faXmark } from '@/shared/icons';
import { DepartmentCostAllocationItem, CostLineItem } from '@/types/analyticsUI';

export interface CostBreakdownDetailModalProps {
  item: DepartmentCostAllocationItem | null;
  onClose: () => void;
}

const CATEGORY_META: Record<
  CostLineItem['category'],
  { label: string; dotClass: string; badgeClass: string }
> = {
  repair: {
    label: 'Sửa chữa',
    dotClass: 'bg-rose-500',
    badgeClass: 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400',
  },
  supplies: {
    label: 'Vật tư',
    dotClass: 'bg-blue-500',
    badgeClass: 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400',
  },
  other: {
    label: 'Chi phí khác',
    dotClass: 'bg-amber-500',
    badgeClass: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400',
  },
};

export const CostBreakdownDetailModal: React.FC<CostBreakdownDetailModalProps> = ({
  item,
  onClose,
}) => {
  const [filterCat, setFilterCat] = useState<'all' | CostLineItem['category']>('all');

  useEffect(() => {
    setFilterCat('all');
  }, [item?.departmentId]);

  useEffect(() => {
    if (!item) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [item, onClose]);

  if (!item) return null;

  const items = item.costItems || [];
  const filteredItems =
    filterCat === 'all' ? items : items.filter((c) => c.category === filterCat);

  const repairTotal =
    item.repairCost ??
    items.filter((c) => c.category === 'repair').reduce((s, c) => s + c.amountVnd, 0);
  const suppliesTotal =
    item.suppliesCost ??
    items.filter((c) => c.category === 'supplies').reduce((s, c) => s + c.amountVnd, 0);
  const otherTotal =
    item.otherCost ??
    items.filter((c) => c.category === 'other').reduce((s, c) => s + c.amountVnd, 0);

  const sumTotals = repairTotal + suppliesTotal + otherTotal || item.totalCost || 1;
  const repairPct = Math.round((repairTotal / sumTotals) * 100);
  const suppliesPct = Math.round((suppliesTotal / sumTotals) * 100);
  const otherPct = Math.max(0, 100 - repairPct - suppliesPct);

  const summaryCells: {
    id: CostLineItem['category'];
    label: string;
    value: number;
    pct: number;
    dotCls: string;
  }[] = [
    { id: 'repair', label: 'Sửa chữa', value: repairTotal, pct: repairPct, dotCls: 'bg-rose-500' },
    { id: 'supplies', label: 'Vật tư', value: suppliesTotal, pct: suppliesPct, dotCls: 'bg-blue-500' },
    { id: 'other', label: 'Chi phí khác', value: otherTotal, pct: otherPct, dotCls: 'bg-amber-500' },
  ];

  return (
    <ModalPortal>
      <div
        role="dialog"
        aria-modal="true"
        onClick={onClose}
        className="fixed inset-0 z-[1100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 w-full max-w-[580px] max-h-[88vh] shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header gọn chuẩn hệ thống */}
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5 min-w-0">
              <span
                className="w-3 h-3 rounded-xs shrink-0 mt-1"
                style={{ backgroundColor: item.color }}
              />
              <div className="min-w-0">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 truncate m-0">
                  Chi Tiết Khoản Chi · {item.floorName || item.departmentName}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 mb-0 truncate">
                  {item.managerName ? `QL đại diện: ${item.managerName}` : item.departmentName} ·{' '}
                  {item.deviceCount} máy
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Tổng chi
                </div>
                <div className="text-sm font-black font-mono text-slate-900 dark:text-slate-100">
                  {item.totalCost.toLocaleString('vi-VN')} đ
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Đóng chi tiết khoản chi"
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 flex items-center justify-center border-none transition-colors cursor-pointer shrink-0"
              >
                <FontAwesomeIcon icon={faXmark} className="text-xs" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-5 flex flex-col gap-4 overflow-y-auto flex-1 custom-scrollbar">
            {/* Strip 3 ô phẳng + thanh tỷ trọng ở mép trên (chuẩn CostHealthBar) */}
            <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shrink-0">
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 flex">
                {repairTotal > 0 && (
                  <div className="h-full bg-rose-500" style={{ width: `${repairPct}%` }} />
                )}
                {suppliesTotal > 0 && (
                  <div className="h-full bg-blue-500" style={{ width: `${suppliesPct}%` }} />
                )}
                {otherTotal > 0 && (
                  <div className="h-full bg-amber-500" style={{ width: `${otherPct}%` }} />
                )}
              </div>
              <div className="grid grid-cols-3 divide-x divide-slate-100 dark:divide-slate-800">
                {summaryCells.map((cell) => {
                  const isActive = filterCat === cell.id;
                  return (
                    <button
                      key={cell.id}
                      type="button"
                      onClick={() => setFilterCat((prev) => (prev === cell.id ? 'all' : cell.id))}
                      className={`px-3.5 py-2.5 text-left border-none cursor-pointer transition-colors ${
                        isActive
                          ? 'bg-slate-100/90 dark:bg-slate-800'
                          : 'bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10.5px] font-semibold text-slate-500 dark:text-slate-400">
                        <span className="inline-flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${cell.dotCls}`} />
                          {cell.label}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">{cell.pct}%</span>
                      </div>
                      <div className="text-xs sm:text-sm font-black font-mono text-slate-900 dark:text-slate-100 mt-1">
                        {cell.value.toLocaleString('vi-VN')} đ
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Thanh lọc Segmented Control gọn */}
            <div className="flex items-center justify-between gap-2 flex-wrap shrink-0">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Danh sách khoản chi ({filteredItems.length})
              </span>
              <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 gap-0.5">
                {[
                  { id: 'all' as const, label: `Tất cả (${items.length})` },
                  { id: 'repair' as const, label: 'Sửa chữa' },
                  { id: 'supplies' as const, label: 'Vật tư' },
                  { id: 'other' as const, label: 'Chi phí khác' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFilterCat(tab.id)}
                    className={`px-2 py-1 rounded-md text-[11px] font-semibold border-none transition-all cursor-pointer ${
                      filterCat === tab.id
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs'
                        : 'bg-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Danh sách liền mạch divide-y (không đóng khung hộp rời) */}
            {filteredItems.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                Chưa có danh sách khoản chi chi tiết cho nhóm này.
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredItems.map((c) => {
                  const meta = CATEGORY_META[c.category];
                  return (
                    <div
                      key={c.id}
                      className="px-3.5 py-2.5 flex items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${meta.badgeClass}`}
                          >
                            {meta.label}
                          </span>
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                            {c.title}
                          </span>
                        </div>
                        {c.note && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {c.note}
                          </div>
                        )}
                      </div>
                      <strong className="text-xs font-mono text-slate-900 dark:text-slate-100 shrink-0">
                        {c.amountVnd.toLocaleString('vi-VN')} đ
                      </strong>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex justify-end bg-slate-50/70 dark:bg-slate-800/40 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg border-none bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};

export default CostBreakdownDetailModal;

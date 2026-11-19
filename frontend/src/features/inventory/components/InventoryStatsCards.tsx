/**
 * Frontend/src/features/inventory/components/InventoryStatsCards.tsx
 *
 * Strip KPI Phẳng 4 Ô Thống Kê Kho Vật Tư:
 * - Thiết kế đồng bộ với FleetHealthBar & TechnicianPerformanceCard (rounded-xl, divide-x).
 * - Tuân thủ AGENTS.md Rule 5 & Rule 7.1 (< 300 LOC, FontAwesome duy nhất).
 */

import React from 'react';
import { FontAwesomeIcon, faBox, faTriangleExclamation, faPrint, faWrench } from '../../../shared/icons';
import { InventoryItem } from '../types';

interface InventoryStatsCardsProps {
  items: InventoryItem[];
  isLoading?: boolean;
  lowStockOnly?: boolean;
  onToggleLowStock?: () => void;
}

export const InventoryStatsCards: React.FC<InventoryStatsCardsProps> = ({
  items,
  isLoading = false,
  lowStockOnly = false,
  onToggleLowStock,
}) => {
  const totalSkus = items.length;
  const lowStockCount = items.filter((it) => it.currentStock <= it.safetyStock).length;
  const totalTonerCount = items
    .filter((it) => it.category.toUpperCase() === 'TONER')
    .reduce((sum, it) => sum + it.currentStock, 0);
  const partsCount = items
    .filter((it) => ['DRUM', 'FUSER', 'ROLLER', 'WASTE_BOX'].includes(it.category.toUpperCase()))
    .reduce((sum, it) => sum + it.currentStock, 0);

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 dark:divide-slate-800 overflow-hidden">
      <div className="px-4 py-3 flex items-center justify-between gap-3">
        <div>
          <div className="text-[11px] font-medium text-slate-500">Tổng mặt hàng</div>
          <div className="text-lg font-extrabold font-mono text-slate-900 dark:text-slate-100 mt-0.5">
            {isLoading ? '—' : totalSkus}
          </div>
          <div className="text-[10.5px] text-slate-400">Mặt hàng đang quản lý</div>
        </div>
        <FontAwesomeIcon icon={faBox} className="text-blue-500/80 text-base shrink-0" />
      </div>

      <button
        type="button"
        onClick={onToggleLowStock}
        className={`px-4 py-3 flex items-center justify-between gap-3 text-left border-none transition-colors ${
          onToggleLowStock ? 'cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/40' : 'cursor-default'
        } ${lowStockOnly ? 'bg-rose-50/70 dark:bg-rose-950/30' : 'bg-transparent'}`}
      >
        <div>
          <div className="text-[11px] font-medium text-slate-500">Chạm ngưỡng an toàn</div>
          <div className={`text-lg font-extrabold font-mono mt-0.5 ${lowStockCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
            {isLoading ? '—' : lowStockCount}
          </div>
          <div className="text-[10.5px] text-slate-400">
            {lowStockCount > 0 ? 'Click để lọc hàng sắp hết' : 'Tồn kho ổn định'}
          </div>
        </div>
        <FontAwesomeIcon
          icon={faTriangleExclamation}
          className={`text-base shrink-0 ${lowStockCount > 0 ? 'text-rose-500' : 'text-emerald-500'}`}
        />
      </button>

      <div className="px-4 py-3 flex items-center justify-between gap-3">
        <div>
          <div className="text-[11px] font-medium text-slate-500">Mực in tồn kho</div>
          <div className="text-lg font-extrabold font-mono text-slate-900 dark:text-slate-100 mt-0.5">
            {isLoading ? '—' : `${totalTonerCount}`} <span className="text-xs font-semibold text-slate-400">hộp</span>
          </div>
          <div className="text-[10.5px] text-slate-400">Đen trắng &amp; Màu CMYK</div>
        </div>
        <FontAwesomeIcon icon={faPrint} className="text-indigo-500/80 text-base shrink-0" />
      </div>

      <div className="px-4 py-3 flex items-center justify-between gap-3">
        <div>
          <div className="text-[11px] font-medium text-slate-500">Vật tư phụ trợ</div>
          <div className="text-lg font-extrabold font-mono text-slate-900 dark:text-slate-100 mt-0.5">
            {isLoading ? '—' : `${partsCount}`} <span className="text-xs font-semibold text-slate-400">chiếc</span>
          </div>
          <div className="text-[10.5px] text-slate-400">Hộp mực thải &amp; linh kiện hãng</div>
        </div>
        <FontAwesomeIcon icon={faWrench} className="text-violet-500/80 text-base shrink-0" />
      </div>
    </div>
  );
};

export default InventoryStatsCards;

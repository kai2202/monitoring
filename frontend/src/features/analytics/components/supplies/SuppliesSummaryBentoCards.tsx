/**
 * Frontend/src/features/analytics/components/supplies/SuppliesSummaryBentoCards.tsx
 *
 * Hệ thống KPI Cards chi tiết & chuẩn hoá cho Tab /analytics/supplies:
 * - Mặc định hiển thị 4 thẻ: Khẩn cấp (<15%), Cần lưu ý (<25%), Mực thải, Hạn cạn kiệt sớm nhất.
 * - Mỗi thẻ cung cấp ngữ cảnh vận hành chi tiết (số máy ảnh hưởng, phân loại mực/cơ, tách Đầy/Sắp đầy, % & ngày hết).
 * - Tích hợp Interactive Quick-Filter (bấm thẻ để lọc trực tiếp Bảng & Biểu đồ).
 */

import React from 'react';
import {
  FontAwesomeIcon,
  faFire,
  faClock,
  faArrowTrendDown,
  faCircleCheck,
  faShieldCheck,
  faBox,
  faBoxesStacked,
} from '../../../../shared/icons';
import { SuppliesFilterMode } from './SuppliesFilterToolbar';

export type SuppliesKpiCardId = 'critical' | 'warning' | 'waste' | 'inventory' | 'soonest' | 'healthRate';

export const DEFAULT_SUPPLIES_KPI_CARDS: SuppliesKpiCardId[] = [
  'critical',
  'warning',
  'waste',
  'inventory',
];

export interface SuppliesSummaryBentoCardsProps {
  criticalCount: number;
  criticalPrinterCount?: number;
  warningCount: number;
  warningTonerCount?: number;
  warningHardwareCount?: number;
  wasteWarningCount?: number;
  wasteFullCount?: number;
  wasteSoonCount?: number;
  soonestEmptyDays?: number;
  soonestPrinterLabel?: string;
  soonestCurrentPercent?: number;
  soonestEmptyDate?: string;
  safeDeviceCount?: number;
  totalDeviceCount?: number;
  totalStockUnits?: number;
  deficitCategoriesCount?: number;
  onFocusInventory?: () => void;
  isInventoryHighlighted?: boolean;
  visibleCardIds?: SuppliesKpiCardId[];
  onSelectFilter?: (mode: SuppliesFilterMode) => void;
  activeFilter?: SuppliesFilterMode;
}

interface KpiCardDescriptor {
  id: SuppliesKpiCardId;
  title: string;
  value: string | number;
  unit: string;
  detailLine: string;
  valueClass: string;
  iconClass: string;
  activeBgClass: string;
  badgeBgClass: string;
  icon: typeof faFire;
  filterMode?: SuppliesFilterMode;
  onClickCustom?: () => void;
}

const GRID_COLS_CLASS: Record<number, string> = {
  1: 'lg:grid-cols-1',
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
  5: 'lg:grid-cols-5',
};

export const SuppliesSummaryBentoCards: React.FC<SuppliesSummaryBentoCardsProps> = ({
  criticalCount,
  criticalPrinterCount = 0,
  warningCount,
  warningTonerCount = 0,
  warningHardwareCount = 0,
  wasteWarningCount = 0,
  wasteFullCount = 0,
  wasteSoonCount = 0,
  soonestEmptyDays = 0,
  soonestPrinterLabel,
  soonestCurrentPercent,
  safeDeviceCount = 0,
  totalDeviceCount = 0,
  totalStockUnits = 0,
  deficitCategoriesCount = 0,
  onFocusInventory,
  isInventoryHighlighted = false,
  visibleCardIds = DEFAULT_SUPPLIES_KPI_CARDS,
  onSelectFilter,
  activeFilter = 'all',
}) => {
  const isCriticalSafe = criticalCount === 0;
  const isWarningSafe = warningCount === 0;
  const isWasteSafe = wasteWarningCount === 0;
  const hasValidSoonest = soonestEmptyDays > 0 && soonestEmptyDays < 999;
  const safePercent =
    totalDeviceCount > 0 ? Math.round((safeDeviceCount / totalDeviceCount) * 100) : 100;
  const isStockDeficit = deficitCategoriesCount > 0;

  const allCards: KpiCardDescriptor[] = [
    {
      id: 'critical',
      title: 'Khẩn cấp (< 15%)',
      value: criticalCount,
      unit: 'hộp mực',
      detailLine: isCriticalSafe ? '0 máy bị ảnh hưởng' : `Trên ${criticalPrinterCount} máy`,
      valueClass: isCriticalSafe ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400',
      iconClass: isCriticalSafe ? 'text-emerald-500' : 'text-rose-500',
      activeBgClass: 'bg-rose-50/70 dark:bg-rose-950/30',
      badgeBgClass: 'bg-rose-600 text-white',
      icon: isCriticalSafe ? faCircleCheck : faFire,
      filterMode: 'critical',
    },
    {
      id: 'warning',
      title: 'Cần lưu ý (< 25%)',
      value: warningCount,
      unit: 'hộp mực',
      detailLine: isWarningSafe
        ? 'Kho đệm ổn định'
        : `${warningTonerCount} mực${warningHardwareCount > 0 ? ` • ${warningHardwareCount} linh kiện` : ''}`,
      valueClass: isWarningSafe ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400',
      iconClass: isWarningSafe ? 'text-emerald-500' : 'text-amber-500',
      activeBgClass: 'bg-amber-50/70 dark:bg-amber-950/30',
      badgeBgClass: 'bg-amber-600 text-white',
      icon: isWarningSafe ? faCircleCheck : faClock,
      filterMode: 'warning',
    },
    {
      id: 'waste',
      title: 'Mực thải',
      value: wasteWarningCount,
      unit: 'máy',
      detailLine: isWasteSafe
        ? 'Hộp mực thải bình thường'
        : `${wasteFullCount} Đầy • ${wasteSoonCount} Sắp đầy`,
      valueClass: isWasteSafe ? 'text-emerald-600 dark:text-emerald-400' : 'text-orange-600 dark:text-orange-400',
      iconClass: isWasteSafe ? 'text-emerald-500' : 'text-orange-500',
      activeBgClass: 'bg-orange-50/70 dark:bg-orange-950/30',
      badgeBgClass: 'bg-orange-600 text-white',
      icon: isWasteSafe ? faCircleCheck : faBox,
      filterMode: 'waste_warning',
    },
    {
      id: 'inventory',
      title: 'Tổng Tồn Kho Sẵn Có',
      value: totalStockUnits,
      unit: 'hộp vật tư',
      detailLine: !isStockDeficit
        ? '6/6 loại vật tư đầy đủ'
        : `Thiếu ${deficitCategoriesCount} loại so với nhu cầu`,
      valueClass: !isStockDeficit ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600 dark:text-rose-400',
      iconClass: !isStockDeficit ? 'text-blue-500' : 'text-rose-500',
      activeBgClass: 'bg-blue-50/70 dark:bg-blue-950/30',
      badgeBgClass: 'bg-blue-600 text-white',
      icon: faBoxesStacked,
      onClickCustom: onFocusInventory,
    },
    {
      id: 'soonest',
      title: 'Cạn kiệt sớm nhất',
      value: hasValidSoonest ? `${soonestEmptyDays} ngày` : 'An toàn',
      unit: '',
      detailLine: hasValidSoonest
        ? `${soonestPrinterLabel || 'Thiết bị'} • ${soonestCurrentPercent ?? '—'}%`
        : 'Không có hộp mực dưới 25%',
      valueClass:
        hasValidSoonest && soonestEmptyDays <= 7
          ? 'text-rose-600 dark:text-rose-400'
          : 'text-slate-900 dark:text-slate-100',
      iconClass: hasValidSoonest && soonestEmptyDays <= 7 ? 'text-rose-500' : 'text-blue-500/80',
      activeBgClass: 'bg-slate-50/80 dark:bg-slate-800/40',
      badgeBgClass: 'bg-blue-600 text-white',
      icon: faArrowTrendDown,
    },
    {
      id: 'healthRate',
      title: 'Hạm đội an toàn',
      value: `${safePercent}%`,
      unit: totalDeviceCount > 0 ? `(${safeDeviceCount}/${totalDeviceCount})` : '',
      detailLine: `${Math.max(0, totalDeviceCount - safeDeviceCount)} máy cần chú ý`,
      valueClass:
        safePercent >= 80
          ? 'text-emerald-600 dark:text-emerald-400'
          : safePercent >= 60
          ? 'text-amber-600 dark:text-amber-400'
          : 'text-rose-600 dark:text-rose-400',
      iconClass: safePercent >= 80 ? 'text-emerald-500' : 'text-amber-500',
      activeBgClass: 'bg-emerald-50/70 dark:bg-emerald-950/30',
      badgeBgClass: 'bg-emerald-600 text-white',
      icon: faShieldCheck,
      filterMode: 'normal',
    },
  ];

  const renderedCards = allCards.filter((c) => visibleCardIds.includes(c.id));
  const lgColsClass = GRID_COLS_CLASS[renderedCards.length] || 'lg:grid-cols-4';

  return (
    <div
      className={`rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 grid grid-cols-1 sm:grid-cols-2 ${lgColsClass} divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-800 overflow-hidden shadow-xs`}
    >
      {renderedCards.map((card) => {
        const isClickable = Boolean(card.onClickCustom || (onSelectFilter && card.filterMode));
        const isActive =
          (card.id === 'inventory' && isInventoryHighlighted) ||
          Boolean(card.filterMode && activeFilter === card.filterMode);

        const handleToggle = () => {
          if (card.onClickCustom) {
            card.onClickCustom();
            return;
          }
          if (!onSelectFilter || !card.filterMode) return;
          onSelectFilter(isActive ? 'all' : card.filterMode);
        };

        return (
          <div
            key={card.id}
            role={isClickable ? 'button' : undefined}
            tabIndex={isClickable ? 0 : undefined}
            onClick={handleToggle}
            onKeyDown={(e) => {
              if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                handleToggle();
              }
            }}
            className={`px-4 py-3.5 flex items-center justify-between gap-3 transition-colors min-w-0 ${
              isClickable
                ? 'cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                : 'cursor-default'
            } ${isActive ? card.activeBgClass : 'bg-transparent'}`}
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2 h-5 flex-nowrap">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                  {card.title}
                </span>
                <span
                  aria-hidden={!isActive}
                  className={`px-1.5 py-0.5 rounded-md text-[9.5px] font-bold shrink-0 transition-opacity duration-150 ${
                    card.badgeBgClass
                  } ${isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                >
                  {card.id === 'inventory' ? 'Đang xem' : 'Đang lọc'}
                </span>
              </div>

              <div className="flex items-baseline gap-1.5 mt-0.5 flex-wrap">
                <span className={`text-xl font-extrabold font-mono tracking-tight ${card.valueClass}`}>
                  {card.value}
                </span>
                {card.unit && (
                  <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                    {card.unit}
                  </span>
                )}
              </div>

              <div
                className="text-[10.5px] text-slate-400 dark:text-slate-500 truncate mt-0.5"
                title={card.detailLine}
              >
                {card.detailLine}
              </div>
            </div>

            <FontAwesomeIcon icon={card.icon} className={`text-base shrink-0 ${card.iconClass}`} />
          </div>
        );
      })}
    </div>
  );
};

export default SuppliesSummaryBentoCards;

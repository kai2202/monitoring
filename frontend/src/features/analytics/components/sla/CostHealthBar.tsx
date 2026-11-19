/**
 * Frontend/src/features/analytics/components/sla/CostHealthBar.tsx
 *
 * Thanh Phân Bổ Ngân Sách Phẳng 1 Hàng (lấy cảm hứng từ FleetHealthBar của /printers):
 * - Thanh tiến độ 3 đoạn mảnh ở mép trên (Sửa chữa | Vật tư | Chi phí khác).
 * - 4 ô chỉ số chia cột bằng đường kẻ dọc mảnh, click để lọc nhanh bảng Phân Bổ Chi Phí bên dưới.
 * - Tuân thủ AGENTS.md Rule 5 & Rule 7.1 (< 300 LOC).
 */

import React, { useMemo } from 'react';
import { DepartmentCostAllocationItem } from '../../../../types/analyticsUI';
import { formatCompactMoney } from './CostAllocationDonutCard';

export type CostHealthFilterMode = 'all' | 'repair' | 'supplies' | 'over_avg';

export interface CostHealthBarProps {
  departments: DepartmentCostAllocationItem[];
  activeFilter: CostHealthFilterMode;
  onSelectFilter: (mode: CostHealthFilterMode) => void;
}

export const CostHealthBar: React.FC<CostHealthBarProps> = ({
  departments,
  activeFilter,
  onSelectFilter,
}) => {
  const stats = useMemo(() => {
    const totalCost = departments.reduce((s, d) => s + (d.totalCost || 0), 0);
    const totalDevices = departments.reduce((s, d) => s + (d.deviceCount || 0), 0);
    const totalRepair = departments.reduce((s, d) => s + (d.repairCost ?? 0), 0);
    const totalSupplies = departments.reduce((s, d) => s + (d.suppliesCost ?? 0), 0);
    const totalOther = departments.reduce((s, d) => s + (d.otherCost ?? 0), 0);
    const avgPerDevice = totalDevices > 0 ? Math.round(totalCost / totalDevices) : 0;
    const overAvgCount =
      avgPerDevice > 0
        ? departments.filter((d) => d.deviceCount > 0 && d.totalCost / d.deviceCount > avgPerDevice)
            .length
        : 0;

    const pct = (v: number) => (totalCost > 0 ? Number(((v / totalCost) * 100).toFixed(1)) : 0);

    return {
      totalCost,
      totalDevices,
      totalRepair,
      totalSupplies,
      totalOther,
      avgPerDevice,
      overAvgCount,
      repairPct: pct(totalRepair),
      suppliesPct: pct(totalSupplies),
      otherPct: pct(totalOther),
    };
  }, [departments]);

  if (departments.length === 0) return null;

  const cells: {
    id: CostHealthFilterMode;
    label: string;
    value: string;
    sub: string;
    dotCls: string;
    activeCls: string;
  }[] = [
    {
      id: 'all',
      label: 'Tổng ngân sách',
      value: `${stats.totalCost.toLocaleString('vi-VN')} đ`,
      sub: `${departments.length} khu vực · ${stats.totalDevices} máy`,
      dotCls: 'bg-cyan-600',
      activeCls: 'bg-cyan-50/60 dark:bg-cyan-950/20',
    },
    {
      id: 'repair',
      label: 'Chi phí sửa chữa',
      value: formatCompactMoney(stats.totalRepair),
      sub: `${stats.repairPct}% tổng ngân sách`,
      dotCls: 'bg-rose-500',
      activeCls: 'bg-rose-50/60 dark:bg-rose-950/20',
    },
    {
      id: 'supplies',
      label: 'Vật tư & tiêu hao',
      value: formatCompactMoney(stats.totalSupplies),
      sub: `${stats.suppliesPct}% tổng ngân sách`,
      dotCls: 'bg-blue-500',
      activeCls: 'bg-blue-50/60 dark:bg-blue-950/20',
    },
    {
      id: 'over_avg',
      label: 'Vượt BQ / máy',
      value: `${stats.overAvgCount} khu vực`,
      sub:
        stats.avgPerDevice > 0
          ? `Mốc BQ: ${formatCompactMoney(stats.avgPerDevice)}/máy`
          : 'Khác: ' + formatCompactMoney(stats.totalOther),
      dotCls: 'bg-amber-500',
      activeCls: 'bg-amber-50/60 dark:bg-amber-950/20',
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs overflow-hidden w-full">
      {/* Thanh tỷ trọng 3 nhóm chi mảnh ở mép trên */}
      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 flex">
        {stats.repairPct > 0 && (
          <div
            className="h-full bg-rose-500 transition-all"
            style={{ width: `${stats.repairPct}%` }}
            title={`Sửa chữa: ${stats.repairPct}%`}
          />
        )}
        {stats.suppliesPct > 0 && (
          <div
            className="h-full bg-blue-500 transition-all"
            style={{ width: `${stats.suppliesPct}%` }}
            title={`Vật tư: ${stats.suppliesPct}%`}
          />
        )}
        {stats.otherPct > 0 && (
          <div
            className="h-full bg-amber-500 transition-all"
            style={{ width: `${stats.otherPct}%` }}
            title={`Chi phí khác: ${stats.otherPct}%`}
          />
        )}
      </div>

      {/* 4 ô chia cột bằng đường kẻ mảnh (chuẩn FleetHealthBar) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 dark:divide-slate-800">
        {cells.map((cell) => {
          const isActive = activeFilter === cell.id;
          return (
            <button
              key={cell.id}
              type="button"
              onClick={() => onSelectFilter(isActive && cell.id !== 'all' ? 'all' : cell.id)}
              className={`px-4 py-3 text-left border-none cursor-pointer transition-colors flex flex-col gap-0.5 ${
                isActive
                  ? cell.activeCls
                  : 'bg-transparent hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                <span className={`w-2 h-2 rounded-full shrink-0 ${cell.dotCls}`} />
                <span>{cell.label}</span>
              </div>
              <div className="text-base font-black font-mono text-slate-900 dark:text-slate-100 mt-0.5">
                {cell.value}
              </div>
              <div className="text-[11px] text-slate-400 dark:text-slate-500">{cell.sub}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CostHealthBar;

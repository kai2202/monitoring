/**
 * Frontend/src/features/analytics/components/sla/CostAllocationDonutCard.tsx
 *
 * Cột Phải (4 cột) — Gồm 2 card nhỏ xếp chồng cân đối chiều cao với bảng bên trái:
 * 1. Card Trên: Cơ Cấu Ngân Sách (Donut SVG + Legend Top 5 khu vực đứng sát nhau).
 * 2. Card Dưới: Top Khoản Chi Lớn Nhất Kỳ Này (Gom từ costItems thực tế các tầng, bấm mở chi tiết).
 * - Tuân thủ AGENTS.md Rule 5 & Rule 7.1 (< 300 LOC).
 */

import React, { useMemo } from 'react';
import { CostLineItem, DepartmentCostAllocationItem } from '../../../../types/analyticsUI';

export interface CostAllocationDonutCardProps {
  items: DepartmentCostAllocationItem[];
  totalCost: number;
  avgFleetCostPerDevice: number;
  hoveredId: string | null;
  onHoverChange: (id: string | null) => void;
  onSelectFloorFilter?: (label: string) => void;
  onOpenDepartmentDetail?: (dept: DepartmentCostAllocationItem) => void;
}

export function formatCompactMoney(val: number): string {
  if (val >= 1_000_000) {
    const m = val / 1_000_000;
    return `${m % 1 === 0 ? m : m.toFixed(1)} tr`;
  }
  if (val >= 1_000) return `${Math.round(val / 1_000)} k`;
  return `${val} đ`;
}

const CATEGORY_DOT_CLASS: Record<CostLineItem['category'], string> = {
  repair: 'bg-rose-500',
  supplies: 'bg-blue-500',
  other: 'bg-amber-500',
};

export const CostAllocationDonutCard: React.FC<CostAllocationDonutCardProps> = ({
  items,
  totalCost,
  avgFleetCostPerDevice,
  hoveredId,
  onHoverChange,
  onSelectFloorFilter,
  onOpenDepartmentDetail,
}) => {
  const totalDevices = useMemo(
    () => items.reduce((sum, d) => sum + (d.deviceCount || 0), 0),
    [items]
  );

  const topCostItems = useMemo(() => {
    const flattened: {
      line: CostLineItem;
      dept: DepartmentCostAllocationItem;
    }[] = [];
    items.forEach((dept) => {
      (dept.costItems || []).forEach((line) => {
        flattened.push({ line, dept });
      });
    });
    return flattened
      .sort((a, b) => b.line.amountVnd - a.line.amountVnd)
      .slice(0, 3);
  }, [items]);

  const donutSegments = useMemo(() => {
    const top5 = items.slice(0, 5);
    const rest = items.slice(5);
    const chartEntries =
      rest.length > 0
        ? [
            ...top5.map((d) => ({
              id: d.departmentId,
              label: d.floorName || d.departmentName,
              cost: d.totalCost,
              color: d.color,
              isOther: false,
            })),
            {
              id: '__others__',
              label: `Khác (${rest.length})`,
              cost: rest.reduce((s, d) => s + d.totalCost, 0),
              color: '#94a3b8',
              isOther: true,
            },
          ]
        : top5.map((d) => ({
            id: d.departmentId,
            label: d.floorName || d.departmentName,
            cost: d.totalCost,
            color: d.color,
            isOther: false,
          }));

    const radius = 56;
    const circumference = 2 * Math.PI * radius;
    let cumulativeFraction = 0;

    return chartEntries.map((entry) => {
      const fraction = totalCost > 0 ? entry.cost / totalCost : 0;
      const strokeLength = fraction * circumference;
      const dashOffset = -cumulativeFraction * circumference;
      cumulativeFraction += fraction;
      return {
        ...entry,
        fraction,
        radius,
        circumference,
        strokeLength,
        dashOffset,
      };
    });
  }, [items, totalCost]);

  const hoveredEntry = donutSegments.find((s) => s.id === hoveredId) || null;

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Card 1: Cơ Cấu Ngân Sách (Donut + Legend sát nhau) */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs flex flex-col gap-3 shrink-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 m-0">
              Cơ Cấu Ngân Sách
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 mb-0">
              {items.length} khu vực · {totalDevices} thiết bị
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm font-black font-mono text-slate-900 dark:text-slate-100">
              {totalCost.toLocaleString('vi-VN')} đ
            </div>
            {avgFleetCostPerDevice > 0 && (
              <div className="text-[10.5px] font-mono text-slate-400">
                BQ: {formatCompactMoney(avgFleetCostPerDevice)}/máy
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 144 144" className="w-full h-full -rotate-90">
              <circle
                cx="72"
                cy="72"
                r="56"
                fill="none"
                stroke="currentColor"
                strokeWidth="17"
                className="text-slate-100 dark:text-slate-800"
              />
              {donutSegments.map((seg) => {
                const isHovered = hoveredId === seg.id;
                const isDimmed = hoveredId !== null && !isHovered;
                return (
                  <circle
                    key={seg.id}
                    cx="72"
                    cy="72"
                    r={seg.radius}
                    fill="none"
                    stroke={seg.color}
                    strokeWidth={isHovered ? 20 : 17}
                    strokeDasharray={`${Math.max(0, seg.strokeLength - 2)} ${seg.circumference}`}
                    strokeDashoffset={seg.dashOffset}
                    strokeLinecap="butt"
                    opacity={isDimmed ? 0.35 : 1}
                    className="transition-all duration-200 cursor-pointer"
                    onMouseEnter={() => onHoverChange(seg.id)}
                    onMouseLeave={() => onHoverChange(null)}
                  />
                );
              })}
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-3 pointer-events-none">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 truncate max-w-[78px]">
                {hoveredEntry ? hoveredEntry.label : 'Tổng chi'}
              </span>
              <span className="text-sm font-black font-mono text-slate-900 dark:text-slate-100">
                {formatCompactMoney(hoveredEntry ? hoveredEntry.cost : totalCost)}
              </span>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                {hoveredEntry
                  ? `${(hoveredEntry.fraction * 100).toFixed(1)}%`
                  : `${items.length} tầng`}
              </span>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-1 min-w-0">
            {donutSegments.map((seg) => {
              const isHovered = hoveredId === seg.id;
              return (
                <button
                  key={seg.id}
                  type="button"
                  onMouseEnter={() => onHoverChange(seg.id)}
                  onMouseLeave={() => onHoverChange(null)}
                  onClick={() => {
                    if (!seg.isOther && onSelectFloorFilter) {
                      onSelectFloorFilter(seg.label);
                    }
                  }}
                  className={`w-full flex items-center justify-between gap-1.5 px-1.5 py-0.5 rounded-md text-[11px] border-none text-left transition-colors cursor-pointer ${
                    isHovered
                      ? 'bg-slate-100 dark:bg-slate-800/80'
                      : 'bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: seg.color }}
                    />
                    <span className="text-slate-700 dark:text-slate-300 font-medium truncate">
                      {seg.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono shrink-0">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {formatCompactMoney(seg.cost)}
                    </span>
                    <span className="text-[10px] text-slate-400 w-9 text-right">
                      {(seg.fraction * 100).toFixed(1)}%
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Card 2: Spotlight Top Khoản Chi Lớn Nhất (Tạo tương phản thị giác nổi bật so với các card trắng) */}
      {topCostItems.length > 0 && (() => {
        const top3Sum = topCostItems.reduce((s, x) => s + x.line.amountVnd, 0);
        const top3Share = totalCost > 0 ? ((top3Sum / totalCost) * 100).toFixed(1) : '0.0';
        const [firstItem, ...restItems] = topCostItems;

        return (
          <div className="rounded-2xl bg-slate-900 dark:bg-slate-950 border border-slate-800 text-white p-4 shadow-sm flex flex-col gap-2.5 flex-1 min-h-[208px] justify-between overflow-hidden">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                  Trọng điểm
                </span>
                <h3 className="text-xs font-extrabold tracking-wide text-white m-0">
                  Top Khoản Chi Lớn Nhất
                </h3>
              </div>
              <span className="text-[10.5px] font-mono text-slate-400">
                {top3Share}% tổng chi
              </span>
            </div>

            {/* Hạng #1 nổi bật */}
            {firstItem && (
              <button
                type="button"
                onClick={() => onOpenDepartmentDetail?.(firstItem.dept)}
                onMouseEnter={() => onHoverChange(firstItem.dept.departmentId)}
                onMouseLeave={() => onHoverChange(null)}
                className="w-full p-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 flex items-center justify-between gap-2.5 text-left transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <span className="w-5 h-5 rounded-md bg-amber-400 text-slate-950 font-mono font-black text-[10.5px] flex items-center justify-center shrink-0 mt-0.5">
                    01
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">
                      {firstItem.line.title}
                    </div>
                    <div className="text-[10.5px] text-slate-300 truncate mt-0.5">
                      {firstItem.dept.floorName || firstItem.dept.departmentName}
                      {firstItem.line.note ? ` · ${firstItem.line.note}` : ''}
                    </div>
                  </div>
                </div>
                <span
                  className="text-sm font-black font-mono text-amber-300 shrink-0"
                  title={`${firstItem.line.amountVnd.toLocaleString('vi-VN')} đ`}
                >
                  {formatCompactMoney(firstItem.line.amountVnd)}
                </span>
              </button>
            )}

            {/* Hạng #2 & #3 gọn gàng */}
            {restItems.length > 0 && (
              <div className="flex flex-col divide-y divide-white/10">
                {restItems.map(({ line, dept }, idx) => (
                  <button
                    key={`${dept.departmentId}-${line.id}`}
                    type="button"
                    onClick={() => onOpenDepartmentDetail?.(dept)}
                    onMouseEnter={() => onHoverChange(dept.departmentId)}
                    onMouseLeave={() => onHoverChange(null)}
                    className="w-full py-1.5 first:pt-0.5 last:pb-0 flex items-center justify-between gap-2 text-left bg-transparent hover:bg-white/5 border-none rounded-lg px-1 -mx-1 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[10px] font-mono font-bold text-slate-400 w-4 shrink-0">
                        0{idx + 2}
                      </span>
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          CATEGORY_DOT_CLASS[line.category] || 'bg-slate-400'
                        }`}
                      />
                      <div className="min-w-0">
                        <div className="text-[11px] font-semibold text-slate-100 truncate">
                          {line.title}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {dept.floorName || dept.departmentName}
                        </div>
                      </div>
                    </div>
                    <span
                      className="text-[11.5px] font-bold font-mono text-slate-200 shrink-0"
                      title={`${line.amountVnd.toLocaleString('vi-VN')} đ`}
                    >
                      {formatCompactMoney(line.amountVnd)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
};

export default CostAllocationDonutCard;

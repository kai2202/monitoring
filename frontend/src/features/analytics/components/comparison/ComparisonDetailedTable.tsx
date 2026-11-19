/**
 * Frontend/src/features/analytics/components/comparison/ComparisonDetailedTable.tsx
 *
 * Bảng Ma Trận Thông Số Chi Tiết (3 Nhóm Cốt Lõi + Highlight Giá Trị Tốt Nhất):
 * 1. Sản lượng in (Tổng, Đen trắng, Màu, Tỷ lệ Màu, TB/ngày).
 * 2. Độ ổn định & Khả dụng (Uptime %, MTBF, Downtime, Số lần sự cố).
 * 3. Mực in hiện tại (K, C, M, Y).
 * - Tuân thủ AGENTS.md Rule 5 (Data Integrity: null -> '—') & Rule 7.1 (< 300 LOC).
 */

import React from 'react';
import { ComparisonDeviceKPIs } from '../../../../types/analyticsUI';

interface ComparisonDetailedTableProps {
  devicesKPIs: ComparisonDeviceKPIs[];
}

type HighlightDirection = 'max' | 'min' | 'none';

interface MetricRowConfig {
  label: string;
  direction: HighlightDirection;
  getValue: (d: ComparisonDeviceKPIs) => number | null;
  format: (val: number | null) => string;
}

function getBestValue(
  devices: ComparisonDeviceKPIs[],
  getValue: (d: ComparisonDeviceKPIs) => number | null,
  direction: HighlightDirection
): number | null {
  if (direction === 'none') return null;
  const nums = devices.map(getValue).filter((v): v is number => typeof v === 'number');
  if (nums.length < 2) return null;
  const allEqual = nums.every((v) => v === nums[0]);
  if (allEqual) return null;
  return direction === 'max' ? Math.max(...nums) : Math.min(...nums);
}

export const ComparisonDetailedTable: React.FC<ComparisonDetailedTableProps> = ({ devicesKPIs }) => {
  const groups: { title: string; badgeClass: string; rows: MetricRowConfig[] }[] = [
    {
      title: '1. Sản Lượng In (Production)',
      badgeClass: 'bg-blue-50/70 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400',
      rows: [
        {
          label: 'Tổng sản lượng (trang)',
          direction: 'max',
          getValue: (d) => d.totalPages,
          format: (v) => (v !== null ? v.toLocaleString('vi-VN') : '—'),
        },
        {
          label: 'Trang Đen trắng (Mono)',
          direction: 'none',
          getValue: (d) => d.production.monoPages,
          format: (v) => (v !== null ? v.toLocaleString('vi-VN') : '—'),
        },
        {
          label: 'Trang In màu (Color)',
          direction: 'none',
          getValue: (d) => d.production.colorPages,
          format: (v) => (v !== null ? v.toLocaleString('vi-VN') : '—'),
        },
        {
          label: 'Tỷ lệ In màu (%)',
          direction: 'none',
          getValue: (d) => d.production.colorRatioPercent,
          format: (v) => (v !== null ? `${v}%` : '—'),
        },
        {
          label: 'Trung bình / ngày (trang)',
          direction: 'max',
          getValue: (d) => d.production.avgDailyPages,
          format: (v) => (v !== null ? v.toLocaleString('vi-VN') : '—'),
        },
      ],
    },
    {
      title: '2. Độ Ổn Định & Khả Dụng (Reliability)',
      badgeClass: 'bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400',
      rows: [
        {
          label: 'Độ khả dụng (Uptime)',
          direction: 'max',
          getValue: (d) => d.uptimePercent,
          format: (v) => (v !== null ? `${v}%` : '—'),
        },
        {
          label: 'Độ ổn định (MTBF)',
          direction: 'max',
          getValue: (d) => d.mtbfHours,
          format: (v) => (v !== null ? `${v} giờ` : '—'),
        },
        {
          label: 'Thời gian dừng máy (Downtime)',
          direction: 'min',
          getValue: (d) => d.downtimeHours,
          format: (v) => (v !== null ? `${v} giờ` : '—'),
        },
        {
          label: 'Số lần sự cố phần cứng',
          direction: 'min',
          getValue: (d) => d.failureCount,
          format: (v) => (v !== null ? `${v} lần` : '—'),
        },
      ],
    },
    {
      title: '3. Mực In Hiện Tại (Consumables)',
      badgeClass: 'bg-amber-50/70 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400',
      rows: [
        {
          label: 'Mực Đen (Black - K)',
          direction: 'max',
          getValue: (d) => d.consumables.tonerBlackPercent,
          format: (v) => (v !== null ? `${v}%` : '—'),
        },
        {
          label: 'Mực Xanh (Cyan - C)',
          direction: 'max',
          getValue: (d) => d.consumables.tonerCyanPercent,
          format: (v) => (v !== null ? `${v}%` : '—'),
        },
        {
          label: 'Mực Đỏ (Magenta - M)',
          direction: 'max',
          getValue: (d) => d.consumables.tonerMagentaPercent,
          format: (v) => (v !== null ? `${v}%` : '—'),
        },
        {
          label: 'Mực Vàng (Yellow - Y)',
          direction: 'max',
          getValue: (d) => d.consumables.tonerYellowPercent,
          format: (v) => (v !== null ? `${v}%` : '—'),
        },
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 m-0">
          Bảng Thông Số Chi Tiết
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 mb-0">
          Đối chiếu 3 nhóm chỉ số cốt lõi và tự động đánh dấu giá trị tối ưu nhất ở mỗi hàng
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800">
                <th className="py-3 px-4 font-bold text-slate-600 dark:text-slate-300 w-1/3">
                  Chỉ số đối chiếu
                </th>
                {devicesKPIs.map((d) => (
                  <th key={d.printerId} className="py-3 px-4 font-extrabold text-slate-900 dark:text-slate-100">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: d.color }}
                      />
                      <span className="truncate">{d.printerName}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {groups.map((group) => (
                <React.Fragment key={group.title}>
                  <tr className={group.badgeClass}>
                    <td
                      colSpan={devicesKPIs.length + 1}
                      className="py-2 px-4 text-[10.5px] font-extrabold uppercase tracking-wider"
                    >
                      {group.title}
                    </td>
                  </tr>
                  {group.rows.map((row) => {
                    const bestVal = getBestValue(devicesKPIs, row.getValue, row.direction);
                    return (
                      <tr key={row.label} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300 font-medium">
                          {row.label}
                        </td>
                        {devicesKPIs.map((d) => {
                          const val = row.getValue(d);
                          const isBest = bestVal !== null && val === bestVal;
                          return (
                            <td key={d.printerId} className="py-2.5 px-4 font-mono">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span
                                  className={
                                    isBest
                                      ? 'font-extrabold text-emerald-600 dark:text-emerald-400'
                                      : 'font-semibold text-slate-800 dark:text-slate-200'
                                  }
                                >
                                  {row.format(val)}
                                </span>
                                {isBest && (
                                  <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[9.5px] font-sans font-bold">
                                    Tốt nhất
                                  </span>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ComparisonDetailedTable;

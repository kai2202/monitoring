/**
 * Frontend/src/features/analytics/components/supplies/SuppliesSegmentedPillCell.tsx
 *
 * Chỉ Số Mức Mực CMYK Trực Quan (CMYK Mini Progress Bars):
 * - Thiết kế dạng lưới 2x2 thanh tiến trình mini (Mini Bars) kèm số % rõ nét.
 * - Đổi màu theo ngưỡng: <15% (Đỏ khẩn cấp), 15-24% (Vàng cảnh báo), ≥25% (Màu chuẩn của mực).
 * - Sửa lỗi: 0% là hết mực thật, chỉ hiển thị '—' khi null/undefined hoặc máy Monochrome.
 * - Tuân thủ AGENTS.md Rule 5 & Rule 7.1 (< 300 LOC).
 */

import React from 'react';

export interface SuppliesSegmentedPillCellProps {
  tonerK: number | null;
  tonerC: number | null;
  tonerM: number | null;
  tonerY: number | null;
  colorCapability?: 'Monochrome' | 'Color';
}

interface TonerItemDef {
  key: string;
  label: string;
  name: string;
  value: number | null;
  colorClass: string;
  badgeBg: string;
}

export const SuppliesSegmentedPillCell: React.FC<SuppliesSegmentedPillCellProps> = ({
  tonerK,
  tonerC,
  tonerM,
  tonerY,
  colorCapability,
}) => {
  const isMono = colorCapability === 'Monochrome';

  const items: TonerItemDef[] = [
    {
      key: 'K',
      label: 'K',
      name: 'Mực Đen (K)',
      value: tonerK,
      colorClass: 'bg-slate-900 dark:bg-slate-200',
      badgeBg: 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900',
    },
    {
      key: 'C',
      label: 'C',
      name: 'Mực Xanh (C)',
      value: isMono ? null : tonerC,
      colorClass: 'bg-cyan-500',
      badgeBg: 'bg-cyan-500 text-white',
    },
    {
      key: 'M',
      label: 'M',
      name: 'Mực Đỏ (M)',
      value: isMono ? null : tonerM,
      colorClass: 'bg-rose-500',
      badgeBg: 'bg-rose-500 text-white',
    },
    {
      key: 'Y',
      label: 'Y',
      name: 'Mực Vàng (Y)',
      value: isMono ? null : tonerY,
      colorClass: 'bg-amber-400',
      badgeBg: 'bg-amber-400 text-slate-900',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 w-full max-w-[230px]">
      {items.map((item) => {
        const val = item.value;
        const isUnsupported = val === null || val === undefined;
        const isCritical = !isUnsupported && val < 15;
        const isWarning = !isUnsupported && val >= 15 && val < 25;

        const fillColor = isCritical
          ? 'bg-rose-500'
          : isWarning
          ? 'bg-amber-500'
          : item.colorClass;

        return (
          <div
            key={item.key}
            title={`${item.name}: ${isUnsupported ? 'Không hỗ trợ / Chưa có dữ liệu' : `${val}%`}`}
            className="flex items-center gap-1.5 min-w-0"
          >
            {/* Color Tag */}
            <span
              className={`w-3.5 h-3.5 rounded text-[9px] font-black flex items-center justify-center shrink-0 shadow-2xs ${
                isUnsupported ? 'bg-slate-200 dark:bg-slate-800 text-slate-400' : item.badgeBg
              }`}
            >
              {item.label}
            </span>

            {/* Progress Bar & Value */}
            <div className="flex-1 flex items-center gap-1.5 min-w-0">
              <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                {!isUnsupported && (
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${fillColor}`}
                    style={{ width: `${Math.max(4, Math.min(100, val))}%` }}
                  />
                )}
              </div>

              <span
                className={`text-[10px] font-bold font-mono shrink-0 w-7 text-right ${
                  isUnsupported
                    ? 'text-slate-400'
                    : isCritical
                    ? 'text-rose-600 dark:text-rose-400 font-extrabold'
                    : isWarning
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                {isUnsupported ? '—' : `${val}%`}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SuppliesSegmentedPillCell;

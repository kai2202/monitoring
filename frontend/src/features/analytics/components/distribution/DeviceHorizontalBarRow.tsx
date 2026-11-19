/**
 * Frontend/src/features/analytics/components/distribution/DeviceHorizontalBarRow.tsx
 *
 * Dòng Bảng Sản Lượng Thiết Bị (Enterprise Table Row):
 * - Hiển thị rộng rãi Tên máy & Vị trí, tách cột Tổng / Đen trắng / In màu rõ ràng.
 * - Thanh tỷ trọng gọn 8px dịu mắt kèm nút ghim đối chiếu nhanh.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React from 'react';
import { FontAwesomeIcon, faThumbtack } from '../../../../shared/icons';

export interface ProcessedPrinterItem {
  id: string;
  name: string;
  model: string;
  floorName: string;
  department: string;
  totalVol: number;
  monoVol: number;
  colorVol: number;
  monoPercent: number;
  colorPercent: number;
}

interface DeviceHorizontalBarRowProps {
  printer: ProcessedPrinterItem;
  idx: number;
  maxVolume: number;
  isPinned: boolean;
  onTogglePinPrinter: (id: string) => void;
}

export const DeviceHorizontalBarRow: React.FC<DeviceHorizontalBarRowProps> = ({
  printer: p,
  idx,
  maxVolume,
  isPinned,
  onTogglePinPrinter,
}) => {
  const barWidthPercent = maxVolume > 0 ? Math.max(4, (p.totalVol / maxVolume) * 100) : 0;

  return (
    <tr
      className={`transition-colors ${
        isPinned
          ? 'bg-indigo-50/50 dark:bg-indigo-950/25'
          : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
      }`}
    >
      {/* Thứ hạng */}
      <td className="py-3 px-4 w-12 font-mono text-[11px] font-semibold tabular-nums">
        <span
          className={`inline-flex items-center justify-center w-6 h-6 rounded-md ${
            idx < 3
              ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
              : 'text-slate-400 dark:text-slate-500'
          }`}
        >
          {idx + 1}
        </span>
      </td>

      {/* Thiết bị & Vị trí */}
      <td className="py-3 px-4 min-w-[220px]">
        <div className="font-semibold text-[13px] text-slate-900 dark:text-slate-100 leading-snug">
          {p.name}
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
          <span className="font-mono">{p.model}</span>
          <span className="text-slate-300 dark:text-slate-600">•</span>
          <span>
            {p.floorName} · {p.department.split('&')[0].trim()}
          </span>
        </div>
      </td>

      {/* Tổng sản lượng */}
      <td className="py-3 px-4 text-right font-mono text-xs font-semibold tabular-nums text-slate-900 dark:text-slate-100 whitespace-nowrap">
        {p.totalVol.toLocaleString('vi-VN')}
      </td>

      {/* Đen trắng (Mono) */}
      <td className="py-3 px-4 text-right font-mono text-xs tabular-nums text-slate-600 dark:text-slate-300 whitespace-nowrap">
        {p.monoVol.toLocaleString('vi-VN')}
      </td>

      {/* In màu (Color) */}
      <td className="py-3 px-4 text-right font-mono text-xs font-medium tabular-nums text-pink-600 dark:text-pink-400 whitespace-nowrap">
        {p.colorVol > 0 ? p.colorVol.toLocaleString('vi-VN') : '—'}
      </td>

      {/* Thanh tỷ trọng Mono / Color */}
      <td className="py-3 px-4 min-w-[165px]">
        <div className="flex items-center gap-2.5">
          <div
            className="w-28 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0"
            title={`Tổng: ${p.totalVol.toLocaleString('vi-VN')} trang (${p.monoPercent}% Đen trắng / ${p.colorPercent}% Màu)`}
          >
            <div
              className="h-full flex rounded-full overflow-hidden transition-all duration-300"
              style={{ width: `${barWidthPercent}%` }}
            >
              <div className="h-full bg-slate-800 dark:bg-slate-200" style={{ width: `${p.monoPercent}%` }} />
              {p.colorPercent > 0 && (
                <div className="h-full bg-pink-500" style={{ width: `${p.colorPercent}%` }} />
              )}
            </div>
          </div>
          <span className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400 w-10 text-right shrink-0">
            {p.colorPercent}% M
          </span>
        </div>
      </td>

      {/* Ghim đối chiếu */}
      <td className="py-3 px-4 text-right w-16">
        <button
          type="button"
          onClick={() => onTogglePinPrinter(p.id)}
          title={isPinned ? 'Bỏ ghim đối chiếu' : 'Ghim vào bảng đối chiếu'}
          aria-label={isPinned ? `Bỏ ghim ${p.name}` : `Ghim ${p.name}`}
          className={`w-7 h-7 rounded-lg inline-flex items-center justify-center text-[11px] transition-colors cursor-pointer ${
            isPinned
              ? 'bg-indigo-600 text-white shadow-2xs'
              : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400'
          }`}
        >
          <FontAwesomeIcon icon={faThumbtack} />
        </button>
      </td>
    </tr>
  );
};

export default DeviceHorizontalBarRow;

/**
 * Frontend/src/features/analytics/components/supplies/HighLoadFleetTableRow.tsx
 *
 * Dòng Thiết Bị Bảng Theo Dõi Mực In & Linh Kiện Trực Quan:
 * - Checkbox chọn máy in phục vụ tác vụ cấp phát hàng loạt.
 * - Cột 1: Thiết bị & Vị trí (Gộp tên, model, tầng, phòng ban gọn gàng).
 * - Cột 2: Sản lượng tháng.
 * - Cột 3: Mực CMYK dạng Mini Progress Bars trực quan 2x2.
 * - Cột 4: Linh kiện Drum, Fuser & Badge Mực thải nổi bật.
 * - Cột 5: Trạng thái Cấp phát & Dự kiến cạn (D-Day) - Ghi rõ đích danh loại mực nào sắp hết.
 * - Cột 6: Thao tác mở chẩn đoán.
 * - Tuân thủ AGENTS.md Rule 5 & Rule 7.1 (< 300 LOC).
 */

import React from 'react';
import {
  FontAwesomeIcon,
  faArrowUpRightFromSquare,
  faCircleExclamation,
  faTriangleExclamation,
  faCircleCheck,
} from '../../../../shared/icons';
import { PrinterConsumablesOverview } from '../../../../types/analyticsUI';
import { SuppliesSegmentedPillCell } from './SuppliesSegmentedPillCell';

export interface HighLoadFleetTableRowProps {
  printer: PrinterConsumablesOverview;
  isSelected?: boolean;
  onToggleSelect?: (printerId: string) => void;
  onSelectPrinter?: (printer: PrinterConsumablesOverview) => void;
}

export const HighLoadFleetTableRow: React.FC<HighLoadFleetTableRowProps> = ({
  printer: p,
  isSelected = false,
  onToggleSelect,
  onSelectPrinter,
}) => {
  const minToner = Math.min(p.tonerK ?? 100, p.tonerC ?? 100, p.tonerM ?? 100, p.tonerY ?? 100);
  const isWasteCritical = p.wasteToner === 'Đầy';
  const isWasteWarning = p.wasteToner === 'Sắp đầy';
  const isDrumCritical = (p.drumLife ?? 100) < 15;
  const isDrumWarning = (p.drumLife ?? 100) >= 15 && (p.drumLife ?? 100) < 25;

  // Tính toán số ngày cạn kiệt dự kiến dựa trên minToner
  const estDays = Math.max(1, Math.round(minToner / 2.5));
  const estDate = new Date(Date.now() + estDays * 24 * 3600 * 1000);
  const estDateStr = `${estDate.getDate()}/${estDate.getMonth() + 1}`;

  // Xác định đích danh vật tư nào đang ở mức nguy cấp nhất
  let urgencyTitle = 'Vật tư ổn định';
  let urgencySub = 'Chưa cần can thiệp';
  let urgencyLevel: 'critical' | 'warning' | 'normal' = 'normal';

  if (p.tonerK < 15) {
    urgencyTitle = `Mực Đen K cạn (${p.tonerK}%)`;
    urgencySub = `Hết sau ~${estDays} ngày (${estDateStr})`;
    urgencyLevel = 'critical';
  } else if (p.tonerC < 15) {
    urgencyTitle = `Mực Xanh C cạn (${p.tonerC}%)`;
    urgencySub = `Hết sau ~${estDays} ngày (${estDateStr})`;
    urgencyLevel = 'critical';
  } else if (p.tonerM < 15) {
    urgencyTitle = `Mực Đỏ M cạn (${p.tonerM}%)`;
    urgencySub = `Hết sau ~${estDays} ngày (${estDateStr})`;
    urgencyLevel = 'critical';
  } else if (p.tonerY < 15) {
    urgencyTitle = `Mực Vàng Y cạn (${p.tonerY}%)`;
    urgencySub = `Hết sau ~${estDays} ngày (${estDateStr})`;
    urgencyLevel = 'critical';
  } else if (isWasteCritical) {
    urgencyTitle = 'Hộp mực thải ĐẦY';
    urgencySub = 'Cần thay thế ngay';
    urgencyLevel = 'critical';
  } else if (isDrumCritical) {
    urgencyTitle = `Cụm Drum cạn (${p.drumLife}%)`;
    urgencySub = 'Cần đặt hàng Vendor';
    urgencyLevel = 'critical';
  } else if (minToner < 25) {
    const lowColor =
      p.tonerK < 25
        ? `Mực K (${p.tonerK}%)`
        : p.tonerC < 25
        ? `Mực C (${p.tonerC}%)`
        : p.tonerM < 25
        ? `Mực M (${p.tonerM}%)`
        : `Mực Y (${p.tonerY}%)`;
    urgencyTitle = `Lưu ý: ${lowColor}`;
    urgencySub = `Cần thay sau ~${estDays} ngày`;
    urgencyLevel = 'warning';
  } else if (isWasteWarning) {
    urgencyTitle = 'Mực thải sắp đầy';
    urgencySub = 'Dự phòng hộp thay thế';
    urgencyLevel = 'warning';
  } else if (isDrumWarning) {
    urgencyTitle = `Drum còn ${p.drumLife}%`;
    urgencySub = 'Theo dõi định kỳ';
    urgencyLevel = 'warning';
  }

  const wasteBadge =
    p.wasteToner === 'Đầy' ? (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10.5px] font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-800/80">
        Mực thải: Đầy
      </span>
    ) : p.wasteToner === 'Sắp đầy' ? (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10.5px] font-medium bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800/80">
        Mực thải: Sắp đầy
      </span>
    ) : (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10.5px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
        Mực thải: OK
      </span>
    );

  return (
    <tr
      onClick={() => onSelectPrinter && onSelectPrinter(p)}
      className={`transition-colors ${
        onSelectPrinter ? 'cursor-pointer' : 'cursor-default'
      } ${
        isSelected
          ? 'bg-blue-50/70 dark:bg-blue-950/40 hover:bg-blue-50 dark:hover:bg-blue-950/60'
          : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
      }`}
    >
      {/* Checkbox Column */}
      <td
        className="px-3.5 py-3 text-center w-[44px]"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect && onToggleSelect(p.printerId)}
          className="w-4 h-4 rounded text-blue-600 border-slate-300 dark:border-slate-600 focus:ring-blue-500 cursor-pointer"
        />
      </td>

      {/* Cột 1: Thiết bị & Vị trí */}
      <td className="px-4 py-3">
        <div className="flex flex-col gap-0.5 min-w-[200px]">
          <strong className="text-[13px] font-semibold text-slate-900 dark:text-slate-100 truncate">
            {p.printerName}
          </strong>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 truncate">
            <span className="font-mono text-slate-500 dark:text-slate-400 shrink-0">{p.model}</span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="truncate">
              {p.floor} — {p.department}
            </span>
          </div>
        </div>
      </td>

      {/* Cột 2: Sản lượng tháng */}
      <td className="px-4 py-3">
        <div className="flex flex-col">
          <span className="text-[13px] font-semibold font-mono tabular-nums text-slate-800 dark:text-slate-100">
            {(p.totalMonthlyVolume || 0).toLocaleString('vi-VN')}
          </span>
          <span className="text-[10.5px] text-slate-400">trang/tháng</span>
        </div>
      </td>

      {/* Cột 3: Mực CMYK */}
      <td className="px-4 py-3">
        <SuppliesSegmentedPillCell
          tonerK={p.tonerK}
          tonerC={p.tonerC}
          tonerM={p.tonerM}
          tonerY={p.tonerY}
        />
      </td>

      {/* Cột 4: Linh kiện & Mực thải */}
      <td className="px-4 py-3">
        <div className="flex flex-col gap-1.5">
          <div>{wasteBadge}</div>
          <div className="flex items-center gap-2 text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
            <span className={p.drumLife < 15 ? 'text-rose-600 dark:text-rose-400 font-semibold' : ''}>
              Drum {p.drumLife ?? '—'}%
            </span>
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <span className={p.fuserLife < 15 ? 'text-rose-600 dark:text-rose-400 font-semibold' : ''}>
              Fuser {p.fuserLife ?? '—'}%
            </span>
          </div>
        </div>
      </td>

      {/* Cột 5: Trạng thái & Dự kiến cạn */}
      <td className="px-4 py-3">
        <div className="flex flex-col items-start gap-1 max-w-[210px]">
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold ${
              urgencyLevel === 'critical'
                ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300'
                : urgencyLevel === 'warning'
                ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
            }`}
          >
            <FontAwesomeIcon
              icon={
                urgencyLevel === 'critical'
                  ? faCircleExclamation
                  : urgencyLevel === 'warning'
                  ? faTriangleExclamation
                  : faCircleCheck
              }
              className="text-[10.5px] shrink-0"
            />
            <span className="truncate">{urgencyTitle}</span>
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 pl-0.5 truncate w-full">
            {urgencySub}
          </span>
        </div>
      </td>

      {/* Cột 6: Thao tác mở Drawer */}
      <td className="px-3 py-3 text-center text-slate-400">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelectPrinter && onSelectPrinter(p);
          }}
          className="w-7 h-7 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 inline-flex items-center justify-center transition-colors cursor-pointer"
          title="Xem chẩn đoán chi tiết thiết bị"
          aria-label={`Xem chi tiết ${p.printerName}`}
        >
          <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-[11px]" />
        </button>
      </td>
    </tr>
  );
};

export default HighLoadFleetTableRow;

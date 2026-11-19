/**
 * Frontend/src/features/dashboard/components/attention/AttentionDeviceTableRow.tsx
 *
 * Dòng Hiển Thị Thiết Bị Cần Xử Lý (Tailwind + Dark Mode chuẩn hệ thống):
 * - Phân biệt rành mạch Ngoại tuyến (Offline) vs Lỗi phần cứng (Hardware) vs Vật tư.
 * - Hỗ trợ sao chép IP nhanh và nút [Tạo Phiếu] mở modal tạo phiếu bảo trì.
 * - Tuân thủ AGENTS.md Rule 5.2 & Rule 7.1 (< 300 LOC, 100% FontAwesome).
 */

import React from 'react';
import {
  FontAwesomeIcon,
  faTriangleExclamation,
  faWifi,
  faBox,
  faCopy,
  faCheck,
  faPlus,
} from '../../../../shared/icons';
import { Printer } from '../../../../types/printer';
import { AttentionCmykMiniBar } from './AttentionCmykMiniBar';

interface AttentionDeviceTableRowProps {
  printer: Printer;
  copiedIp: string | null;
  onCopyIp: (e: React.MouseEvent, ip: string) => void;
  onSelectPrinter: (printer: Printer) => void;
  onCreateTask?: (printer: Printer) => void;
}

export const AttentionDeviceTableRow: React.FC<AttentionDeviceTableRowProps> = ({
  printer,
  copiedIp,
  onCopyIp,
  onSelectPrinter,
  onCreateTask,
}) => {
  const isOffline = printer.connectionStatus === 'Offline';
  const isHardware =
    !isOffline &&
    (printer.alertSeverity === 'critical' ||
      printer.health === 'Critical' ||
      Boolean(printer.copierErr) ||
      Boolean(printer.mfpErr));

  return (
    <tr
      onClick={() => onSelectPrinter(printer)}
      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
    >
      {/* IP & Copy */}
      <td className="py-2.5 pl-4 sm:pl-5 pr-3 whitespace-nowrap">
        <button
          type="button"
          onClick={(e) => onCopyIp(e, printer.ip)}
          className="bg-transparent border-none p-0 cursor-pointer inline-flex items-center gap-1.5 font-mono text-[11.5px] text-blue-600 dark:text-blue-400 hover:underline"
        >
          <span>{printer.ip}</span>
          {copiedIp === printer.ip ? (
            <FontAwesomeIcon icon={faCheck} className="text-[10.5px] text-emerald-600" />
          ) : (
            <FontAwesomeIcon icon={faCopy} className="text-[10.5px] opacity-70" />
          )}
        </button>
      </td>

      {/* Name & Model */}
      <td className="py-2.5 px-3 min-w-[190px]">
        <div className="font-bold text-slate-900 dark:text-slate-100 truncate">
          {printer.name}
        </div>
        <div className="text-[10.5px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
          {printer.model}
        </div>
      </td>

      {/* Location */}
      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 min-w-[130px]">
        {printer.location}
      </td>

      {/* CMYK Mini Bar */}
      <td className="py-2.5 px-3">
        <AttentionCmykMiniBar printer={printer} />
      </td>

      {/* Sự Cố Hiện Tại (Tách biệt Offline vs Hardware vs Consumables) */}
      <td className="py-2.5 px-3 min-w-[210px]">
        {isOffline ? (
          <div className="flex items-start gap-2">
            <FontAwesomeIcon icon={faWifi} className="text-[11px] text-slate-500 mt-0.5 shrink-0" />
            <div>
              <div className="font-bold text-[11.5px] text-slate-700 dark:text-slate-200">
                Mất kết nối mạng (Offline)
              </div>
              <div className="text-[10px] text-slate-400">Mất SNMP / Không ping được IP</div>
            </div>
          </div>
        ) : isHardware ? (
          <div className="flex items-start gap-2">
            <FontAwesomeIcon
              icon={faTriangleExclamation}
              className="text-[11px] text-rose-500 mt-0.5 shrink-0"
            />
            <div>
              <div className="font-bold text-[11.5px] text-rose-600 dark:text-rose-400">
                Lỗi phần cứng (Hardware)
              </div>
              <div className="text-[10px] text-slate-400 truncate max-w-[200px]">
                {printer.alertText || printer.copierErr || 'Sự cố cơ khí / linh kiện'}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-2">
            <FontAwesomeIcon
              icon={faBox}
              className="text-[11px] text-amber-500 mt-0.5 shrink-0"
            />
            <div>
              <div className="font-bold text-[11.5px] text-amber-600 dark:text-amber-400">
                Vật tư chạm ngưỡng thấp
              </div>
              <div className="text-[10px] text-slate-400 truncate max-w-[200px]">
                {printer.alertText || 'Mực in hoặc linh kiện cần thay'}
              </div>
            </div>
          </div>
        )}
      </td>

      {/* Trạng Thái Badge */}
      <td className="py-2.5 px-3 whitespace-nowrap">
        <span
          className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold inline-block ${
            isOffline
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              : isHardware
              ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'
              : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400'
          }`}
        >
          {isOffline ? 'Ngoại tuyến' : isHardware ? 'Khẩn cấp' : 'Cảnh báo'}
        </span>
      </td>

      {/* Thao Tác: Nút [Tạo Phiếu] */}
      <td
        className="py-2.5 pl-3 pr-4 sm:pr-5 text-right whitespace-nowrap"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => {
            if (onCreateTask) onCreateTask(printer);
            else onSelectPrinter(printer);
          }}
          title="Tạo phiếu bảo trì mới cho thiết bị này ngay tại Dashboard"
          className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold border-none inline-flex items-center gap-1 cursor-pointer transition-colors"
        >
          <FontAwesomeIcon icon={faPlus} className="text-[9.5px]" />
          <span>Tạo Phiếu</span>
        </button>
      </td>
    </tr>
  );
};

export default AttentionDeviceTableRow;

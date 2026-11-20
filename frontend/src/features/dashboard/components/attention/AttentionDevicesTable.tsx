/**
 * Frontend/src/features/dashboard/components/attention/AttentionDevicesTable.tsx
 *
 * Bảng Thiết Bị Cần Xử Lý (Tailwind + Dark Mode chuẩn hệ thống):
 * - Bố cục liền mạch không viền lồng, tích hợp tìm kiếm (tên, IP, vị trí) & tab lọc mức độ.
 * - Phân trang cố định 5 dòng/trang, luôn giữ thanh footer ổn định không nhảy chiều cao.
 * - Tuân thủ AGENTS.md Rule 5.2, Rule 6 & Rule 7.1 (< 300 LOC).
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  FontAwesomeIcon,
  faCircleCheck,
  faChevronLeft,
  faChevronRight,
  faMagnifyingGlass,
} from '../../../../shared/icons';
import { Printer } from '../../../../types/printer';
import { AttentionDeviceTableRow } from './AttentionDeviceTableRow';

export interface AttentionDevicesTableProps {
  printers: Printer[];
  onSelectPrinter: (printer: Printer) => void;
  onCreateTask?: (printer: Printer) => void;
  activeFilterTitle?: string | null;
  onClearFilter?: () => void;
}

const PAGE_SIZE = 5;

export const AttentionDevicesTable: React.FC<AttentionDevicesTableProps> = ({
  printers,
  onSelectPrinter,
  onCreateTask,
  activeFilterTitle,
  onClearFilter,
}) => {
  const [copiedIp, setCopiedIp] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'critical' | 'warning'>('all');
  const [page, setPage] = useState<number>(1);

  useEffect(() => {
    setPage(1);
  }, [filterTab, activeFilterTitle, searchQuery, printers.length]);

  const handleCopyIp = (e: React.MouseEvent, ip: string) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(ip);
    setCopiedIp(ip);
    setTimeout(() => setCopiedIp(null), 1500);
  };

  const displayedPrinters = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return printers.filter((p) => {
      if (filterTab === 'critical') {
        const isCrit =
          p.health === 'Critical' ||
          p.alertSeverity === 'critical' ||
          p.connectionStatus === 'Offline';
        if (!isCrit) return false;
      } else if (filterTab === 'warning') {
        if (p.health !== 'Warning' && p.alertSeverity !== 'warning') return false;
      }

      if (q) {
        const match =
          (p.name || '').toLowerCase().includes(q) ||
          (p.ip || '').toLowerCase().includes(q) ||
          (p.location || '').toLowerCase().includes(q) ||
          (p.model || '').toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [printers, filterTab, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(displayedPrinters.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginatedPrinters = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return displayedPrinters.slice(start, start + PAGE_SIZE);
  }, [displayedPrinters, safePage]);

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-hidden flex flex-col w-full">
      {/* Header + Filter Toolbar */}
      <div className="p-4 sm:p-5 pb-3 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
          <h3 className="text-sm font-extrabold m-0 text-slate-900 dark:text-slate-100">
            Thiết Bị Cần Xử Lý
          </h3>
          <span className="text-[10.5px] font-semibold font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {displayedPrinters.length} máy
          </span>

          {activeFilterTitle && (
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-300 font-bold inline-flex items-center gap-1.5">
              <span>Lọc: {activeFilterTitle}</span>
              {onClearFilter && (
                <button
                  type="button"
                  onClick={onClearFilter}
                  aria-label="Xóa bộ lọc KPI"
                  className="bg-transparent border-none p-0 text-blue-600 dark:text-blue-300 cursor-pointer font-extrabold text-xs leading-none"
                >
                  ×
                </button>
              )}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative w-full sm:w-52">
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm tên máy, IP, vị trí..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs border border-slate-200/80 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
            />
          </div>

          <div className="inline-flex items-center gap-0.5 p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800">
            {[
              { id: 'all' as const, label: 'Tất cả' },
              { id: 'critical' as const, label: 'Khẩn cấp / Offline' },
              { id: 'warning' as const, label: 'Cảnh báo vật tư' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterTab(tab.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] border-none transition-all cursor-pointer ${
                  filterTab === tab.id
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold shadow-2xs'
                    : 'bg-transparent text-slate-500 dark:text-slate-400 font-medium hover:text-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table liền mạch */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left min-w-[920px] text-xs">
          <thead className="border-y border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <tr className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              <th className="py-2 pl-4 sm:pl-5 pr-3 w-[130px]">Địa chỉ IP</th>
              <th className="py-2 px-3 w-[200px]">Thiết bị</th>
              <th className="py-2 px-3 w-[140px]">Vị trí</th>
              <th className="py-2 px-3 w-[110px]">Mực CMYK</th>
              <th className="py-2 px-3 w-[220px]">Sự cố hiện tại</th>
              <th className="py-2 px-3 w-[105px]">Trạng thái</th>
              <th className="py-2 pl-3 pr-4 sm:pr-5 text-right w-[120px]">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {paginatedPrinters.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 px-6 text-center">
                  {printers.length === 0 ? (
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="w-9 h-9 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
                        <FontAwesomeIcon icon={faCircleCheck} className="text-base" />
                      </div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                        Hạm đội vận hành ổn định — 100% an toàn
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Không phát hiện sự cố phần cứng, ngoại tuyến hay cạn kiệt vật tư nào cần can thiệp.
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400">
                      Không có máy in nào khớp với bộ lọc hiện tại.
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              paginatedPrinters.map((printer) => (
                <AttentionDeviceTableRow
                  key={printer.id}
                  printer={printer}
                  copiedIp={copiedIp}
                  onCopyIp={handleCopyIp}
                  onSelectPrinter={onSelectPrinter}
                  onCreateTask={onCreateTask}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer cố định chiều cao */}
      <div className="px-4 sm:px-5 py-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 min-h-[42px]">
        <span>
          {displayedPrinters.length === 0
            ? '0 thiết bị'
            : `Hiển thị ${(safePage - 1) * PAGE_SIZE + 1}–${Math.min(
                safePage * PAGE_SIZE,
                displayedPrinters.length
              )} / ${displayedPrinters.length} thiết bị`}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={safePage <= 1 || totalPages <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-40 border-none flex items-center justify-center cursor-pointer text-slate-600 dark:text-slate-300"
          >
            <FontAwesomeIcon icon={faChevronLeft} className="text-[10px]" />
          </button>
          <span className="px-2 font-mono font-semibold text-slate-700 dark:text-slate-200">
            {safePage}/{totalPages}
          </span>
          <button
            type="button"
            disabled={safePage >= totalPages || totalPages <= 1}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-40 border-none flex items-center justify-center cursor-pointer text-slate-600 dark:text-slate-300"
          >
            <FontAwesomeIcon icon={faChevronRight} className="text-[10px]" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttentionDevicesTable;

/**
 * Frontend/src/features/analytics/components/supplies/HighLoadFleetSuppliesTable.tsx
 *
 * Bảng Mức Vật Tư Hạm Đội Máy In:
 * - Tích hợp Checkbox chọn máy in & Thanh Tác Vụ Nổi "Xác Nhận Đã Cấp Phát Hàng Loạt".
 * - Bổ sung thanh Chip lọc nhanh loại vật tư (Mực K < 15%, Mực Màu, Hộp Thải, Drum).
 * - Phân trang (10, 25, 50), sắp xếp linh hoạt, tìm kiếm tức thì.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC, FontAwesome duy nhất).
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  FontAwesomeIcon,
  faChevronLeft,
  faChevronRight,
  faMagnifyingGlass,
  faClipboardCheck,
  faXmark,
} from '../../../../shared/icons';
import { PrinterConsumablesOverview } from '../../../../types/analyticsUI';
import { HighLoadFleetTableRow } from './HighLoadFleetTableRow';

export type QuickSupplyFilter = 'all' | 'tonerK' | 'tonerColor' | 'waste' | 'drum';

export interface HighLoadFleetSuppliesTableProps {
  printers?: PrinterConsumablesOverview[];
  devices?: PrinterConsumablesOverview[];
  onSelectPrinter?: (printer: PrinterConsumablesOverview) => void;
  onSelectDevice?: (device: PrinterConsumablesOverview) => void;
  onOpenBulkConfirm?: (selectedPrinters: PrinterConsumablesOverview[]) => void;
}

type FleetSortField = 'minSupply' | 'totalMonthlyVolume' | 'printerName';

const getMinSupply = (p: PrinterConsumablesOverview) =>
  Math.min(p.tonerK, p.tonerC, p.tonerM, p.tonerY, p.drumLife, p.fuserLife);

export const HighLoadFleetSuppliesTable: React.FC<HighLoadFleetSuppliesTableProps> = ({
  printers,
  devices,
  onSelectPrinter,
  onSelectDevice,
  onOpenBulkConfirm,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<FleetSortField>('minSupply');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [quickSupply, setQuickSupply] = useState<QuickSupplyFilter>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const rawList = devices || printers || [];
  const handleSelect = onSelectDevice || onSelectPrinter;

  useEffect(() => {
    setCurrentPage(1);
  }, [rawList, quickSupply]);

  const handleToggleSort = (field: FleetSortField) => {
    if (sortBy === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortDir(field === 'totalMonthlyVolume' ? 'desc' : 'asc');
    }
    setCurrentPage(1);
  };

  const filteredPrinters = useMemo(() => {
    let list = rawList;
    if (quickSupply === 'tonerK') {
      list = list.filter((p) => p.tonerK < 15);
    } else if (quickSupply === 'tonerColor') {
      list = list.filter((p) => p.tonerC < 15 || p.tonerM < 15 || p.tonerY < 15);
    } else if (quickSupply === 'waste') {
      list = list.filter((p) => p.wasteToner === 'Đầy');
    } else if (quickSupply === 'drum') {
      list = list.filter((p) => p.drumLife < 15);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.printerName.toLowerCase().includes(q) ||
          p.model.toLowerCase().includes(q) ||
          p.floor.toLowerCase().includes(q) ||
          p.department.toLowerCase().includes(q)
      );
    }

    return [...list].sort((a, b) => {
      let diff = 0;
      if (sortBy === 'minSupply') diff = getMinSupply(a) - getMinSupply(b);
      else if (sortBy === 'totalMonthlyVolume') diff = a.totalMonthlyVolume - b.totalMonthlyVolume;
      else diff = a.printerName.localeCompare(b.printerName);
      return sortDir === 'asc' ? diff : -diff;
    });
  }, [rawList, searchQuery, sortBy, sortDir, quickSupply]);

  const totalPages = Math.max(1, Math.ceil(filteredPrinters.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const displayedPrinters = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredPrinters.slice(start, start + pageSize);
  }, [filteredPrinters, safePage, pageSize]);

  const isAllCurrentSelected = displayedPrinters.length > 0 && displayedPrinters.every((p) => selectedIds.has(p.printerId));

  const handleToggleSelectAll = () => {
    if (isAllCurrentSelected) {
      const next = new Set(selectedIds);
      displayedPrinters.forEach((p) => next.delete(p.printerId));
      setSelectedIds(next);
    } else {
      const next = new Set(selectedIds);
      displayedPrinters.forEach((p) => next.add(p.printerId));
      setSelectedIds(next);
    }
  };

  const handleToggleRow = (printerId: string) => {
    const next = new Set(selectedIds);
    if (next.has(printerId)) next.delete(printerId);
    else next.add(printerId);
    setSelectedIds(next);
  };

  const handleSelectCriticalOnly = () => {
    const crit = rawList.filter((p) => getMinSupply(p) < 15 || p.wasteToner === 'Đầy');
    setSelectedIds(new Set(crit.map((p) => p.printerId)));
  };

  const selectedPrintersList = useMemo(
    () => rawList.filter((p) => selectedIds.has(p.printerId)),
    [rawList, selectedIds]
  );

  return (
    <div className="relative rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col">
      {/* 1. Header Toolbar: Tiêu đề, Chip Lọc Nhanh & Tìm kiếm */}
      <div className="px-5 py-3.5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 m-0">
            Chi Tiết Mức Vật Tư
          </h3>
          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-600 dark:text-slate-300 tabular-nums">
            {filteredPrinters.length} máy
          </span>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Segmented filter pills */}
          <div className="inline-flex items-center p-1 rounded-xl bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 gap-0.5 flex-wrap">
            {[
              { id: 'all' as const, label: 'Tất cả', dotClass: '' },
              { id: 'tonerK' as const, label: 'Mực K < 15%', dotClass: 'bg-slate-800 dark:bg-slate-200' },
              { id: 'tonerColor' as const, label: 'Mực màu < 15%', dotClass: 'bg-cyan-500' },
              { id: 'waste' as const, label: 'Mực thải đầy', dotClass: 'bg-rose-500' },
              { id: 'drum' as const, label: 'Drum < 15%', dotClass: 'bg-violet-500' },
            ].map((chip) => {
              const isActive = quickSupply === chip.id;
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => setQuickSupply(chip.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {chip.dotClass && (
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${chip.dotClass}`} />
                  )}
                  <span>{chip.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative">
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Tìm máy in, phòng ban..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-8 pr-7 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 w-52 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
                aria-label="Xóa tìm kiếm"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <FontAwesomeIcon icon={faXmark} className="text-[11px]" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Table Data */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left min-w-[940px] text-xs">
          <thead>
            <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <th className="px-3.5 py-2.5 w-[44px] text-center">
                <input
                  type="checkbox"
                  checked={isAllCurrentSelected}
                  onChange={handleToggleSelectAll}
                  className="w-4 h-4 rounded text-blue-600 border-slate-300 dark:border-slate-600 cursor-pointer"
                  title="Chọn tất cả máy trên trang"
                />
              </th>
              <th
                onClick={() => handleToggleSort('printerName')}
                className="px-4 py-2.5 w-[250px] cursor-pointer select-none hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              >
                Thiết bị &amp; Vị trí {sortBy === 'printerName' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th
                onClick={() => handleToggleSort('totalMonthlyVolume')}
                className="px-4 py-2.5 w-[125px] cursor-pointer select-none hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              >
                Sản lượng {sortBy === 'totalMonthlyVolume' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th
                onClick={() => handleToggleSort('minSupply')}
                className="px-4 py-2.5 w-[245px] cursor-pointer select-none hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              >
                Mực CMYK {sortBy === 'minSupply' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th className="px-4 py-2.5 w-[180px]">Linh kiện &amp; Mực thải</th>
              <th className="px-4 py-2.5 w-[210px]">Trạng thái &amp; Dự kiến</th>
              <th className="px-3 py-2.5 w-[44px] text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {displayedPrinters.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-10 text-center text-xs text-slate-400 dark:text-slate-500">
                  Không tìm thấy thiết bị nào phù hợp với bộ lọc hiện tại.
                </td>
              </tr>
            ) : (
              displayedPrinters.map((p) => (
                <HighLoadFleetTableRow
                  key={p.printerId}
                  printer={p}
                  isSelected={selectedIds.has(p.printerId)}
                  onToggleSelect={handleToggleRow}
                  onSelectPrinter={handleSelect}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 3. Footer: Pagination */}
      {filteredPrinters.length > 0 && (
        <div className="px-5 py-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 flex-wrap gap-2.5">
          <div className="flex items-center gap-3">
            <span className="tabular-nums">
              Hiển thị <strong className="text-slate-700 dark:text-slate-200">{(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, filteredPrinters.length)}</strong> / <strong className="text-slate-700 dark:text-slate-200">{filteredPrinters.length}</strong> máy
            </span>
            <div className="inline-flex items-center gap-1">
              {[10, 25, 50].map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => {
                    setPageSize(sz);
                    setCurrentPage(1);
                  }}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-medium tabular-nums transition-colors cursor-pointer ${
                    pageSize === sz
                      ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center disabled:opacity-40 cursor-pointer transition-colors"
                aria-label="Trang trước"
              >
                <FontAwesomeIcon icon={faChevronLeft} className="text-[10px]" />
              </button>
              <span className="text-[11px] font-medium tabular-nums px-1.5 text-slate-600 dark:text-slate-300">
                {safePage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center disabled:opacity-40 cursor-pointer transition-colors"
                aria-label="Trang sau"
              >
                <FontAwesomeIcon icon={faChevronRight} className="text-[10px]" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* 4. Floating Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="sticky bottom-3 mx-4 my-2 px-4 py-2.5 rounded-xl bg-slate-900/95 dark:bg-slate-800/95 text-white shadow-xl flex items-center justify-between flex-wrap gap-3 z-30 animate-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-medium">
              Đã chọn <strong className="text-emerald-400 font-semibold tabular-nums">{selectedIds.size}</strong> máy in
            </span>
            <button
              type="button"
              onClick={handleSelectCriticalOnly}
              className="text-[11px] text-slate-300 hover:text-white underline underline-offset-2 ml-1 cursor-pointer"
            >
              Chọn tất cả máy &lt;15%
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <FontAwesomeIcon icon={faXmark} className="text-[11px]" />
              <span>Bỏ chọn</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenBulkConfirm && onOpenBulkConfirm(selectedPrintersList)}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FontAwesomeIcon icon={faClipboardCheck} className="text-xs" />
              <span>Xác nhận cấp phát ({selectedIds.size})</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HighLoadFleetSuppliesTable;

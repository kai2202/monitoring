/**
 * Frontend/src/features/analytics/components/sla/RecurringErrorsTable.tsx
 *
 * Bảng Thống Kê Các Mã Lỗi Lặp Lại Nhiều Nhất (Top Recurring Error Codes Table):
 * - Đồng bộ phong cách /printers: Header dot màu gọn, bảng liền mạch, cố định 5 dòng/trang.
 * - Hỗ trợ tìm kiếm nhanh, lọc mức độ (Khẩn cấp / Cảnh báo), sắp xếp cột và Drill-down Drawer.
 * - Tuân thủ AGENTS.md Rule 5 & Rule 7.1 (< 300 LOC).
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  FontAwesomeIcon,
  faCircleExclamation,
  faMagnifyingGlass,
  faChevronLeft,
  faChevronRight,
} from '@/shared/icons';
import { RecurringErrorItem } from '@/types/api';
import { RecurringErrorDetailDrawer } from './RecurringErrorDetailDrawer';

export interface RecurringErrorsTableProps {
  recurringErrors?: RecurringErrorItem[];
  onOpenTask?: (taskId: string) => void;
  onCreatePreventiveTask?: (errorItem: RecurringErrorItem) => void;
}

type ErrorSortField = 'occurrenceCount' | 'errorCode';

const PAGE_SIZE = 5;

export const RecurringErrorsTable: React.FC<RecurringErrorsTableProps> = ({
  recurringErrors = [],
  onOpenTask,
  onCreatePreventiveTask: _onCreatePreventiveTask,
}) => {
  const [selectedError, setSelectedError] = useState<RecurringErrorItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'warning'>('all');
  const [sortBy, setSortBy] = useState<ErrorSortField>('occurrenceCount');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [recurringErrors]);

  const handleToggleSort = (field: ErrorSortField) => {
    if (sortBy === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortDir(field === 'occurrenceCount' ? 'desc' : 'asc');
    }
    setCurrentPage(1);
  };

  const filteredErrors = useMemo(() => {
    let list = recurringErrors;
    if (severityFilter !== 'all') {
      list = list.filter((e) => e.severity === severityFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (e) =>
          e.errorCode.toLowerCase().includes(q) ||
          e.vendor.toLowerCase().includes(q) ||
          e.vietnameseDesc.toLowerCase().includes(q) ||
          e.topAffectedPrinters.some((p) => p.name.toLowerCase().includes(q))
      );
    }
    return [...list].sort((a, b) => {
      const diff =
        sortBy === 'occurrenceCount'
          ? a.occurrenceCount - b.occurrenceCount
          : a.errorCode.localeCompare(b.errorCode);
      return sortDir === 'asc' ? diff : -diff;
    });
  }, [recurringErrors, severityFilter, searchQuery, sortBy, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filteredErrors.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const displayedErrors = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredErrors.slice(start, start + PAGE_SIZE);
  }, [filteredErrors, safePage]);

  return (
    <div className="flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-hidden w-full">
      {/* Header & Controls */}
      <div className="p-4 sm:p-5 pb-3 flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 m-0">
              Các Mã Lỗi Hay Bị Lặp Lại Nhất
            </h3>
            <span className="text-[10.5px] font-semibold font-mono px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300">
              {filteredErrors.length} mã lỗi
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 mb-0">
            Bấm vào từng dòng để xem lịch sử phát sinh, máy bị ảnh hưởng và tạo Task kiểm tra
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex items-center gap-0.5 p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800">
            {[
              { id: 'all' as const, label: 'Tất cả' },
              { id: 'critical' as const, label: 'Khẩn cấp' },
              { id: 'warning' as const, label: 'Cảnh báo' },
            ].map((tab) => {
              const active = severityFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setSeverityFilter(tab.id);
                    setCurrentPage(1);
                  }}
                  className={`px-2 py-1 rounded-md text-[11px] border-none transition-all cursor-pointer ${
                    active
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold shadow-2xs'
                      : 'bg-transparent text-slate-500 dark:text-slate-400 font-medium hover:text-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="relative">
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Tìm mã lỗi, hãng, máy..."
              className="pl-8 pr-3 py-1.5 rounded-lg text-xs border border-slate-200/80 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 w-48"
            />
          </div>
        </div>
      </div>

      {/* Table Content */}
      {displayedErrors.length === 0 ? (
        <div className="py-10 text-center text-xs text-slate-400 border-t border-slate-100 dark:border-slate-800">
          Không tìm thấy mã lỗi nào phù hợp bộ lọc hiện tại.
        </div>
      ) : (
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="border-y border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <tr className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                <th
                  onClick={() => handleToggleSort('errorCode')}
                  className="py-2 pl-4 sm:pl-5 pr-3 cursor-pointer select-none hover:text-slate-700 dark:hover:text-slate-200"
                >
                  Hãng &amp; Mã Lỗi {sortBy === 'errorCode' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th className="py-2 px-3">Mô Tả Lỗi (Tiếng Việt)</th>
                <th
                  onClick={() => handleToggleSort('occurrenceCount')}
                  className="py-2 px-3 text-center cursor-pointer select-none hover:text-slate-700 dark:hover:text-slate-200"
                >
                  Số Lần Lặp{' '}
                  {sortBy === 'occurrenceCount' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th className="py-2 px-3">Máy Ảnh Hưởng</th>
                <th className="py-2 px-3 text-right">Mức Độ</th>
                <th className="py-2 pl-2 pr-4 sm:pr-5 w-8" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {displayedErrors.map((err) => {
                const isCritical = err.severity === 'critical';
                const topPrinter = err.topAffectedPrinters[0];
                const extraCount = Math.max(0, err.topAffectedPrinters.length - 1);

                return (
                  <tr
                    key={`${err.vendor}-${err.errorCode}`}
                    onClick={() => setSelectedError(err)}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
                  >
                    <td className="py-2.5 pl-4 sm:pl-5 pr-3 font-mono font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 transition-colors whitespace-nowrap">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-sans mr-1.5">
                        {err.vendor}
                      </span>
                      {err.errorCode}
                    </td>

                    <td
                      className="py-2.5 px-3 text-slate-700 dark:text-slate-300 max-w-[280px] truncate"
                      title={err.vietnameseDesc}
                    >
                      {err.vietnameseDesc}
                    </td>

                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-[11px]">
                        {err.occurrenceCount} lần
                      </span>
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {topPrinter ? (
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-[10.5px] font-medium max-w-[170px] truncate">
                            {topPrinter.name} ({topPrinter.count})
                          </span>
                          {extraCount > 0 && (
                            <span className="text-[10.5px] font-mono text-slate-400">
                              +{extraCount} máy khác
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">—</span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          isCritical
                            ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200/60'
                            : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200/60'
                        }`}
                      >
                        <FontAwesomeIcon icon={faCircleExclamation} className="text-[9px]" />
                        {isCritical ? 'Khẩn cấp' : 'Cảnh báo'}
                      </span>
                    </td>

                    <td className="py-2.5 pl-2 pr-4 sm:pr-5 text-right whitespace-nowrap">
                      <FontAwesomeIcon
                        icon={faChevronRight}
                        className="text-[10px] text-slate-300 group-hover:text-blue-500 transition-colors"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer Phân trang cố định 5 dòng/trang */}
      {totalPages > 1 && (
        <div className="px-4 sm:px-5 py-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span>
            Hiển thị {(safePage - 1) * PAGE_SIZE + 1}–
            {Math.min(safePage * PAGE_SIZE, filteredErrors.length)} / {filteredErrors.length} mã lỗi
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 disabled:opacity-40 border-none flex items-center justify-center cursor-pointer text-slate-600"
            >
              <FontAwesomeIcon icon={faChevronLeft} className="text-[10px]" />
            </button>
            <span className="px-2 font-mono font-semibold text-slate-700 dark:text-slate-200">
              {safePage}/{totalPages}
            </span>
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 disabled:opacity-40 border-none flex items-center justify-center cursor-pointer text-slate-600"
            >
              <FontAwesomeIcon icon={faChevronRight} className="text-[10px]" />
            </button>
          </div>
        </div>
      )}

      <RecurringErrorDetailDrawer
        errorItem={selectedError}
        isOpen={Boolean(selectedError)}
        onClose={() => setSelectedError(null)}
        onOpenTask={onOpenTask}
      />
    </div>
  );
};

export default RecurringErrorsTable;

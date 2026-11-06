/**
 * Frontend/src/features/settings/components/ErrorDictionaryTable.tsx
 *
 * Bảng Dữ Liệu Tra Cứu Từ Điển Mã Lỗi & Phân Trang Đa Tiêu Chí:
 * - Hiển thị danh sách mã lỗi phân trang động (10, 25, 50, 100, Tất cả).
 * - Bento Empty State trực quan khi không tìm thấy kết quả kèm nút "Xóa bộ lọc".
 * - Điều hướng trang thông minh với dấu ba chấm (...).
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC, sweet spot 150-250 LOC).
 */

import React from 'react';
import {
  FontAwesomeIcon,
  faChevronLeft,
  faChevronRight,
  faRotate,
  faFilter,
  faInbox,
} from '@/shared/icons';
import { PrinterErrorCode } from '@/types/api';

export interface ErrorDictionaryTableProps {
  isLoading: boolean;
  paginatedErrors: PrinterErrorCode[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
  searchQuery: string;
}

/**
 * Tạo danh sách các số trang kèm dấu '...' cho giao diện phân trang
 */
function getPageNumbers(currentPage: number, totalPages: number): (number | string)[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (currentPage <= 3) {
    return [1, 2, 3, 4, '...', totalPages];
  }
  if (currentPage >= totalPages - 2) {
    return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }
  return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
}

export const ErrorDictionaryTable: React.FC<ErrorDictionaryTableProps> = ({
  isLoading,
  paginatedErrors,
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onResetFilters,
  hasActiveFilters,
  searchQuery,
}) => {
  return (
    <>
      <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-[10.5px] uppercase tracking-wider">
              <th className="py-3 px-4">Hãng</th>
              <th className="py-3 px-4">Mã Lỗi</th>
              <th className="py-3 px-4">Tên Lỗi / Khối Linh Kiện</th>
              <th className="py-3 px-4">Mức Độ</th>
              <th className="py-3 px-4">Mô Tả Kỹ Thuật</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400 text-xs">
                  Đang nạp từ điển mã lỗi...
                </td>
              </tr>
            ) : paginatedErrors.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 px-4">
                  <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 dark:text-indigo-400 flex items-center justify-center mb-3 shadow-sm border border-indigo-100 dark:border-indigo-900/40">
                      <FontAwesomeIcon icon={hasActiveFilters ? faFilter : faInbox} className="text-xl" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1">
                      {hasActiveFilters ? 'Không tìm thấy mã lỗi phù hợp' : 'Từ điển mã lỗi hiện đang trống'}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                      {hasActiveFilters
                        ? `Không có mã lỗi nào khớp với điều kiện lọc hiện tại${
                            searchQuery ? ` ("${searchQuery}")` : ''
                          }. Hãy thử thay đổi từ khóa hoặc xóa bớt tiêu chí lọc.`
                        : 'Chưa có bản ghi nào trong hệ thống. Hãy nạp file CSV để cập nhật từ điển mã lỗi phần cứng.'}
                    </p>
                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={onResetFilters}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs shadow-sm shadow-indigo-200 dark:shadow-none flex items-center gap-2 transition-all cursor-pointer"
                      >
                        <FontAwesomeIcon icon={faRotate} className="text-xs" />
                        <span>Xóa bộ lọc và xem tất cả</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              paginatedErrors.map((err) => {
                const code = err.errorCode || (err as any).code || '—';
                const sub = err.affectedSubsystem || (err as any).subsystem || 'General';
                const isCrit = err.severity === 'Critical';
                const isWarn = err.severity === 'Warning';
                return (
                  <tr key={err.id || code} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-100">
                      {err.vendor}
                    </td>
                    <td className="py-3 px-4 font-mono font-extrabold text-indigo-600 dark:text-indigo-400">
                      {code}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-100">{err.errorName || 'Lỗi phần cứng'}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">Khối: {sub}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold ${
                          isCrit
                            ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/60'
                            : isWarn
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/60'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {err.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 text-xs max-w-sm leading-relaxed">
                      {err.description}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400 pt-2">
        {/* Số bản ghi hiển thị */}
        <div>
          {totalCount === 0 ? (
            <span>0 mã lỗi</span>
          ) : pageSize === -1 ? (
            <span>
              Hiển thị tất cả <strong className="text-slate-700 dark:text-slate-200">{totalCount}</strong> mã lỗi
            </span>
          ) : (
            <span>
              Hiển thị <strong className="text-slate-700 dark:text-slate-200">{(currentPage - 1) * pageSize + 1}</strong> -{' '}
              <strong className="text-slate-700 dark:text-slate-200">{Math.min(currentPage * pageSize, totalCount)}</strong> trên tổng số{' '}
              <strong className="text-slate-700 dark:text-slate-200">{totalCount}</strong> mã lỗi
            </span>
          )}
        </div>

        {/* Cấu hình kích thước trang & Nút chuyển trang */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-[11.5px]">Số dòng / trang:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={-1}>Tất cả</option>
            </select>
          </div>

          {totalPages > 1 && pageSize !== -1 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => onPageChange(currentPage - 1)}
                className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center transition-colors"
                title="Trang trước"
              >
                <FontAwesomeIcon icon={faChevronLeft} className="text-[10px]" />
              </button>

              {getPageNumbers(currentPage, totalPages).map((p, idx) => {
                if (p === '...') {
                  return (
                    <span key={`ellipsis-${idx}`} className="px-1 text-slate-400 select-none">
                      ...
                    </span>
                  );
                }
                const pageNum = Number(p);
                const isActive = pageNum === currentPage;
                return (
                  <button
                    key={`page-${pageNum}`}
                    type="button"
                    onClick={() => onPageChange(pageNum)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => onPageChange(currentPage + 1)}
                className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center transition-colors"
                title="Trang kế tiếp"
              >
                <FontAwesomeIcon icon={faChevronRight} className="text-[10px]" />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ErrorDictionaryTable;

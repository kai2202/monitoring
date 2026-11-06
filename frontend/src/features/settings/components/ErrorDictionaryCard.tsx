/**
 * Frontend/src/features/settings/components/ErrorDictionaryCard.tsx
 *
 * Thẻ Tra Cứu Từ Điển Mã Lỗi Phần Cứng Đa Thương Hiệu:
 * - Tra cứu mã SC (Ricoh), E (Canon), 50-70 (HP), Epson...
 * - Tìm kiếm thời gian thực tích hợp Debounce (250ms), hỗ trợ tra cứu đa từ khóa (AND/OR).
 * - Bộ lọc Hãng sản xuất, Mức độ nghiêm trọng và Khối linh kiện phần cứng.
 * - Phân trang động (10, 25, 50, 100, Tất cả) và nút Đặt lại bộ lọc trực quan.
 * - Hỗ trợ Nạp CSV với validation & Xuất CSV chuẩn UTF-8 BOM.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC, sweet spot 150-250 LOC).
 */

import React, { useState, useMemo } from 'react';
import { toast } from 'sonner';
import {
  FontAwesomeIcon,
  faMagnifyingGlass,
  faMicrochip,
  faFileCsv,
  faDownload,
  faRotate,
  faXmark,
} from '@/shared/icons';
import { useDebounce } from '@/shared/hooks';
import { PrinterErrorCode } from '@/types/api';
import { exportErrorDictionaryToCsv } from '../utils/errorDictionaryCsvHelper';
import {
  SUBSYSTEM_LABELS,
  filterErrorDictionary,
  countActiveFilters,
  extractAvailableSubsystems,
} from '../utils/errorDictionaryFilterHelper';
import { CsvImportModal } from './modals';
import { ErrorDictionaryTable } from './ErrorDictionaryTable';

interface ErrorDictionaryCardProps {
  errorDict: PrinterErrorCode[];
  isLoading: boolean;
  onReloadDictionary?: () => void;
}

export const ErrorDictionaryCard: React.FC<ErrorDictionaryCardProps> = ({
  errorDict,
  isLoading,
  onReloadDictionary,
}) => {
  const [errorSearch, setErrorSearch] = useState('');
  const debouncedSearch = useDebounce(errorSearch, 250);
  const [vendorFilter, setVendorFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [subsystemFilter, setSubsystemFilter] = useState('all');
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [customErrors, setCustomErrors] = useState<PrinterErrorCode[]>([]);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const combinedErrors = useMemo(() => {
    return [...customErrors, ...errorDict];
  }, [customErrors, errorDict]);

  const availableSubsystems = useMemo(() => {
    return extractAvailableSubsystems(combinedErrors);
  }, [combinedErrors]);

  const filteredErrors = useMemo(() => {
    return filterErrorDictionary(
      combinedErrors,
      debouncedSearch,
      vendorFilter,
      severityFilter,
      subsystemFilter
    );
  }, [combinedErrors, debouncedSearch, vendorFilter, severityFilter, subsystemFilter]);

  const activeFilterCount = useMemo(() => {
    return countActiveFilters(errorSearch, vendorFilter, severityFilter, subsystemFilter);
  }, [errorSearch, vendorFilter, severityFilter, subsystemFilter]);

  const handleResetFilters = () => {
    setErrorSearch('');
    setVendorFilter('all');
    setSeverityFilter('all');
    setSubsystemFilter('all');
    setCurrentPage(1);
  };

  const totalPages = pageSize === -1 ? 1 : Math.max(1, Math.ceil(filteredErrors.length / pageSize));
  const paginatedErrors = useMemo(() => {
    if (pageSize === -1) return filteredErrors;
    const start = (currentPage - 1) * pageSize;
    return filteredErrors.slice(start, start + pageSize);
  }, [filteredErrors, currentPage, pageSize]);

  const handleImportSuccess = (importedRows: PrinterErrorCode[]) => {
    if (onReloadDictionary) {
      setCustomErrors([]);
      onReloadDictionary();
    } else {
      setCustomErrors((prev) => [...importedRows, ...prev]);
    }
    toast.success(`Đã nạp thành công ${importedRows.length} mã lỗi từ file CSV.`);
  };

  const handleExportCsv = () => {
    if (combinedErrors.length === 0) {
      toast.warning('Không có dữ liệu mã lỗi để xuất.');
      return;
    }
    exportErrorDictionaryToCsv(combinedErrors);
    toast.success('Đã xuất file CSV từ điển mã lỗi chuẩn UTF-8 BOM thành công!');
  };

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-4">
      {/* 1. Tiêu đề & Hành động xuất/nhập */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-sm">
            <FontAwesomeIcon icon={faMicrochip} className="text-base" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Từ Điển Mã Lỗi Phần Cứng Đa Thương Hiệu
            </h2>
            <p className="text-[11.5px] text-slate-500 dark:text-slate-400 mt-0.5">
              Bảng tra cứu chuẩn hóa mã SC (Ricoh), mã E (Canon), mã 50-70 (HP) phục vụ chẩn đoán kỹ thuật
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleExportCsv}
            className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <FontAwesomeIcon icon={faDownload} className="text-xs text-emerald-600" />
            <span>Xuất CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCsvModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold border border-indigo-200/60 flex items-center gap-1.5 transition-colors"
          >
            <FontAwesomeIcon icon={faFileCsv} className="text-xs" />
            <span>Nạp CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Thanh Tìm kiếm Realtime & Bộ lọc Đa tiêu chí */}
      <div className="flex items-center justify-between flex-wrap gap-2.5">
        <div className="relative flex-1 min-w-[220px]">
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"
          />
          <input
            type="text"
            placeholder="Tìm theo mã lỗi, tên lỗi, khối linh kiện..."
            value={errorSearch}
            onChange={(e) => {
              setErrorSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-8 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none focus:border-indigo-500 transition-colors"
          />
          {errorSearch && (
            <button
              type="button"
              onClick={() => {
                setErrorSearch('');
                setCurrentPage(1);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
              title="Xóa tìm kiếm"
            >
              <FontAwesomeIcon icon={faXmark} className="text-xs" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Lọc Hãng */}
          <select
            value={vendorFilter}
            onChange={(e) => {
              setVendorFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
          >
            <option value="all">Tất cả hãng</option>
            <option value="Ricoh">Ricoh</option>
            <option value="Canon">Canon</option>
            <option value="HP">HP</option>
            <option value="Epson">Epson</option>
            <option value="General">Chung (General)</option>
          </select>

          {/* Lọc Mức độ */}
          <select
            value={severityFilter}
            onChange={(e) => {
              setSeverityFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
          >
            <option value="all">Tất cả mức độ</option>
            <option value="Critical">Critical (Nguy cấp)</option>
            <option value="Warning">Warning (Cảnh báo)</option>
            <option value="Info">Info (Thông tin)</option>
          </select>

          {/* Lọc Khối linh kiện */}
          <select
            value={subsystemFilter}
            onChange={(e) => {
              setSubsystemFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
          >
            <option value="all">Tất cả khối linh kiện</option>
            {availableSubsystems.map((sub) => (
              <option key={sub} value={sub}>
                {SUBSYSTEM_LABELS[sub] || sub}
              </option>
            ))}
          </select>

          {/* Nút Đặt lại bộ lọc */}
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-semibold border border-rose-200/60 dark:border-rose-900/40 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Đặt lại toàn bộ tiêu chí tìm kiếm & lọc"
            >
              <FontAwesomeIcon icon={faRotate} className="text-[10.5px]" />
              <span>Đặt lại ({activeFilterCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Bảng Dữ Liệu Tra Cứu (Sub-Component) */}
      <ErrorDictionaryTable
        isLoading={isLoading}
        paginatedErrors={paginatedErrors}
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={filteredErrors.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setCurrentPage(1);
        }}
        onResetFilters={handleResetFilters}
        hasActiveFilters={activeFilterCount > 0}
        searchQuery={debouncedSearch}
      />

      {/* 4. Modal nạp CSV */}
      <CsvImportModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        onImportSuccess={handleImportSuccess}
        existingCodes={combinedErrors}
      />
    </div>
  );
};

export default ErrorDictionaryCard;

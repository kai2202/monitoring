/**
 * Frontend/src/features/settings/components/ErrorDictionaryCard.tsx
 *
 * Thẻ Tra Cứu & Quản Trị Vòng Đời Từ Điển Mã Lỗi Phần Cứng Đa Thương Hiệu:
 * - Hiển thị thời điểm nạp bộ CSV hiện hành để đối chiếu & cập nhật (`CsvDatasetStatusBanner`).
 * - Cho phép gỡ hoàn toàn bộ CSV khỏi cơ sở dữ liệu và chỉ khôi phục khi nạp CSV mới.
 * - Khung thông báo các mã lỗi phát sinh chưa tích hợp vào CSV (`UnmappedErrorCodesPanel`),
 *   tự động ẩn đi ngay khi nạp CSV chứa mã lỗi tương ứng.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC, 100% FontAwesome).
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';
import {
  FontAwesomeIcon,
  faMicrochip,
  faFileCsv,
  faDownload,
} from '@/shared/icons';
import { useDebounce } from '@/shared/hooks';
import { PrinterErrorCode } from '@/types/api';
import { settingsService } from '@/services';
import { setUnmappedErrors } from '@/app/slices/notificationSlice';
import {
  CsvImportApiResult,
  ErrorDictionaryLifecycleStatus,
} from '@/services/interfaces/ISettingsService';
import { exportErrorDictionaryToCsv } from '../utils/errorDictionaryCsvHelper';
import {
  filterErrorDictionary,
  countActiveFilters,
  extractAvailableSubsystems,
} from '../utils/errorDictionaryFilterHelper';
import { CsvImportModal } from './modals';
import { ErrorDictionaryTable } from './ErrorDictionaryTable';
import {
  CsvDatasetStatusBanner,
  UnmappedErrorCodesPanel,
  ErrorDictionaryFilterBar,
} from './dictionary';

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
  const dispatch = useDispatch();
  const [errorSearch, setErrorSearch] = useState('');
  const debouncedSearch = useDebounce(errorSearch, 250);
  const [vendorFilter, setVendorFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [subsystemFilter, setSubsystemFilter] = useState('all');
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [customErrors, setCustomErrors] = useState<PrinterErrorCode[]>([]);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [lifecycleStatus, setLifecycleStatus] = useState<ErrorDictionaryLifecycleStatus | null>(null);
  const [isUnloading, setIsUnloading] = useState(false);

  const fetchLifecycle = useCallback(async () => {
    try {
      const status = await settingsService.getErrorDictionaryStatus();
      setLifecycleStatus(status);
      if (status?.unmappedCodes) {
        dispatch(setUnmappedErrors(status.unmappedCodes));
      }
    } catch {
      // Giữ trạng thái hiện tại nếu chưa phản hồi
    }
  }, [dispatch]);

  useEffect(() => {
    fetchLifecycle();
  }, [fetchLifecycle, errorDict.length]);

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

  const handleImportSuccess = (importedRows: PrinterErrorCode[], apiRes?: CsvImportApiResult) => {
    if (apiRes?.lifecycle) {
      setLifecycleStatus(apiRes.lifecycle);
      if (apiRes.lifecycle.unmappedCodes) {
        dispatch(setUnmappedErrors(apiRes.lifecycle.unmappedCodes));
      }
    } else {
      fetchLifecycle();
    }

    if (onReloadDictionary) {
      setCustomErrors([]);
      onReloadDictionary();
    } else {
      setCustomErrors((prev) => [...importedRows, ...prev]);
    }

    if (apiRes?.resolvedUnmappedCount && apiRes.resolvedUnmappedCount > 0) {
      toast.success(
        `Đã nạp ${importedRows.length} mã lỗi CSV (Đã tự động đối chiếu & gỡ ${apiRes.resolvedUnmappedCount} thông báo mã chưa tích hợp)!`
      );
    } else {
      toast.success(`Đã nạp thành công ${importedRows.length} mã lỗi từ file CSV.`);
    }
  };

  const handleUnloadConfirm = async () => {
    setIsUnloading(true);
    try {
      const res = await settingsService.unloadErrorDictionaryCsv();
      setCustomErrors([]);
      setLifecycleStatus(res.lifecycle);
      if (res.lifecycle?.unmappedCodes) {
        dispatch(setUnmappedErrors(res.lifecycle.unmappedCodes));
      }
      if (onReloadDictionary) {
        onReloadDictionary();
      }
      toast.success(`Đã gỡ hoàn toàn ${res.removedCount} mã lỗi CSV ra khỏi cơ sở dữ liệu!`);
    } catch (err: any) {
      toast.error(err?.message || 'Không thể gỡ bộ từ điển CSV khỏi cơ sở dữ liệu');
    } finally {
      setIsUnloading(false);
    }
  };

  const handleExportCsv = () => {
    if (combinedErrors.length === 0) {
      toast.warning('Không có dữ liệu mã lỗi trong cơ sở dữ liệu để xuất.');
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
              Quản trị vòng đời bộ nạp CSV, đối chiếu thời gian cập nhật và tự động phát hiện mã lỗi chưa tích hợp
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleExportCsv}
            className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FontAwesomeIcon icon={faDownload} className="text-xs text-emerald-600" />
            <span>Xuất CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCsvModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold border border-indigo-200/60 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FontAwesomeIcon icon={faFileCsv} className="text-xs" />
            <span>Nạp CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Trạng thái Bộ nạp CSV (Thời gian nạp & Nút Gỡ bộ CSV) */}
      <CsvDatasetStatusBanner
        dataset={lifecycleStatus?.activeDataset ?? null}
        isUnloading={isUnloading}
        onUnloadConfirm={handleUnloadConfirm}
        onOpenImportModal={() => setIsCsvModalOpen(true)}
      />

      {/* 3. Danh sách Thông báo Mã lỗi phát sinh chưa được tích hợp vào CSV */}
      {lifecycleStatus && (
        <UnmappedErrorCodesPanel unmappedCodes={lifecycleStatus.unmappedCodes} />
      )}

      {/* 4. Thanh Tìm kiếm Realtime & Bộ lọc Đa tiêu chí */}
      <ErrorDictionaryFilterBar
        errorSearch={errorSearch}
        vendorFilter={vendorFilter}
        severityFilter={severityFilter}
        subsystemFilter={subsystemFilter}
        availableSubsystems={availableSubsystems}
        activeFilterCount={activeFilterCount}
        onSearchChange={(val) => {
          setErrorSearch(val);
          setCurrentPage(1);
        }}
        onVendorChange={(val) => {
          setVendorFilter(val);
          setCurrentPage(1);
        }}
        onSeverityChange={(val) => {
          setSeverityFilter(val);
          setCurrentPage(1);
        }}
        onSubsystemChange={(val) => {
          setSubsystemFilter(val);
          setCurrentPage(1);
        }}
        onResetFilters={handleResetFilters}
      />

      {/* 5. Bảng Dữ Liệu Tra Cứu */}
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

      {/* 6. Modal nạp CSV */}
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

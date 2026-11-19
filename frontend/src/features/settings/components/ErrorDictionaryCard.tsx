/**
 * Frontend/src/features/settings/components/ErrorDictionaryCard.tsx
 *
 * Thẻ Tra Cứu & Quản Trị Vòng Đời Từ Điển Mã Lỗi Phần Cứng Đa Thương Hiệu:
 * - Vòng đời bộ nạp CSV (hiển thị thời điểm, nạp mới, gỡ bỏ, tải template).
 * - Bổ sung nút Thêm/Sửa mã lỗi trực tiếp & Xóa mã lỗi đơn lẻ.
 * - Khung thông báo các mã lỗi phát sinh chưa tích hợp vào CSV (Unmapped codes).
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
  faPlus,
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
import { CsvImportModal, ErrorCodeEditModal } from './modals';
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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingErrorCode, setEditingErrorCode] = useState<PrinterErrorCode | null>(null);
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
      // Giữ trạng thái hiện tại
    }
  }, [dispatch]);

  useEffect(() => {
    fetchLifecycle();
  }, [fetchLifecycle, errorDict.length]);

  const combinedErrors = useMemo(() => {
    const map = new Map<string, PrinterErrorCode>();
    for (const item of [...customErrors, ...errorDict]) {
      map.set(`${item.vendor.toLowerCase()}::${item.errorCode.toUpperCase()}`, item);
    }
    return Array.from(map.values());
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
    return countActiveFilters(debouncedSearch, vendorFilter, severityFilter, subsystemFilter);
  }, [debouncedSearch, vendorFilter, severityFilter, subsystemFilter]);

  const totalPages = useMemo(() => {
    if (pageSize === -1) return 1;
    return Math.max(1, Math.ceil(filteredErrors.length / pageSize));
  }, [filteredErrors.length, pageSize]);

  const paginatedErrors = useMemo(() => {
    if (pageSize === -1) return filteredErrors;
    const startIndex = (currentPage - 1) * pageSize;
    return filteredErrors.slice(startIndex, startIndex + pageSize);
  }, [filteredErrors, currentPage, pageSize]);

  const handleResetFilters = () => {
    setErrorSearch('');
    setVendorFilter('all');
    setSeverityFilter('all');
    setSubsystemFilter('all');
    setCurrentPage(1);
  };

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

    toast.success(`Đã nạp thành công ${importedRows.length} mã lỗi từ file CSV.`);
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
      if (onReloadDictionary) onReloadDictionary();
      toast.success(`Đã gỡ hoàn toàn ${res.removedCount} mã lỗi CSV ra khỏi cơ sở dữ liệu!`);
    } catch (err: any) {
      toast.error(err?.message || 'Không thể gỡ bộ từ điển CSV');
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

  const handleDownloadTemplate = () => {
    const csvContent =
      '\uFEFFVendor,ErrorCode,ErrorName,Subsystem,Severity,Description\n' +
      'HP,50.2,Fuser Error,Fuser,Critical,"Lỗi quá nhiệt bộ phận sấy, cần kiểm tra thermistor và nguồn cấp"\n' +
      'Canon,E000-0001,Fixing Temperature Error,Fuser,Critical,"Nhiệt độ sấy tăng không đạt chuẩn sau khi bật nguồn"\n' +
      'Ricoh,SC-542,Fuser Warm-up Error,Fuser,Critical,"Lỗi gia nhiệt cụm sấy không đạt ngưỡng trong thời gian quy định"\n';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'mau_tu_dien_ma_loi_chuan.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Đã tải xuống file mẫu CSV chuẩn');
  };

  const handleSaveErrorSuccess = (saved: PrinterErrorCode) => {
    setCustomErrors((prev) => {
      const idx = prev.findIndex((e) => e.id === saved.id || (e.errorCode === saved.errorCode && e.vendor === saved.vendor));
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [saved, ...prev];
    });
    if (onReloadDictionary) onReloadDictionary();
    toast.success(`Đã lưu thành công mã lỗi ${saved.errorCode}`);
  };

  const handleDeleteError = async (item: PrinterErrorCode) => {
    const confirmed = window.confirm(`Bạn có chắc chắn muốn xóa mã lỗi ${item.errorCode} (${item.vendor})?`);
    if (!confirmed) return;
    try {
      await settingsService.deleteErrorCode(item.id);
      setCustomErrors((prev) => prev.filter((e) => e.id !== item.id));
      if (onReloadDictionary) onReloadDictionary();
      toast.success(`Đã xóa mã lỗi ${item.errorCode} thành công`);
    } catch (err: any) {
      toast.error(err?.message || 'Không thể xóa mã lỗi');
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-4">
      {/* 1. Tiêu đề & Hành động */}
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
              Quản trị vòng đời bộ nạp CSV, tra cứu chẩn đoán kỹ thuật và phát hiện mã lỗi chưa chuẩn hóa
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleDownloadTemplate}
            title="Tải mẫu file CSV chuẩn"
            className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FontAwesomeIcon icon={faDownload} className="text-xs text-slate-500" />
            <span>Mẫu CSV</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            title="Xuất toàn bộ mã lỗi ra CSV"
            className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FontAwesomeIcon icon={faDownload} className="text-xs text-emerald-600" />
            <span>Xuất CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCsvModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold border border-indigo-200/60 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FontAwesomeIcon icon={faFileCsv} className="text-xs" />
            <span>Nạp CSV</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEditingErrorCode(null);
              setIsEditModalOpen(true);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FontAwesomeIcon icon={faPlus} className="text-xs" />
            <span>+ Thêm mã lỗi</span>
          </button>
        </div>
      </div>

      {/* 2. Trạng thái Bộ nạp CSV */}
      <CsvDatasetStatusBanner
        dataset={lifecycleStatus?.activeDataset ?? null}
        isUnloading={isUnloading}
        onUnloadConfirm={handleUnloadConfirm}
        onOpenImportModal={() => setIsCsvModalOpen(true)}
      />

      {/* 3. Panel Mã lỗi chưa định danh */}
      {lifecycleStatus && (
        <UnmappedErrorCodesPanel unmappedCodes={lifecycleStatus.unmappedCodes} />
      )}

      {/* 4. Bộ lọc & Tìm kiếm */}
      <ErrorDictionaryFilterBar
        errorSearch={errorSearch}
        vendorFilter={vendorFilter}
        severityFilter={severityFilter}
        subsystemFilter={subsystemFilter}
        availableSubsystems={availableSubsystems}
        activeFilterCount={activeFilterCount}
        onSearchChange={(val) => { setErrorSearch(val); setCurrentPage(1); }}
        onVendorChange={(val) => { setVendorFilter(val); setCurrentPage(1); }}
        onSeverityChange={(val) => { setSeverityFilter(val); setCurrentPage(1); }}
        onSubsystemChange={(val) => { setSubsystemFilter(val); setCurrentPage(1); }}
        onResetFilters={handleResetFilters}
      />

      {/* 5. Bảng dữ liệu tra cứu */}
      <ErrorDictionaryTable
        isLoading={isLoading}
        paginatedErrors={paginatedErrors}
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={filteredErrors.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={(newSize) => { setPageSize(newSize); setCurrentPage(1); }}
        onResetFilters={handleResetFilters}
        hasActiveFilters={activeFilterCount > 0}
        searchQuery={debouncedSearch}
        onEditError={(item) => {
          setEditingErrorCode(item);
          setIsEditModalOpen(true);
        }}
        onDeleteError={handleDeleteError}
      />

      {/* 6. Modals */}
      <CsvImportModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        onImportSuccess={handleImportSuccess}
        existingCodes={combinedErrors}
      />
      <ErrorCodeEditModal
        isOpen={isEditModalOpen}
        errorCodeItem={editingErrorCode}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleSaveErrorSuccess}
      />
    </div>
  );
};

export default ErrorDictionaryCard;

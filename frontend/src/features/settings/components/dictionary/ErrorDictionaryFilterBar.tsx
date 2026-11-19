/**
 * Frontend/src/features/settings/components/dictionary/ErrorDictionaryFilterBar.tsx
 *
 * Thanh Tìm Kiếm Thời Gian Thực & Bộ Lọc Đa Tiêu Chí cho Từ Điển Mã Lỗi:
 * - Tách riêng để giữ `ErrorDictionaryCard.tsx` gọn nhẹ (< 200 LOC).
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC, 100% FontAwesome).
 */

import React from 'react';
import {
  FontAwesomeIcon,
  faMagnifyingGlass,
  faRotate,
  faXmark,
} from '@/shared/icons';
import { SUBSYSTEM_LABELS } from '../../utils/errorDictionaryFilterHelper';

interface ErrorDictionaryFilterBarProps {
  errorSearch: string;
  vendorFilter: string;
  severityFilter: string;
  subsystemFilter: string;
  availableSubsystems: string[];
  activeFilterCount: number;
  onSearchChange: (val: string) => void;
  onVendorChange: (val: string) => void;
  onSeverityChange: (val: string) => void;
  onSubsystemChange: (val: string) => void;
  onResetFilters: () => void;
}

export const ErrorDictionaryFilterBar: React.FC<ErrorDictionaryFilterBarProps> = ({
  errorSearch,
  vendorFilter,
  severityFilter,
  subsystemFilter,
  availableSubsystems,
  activeFilterCount,
  onSearchChange,
  onVendorChange,
  onSeverityChange,
  onSubsystemChange,
  onResetFilters,
}) => {
  return (
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
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-8 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none focus:border-indigo-500 transition-colors"
        />
        {errorSearch && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
            title="Xóa tìm kiếm"
          >
            <FontAwesomeIcon icon={faXmark} className="text-xs" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <select
          value={vendorFilter}
          onChange={(e) => onVendorChange(e.target.value)}
          className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
        >
          <option value="all">Tất cả hãng</option>
          <option value="Ricoh">Ricoh</option>
          <option value="Canon">Canon</option>
          <option value="HP">HP</option>
          <option value="Epson">Epson</option>
          <option value="Brother">Brother</option>
          <option value="Toshiba">Toshiba</option>
          <option value="General">Chung (General)</option>
        </select>

        <select
          value={severityFilter}
          onChange={(e) => onSeverityChange(e.target.value)}
          className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
        >
          <option value="all">Tất cả mức độ</option>
          <option value="Critical">Critical (Nguy cấp)</option>
          <option value="Warning">Warning (Cảnh báo)</option>
          <option value="Info">Info (Thông tin)</option>
        </select>

        <select
          value={subsystemFilter}
          onChange={(e) => onSubsystemChange(e.target.value)}
          className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
        >
          <option value="all">Tất cả khối linh kiện</option>
          {availableSubsystems.map((sub) => (
            <option key={sub} value={sub}>
              {SUBSYSTEM_LABELS[sub] || sub}
            </option>
          ))}
        </select>

        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={onResetFilters}
            className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-semibold border border-rose-200/60 dark:border-rose-900/40 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Đặt lại toàn bộ tiêu chí tìm kiếm & lọc"
          >
            <FontAwesomeIcon icon={faRotate} className="text-[10.5px]" />
            <span>Đặt lại ({activeFilterCount})</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorDictionaryFilterBar;


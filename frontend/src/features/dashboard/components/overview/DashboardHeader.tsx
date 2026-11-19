/**
 * Frontend/src/features/dashboard/components/overview/DashboardHeader.tsx
 *
 * Header Trung tâm Điều hành Dashboard:
 * - Tiêu đề + Bộ lọc Chi nhánh (đồng bộ Redux selectedBranch).
 * - Huy hiệu Độ tươi dữ liệu (Data Freshness: Live vs Dữ liệu đã cũ theo AGENTS.md Rule 5.2 & 7.5).
 * - Nút Làm mới dữ liệu thủ công.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React from 'react';
import {
  FontAwesomeIcon,
  faBuilding,
  faClock,
  faRotate,
  faTriangleExclamation,
} from '@/shared/icons';

export interface DashboardHeaderProps {
  branches: string[];
  selectedBranch: string;
  onBranchChange: (branch: string) => void;
  lastSyncTime: string | null;
  isStale: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  branches,
  selectedBranch,
  onBranchChange,
  lastSyncTime,
  isStale,
  isRefreshing,
  onRefresh,
}) => {
  const formattedSync = lastSyncTime
    ? new Date(lastSyncTime).toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800">
      {/* Trái: Bộ lọc Chi nhánh dạng Underline Tab tối giản */}
      <div className="flex items-center gap-1 overflow-x-auto max-w-full">
        {branches.length > 0 ? (
          ['all', ...branches].map((b) => {
            const isAll = b === 'all';
            const isSel = selectedBranch === b;
            return (
              <button
                key={b}
                type="button"
                onClick={() => onBranchChange(b)}
                className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-bold transition-colors whitespace-nowrap border-0 border-b-2 border-solid bg-transparent cursor-pointer -mb-px ${
                  isSel
                    ? 'border-b-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-b-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {isAll && <FontAwesomeIcon icon={faBuilding} className="text-[11px]" />}
                <span>{isAll ? 'Tất cả chi nhánh' : b}</span>
              </button>
            );
          })
        ) : (
          <div className="flex items-center gap-1.5 px-2 py-2.5 text-xs font-bold text-slate-500">
            <FontAwesomeIcon icon={faBuilding} className="text-[11px] text-blue-600" />
            <span>Toàn hệ thống</span>
          </div>
        )}
      </div>

      {/* Phải: Độ tươi dữ liệu + Làm mới */}
      <div className="flex items-center gap-2 pb-2 sm:pb-1.5 shrink-0">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${
            isStale
              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/70'
              : 'bg-transparent text-slate-500 dark:text-slate-400 border-slate-200/80 dark:border-slate-800'
          }`}
        >
          <FontAwesomeIcon
            icon={isStale ? faTriangleExclamation : faClock}
            className={`text-[10px] ${isStale ? 'text-amber-600' : 'text-emerald-600'}`}
          />
          <span>
            {isStale
              ? 'Dữ liệu đã cũ'
              : formattedSync
              ? `Đồng bộ lúc ${formattedSync}`
              : 'Đang chờ đồng bộ'}
          </span>
        </span>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="px-2.5 py-1.5 rounded-lg bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60 transition-colors"
        >
          <FontAwesomeIcon
            icon={faRotate}
            className={`text-[11px] text-slate-400 ${isRefreshing ? 'animate-spin' : ''}`}
          />
          <span>Làm mới</span>
        </button>
      </div>
    </div>
  );
};

export default DashboardHeader;

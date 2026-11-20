/**
 * Frontend/src/features/printers/components/PrintersPageHeader.tsx
 *
 * Minimalist Split Bar Header (Linear / Raycast Style):
 * - Không đóng khung card, không tiêu đề/mô tả thừa.
 * - Trái: Tab gạch chân mảnh 2px trực tiếp trên nền trang.
 * - Phải: Cụm nút tác vụ phẳng tối giản.
 */

import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../app/store';
import {
  FontAwesomeIcon,
  faPrint,
  faCalendarDays,
  faWrench,
  faRotate,
  faBuilding,
  faPlus,
  faFileCsv,
} from '../../../shared/icons';

export interface PrintersPageHeaderProps {
  activeTab?: 'printers' | 'inventory' | 'timeline' | 'history';
  onTabChange?: (tab: 'printers' | 'inventory' | 'timeline' | 'history') => void;
  roleNameVi?: string;
  isAdmin: boolean;
  totalPrinters: number;
  totalTasks: number;
  isLoading: boolean;
  onRefresh: () => void;
  onOpenCreatePrinter: () => void;
  onExportCsv?: () => void;
}

export const PrintersPageHeader: React.FC<PrintersPageHeaderProps> = ({
  activeTab,
  onTabChange,
  roleNameVi,
  isAdmin,
  totalPrinters,
  totalTasks,
  isLoading,
  onRefresh,
  onOpenCreatePrinter,
  onExportCsv,
}) => {
  const currentTab = activeTab || 'printers';
  const { user } = useSelector((state: RootState) => state.auth);
  const role = user?.role;
  const isFieldTech = role === 'FIELD_TECH';

  const subTabs = isFieldTech
    ? [
        { id: 'timeline' as const, label: 'Lịch trình Gantt', icon: faCalendarDays, count: null },
        { id: 'history' as const, label: 'Lệnh bảo trì', icon: faWrench, count: totalTasks },
        { id: 'inventory' as const, label: 'Sơ đồ tầng', icon: faBuilding, count: null },
        { id: 'printers' as const, label: 'Danh sách máy', icon: faPrint, count: totalPrinters },
      ]
    : [
        { id: 'printers' as const, label: 'Danh sách', icon: faPrint, count: totalPrinters },
        { id: 'inventory' as const, label: 'Sơ đồ tầng & Tổng vụ', icon: faBuilding, count: null },
        { id: 'timeline' as const, label: 'Lịch trình Gantt', icon: faCalendarDays, count: null },
        { id: 'history' as const, label: 'Lịch sử bảo trì', icon: faWrench, count: totalTasks },
      ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800">
      {/* Trái: Underline Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto max-w-full">
        {subTabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange?.(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold transition-colors whitespace-nowrap border-0 border-b-2 border-solid bg-transparent cursor-pointer -mb-px ${
                isActive
                  ? 'border-b-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-b-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <FontAwesomeIcon icon={tab.icon} className="text-[11px]" />
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
        {roleNameVi && (
          <span className="hidden xl:inline-flex ml-2 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0">
            {roleNameVi}
          </span>
        )}
      </div>

      {/* Phải: Nút tác vụ phẳng tối giản */}
      <div className="flex items-center gap-2 pb-2 sm:pb-1.5 shrink-0">
        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="px-2.5 py-1.5 rounded-lg bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-xs border border-slate-200 dark:border-slate-700 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
        >
          <FontAwesomeIcon icon={faRotate} spin={isLoading} className="text-[11px] text-slate-400" />
          <span>Làm mới</span>
        </button>

        {onExportCsv && currentTab === 'printers' && (
          <button
            type="button"
            onClick={onExportCsv}
            title="Xuất file CSV danh mục máy in"
            className="px-2.5 py-1.5 rounded-lg bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-xs border border-slate-200 dark:border-slate-700 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <FontAwesomeIcon icon={faFileCsv} className="text-[11.5px] text-emerald-600" />
            <span>Xuất CSV</span>
          </button>
        )}

        {isAdmin && (
          <button
            type="button"
            onClick={onOpenCreatePrinter}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer border-none"
          >
            <FontAwesomeIcon icon={faPlus} className="text-[11px]" />
            <span>Khai báo máy in</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default PrintersPageHeader;

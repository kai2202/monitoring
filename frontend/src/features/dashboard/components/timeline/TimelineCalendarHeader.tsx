/**
 * Frontend/src/features/dashboard/components/timeline/TimelineCalendarHeader.tsx
 *
 * Header điều khiển Lịch Trình Tiến Độ Công Việc (Timeline Gantt Calendar):
 * - Thiết kế 2 hàng mạch lạc:
 *   + Hàng 1: Điều hướng dải ngày (7/14/30 ngày, Hôm nay, Prev/Next) + Chú giải trạng thái + Tạo việc mới.
 *   + Hàng 2: Thanh lọc tập trung (Tìm máy in, Loại việc, KTV, Có gắn task, Việc của tôi, Ẩn việc đã xong).
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC, FontAwesome chuẩn).
 */

import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../app/store';
import {
  FontAwesomeIcon,
  faChevronLeft,
  faChevronRight,
  faPlus,
  faMagnifyingGlass,
  faFilter,
  faUser,
  faUserCheck,
  faCheck,
} from '../../../../shared/icons';

export interface AvailableTechnician {
  id?: string;
  name: string;
  role?: string;
}

interface TimelineCalendarHeaderProps {
  viewDuration: 7 | 14 | 30;
  onChangeViewDuration: (v: 7 | 14 | 30) => void;
  dateRangeLabel: string;
  onPrevRange: () => void;
  onNextRange: () => void;
  onJumpToToday: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  typeFilter: string;
  onTypeFilterChange: (t: string) => void;
  onlyWithTasks: boolean;
  onToggleOnlyWithTasks: () => void;
  printersWithTasksCount: number;
  technicianFilter: string;
  onTechnicianFilterChange: (tech: string) => void;
  availableTechnicians: AvailableTechnician[];
  myTasksOnly?: boolean;
  onToggleMyTasksOnly?: () => void;
  myTasksCount?: number;
  hideCompleted?: boolean;
  onToggleHideCompleted?: () => void;
  onOpenCreateModal: () => void;
}

export const TimelineCalendarHeader: React.FC<TimelineCalendarHeaderProps> = ({
  viewDuration,
  onChangeViewDuration,
  dateRangeLabel,
  onPrevRange,
  onNextRange,
  onJumpToToday,
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  onlyWithTasks,
  onToggleOnlyWithTasks,
  printersWithTasksCount,
  technicianFilter,
  onTechnicianFilterChange,
  availableTechnicians = [],
  myTasksOnly = false,
  onToggleMyTasksOnly,
  myTasksCount = 0,
  hideCompleted = true,
  onToggleHideCompleted,
  onOpenCreateModal,
}) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
      {/* Hàng 1: Điều hướng thời gian + Chú giải + Tạo việc mới */}
      <div className="px-4 py-3 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="inline-flex items-center rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900">
            <button
              type="button"
              onClick={onPrevRange}
              className="px-2.5 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border-none bg-transparent cursor-pointer"
              title="Khoảng trước"
            >
              <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
            </button>
            <button
              type="button"
              onClick={onJumpToToday}
              className="px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50/70 border-x border-slate-200 dark:border-slate-700 bg-transparent cursor-pointer"
            >
              Hôm nay
            </button>
            <button
              type="button"
              onClick={onNextRange}
              className="px-2.5 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border-none bg-transparent cursor-pointer"
              title="Khoảng tiếp theo"
            >
              <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
            </button>
          </div>

          <strong className="text-sm font-bold text-slate-900 dark:text-slate-100 px-1">{dateRangeLabel}</strong>

          {/* Segmented Control 7 / 14 / 30 ngày */}
          <div className="p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 inline-flex items-center gap-0.5">
            {[
              { val: 7 as const, label: '7 ngày' },
              { val: 14 as const, label: '14 ngày' },
              { val: 30 as const, label: '30 ngày' },
            ].map((item) => {
              const isActive = viewDuration === item.val;
              return (
                <button
                  key={item.val}
                  type="button"
                  onClick={() => onChangeViewDuration(item.val)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border-none cursor-pointer transition-all ${
                    isActive
                      ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                      : 'bg-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Chú giải màu sắc nhỏ gọn */}
          <div className="hidden xl:flex items-center gap-3 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <span>Đang xử lý</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Chờ / Đã lên lịch</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Khẩn cấp P1</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Hoàn tất</span>
            </span>
          </div>

          {isAdmin && (
            <button
              type="button"
              onClick={onOpenCreateModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold border-none cursor-pointer transition-colors"
            >
              <FontAwesomeIcon icon={faPlus} className="text-[11px]" />
              <span>Giao việc mới</span>
            </button>
          )}
        </div>
      </div>

      {/* Hàng 2: Thanh lọc tập trung */}
      <div className="px-4 py-2.5 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2.5 flex-wrap">
        {/* Tìm kiếm máy in */}
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 min-w-[180px] flex-1 max-w-[260px]">
          <FontAwesomeIcon icon={faMagnifyingGlass} className="text-xs text-slate-400" />
          <input
            type="text"
            placeholder="Tìm máy in, IP, vị trí..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full border-none bg-transparent outline-none text-xs text-slate-800 dark:text-slate-100"
          />
        </div>

        {/* Lọc loại việc */}
        <select
          value={typeFilter}
          onChange={(e) => onTypeFilterChange(e.target.value)}
          className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
        >
          <option value="all">Tất cả loại việc</option>
          <option value="CORRECTIVE_REPAIR">Sửa chữa P1</option>
          <option value="PREVENTIVE_MAINTENANCE">Bảo trì</option>
          <option value="SUPPLIES_REPLACEMENT">Cấp phát vật tư</option>
          <option value="ROUTINE_INSPECTION">Kiểm tra định kỳ</option>
        </select>

        {/* Lọc KTV */}
        <div
          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs ${
            technicianFilter !== 'all'
              ? 'bg-blue-50 border-blue-300 text-blue-700 font-semibold'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
          }`}
        >
          <FontAwesomeIcon icon={faUser} className="text-[11px]" />
          <select
            value={technicianFilter}
            onChange={(e) => onTechnicianFilterChange(e.target.value)}
            className="border-none bg-transparent outline-none text-xs cursor-pointer max-w-[160px]"
          >
            <option value="all">Tất cả KTV</option>
            {availableTechnicians.map((tech) => (
              <option key={tech.id || tech.name} value={tech.name}>
                {tech.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 flex-wrap ml-auto">
          {/* Nút lọc máy in có task */}
          <button
            type="button"
            onClick={onToggleOnlyWithTasks}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
              onlyWithTasks
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            <FontAwesomeIcon icon={faFilter} className="text-[10.5px]" />
            <span>Có gắn task</span>
            <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${onlyWithTasks ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
              {printersWithTasksCount}
            </span>
          </button>

          {/* Nút lọc việc của tôi */}
          {onToggleMyTasksOnly && (
            <button
              type="button"
              onClick={onToggleMyTasksOnly}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                myTasksOnly
                  ? 'bg-amber-50 border-amber-300 text-amber-700'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              <FontAwesomeIcon icon={faUserCheck} className="text-[10.5px]" />
              <span>Việc của tôi</span>
              {myTasksCount !== undefined && (
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${myTasksOnly ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {myTasksCount}
                </span>
              )}
            </button>
          )}

          {/* Nút ẩn/hiện việc đã xong */}
          {onToggleHideCompleted && (
            <button
              type="button"
              onClick={onToggleHideCompleted}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                !hideCompleted
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              <FontAwesomeIcon icon={faCheck} className="text-[10px]" />
              <span>{!hideCompleted ? 'Đang hiện việc xong' : 'Ẩn việc đã xong'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimelineCalendarHeader;

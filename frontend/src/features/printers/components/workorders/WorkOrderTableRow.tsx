/**
 * Frontend/src/features/printers/components/workorders/WorkOrderTableRow.tsx
 *
 * Dòng Hiển Thị Lệnh Bảo Trì (Work Order Table Row):
 * - Click dòng để mở Drawer chi tiết.
 * - Gom thao tác Admin (Điều phối KTV, Hủy lệnh) vào menu dropdown gọn gàng thay vì đặt nút lặp trên mọi dòng.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC, FontAwesome chuẩn).
 */

import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../app/store';
import {
  FontAwesomeIcon,
  faChevronRight,
  faChevronDown,
  faFire,
  faTriangleExclamation,
  faClock,
  faUserGear,
  faBan,
  faSliders,
} from '../../../../shared/icons';
import { Task, TaskPriority, TaskStatus } from '../../../../types/task';
import { Printer } from '../../../../types/printer';

interface WorkOrderTableRowProps {
  task: Task;
  printer?: Printer;
  isExpanded: boolean;
  onToggleExpand: (e: React.MouseEvent) => void;
  onOpenDetail: () => void;
  isAdmin?: boolean;
  isMenuOpen?: boolean;
  onToggleMenu?: (e: React.MouseEvent) => void;
  onOpenReassign?: (task: Task) => void;
  onOpenCancel?: (task: Task) => void;
}

export const WorkOrderTableRow: React.FC<WorkOrderTableRowProps> = ({
  task,
  isExpanded,
  onToggleExpand,
  onOpenDetail,
  isAdmin = false,
  isMenuOpen = false,
  onToggleMenu,
  onOpenReassign,
  onOpenCancel,
}) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const isAssetHr = false;

  const steps = task.dynamicSteps || [];
  const completedSteps = steps.filter((s) => s.status === 'Completed').length;
  const isActionable = task.status !== 'Completed' && task.status !== 'Cancelled';

  const renderPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'P1_Urgent':
        return (
          <span className="inline-flex items-center gap-1 text-rose-600 font-bold text-[11.5px]">
            <FontAwesomeIcon icon={faFire} className="text-[11px]" />
            <span>Khẩn cấp</span>
          </span>
        );
      case 'P2_High':
        return (
          <span className="inline-flex items-center gap-1 text-orange-600 font-semibold text-[11.5px]">
            <FontAwesomeIcon icon={faTriangleExclamation} className="text-[11px]" />
            <span>Cao</span>
          </span>
        );
      case 'P3_Medium':
        return (
          <span className="inline-flex items-center gap-1 text-amber-600 font-semibold text-[11.5px]">
            <FontAwesomeIcon icon={faClock} className="text-[11px]" />
            <span>Trung bình</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-sky-600 font-medium text-[11.5px]">
            <FontAwesomeIcon icon={faChevronDown} className="text-[10px]" />
            <span>Thấp</span>
          </span>
        );
    }
  };

  const renderStatusBadge = (status: TaskStatus) => {
    if (status === 'In_Progress' && task.reworkReason) {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span>Cần làm lại</span>
        </span>
      );
    }
    switch (status) {
      case 'In_Progress':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            <span>Đang xử lý</span>
          </span>
        );
      case 'Pending_Verification':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
            <span>Chờ duyệt</span>
          </span>
        );
      case 'Planned':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <span>Đã lên lịch</span>
          </span>
        );
      case 'Waiting':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>Tạm hoãn</span>
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            <span>Hoàn tất</span>
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>Đã hủy</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <span>Đang mở</span>
          </span>
        );
    }
  };

  return (
    <tr
      onClick={onOpenDetail}
      className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
    >
      {/* 1. Expand Arrow & Title */}
      <td className="px-4 py-3">
        <div className="flex items-start gap-2">
          <button
            type="button"
            onClick={onToggleExpand}
            className="p-0.5 mt-0.5 text-slate-400 hover:text-slate-700 bg-transparent border-none cursor-pointer"
            title={isExpanded ? 'Thu gọn các bước' : 'Xem nhanh các bước'}
          >
            <FontAwesomeIcon icon={isExpanded ? faChevronDown : faChevronRight} className="text-xs" />
          </button>
          <div className="min-w-0">
            <div className="text-[13px] font-bold text-slate-900 dark:text-slate-100">{task.title}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Mã: <span className="font-mono">{task.id}</span>
              {steps.length > 0 && ` • ${completedSteps}/${steps.length} bước (${task.progressPercent || 0}%)`}
            </div>
          </div>
        </div>
      </td>

      {/* 2. Assignee */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
            {(task.assignee || 'KT')[0]}
          </div>
          <span className="text-xs text-slate-800 dark:text-slate-200 truncate">{task.assignee || 'Kỹ sư NOC'}</span>
        </div>
      </td>

      {/* 3. Status */}
      <td className="px-4 py-3">{renderStatusBadge(task.status)}</td>

      {/* 4. Priority */}
      <td className="px-4 py-3">{renderPriorityBadge(task.priority)}</td>

      {/* 5. Target Asset & Location */}
      <td className="px-4 py-3">
        <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">{task.printerName}</div>
        <div className="text-[11px] text-slate-500">{task.location}</div>
      </td>

      {/* 6. Error Code */}
      <td className="px-4 py-3">
        {task.errorCode ? (
          <span className="px-1.5 py-0.5 rounded text-[11px] font-mono font-bold bg-rose-50 text-rose-600">
            {task.errorCode}
          </span>
        ) : (
          <span className="text-slate-400 text-xs">—</span>
        )}
      </td>

      {/* 7. Action: Chi tiết + Menu Admin gọn */}
      <td className="px-4 py-3 text-right">
        <div className="inline-flex items-center justify-end gap-1.5 relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetail();
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 dark:bg-slate-800 dark:text-slate-200 text-[11.5px] font-semibold transition-colors cursor-pointer border-none"
          >
            {isAdmin ? 'Chi tiết' : isAssetHr ? 'Đối soát' : isActionable ? 'Thực hiện' : 'Xem lại'}
          </button>

          {isAdmin && isActionable && (onOpenReassign || onOpenCancel) && (
            <>
              <button
                type="button"
                onClick={onToggleMenu}
                title="Thao tác quản trị (Chuyển giao KTV / Hủy lệnh)"
                className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
              >
                <FontAwesomeIcon icon={faSliders} className="text-[11px]" />
              </button>

              {isMenuOpen && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-8 z-30 w-44 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg py-1 text-left"
                >
                  {onOpenReassign && (
                    <button
                      type="button"
                      onClick={() => onOpenReassign(task)}
                      className="w-full px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer bg-transparent border-none text-left"
                    >
                      <FontAwesomeIcon icon={faUserGear} className="text-blue-600 text-[11px]" />
                      <span>Chuyển giao KTV</span>
                    </button>
                  )}
                  {onOpenCancel && (
                    <button
                      type="button"
                      onClick={() => onOpenCancel(task)}
                      className="w-full px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 cursor-pointer bg-transparent border-none text-left"
                    >
                      <FontAwesomeIcon icon={faBan} className="text-[11px]" />
                      <span>Hủy lệnh</span>
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </td>
    </tr>
  );
};

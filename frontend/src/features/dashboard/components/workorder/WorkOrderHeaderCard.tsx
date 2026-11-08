/**
 * Frontend/src/features/dashboard/components/workorder/WorkOrderHeaderCard.tsx
 *
 * Khối Header Chi Tiết Lệnh Bảo Trì (Work Order Inspector Header):
 * - Hiển thị huy hiệu định danh: Task ID, Độ ưu tiên, Trạng thái (Completed, Chờ duyệt, Cần làm lại, Chỉ xem).
 * - Người phụ trách, hạn SLA, nút xem ảnh in test.
 * - Hàng nút hành động phân quyền: KTV "Nhận việc", KTV "Gửi duyệt", Admin "Phê duyệt đóng lệnh" / "Yêu cầu làm lại".
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC, 100% FontAwesome).
 */

import React from 'react';
import {
  FontAwesomeIcon,
  faFlag,
  faEye,
  faRotate,
  faLock,
  faClock,
  faCircleCheck,
  faUser,
  faCalendar,
  faPaperPlane,
  faWrench,
} from '../../../../shared/icons';
import { Task } from '../../../../types/task';

export interface WorkOrderHeaderCardProps {
  task: Task;
  isAdmin: boolean;
  isHr: boolean;
  canEditTask: boolean;
  isCompleted: boolean;
  isReworking: boolean;
  isReadyForApproval: boolean;
  completedStepsCount: number;
  totalStepsCount: number;
  allStepsCompleted: boolean;
  onOpenTestPrintModal: () => void;
  onOpenReworkModal: () => void;
  onStartTask: () => void;
  onSubmitApproval: () => void;
  onApproveAndClose: () => void;
  onReopenTask?: (taskId: string) => void;
}

export const WorkOrderHeaderCard: React.FC<WorkOrderHeaderCardProps> = ({
  task,
  isAdmin,
  isHr,
  canEditTask,
  isCompleted,
  isReworking,
  isReadyForApproval,
  completedStepsCount,
  totalStepsCount,
  allStepsCompleted,
  onOpenTestPrintModal,
  onOpenReworkModal,
  onStartTask,
  onSubmitApproval,
  onApproveAndClose,
  onReopenTask,
}) => {
  return (
    <div
      className={`p-5 rounded-3xl border flex items-center justify-between flex-wrap gap-4 shadow-xs ${
        isCompleted
          ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
          : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
      }`}
    >
      {/* Thông tin định danh & Metadata */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10.5px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            🔗 {task.id}
          </span>
          <span className="text-[10.5px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200/60 flex items-center gap-1">
            <FontAwesomeIcon icon={faFlag} className="text-[9px]" />
            <span>{task.priority || 'P2_High'}</span>
          </span>
          {isCompleted && (
            <span className="text-[10.5px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
              ✓ Đã hoàn tất
            </span>
          )}
          {!isCompleted && task.status === 'Pending_Verification' && (
            <span className="text-[10.5px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 flex items-center gap-1">
              <FontAwesomeIcon icon={faClock} className="text-[9px]" />
              <span>Chờ Admin nghiệm thu</span>
            </span>
          )}
          {!isCompleted && isReworking && (
            <span className="text-[10.5px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 border border-amber-300 flex items-center gap-1">
              <FontAwesomeIcon icon={faRotate} className="text-[9px]" />
              <span>Cần làm lại</span>
            </span>
          )}
          {!canEditTask && !isAdmin && (
            <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 flex items-center gap-1">
              <FontAwesomeIcon icon={faLock} className="text-[9px]" />
              <span>Chỉ xem</span>
            </span>
          )}
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">{task.title}</h3>
        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex-wrap">
          <span className="flex items-center gap-1.5">
            <FontAwesomeIcon icon={faUser} className="text-[10px] text-slate-400" />
            <span>
              Phụ trách: <strong className="text-slate-700 dark:text-slate-200">{task.assignee || 'Kỹ sư NOC'}</strong>
            </span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <FontAwesomeIcon icon={faCalendar} className="text-[10px] text-indigo-500" />
            <span>
              Hạn SLA: <strong className="text-slate-700 dark:text-slate-200">{task.dueDate || 'Hôm nay'}</strong>
            </span>
          </span>
        </div>
      </div>

      {/* Action Buttons: Điều chỉnh theo đúng trạng thái xử lý & phân quyền */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={onOpenTestPrintModal}
          className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <FontAwesomeIcon icon={faEye} className="text-xs" />
          <span>Xem ảnh in test</span>
        </button>

        {isCompleted ? (
          isAdmin ? (
            <button
              type="button"
              onClick={() => onReopenTask?.(task.id)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <FontAwesomeIcon icon={faRotate} className="text-xs" />
              <span>Mở lại nhiệm vụ</span>
            </button>
          ) : null
        ) : isHr ? (
          <span className="px-3.5 py-2 rounded-xl bg-sky-50 text-sky-700 text-xs font-bold border border-sky-200/60">
            Hồ sơ đối soát kiểm kê
          </span>
        ) : !canEditTask ? (
          <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-medium border border-slate-200 flex items-center gap-1.5">
            <FontAwesomeIcon icon={faLock} className="text-xs text-slate-400" />
            <span>Phụ trách: {task.assignee || 'KTV khác'}</span>
          </span>
        ) : task.status === 'Planned' ? (
          /* Trạng thái Planned: KTV nhận việc */
          canEditTask ? (
            <button
              type="button"
              onClick={onStartTask}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition-colors"
            >
              <FontAwesomeIcon icon={faWrench} className="text-xs" />
              <span>Nhận việc &amp; Bắt đầu</span>
            </button>
          ) : (
            <span className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold">
              Chờ KTV nhận việc
            </span>
          )
        ) : isReadyForApproval ? (
          /* Khi task đã gửi duyệt hoặc hoàn tất các bước */
          isAdmin ? (
            <>
              <button
                type="button"
                onClick={onOpenReworkModal}
                className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 dark:text-amber-400 text-xs font-bold border border-amber-200 flex items-center gap-1.5 transition-colors"
              >
                <FontAwesomeIcon icon={faRotate} className="text-xs" />
                <span>Yêu cầu làm lại</span>
              </button>
              <button
                type="button"
                onClick={onApproveAndClose}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-colors"
              >
                <FontAwesomeIcon icon={faCircleCheck} className="text-xs" />
                <span>Phê duyệt đóng lệnh</span>
              </button>
            </>
          ) : (
            <span className="px-3.5 py-2 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200 flex items-center gap-1.5">
              <FontAwesomeIcon icon={faClock} className="text-indigo-500 text-xs" />
              <span>Đã gửi chờ Admin duyệt</span>
            </span>
          )
        ) : isAdmin ? (
          /* Khi task chưa hoàn thành */
          <span className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold border border-slate-200/80 flex items-center gap-1.5">
            <FontAwesomeIcon icon={faClock} className="text-slate-400 text-xs" />
            <span>{isReworking ? 'Chờ KTV khắc phục làm lại' : 'Đang chờ KTV xử lý'}</span>
          </span>
        ) : isReworking ? (
          allStepsCompleted ? (
            <button
              type="button"
              onClick={onSubmitApproval}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition-colors"
            >
              <FontAwesomeIcon icon={faPaperPlane} className="text-xs" />
              <span>Gửi duyệt nghiệm thu lại</span>
            </button>
          ) : (
            <span className="px-3.5 py-2 rounded-xl bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200/80 flex items-center gap-1.5">
              <FontAwesomeIcon icon={faClock} className="text-amber-500 text-xs" />
              <span>
                Cần hoàn thành bước làm lại ({completedStepsCount}/{totalStepsCount})
              </span>
            </span>
          )
        ) : (
          <button
            type="button"
            onClick={onSubmitApproval}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition-colors"
          >
            <FontAwesomeIcon icon={faPaperPlane} className="text-xs" />
            <span>Gửi duyệt nghiệm thu</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default WorkOrderHeaderCard;


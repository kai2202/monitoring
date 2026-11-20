/**
 * Frontend/src/features/dashboard/components/workorder/WorkOrderHeaderCard.tsx
 *
 * Khối Header Chi Tiết Lệnh Bảo Trì (Work Order Inspector Header):
 * - Hiển thị huy hiệu định danh: Task ID, Độ ưu tiên, Trạng thái (Completed, Chờ duyệt, Cần làm lại, Chỉ xem).
 * - Người phụ trách, hạn SLA, và các mốc tiến độ xử lý.
 * - Hàng nút hành động phân quyền: KTV "Nhận việc", KTV "Gửi duyệt", Admin "Phê duyệt đóng lệnh" / "Yêu cầu làm lại".
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC, 100% FontAwesome).
 */

import React from 'react';
import {
  FontAwesomeIcon,
  faFlag,
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
  onOpenReworkModal: () => void;
  onStartTask: () => void;
  onSubmitApproval: () => void;
  onApproveAndClose: () => void;
  onReopenTask?: (taskId: string) => void;
}

const PRIORITY_LABELS: Record<string, { label: string; badgeCls: string }> = {
  P1_Urgent: { label: 'P1 - Nguy cấp', badgeCls: 'bg-rose-50/90 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400' },
  P2_High: { label: 'P2 - Cao', badgeCls: 'bg-amber-50/90 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400' },
  P3_Medium: { label: 'P3 - Trung bình', badgeCls: 'bg-blue-50/90 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400' },
  P4_Low: { label: 'P4 - Thấp', badgeCls: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300' },
};

const formatSlaDate = (raw?: string | null) => {
  if (!raw) return 'Hôm nay';
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return `${d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}, ${d.toLocaleDateString('vi-VN')}`;
};

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
  onOpenReworkModal,
  onStartTask,
  onSubmitApproval,
  onApproveAndClose,
  onReopenTask,
}) => {
  const priorityMeta = PRIORITY_LABELS[task.priority || 'P2_High'] || PRIORITY_LABELS.P2_High;

  return (
    <div
      className={`px-4 py-3.5 rounded-2xl flex items-center justify-between flex-wrap gap-3 shadow-xs ring-1 ring-slate-900/[0.05] dark:ring-white/[0.06] ${
        isCompleted
          ? 'bg-emerald-50/70 dark:bg-emerald-950/25'
          : 'bg-slate-50/90 dark:bg-slate-800/50'
      }`}
    >
      {/* Thông tin định danh & Metadata */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10.5px] font-mono font-bold px-2 py-0.5 rounded-md bg-white/80 dark:bg-slate-900 text-slate-600 dark:text-slate-300">
            🔗 {task.id}
          </span>
          <span className={`text-[10.5px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 whitespace-nowrap ${priorityMeta.badgeCls}`}>
            <FontAwesomeIcon icon={faFlag} className="text-[9px]" />
            <span>{priorityMeta.label}</span>
          </span>
          {isCompleted && (
            <span className="text-[10.5px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100/90 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
              ✓ Đã hoàn tất
            </span>
          )}
          {!isCompleted && task.status === 'Pending_Verification' && (
            <span className="text-[10.5px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-100/90 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 flex items-center gap-1 whitespace-nowrap">
              <FontAwesomeIcon icon={faClock} className="text-[9px]" />
              <span>Chờ Admin nghiệm thu</span>
            </span>
          )}
          {!isCompleted && isReworking && (
            <span className="text-[10.5px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100/90 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 flex items-center gap-1 whitespace-nowrap">
              <FontAwesomeIcon icon={faRotate} className="text-[9px]" />
              <span>Cần làm lại</span>
            </span>
          )}
          {!canEditTask && !isAdmin && (
            <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-white/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center gap-1 whitespace-nowrap">
              <FontAwesomeIcon icon={faLock} className="text-[9px]" />
              <span>Chỉ xem</span>
            </span>
          )}
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">{task.title}</h3>
        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex-wrap">
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
              Hạn SLA: <strong className="text-slate-700 dark:text-slate-200">{formatSlaDate(task.dueDate)}</strong>
            </span>
          </span>
        </div>
      </div>

      {/* Action Buttons: Điều chỉnh theo đúng trạng thái xử lý & phân quyền */}
      <div className="flex items-center gap-2 flex-wrap">
        {isCompleted ? (
          isAdmin ? (
            <button
              type="button"
              onClick={() => onReopenTask?.(task.id)}
              className="px-3.5 py-2 rounded-xl bg-white/80 dark:bg-slate-800 hover:bg-white text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FontAwesomeIcon icon={faRotate} className="text-xs" />
              <span>Mở lại nhiệm vụ</span>
            </button>
          ) : null
        ) : isHr ? (
          <span className="px-3.5 py-2 rounded-xl bg-sky-50 text-sky-700 text-xs font-bold">
            Hồ sơ đối soát kiểm kê
          </span>
        ) : !canEditTask ? (
          <span className="px-3 py-1.5 rounded-xl bg-white/80 dark:bg-slate-800 text-slate-500 text-xs font-medium flex items-center gap-1.5">
            <FontAwesomeIcon icon={faLock} className="text-xs text-slate-400" />
            <span>Phụ trách: {task.assignee || 'KTV khác'}</span>
          </span>
        ) : task.status === 'Planned' ? (
          canEditTask ? (
            <button
              type="button"
              onClick={onStartTask}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FontAwesomeIcon icon={faWrench} className="text-xs" />
              <span>Nhận việc &amp; Bắt đầu</span>
            </button>
          ) : (
            <span className="px-3.5 py-2 rounded-xl bg-white/80 text-slate-600 text-xs font-semibold">
              Chờ KTV nhận việc
            </span>
          )
        ) : isReadyForApproval ? (
          isAdmin ? (
            <>
              <button
                type="button"
                onClick={onOpenReworkModal}
                className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 dark:text-amber-400 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FontAwesomeIcon icon={faRotate} className="text-xs" />
                <span>Yêu cầu làm lại</span>
              </button>
              <button
                type="button"
                onClick={onApproveAndClose}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FontAwesomeIcon icon={faCircleCheck} className="text-xs" />
                <span>Phê duyệt đóng lệnh</span>
              </button>
            </>
          ) : (
            <span className="px-3.5 py-2 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-bold flex items-center gap-1.5">
              <FontAwesomeIcon icon={faClock} className="text-indigo-500 text-xs" />
              <span>Đã gửi chờ Admin duyệt</span>
            </span>
          )
        ) : isAdmin ? (
          <span className="px-3.5 py-2 rounded-xl bg-white/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5">
            <FontAwesomeIcon icon={faClock} className="text-slate-400 text-xs" />
            <span>{isReworking ? 'Chờ KTV khắc phục làm lại' : 'Đang chờ KTV xử lý'}</span>
          </span>
        ) : isReworking ? (
          allStepsCompleted ? (
            <button
              type="button"
              onClick={onSubmitApproval}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FontAwesomeIcon icon={faPaperPlane} className="text-xs" />
              <span>Gửi duyệt nghiệm thu lại</span>
            </button>
          ) : (
            <span className="px-3.5 py-2 rounded-xl bg-amber-50 text-amber-700 text-xs font-semibold flex items-center gap-1.5">
              <FontAwesomeIcon icon={faClock} className="text-amber-500 text-xs" />
              <span>
                Cần hoàn thành bước làm lại ({completedStepsCount}/{totalStepsCount})
              </span>
            </span>
          )
        ) : allStepsCompleted ? (
          <button
            type="button"
            onClick={onSubmitApproval}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FontAwesomeIcon icon={faPaperPlane} className="text-xs" />
            <span>Gửi duyệt nghiệm thu</span>
          </button>
        ) : (
          <span
            title="Hãy hoàn tất 100% các bước kỹ thuật quy chuẩn để gửi duyệt nghiệm thu"
            className="px-3.5 py-2 rounded-xl bg-white/80 dark:bg-slate-800 text-slate-400 dark:text-slate-500 text-xs font-semibold flex items-center gap-1.5 cursor-not-allowed"
          >
            <FontAwesomeIcon icon={faPaperPlane} className="text-xs" />
            <span>Gửi duyệt ({completedStepsCount}/{totalStepsCount})</span>
          </span>
        )}
      </div>
    </div>
  );
};

export default WorkOrderHeaderCard;


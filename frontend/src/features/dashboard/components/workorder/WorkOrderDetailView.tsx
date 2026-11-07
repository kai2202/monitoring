/**
 * Frontend/src/features/dashboard/components/workorder/WorkOrderDetailView.tsx
 *
 * Giao diện Chi Tiết Lệnh Bảo Trì (Work Order Detail View):
 * - Áp dụng thiết kế Slide-over Task Inspector từ Image 3.
 * - Quy tắc phê duyệt đóng lệnh & yêu cầu làm lại:
 *   + Khi task CHƯA hoàn thành (hoặc KTV chưa bấm gửi duyệt): ẨN HOÀN TOÀN 2 nút.
 *   + Khi task ĐÃ HOÀN THÀNH / KTV bấm gửi nghiệm thu: HIỂN THỊ ĐỒNG THỜI CẢ 2 NÚT cho Admin.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC, 100% FontAwesome).
 */

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { RootState } from '../../../../app/store';
import { addTaskNotification, removeTaskNotificationByTaskId } from '../../../../app/slices/notificationSlice';
import { DATA_SOURCE } from '../../../../config/dataSource';
import { taskService } from '../../../../services';
import {
  FontAwesomeIcon, faRotate, faCircleCheck, faEye, faFlag,
  faCalendar, faUser, faPaperPlane, faClock,
} from '../../../../shared/icons';
import { Task, TimeAndCostSummary, WorkLogEntry, TaskAttachment, VendorCommunicationLog } from '../../../../types/task';
import { WorkOrderTimeCostCard } from './WorkOrderTimeCostCard';
import { WorkOrderSubTasksProgress } from './WorkOrderSubTasksProgress';
import { WorkOrderWorkLogsList } from './WorkOrderWorkLogsList';
import { WorkOrderVendorAndAttachments } from './WorkOrderVendorAndAttachments';
import { WorkOrderActivityStream } from './WorkOrderActivityStream';
import { TestPrintReviewModal } from './TestPrintReviewModal';
import { ReworkReasonModal } from './ReworkReasonModal';

export interface WorkOrderDetailViewProps {
  task: Task;
  onUpdateTask?: (updated: Task) => void;
  onCompleteTask?: (taskId: string) => void;
  onReopenTask?: (taskId: string) => void;
  onAddNewStep?: (taskId: string, stepTitle: string) => void;
  onToggleStepStatus?: (taskId: string, stepId: string) => void;
  onAddActivityNote?: (taskId: string, note: string) => void;
}

export const WorkOrderDetailView: React.FC<WorkOrderDetailViewProps> = ({
  task, onUpdateTask, onCompleteTask, onReopenTask, onAddNewStep, onToggleStepStatus, onAddActivityNote,
}) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === 'ADMIN';
  const isHr = user?.role === 'ASSET_HR' || user?.role === 'DEPARTMENT_HEAD';
  const [selectedStepFilter, setSelectedStepFilter] = useState<string | null>(null);
  const [isTestPrintModalOpen, setIsTestPrintModalOpen] = useState(false);
  const [isReworkModalOpen, setIsReworkModalOpen] = useState(false);

  const steps = task.dynamicSteps || [];
  const isCompleted = task.status === 'Completed';
  const completedStepsCount = steps.filter((s) => s.status === 'Completed').length;
  const allStepsCompleted = steps.length > 0 && completedStepsCount === steps.length;
  const isReadyForApproval =
    task.status === 'Pending_Verification' || allStepsCompleted || (task.progressPercent ?? 0) >= 100;

  const handleRequestRework = (reason: string) => {
    if (onUpdateTask) onUpdateTask({ ...task, status: 'In_Progress', progressPercent: 80 });
    if (onAddActivityNote) onAddActivityNote(task.id, `[YÊU CẦU LÀM LẠI TỪ ADMIN]: ${reason}`);
    dispatch(removeTaskNotificationByTaskId(task.id));
    dispatch(addTaskNotification({
      id: `notif-${Date.now()}`, taskId: task.id, taskTitle: task.title, printerId: task.printerId,
      type: 'REWORK_REQUIRED', message: reason, assigneeName: task.assignee || 'Kỹ thuật viên',
      requestedByName: user?.fullName || 'Quản trị viên (Admin)', reworkReason: reason,
      timestamp: 'Vừa xong', isRead: false,
    }));
    toast.success(`Đã gửi yêu cầu làm lại cho KTV ${task.assignee || ''}`);
  };

  const handleSubmitApproval = () => {
    if (onUpdateTask) onUpdateTask({ ...task, status: 'Pending_Verification', progressPercent: 100 });
    if (onAddActivityNote) onAddActivityNote(task.id, `[KỸ THUẬT VIÊN]: Đã hoàn tất các bước và gửi yêu cầu phê duyệt nghiệm thu.`);
    dispatch(addTaskNotification({
      id: `notif-${Date.now()}`, taskId: task.id, taskTitle: task.title, printerId: task.printerId,
      type: 'PENDING_APPROVAL', message: `KTV ${user?.fullName || 'Hiện trường'} đã gửi yêu cầu nghiệm thu đóng lệnh`,
      assigneeName: task.assignee || 'Kỹ thuật viên', timestamp: 'Vừa xong', isRead: false,
    }));
    toast.success('Đã gửi yêu cầu nghiệm thu lên Quản trị viên');
  };

  const handleSaveTimeCost = (tc: TimeAndCostSummary) => onUpdateTask?.({ ...task, timeAndCost: tc });
  const handleAddAttachment = (att: TaskAttachment) => onUpdateTask?.({ ...task, attachments: [...(task.attachments || []), att] });

  const handleAddWorkLog = async (log: Partial<WorkLogEntry>) => {
    if (DATA_SOURCE === 'api') {
      try {
        const updated = await taskService.addTaskWorkLog(task.id, log);
        onUpdateTask?.(updated);
        toast.success('Đã lưu nhật ký thao tác và cập nhật chi phí');
      } catch (err: any) {
        toast.error(err?.message || 'Không thể lưu nhật ký thao tác');
      }
      return;
    }
    onUpdateTask?.({ ...task, workLogs: [...(task.workLogs || []), log as WorkLogEntry] });
  };

  const handleAddVendorLog = async (log: Partial<VendorCommunicationLog>) => {
    if (DATA_SOURCE === 'api') {
      try {
        const updated = await taskService.addTaskWorkLog(task.id, {
          stepNumber: 0, stepTitle: 'Trao đổi hãng', performerName: user?.fullName || 'Kỹ sư NOC', performerAvatar: 'KT',
          actionsTaken: `[HÃNG: ${log.vendorName || 'Chính hãng'} | ${log.contactPerson || ''}] ${log.discussionContent || ''}`,
          resultStatus: 'SUCCESS', additionalTimeHours: 0,
        });
        onUpdateTask?.(updated);
        toast.success('Đã lưu trao đổi với hãng');
      } catch (err: any) {
        toast.error(err?.message || 'Không thể lưu trao đổi với hãng');
      }
      return;
    }
    onUpdateTask?.({ ...task, vendorCommunications: [...(task.vendorCommunications || []), log as VendorCommunicationLog] });
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* 1. Header Card with Image 3 Task Inspector Badges */}
      <div className={`p-5 rounded-3xl border flex items-center justify-between flex-wrap gap-4 shadow-xs ${
        isCompleted ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800' : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
      }`}>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
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
                ⏱ Chờ Admin nghiệm thu
              </span>
            )}
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">{task.title}</h3>
          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex-wrap">
            <span className="flex items-center gap-1.5">
              <FontAwesomeIcon icon={faUser} className="text-[10px] text-slate-400" />
              <span>Phụ trách: <strong className="text-slate-700 dark:text-slate-200">{task.assignee || 'Kỹ sư NOC'}</strong></span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <FontAwesomeIcon icon={faCalendar} className="text-[10px] text-indigo-500" />
              <span>Hạn SLA: <strong className="text-slate-700 dark:text-slate-200">{task.dueDate || 'Hôm nay'}</strong></span>
            </span>
          </div>
        </div>

        {/* Action Buttons: Điều chỉnh theo đúng trạng thái xử lý của KTV */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIsTestPrintModalOpen(true)}
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
          ) : (
            <>
              {/* Khi task ĐÃ HOÀN THÀNH / KTV bấm gửi nghiệm thu: Hiển thị cả 2 nút cho Admin */}
              {isReadyForApproval ? (
                isAdmin ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsReworkModalOpen(true)}
                      className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 dark:text-amber-400 text-xs font-bold border border-amber-200 flex items-center gap-1.5 transition-colors"
                    >
                      <FontAwesomeIcon icon={faRotate} className="text-xs" />
                      <span>Yêu cầu làm lại</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        dispatch(removeTaskNotificationByTaskId(task.id));
                        onCompleteTask?.(task.id);
                      }}
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
              ) : (
                /* Khi task CHƯA hoàn thành (hoặc KTV chưa bấm gửi duyệt): Ẩn hoàn toàn hai nút */
                isAdmin ? (
                  <span className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold border border-slate-200/80 flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faClock} className="text-slate-400 text-xs" />
                    <span>Đang chờ KTV xử lý</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmitApproval}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition-colors"
                  >
                    <FontAwesomeIcon icon={faPaperPlane} className="text-xs" />
                    <span>Gửi duyệt nghiệm thu</span>
                  </button>
                )
              )}
            </>
          )}
        </div>
      </div>

      {/* 2. Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        <div className="flex flex-col gap-4">
          <WorkOrderWorkLogsList
            workLogs={task.workLogs || []} steps={steps} selectedStepIdFilter={selectedStepFilter}
            assigneeName={task.assignee} isReadOnly={isCompleted}
            onClearStepFilter={() => setSelectedStepFilter(null)} onAddWorkLog={handleAddWorkLog}
          />
          <WorkOrderVendorAndAttachments
            taskId={task.id} uploaderName={user?.fullName || 'Kỹ thuật viên'}
            vendorLogs={task.vendorCommunications || []} attachments={task.attachments || []} isReadOnly={isCompleted}
            onAddVendorLog={handleAddVendorLog} onAddAttachment={handleAddAttachment}
          />
          <WorkOrderActivityStream
            activityFeed={task.activityFeed || []} isReadOnly={isCompleted}
            onAddNote={(note) => onAddActivityNote?.(task.id, note)}
          />
        </div>

        <div className="flex flex-col gap-4">
          <WorkOrderSubTasksProgress
            steps={steps} workLogs={task.workLogs || []} progressPercent={task.progressPercent || 0} isReadOnly={isCompleted}
            onToggleStep={(sId) => onToggleStepStatus?.(task.id, sId)}
            onAddStep={(title) => onAddNewStep?.(task.id, title)}
            selectedStepIdFilter={selectedStepFilter} onSelectStepFilter={setSelectedStepFilter}
          />
          <WorkOrderTimeCostCard
            timeAndCost={task.timeAndCost || { repairTimeHours: null, waitingTimeHours: null, downtimeHours: null, laborCostVnd: null, partsCostVnd: null, totalCostVnd: null }}
            estimatedTimeAndCost={task.estimatedTimeAndCost} isReadOnly={isCompleted} onSaveTimeCost={handleSaveTimeCost}
          />
        </div>
      </div>

      <TestPrintReviewModal
        isOpen={isTestPrintModalOpen} onClose={() => setIsTestPrintModalOpen(false)} task={task}
        onApproveAndClose={() => onCompleteTask?.(task.id)} onRequestRework={handleRequestRework}
        isAdmin={Boolean(isAdmin && isReadyForApproval)}
      />
      <ReworkReasonModal
        isOpen={isReworkModalOpen} taskId={task.id} taskTitle={task.title} assigneeName={task.assignee}
        onClose={() => setIsReworkModalOpen(false)} onSubmit={handleRequestRework}
      />
    </div>
  );
};

export default WorkOrderDetailView;

/**
 * Frontend/src/features/dashboard/components/workorder/WorkOrderDetailView.tsx
 *
 * Giao diện Chi Tiết Lệnh Bảo Trì (Work Order Detail View):
 * - Thiết kế Slide-over Task Inspector, đấu nối taskService (approveTask, reworkTask, updateTaskStatus).
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC, 100% FontAwesome).
 */

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { RootState } from '../../../../app/store';
import { addTaskNotification, removeTaskNotificationByTaskId } from '../../../../app/slices/notificationSlice';
import { DATA_SOURCE } from '../../../../config/dataSource';
import { taskService } from '../../../../services';
import { FontAwesomeIcon, faTriangleExclamation } from '../../../../shared/icons';
import { Task, TimeAndCostSummary, WorkLogEntry, TaskAttachment, VendorCommunicationLog } from '../../../../types/task';
import {
  WorkOrderHeaderCard,
  WorkOrderTimeCostCard,
  WorkOrderSubTasksProgress,
  WorkOrderWorkLogsList,
  WorkOrderVendorAndAttachments,
  WorkOrderActivityStream,
} from './';
import { TestPrintReviewModal, ReworkReasonModal } from './modals';

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
  task,
  onUpdateTask,
  onCompleteTask,
  onReopenTask,
  onAddNewStep,
  onToggleStepStatus,
  onAddActivityNote,
}) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === 'ADMIN';
  const isHr = user?.role === 'ASSET_HR' || user?.role === 'DEPARTMENT_HEAD';
  const [selectedStepFilter, setSelectedStepFilter] = useState<string | null>(null);
  const [isTestPrintModalOpen, setIsTestPrintModalOpen] = useState(false);
  const [isReworkModalOpen, setIsReworkModalOpen] = useState(false);

  const isAssignee = Boolean(
    (user?.id && task.assigneeId === user.id) ||
    (user?.fullName && task.assignee && user.fullName.toLowerCase().includes(task.assignee.toLowerCase())) ||
    (user?.role === 'FIELD_TECH' && (!task.assignee || task.assignee === 'Chưa phân công'))
  );
  const canEditTask = isAdmin || isAssignee;
  const isCompleted = task.status === 'Completed';
  const isGeneralReadOnly = isCompleted || !canEditTask;

  const steps = task.dynamicSteps || [];
  const completedStepsCount = steps.filter((s) => s.status === 'Completed').length;
  const allStepsCompleted = steps.length > 0 && completedStepsCount === steps.length;
  const isReworking = Boolean(task.reworkReason && task.status === 'In_Progress');
  const isReadyForApproval =
    !isCompleted && !isReworking && (task.status === 'Pending_Verification' || (allStepsCompleted && (task.progressPercent ?? 0) >= 100));

  const handleStartTask = async () => {
    try {
      const updated = await taskService.updateTaskStatus(task.id, {
        status: 'In_Progress',
        author: user?.fullName || 'Kỹ thuật viên',
        comment: 'Kỹ thuật viên đã nhận lệnh và bắt đầu tiến hành xử lý',
      });
      onUpdateTask?.(updated);
      toast.success('Đã nhận việc thành công. Bắt đầu xử lý!');
    } catch (err: any) {
      toast.error(err?.message || 'Không thể nhận lệnh bảo trì');
    }
  };

  const handleSubmitApproval = async () => {
    try {
      const updated = await taskService.updateTaskStatus(task.id, {
        status: 'Pending_Verification',
        progressPercent: 100,
        author: user?.fullName || 'Kỹ thuật viên',
        comment: 'Kỹ thuật viên đã hoàn tất các bước và gửi yêu cầu phê duyệt nghiệm thu',
      });
      onUpdateTask?.(updated);
      onAddActivityNote?.(task.id, `[KỸ THUẬT VIÊN]: Đã hoàn tất các bước và gửi yêu cầu phê duyệt nghiệm thu.`);
      dispatch(
        addTaskNotification({
          id: `notif-${Date.now()}`,
          taskId: task.id,
          taskTitle: task.title,
          printerId: task.printerId,
          type: 'PENDING_APPROVAL',
          message: `KTV ${user?.fullName || 'Hiện trường'} đã gửi yêu cầu nghiệm thu đóng lệnh`,
          assigneeName: task.assignee || 'Kỹ thuật viên',
          timestamp: 'Vừa xong',
          isRead: false,
        })
      );
      toast.success('Đã gửi yêu cầu nghiệm thu lên Quản trị viên');
    } catch (err: any) {
      toast.error(err?.message || 'Không thể gửi yêu cầu nghiệm thu');
    }
  };

  const handleApproveTask = async () => {
    try {
      const updated = await taskService.approveTask(task.id);
      dispatch(removeTaskNotificationByTaskId(task.id));
      onUpdateTask?.(updated);
      onCompleteTask?.(task.id);
      toast.success('Đã phê duyệt nghiệm thu & Đóng lệnh thành công!');
    } catch (err: any) {
      toast.error(err?.message || 'Không thể phê duyệt nhiệm vụ');
    }
  };

  const handleRequestRework = async (reason: string) => {
    try {
      const updated = await taskService.reworkTask(task.id, reason);
      dispatch(removeTaskNotificationByTaskId(task.id));
      onUpdateTask?.(updated);
      onAddActivityNote?.(task.id, `[YÊU CẦU LÀM LẠI TỪ ADMIN]: ${reason}`);
      dispatch(
        addTaskNotification({
          id: `notif-${Date.now()}`,
          taskId: task.id,
          taskTitle: task.title,
          printerId: task.printerId,
          type: 'REWORK_REQUIRED',
          message: reason,
          assigneeName: task.assignee || 'Kỹ thuật viên',
          requestedByName: user?.fullName || 'Quản trị viên (Admin)',
          reworkReason: reason,
          timestamp: 'Vừa xong',
          isRead: false,
        })
      );
      toast.success(`Đã gửi yêu cầu làm lại cho KTV ${task.assignee || ''}`);
    } catch (err: any) {
      toast.error(err?.message || 'Không thể gửi yêu cầu làm lại');
    }
  };

  const handleSaveTimeCost = (tc: TimeAndCostSummary) => onUpdateTask?.({ ...task, timeAndCost: tc });
  const handleAddAttachment = (att: TaskAttachment) => {
    const list = task.attachments || [];
    if (!list.some((a) => a.id === att.id || (a.fileName === att.fileName && a.uploadedAt === att.uploadedAt))) {
      onUpdateTask?.({ ...task, attachments: [...list, att] });
    }
  };
  const handleDeleteAttachment = async (attId: string) => {
    try {
      const updated = await taskService.deleteTaskAttachment(task.id, attId);
      onUpdateTask?.(updated);
      toast.success('Đã xoá tệp đính kèm');
    } catch {
      onUpdateTask?.({ ...task, attachments: (task.attachments || []).filter((a) => a.id !== attId) });
      toast.success('Đã xoá tệp đính kèm');
    }
  };

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
          stepNumber: 0,
          stepTitle: 'Trao đổi hãng',
          performerName: user?.fullName || 'Kỹ sư NOC',
          performerAvatar: 'KT',
          actionsTaken: `[HÃNG: ${log.vendorName || 'Chính hãng'} | ${log.contactPerson || ''}] ${log.discussionContent || ''}`,
          resultStatus: 'SUCCESS',
          additionalTimeHours: 0,
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
      <WorkOrderHeaderCard
        task={task}
        isAdmin={Boolean(isAdmin)}
        isHr={Boolean(isHr)}
        canEditTask={canEditTask}
        isCompleted={isCompleted}
        isReworking={isReworking}
        isReadyForApproval={isReadyForApproval}
        completedStepsCount={completedStepsCount}
        totalStepsCount={steps.length}
        allStepsCompleted={allStepsCompleted}
        onOpenTestPrintModal={() => setIsTestPrintModalOpen(true)}
        onOpenReworkModal={() => setIsReworkModalOpen(true)}
        onStartTask={handleStartTask}
        onSubmitApproval={handleSubmitApproval}
        onApproveAndClose={handleApproveTask}
        onReopenTask={onReopenTask}
      />

      {isReworking && (
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 flex items-start gap-3 shadow-xs">
          <FontAwesomeIcon icon={faTriangleExclamation} className="text-amber-600 dark:text-amber-400 text-sm mt-0.5 shrink-0" />
          <div className="flex-1 flex flex-col gap-0.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-bold text-amber-900 dark:text-amber-200">Yêu cầu làm lại từ Quản trị viên</span>
              <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">Tiến độ: {task.progressPercent ?? 80}%</span>
            </div>
            <p className="text-xs text-amber-800 dark:text-amber-300 font-medium m-0">{task.reworkReason}</p>
            <span className="text-[11px] text-amber-700/80 dark:text-amber-400/80 mt-0.5">
              💡 Hãy khắc phục theo yêu cầu và chụp ảnh bản in nghiệm thu mới để gửi duyệt lại.
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        <div className="flex flex-col gap-4">
          <WorkOrderWorkLogsList
            workLogs={task.workLogs || []} steps={steps} selectedStepIdFilter={selectedStepFilter}
            assigneeName={task.assignee} isReadOnly={isGeneralReadOnly}
            onClearStepFilter={() => setSelectedStepFilter(null)} onAddWorkLog={handleAddWorkLog}
          />
          <WorkOrderVendorAndAttachments
            taskId={task.id} uploaderName={user?.fullName || 'Kỹ thuật viên'}
            vendorLogs={task.vendorCommunications || []} attachments={task.attachments || []}
            isReadOnly={isGeneralReadOnly} onAddVendorLog={handleAddVendorLog}
            onAddAttachment={handleAddAttachment} onDeleteAttachment={handleDeleteAttachment}
          />
          <WorkOrderActivityStream
            activityFeed={task.activityFeed || []} isReadOnly={isCompleted}
            onAddNote={(note) => onAddActivityNote?.(task.id, note)}
          />
        </div>

        <div className="flex flex-col gap-4">
          <WorkOrderSubTasksProgress
            steps={steps} workLogs={task.workLogs || []} progressPercent={task.progressPercent || 0}
            isReadOnly={isGeneralReadOnly} onToggleStep={(sId) => onToggleStepStatus?.(task.id, sId)}
            onAddStep={(title) => onAddNewStep?.(task.id, title)} selectedStepIdFilter={selectedStepFilter}
            onSelectStepFilter={setSelectedStepFilter}
          />
          <WorkOrderTimeCostCard
            timeAndCost={task.timeAndCost || { repairTimeHours: null, waitingTimeHours: null, downtimeHours: null, laborCostVnd: null, partsCostVnd: null, totalCostVnd: null }}
            estimatedTimeAndCost={task.estimatedTimeAndCost} isReadOnly={isGeneralReadOnly} onSaveTimeCost={handleSaveTimeCost}
          />
        </div>
      </div>

      <TestPrintReviewModal
        isOpen={isTestPrintModalOpen}
        onClose={() => setIsTestPrintModalOpen(false)}
        task={task}
        onApproveAndClose={handleApproveTask}
        onRequestRework={handleRequestRework}
        isAdmin={Boolean(isAdmin && isReadyForApproval)}
      />
      <ReworkReasonModal
        isOpen={isReworkModalOpen}
        taskId={task.id}
        taskTitle={task.title}
        assigneeName={task.assignee}
        onClose={() => setIsReworkModalOpen(false)}
        onSubmit={handleRequestRework}
      />
    </div>
  );
};

export default WorkOrderDetailView;

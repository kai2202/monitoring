/**
 * Frontend/src/features/dashboard/components/workorder/WorkOrderDetailView.tsx
 *
 * Giao diện Chi Tiết Lệnh Bảo Trì (Work Order Detail View):
 * - Tích hợp Universal Gmail-Style Collaboration Thread & HR Dossier Consolidator Modal.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC, 100% FontAwesome).
 */

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { RootState } from '../../../../app/store';
import { addTaskNotification, removeTaskNotificationByTaskId } from '../../../../app/slices/notificationSlice';
import { DATA_SOURCE } from '../../../../config/dataSource';
import { taskService } from '../../../../services';
import { Task, WorkLogEntry, TaskAttachment, VendorCommunicationLog } from '../../../../types/task';
import { FontAwesomeIcon, faTriangleExclamation } from '../../../../shared/icons';
import {
  WorkOrderHeaderCard,
  WorkOrderMaterialsCard,
  WorkOrderSubTasksProgress,
  WorkOrderWorkLogsList,
  WorkOrderVendorAndAttachments,
} from './';
import { ReworkReasonModal } from './modals';
import { TaskCollaborationThread } from '../../../tasks/components/collaboration';

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
  const isHr = false;
  const [selectedStepFilter, setSelectedStepFilter] = useState<string | null>(null);
  const [isReworkModalOpen, setIsReworkModalOpen] = useState(false);
  const [detailTab, setDetailTab] = useState<'execution' | 'discussion'>('execution');

  const discussionCount = (task.contributions?.length || 0) + (task.vendorCommunications?.length || 0);
  const attachmentCount = task.attachments?.length || 0;

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
  const isReadyForApproval = !isCompleted && !isReworking && task.status === 'Pending_Verification';
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
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Không thể phê duyệt nhiệm vụ');
    }
  };

  const handleRequestRework = async (reason: string) => {
    try {
      const updated = await taskService.reworkTask(task.id, reason);
      dispatch(removeTaskNotificationByTaskId(task.id));
      onUpdateTask?.(updated);
      onAddActivityNote?.(task.id, `[YÊU CẦU LÀM LẠI]: ${reason}`);
      toast.success(`Đã gửi yêu cầu làm lại cho KTV ${task.assignee || ''}`);
    } catch (err: any) {
      toast.error(err?.message || 'Không thể gửi yêu cầu làm lại');
    }
  };

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
    } catch {
      onUpdateTask?.({ ...task, attachments: (task.attachments || []).filter((a) => a.id !== attId) });
    }
    toast.success('Đã xoá tệp đính kèm');
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
        onOpenReworkModal={() => setIsReworkModalOpen(true)}
        onStartTask={handleStartTask}
        onSubmitApproval={handleSubmitApproval}
        onApproveAndClose={handleApproveTask}
        onReopenTask={onReopenTask}
      />

      {isReworking && (
        <div className="px-3.5 py-2.5 rounded-xl bg-amber-50/90 dark:bg-amber-950/30 flex items-start gap-2.5">
          <FontAwesomeIcon icon={faTriangleExclamation} className="text-amber-600 dark:text-amber-400 text-xs mt-0.5 shrink-0" />
          <div className="flex-1 flex flex-col gap-0.5">
            <span className="text-xs font-bold text-amber-900 dark:text-amber-200">Yêu cầu làm lại từ Quản trị viên</span>
            <p className="text-xs text-amber-800 dark:text-amber-300 font-medium m-0">{task.reworkReason}</p>
          </div>
        </div>
      )}

      {/* Sub-tabs điều hướng gọn: 2 tab chính */}
      <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 self-start">
        {[
          { id: 'execution' as const, label: 'Thực thi & Vật tư' },
          ...(task.taskType !== 'SUPPLY_REPLENISHMENT' || (task.vendorCommunications?.length || 0) > 0
            ? [{ id: 'discussion' as const, label: `Trao đổi & Hãng (${discussionCount})` }]
            : []),
        ].map((tab) => {
          const isActive = detailTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setDetailTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Nội dung Sub-tab: nền xám nhẹ tách biệt các card trắng bên trong */}
      <div className="rounded-2xl bg-slate-100/70 dark:bg-slate-800/40 p-2.5 flex flex-col gap-2.5 overflow-hidden">
        {detailTab === 'execution' && (
          <>
            {task.taskType === 'SUPPLY_REPLENISHMENT' && (
              <WorkOrderMaterialsCard
                task={task}
                readOnly={isGeneralReadOnly}
                onUpdateMaterials={(plannedMaterials) => onUpdateTask?.({ ...task, plannedMaterials })}
              />
            )}

            {task.taskType === 'HARDWARE_INSPECTION' && (
              <WorkOrderWorkLogsList
                embedded
                workLogs={task.workLogs || []} steps={steps} selectedStepIdFilter={selectedStepFilter}
                assigneeName={task.assignee} isReadOnly={isGeneralReadOnly}
                onClearStepFilter={() => setSelectedStepFilter(null)} onAddWorkLog={handleAddWorkLog}
              />
            )}

            {(task.taskType !== 'SUPPLY_REPLENISHMENT' || steps.length > 0) && task.taskType !== 'HARDWARE_INSPECTION' && (
              <WorkOrderSubTasksProgress
                embedded
                steps={steps}
                workLogs={task.workLogs || []}
                progressPercent={task.progressPercent || 0}
                isReworking={isReworking}
                isReadOnly={isGeneralReadOnly}
                onToggleStep={(sId) => onToggleStepStatus?.(task.id, sId)}
                onAddStep={(title) => onAddNewStep?.(task.id, title)}
                selectedStepIdFilter={selectedStepFilter}
                onSelectStepFilter={setSelectedStepFilter}
              />
            )}

            {task.taskType !== 'HARDWARE_INSPECTION' && (
              <WorkOrderWorkLogsList
                embedded
                workLogs={task.workLogs || []} steps={steps} selectedStepIdFilter={selectedStepFilter}
                assigneeName={task.assignee} isReadOnly={isGeneralReadOnly}
                onClearStepFilter={() => setSelectedStepFilter(null)} onAddWorkLog={handleAddWorkLog}
              />
            )}

            {task.taskType !== 'SUPPLY_REPLENISHMENT' && (
              <WorkOrderMaterialsCard
                task={task}
                readOnly={isGeneralReadOnly}
                onUpdateMaterials={(plannedMaterials) => onUpdateTask?.({ ...task, plannedMaterials })}
              />
            )}

            <WorkOrderVendorAndAttachments
              embedded
              section="attachments"
              taskId={task.id} uploaderName={user?.fullName || 'Kỹ thuật viên'}
              vendorLogs={task.vendorCommunications || []} attachments={task.attachments || []}
              isReadOnly={isGeneralReadOnly} onAddVendorLog={handleAddVendorLog}
              onAddAttachment={handleAddAttachment} onDeleteAttachment={handleDeleteAttachment}
            />
          </>
        )}

        {detailTab === 'discussion' && (
          <>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900">
              <TaskCollaborationThread task={task} onTaskUpdated={onUpdateTask} />
            </div>
            <WorkOrderVendorAndAttachments
              embedded
              section="vendor"
              taskId={task.id} uploaderName={user?.fullName || 'Kỹ thuật viên'}
              vendorLogs={task.vendorCommunications || []} attachments={task.attachments || []}
              isReadOnly={isGeneralReadOnly} onAddVendorLog={handleAddVendorLog}
              onAddAttachment={handleAddAttachment} onDeleteAttachment={handleDeleteAttachment}
            />
          </>
        )}
      </div>

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

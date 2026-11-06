/**
 * Frontend/src/features/dashboard/components/workorder/WorkOrderDetailView.tsx
 *
 * Giao diện Chi Tiết Lệnh Bảo Trì (Work Order Detail View):
 * - Áp dụng thiết kế Slide-over Task Inspector từ Image 3.
 * - Kết nối TimeCostCard, SubTasksProgress, WorkLogsList, VendorAttachments, ActivityStream.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { RootState } from '../../../../app/store';
import { DATA_SOURCE } from '../../../../config/dataSource';
import { taskService } from '../../../../services';
import { FontAwesomeIcon, faRotate, faCircleCheck, faEye, faFlag, faCalendar, faUser } from '../../../../shared/icons';
import { Task, TimeAndCostSummary, WorkLogEntry, TaskAttachment, VendorCommunicationLog } from '../../../../types/task';
import { WorkOrderTimeCostCard } from './WorkOrderTimeCostCard';
import { WorkOrderSubTasksProgress } from './WorkOrderSubTasksProgress';
import { WorkOrderWorkLogsList } from './WorkOrderWorkLogsList';
import { WorkOrderVendorAndAttachments } from './WorkOrderVendorAndAttachments';
import { WorkOrderActivityStream } from './WorkOrderActivityStream';
import { TestPrintReviewModal } from './TestPrintReviewModal';

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
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === 'ADMIN';
  const isHr = user?.role === 'ASSET_HR' || user?.role === 'DEPARTMENT_HEAD';
  const [selectedStepFilter, setSelectedStepFilter] = useState<string | null>(null);
  const [isTestPrintModalOpen, setIsTestPrintModalOpen] = useState(false);

  const steps = task.dynamicSteps || [];
  const isCompleted = task.status === 'Completed';

  const handleRequestRework = (reason: string) => {
    if (onAddActivityNote) onAddActivityNote(task.id, `[YÊU CẦU LÀM LẠI TỪ ADMIN]: ${reason}`);
    if (onReopenTask) onReopenTask(task.id);
  };

  const handleSaveTimeCost = (updatedTimeCost: TimeAndCostSummary) => {
    if (onUpdateTask) onUpdateTask({ ...task, timeAndCost: updatedTimeCost });
  };

  const handleAddWorkLog = async (log: Partial<WorkLogEntry>) => {
    if (DATA_SOURCE === 'api') {
      try {
        const updatedTask = await taskService.addTaskWorkLog(task.id, log);
        if (onUpdateTask) onUpdateTask(updatedTask);
        toast.success('Đã lưu nhật ký thao tác và cập nhật chi phí bảo trì');
      } catch (err: any) {
        toast.error(err?.message || 'Không thể lưu nhật ký thao tác lên máy chủ');
      }
      return;
    }
    if (onUpdateTask) {
      const updatedLogs = [...(task.workLogs || []), log as WorkLogEntry];
      onUpdateTask({ ...task, workLogs: updatedLogs });
    }
  };

  const handleAddAttachment = (attachment: TaskAttachment) => {
    if (onUpdateTask) {
      const updatedAttachments = [...(task.attachments || []), attachment];
      onUpdateTask({ ...task, attachments: updatedAttachments });
    }
  };

  const handleAddVendorLog = async (log: Partial<VendorCommunicationLog>) => {
    if (DATA_SOURCE === 'api') {
      try {
        const updatedTask = await taskService.addTaskWorkLog(task.id, {
          stepNumber: 0,
          stepTitle: 'Trao đổi hãng',
          performerName: user?.fullName || 'Kỹ sư NOC',
          performerAvatar: 'KT',
          actionsTaken: `[HÃNG: ${log.vendorName || 'Hỗ trợ kỹ thuật chính hãng'} | ${log.contactPerson || ''}] ${log.discussionContent || ''}`,
          resultStatus: 'SUCCESS',
          additionalTimeHours: 0,
        });
        if (onUpdateTask) onUpdateTask(updatedTask);
        toast.success('Đã lưu ghi nhận trao đổi kỹ thuật với hãng');
      } catch (err: any) {
        toast.error(err?.message || 'Không thể lưu trao đổi kỹ thuật với hãng lên máy chủ');
      }
      return;
    }
    if (onUpdateTask) {
      const updatedLogs = [...(task.vendorCommunications || []), log as VendorCommunicationLog];
      onUpdateTask({ ...task, vendorCommunications: updatedLogs });
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* 1. Header Card with Image 3 Task Inspector Badges */}
      <div
        className={`p-5 rounded-3xl border flex items-center justify-between flex-wrap gap-4 shadow-xs ${
          isCompleted
            ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
            : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
        }`}
      >
        <div className="flex flex-col gap-1.5">
          {/* Top badges: ID & Priority Flag */}
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
          </div>

          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
            {task.title}
          </h3>

          {/* Property bar: Assignee & Due Date */}
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

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIsTestPrintModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <FontAwesomeIcon icon={faEye} className="text-xs" />
            <span>Xem ảnh in test</span>
          </button>

          {isCompleted ? (
            <button
              type="button"
              onClick={() => onReopenTask && onReopenTask(task.id)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <FontAwesomeIcon icon={faRotate} className="text-xs" />
              <span>Mở lại nhiệm vụ</span>
            </button>
          ) : isHr ? (
            <span className="px-3.5 py-2 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 text-xs font-bold border border-sky-200/60">
              Hồ sơ đối soát kiểm kê
            </span>
          ) : (
            <>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setIsTestPrintModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 text-xs font-bold border border-amber-200 flex items-center gap-1.5 transition-colors"
                >
                  <FontAwesomeIcon icon={faRotate} className="text-xs" />
                  <span>Yêu cầu làm lại</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => onCompleteTask && onCompleteTask(task.id)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-colors"
              >
                <FontAwesomeIcon icon={faCircleCheck} className="text-xs" />
                <span>{isAdmin ? 'Phê duyệt đóng lệnh' : 'Hoàn tất &amp; Nghiệm thu'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* 2. Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {/* Left Column */}
        <div className="flex flex-col gap-4">
          <WorkOrderWorkLogsList
            workLogs={task.workLogs || []}
            steps={steps}
            selectedStepIdFilter={selectedStepFilter}
            onClearStepFilter={() => setSelectedStepFilter(null)}
            onAddWorkLog={handleAddWorkLog}
          />
          <WorkOrderVendorAndAttachments
            taskId={task.id}
            uploaderName={user?.fullName || 'Kỹ thuật viên'}
            vendorLogs={task.vendorCommunications || []}
            attachments={task.attachments || []}
            onAddVendorLog={handleAddVendorLog}
            onAddAttachment={handleAddAttachment}
          />
          <WorkOrderActivityStream
            activityFeed={task.activityFeed || []}
            onAddNote={(note) => onAddActivityNote && onAddActivityNote(task.id, note)}
          />
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-4">
          <WorkOrderSubTasksProgress
            steps={steps}
            workLogs={task.workLogs || []}
            progressPercent={task.progressPercent || 0}
            onToggleStep={(sId) => onToggleStepStatus && onToggleStepStatus(task.id, sId)}
            onAddStep={(title) => onAddNewStep && onAddNewStep(task.id, title)}
            selectedStepIdFilter={selectedStepFilter}
            onSelectStepFilter={setSelectedStepFilter}
          />
          <WorkOrderTimeCostCard
            timeAndCost={task.timeAndCost || { repairTimeHours: null, waitingTimeHours: null, downtimeHours: null, laborCostVnd: null, partsCostVnd: null, totalCostVnd: null }}
            estimatedTimeAndCost={task.estimatedTimeAndCost}
            onSaveTimeCost={handleSaveTimeCost}
          />
        </div>
      </div>

      <TestPrintReviewModal
        isOpen={isTestPrintModalOpen}
        onClose={() => setIsTestPrintModalOpen(false)}
        task={task}
        onApproveAndClose={() => onCompleteTask && onCompleteTask(task.id)}
        onRequestRework={handleRequestRework}
        isAdmin={isAdmin}
      />
    </div>
  );
};

export default WorkOrderDetailView;

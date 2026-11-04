/**
 * Frontend/src/features/dashboard/components/workorder/WorkOrderDetailView.tsx
 *
 * Giao diện Chi Tiết Lệnh Bảo Trì (Work Order Detail View):
 * - Clean architecture, tách nhỏ các sub-component (< 300 LOC/file).
 * - Kết nối TimeCostCard, SubTasksProgress, WorkLogsList, VendorAttachments, ActivityStream.
 * - Tuân thủ AGENTS.md Rule 7.1.
 */

import React, { useState } from 'react';
import { FontAwesomeIcon, faRotate, faCircleCheck } from '../../../../shared/icons';
import { Task, TimeAndCostSummary, WorkLogEntry, TaskAttachment, VendorCommunicationLog } from '../../../../types/task';
import { WorkOrderTimeCostCard } from './WorkOrderTimeCostCard';
import { WorkOrderSubTasksProgress } from './WorkOrderSubTasksProgress';
import { WorkOrderWorkLogsList } from './WorkOrderWorkLogsList';
import { WorkOrderVendorAndAttachments } from './WorkOrderVendorAndAttachments';
import { WorkOrderActivityStream } from './WorkOrderActivityStream';

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
  const [selectedStepFilter, setSelectedStepFilter] = useState<string | null>(null);

  const steps = task.dynamicSteps || [];
  const isCompleted = task.status === 'Completed';

  const handleSaveTimeCost = (updatedTimeCost: TimeAndCostSummary) => {
    if (onUpdateTask) {
      onUpdateTask({
        ...task,
        timeAndCost: updatedTimeCost,
      });
    }
  };

  const handleAddWorkLog = (log: Partial<WorkLogEntry>) => {
    if (onUpdateTask) {
      const updatedLogs = [...(task.workLogs || []), log as WorkLogEntry];
      onUpdateTask({
        ...task,
        workLogs: updatedLogs,
      });
    }
  };

  const handleAddAttachment = (attachment: TaskAttachment) => {
    if (onUpdateTask) {
      const updatedAttachments = [...(task.attachments || []), attachment];
      onUpdateTask({
        ...task,
        attachments: updatedAttachments,
      });
    }
  };

  const handleAddVendorLog = (log: Partial<VendorCommunicationLog>) => {
    if (onUpdateTask) {
      const updatedLogs = [...(task.vendorCommunications || []), log as VendorCommunicationLog];
      onUpdateTask({
        ...task,
        vendorCommunications: updatedLogs,
      });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      {/* 1. Header Card with Status & Action */}
      <div
        style={{
          padding: '16px 20px',
          borderRadius: '16px',
          backgroundColor: isCompleted ? 'rgba(22, 163, 74, 0.06)' : 'var(--bg-card, #ffffff)',
          border: isCompleted ? '1px solid rgba(22, 163, 74, 0.3)' : '1px solid var(--border-color, #e2e8f0)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                padding: '2px 8px',
                borderRadius: '9999px',
                fontSize: '11px',
                fontWeight: 800,
                backgroundColor: isCompleted ? '#16a34a' : '#2563eb',
                color: '#ffffff',
              }}
            >
              {task.priority || 'P2_High'}
            </span>
            <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: 'var(--text-primary, #0f172a)' }}>
              {task.title}
            </h3>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted, #64748b)', margin: '4px 0 0 0' }}>
            Người phụ trách: <strong>{task.assignee || 'Kỹ sư NOC'}</strong> • Hạn hoàn thành: {task.dueDate || 'Hôm nay'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isCompleted ? (
            <button
              type="button"
              onClick={() => onReopenTask && onReopenTask(task.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: '10px',
                backgroundColor: 'transparent',
                border: '1px solid var(--border-color, #e2e8f0)',
                color: 'var(--text-secondary, #475569)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <FontAwesomeIcon icon={faRotate} style={{ fontSize: '12px' }} />
              <span>Mở lại nhiệm vụ</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onCompleteTask && onCompleteTask(task.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 16px',
                borderRadius: '10px',
                backgroundColor: '#16a34a',
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(22, 163, 74, 0.3)',
              }}
            >
              <FontAwesomeIcon icon={faCircleCheck} style={{ fontSize: '13px' }} />
              <span>Hoàn tất &amp; Nghiệm thu</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Main Content Grid (Left: Work Logs & Notes; Right: Steps Progress & Cost) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '16px',
          alignItems: 'start',
        }}
      >
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <WorkOrderWorkLogsList
            workLogs={task.workLogs || []}
            steps={steps}
            selectedStepIdFilter={selectedStepFilter}
            onClearStepFilter={() => setSelectedStepFilter(null)}
            onAddWorkLog={handleAddWorkLog}
          />
          <WorkOrderVendorAndAttachments
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
    </div>
  );
};

export default WorkOrderDetailView;


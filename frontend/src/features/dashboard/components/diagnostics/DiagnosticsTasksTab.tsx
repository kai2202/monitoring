/**
 * Frontend/src/features/dashboard/components/diagnostics/DiagnosticsTasksTab.tsx
 *
 * Tab Quản Lý Nhiệm Vụ & Lệnh Bảo Trì trong Diagnostics Drawer:
 * - Đang xử lý: Chọn task nhanh qua pills + hiển thị chi tiết.
 * - Kho lịch sử: Dạng đóng/mở (Accordion Collapsible) chọn tới đâu hiện tới đó.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../app/store';
import {
  FontAwesomeIcon,
  faPlus,
  faCircleCheck,
  faChevronDown,
  faChevronUp,
} from '../../../../shared/icons';
import { Task } from '../../../../types/task';
import { WorkOrderDetailView } from '../workorder/WorkOrderDetailView';

interface DiagnosticsTasksTabProps {
  tasks: Task[];
  selectedTaskId: string | null;
  onSelectTask: (id: string) => void;
  onOpenCreateTask: () => void;
  onUpdateTask: (task: Task) => void;
  onCompleteTask: (id: string) => void;
  onReopenTask: (id: string) => void;
  onAddNewStep: (taskId: string, title: string) => void;
  onToggleStep: (taskId: string, stepId: string) => void;
  onAddActivityNote: (taskId: string, note: string) => void;
}

export const DiagnosticsTasksTab: React.FC<DiagnosticsTasksTabProps> = ({
  tasks = [],
  selectedTaskId,
  onSelectTask,
  onOpenCreateTask,
  onUpdateTask,
  onCompleteTask,
  onReopenTask,
  onAddNewStep,
  onToggleStep,
  onAddActivityNote,
}) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === 'ADMIN';
  const [filterMode, setFilterMode] = useState<'active' | 'history'>('active');
  const [expandedHistoryIds, setExpandedHistoryIds] = useState<Record<string, boolean>>({});

  const activeTasks = tasks.filter((t) => t.status !== 'Completed');
  const historyTasks = tasks.filter((t) => t.status === 'Completed');

  // Nếu selectedTaskId thuộc history khi chuyển sang tab history, tự động mở task đó
  useEffect(() => {
    if (selectedTaskId && filterMode === 'history') {
      setExpandedHistoryIds((prev) => ({ ...prev, [selectedTaskId]: true }));
    }
  }, [selectedTaskId, filterMode]);

  const toggleHistoryExpand = (taskId: string) => {
    setExpandedHistoryIds((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  const currentActiveTask = activeTasks.find((t) => t.id === selectedTaskId) || activeTasks[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px 20px' }}>
      {/* 1. Header Controls & Filter Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            type="button"
            onClick={() => setFilterMode('active')}
            style={{
              padding: '6px 14px',
              borderRadius: '9999px',
              fontSize: '11.5px',
              fontWeight: filterMode === 'active' ? 700 : 500,
              backgroundColor: filterMode === 'active' ? '#2563eb' : 'var(--bg-subtle, #f8fafc)',
              color: filterMode === 'active' ? '#ffffff' : 'var(--text-secondary, #475569)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Đang xử lý ({activeTasks.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('history')}
            style={{
              padding: '6px 14px',
              borderRadius: '9999px',
              fontSize: '11.5px',
              fontWeight: filterMode === 'history' ? 700 : 500,
              backgroundColor: filterMode === 'history' ? '#2563eb' : 'var(--bg-subtle, #f8fafc)',
              color: filterMode === 'history' ? '#ffffff' : 'var(--text-secondary, #475569)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Kho lịch sử ({historyTasks.length})
          </button>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={onOpenCreateTask}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '10px',
              backgroundColor: '#16a34a',
              color: '#ffffff',
              fontSize: '11.5px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <FontAwesomeIcon icon={faPlus} style={{ fontSize: '12px' }} />
            <span>Tạo công việc mới</span>
          </button>
        )}
      </div>

      {/* 2. CHẾ ĐỘ 1: ĐANG XỬ LÝ (Active Tasks) */}
      {filterMode === 'active' && (
        <>
          {activeTasks.length > 1 && (
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
              {activeTasks.map((t) => {
                const isSelected = currentActiveTask && currentActiveTask.id === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => onSelectTask(t.id)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '10px',
                      fontSize: '11.5px',
                      fontWeight: isSelected ? 700 : 500,
                      backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.12)' : 'var(--bg-card, #ffffff)',
                      border: isSelected ? '1px solid #2563eb' : '1px solid var(--border-color, #e2e8f0)',
                      color: isSelected ? '#2563eb' : 'var(--text-secondary, #475569)',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {t.title}
                  </button>
                );
              })}
            </div>
          )}

          {currentActiveTask ? (
            <WorkOrderDetailView
              task={currentActiveTask}
              onUpdateTask={onUpdateTask}
              onCompleteTask={onCompleteTask}
              onReopenTask={onReopenTask}
              onAddNewStep={onAddNewStep}
              onToggleStepStatus={onToggleStep}
              onAddActivityNote={onAddActivityNote}
            />
          ) : (
            <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text-muted, #64748b)', fontSize: '13px', backgroundColor: 'var(--bg-subtle, #f8fafc)', borderRadius: '16px', border: '1px dashed var(--border-color, #e2e8f0)' }}>
              Không có nhiệm vụ nào đang xử lý. Bấm nút <strong>"+ Tạo công việc mới"</strong> để giao việc.
            </div>
          )}
        </>
      )}

      {/* 3. CHẾ ĐỘ 2: KHO LỊCH SỬ (History Tasks dạng Đóng / Mở Accordion - Chọn tới đâu hiện tới đó) */}
      {filterMode === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {historyTasks.length === 0 ? (
            <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text-muted, #64748b)', fontSize: '13px', backgroundColor: 'var(--bg-subtle, #f8fafc)', borderRadius: '16px', border: '1px dashed var(--border-color, #e2e8f0)' }}>
              Chưa có công việc nào hoàn tất trong kho lịch sử.
            </div>
          ) : (
            historyTasks.map((task) => {
              const isExpanded = Boolean(expandedHistoryIds[task.id]);
              const steps = task.dynamicSteps || [];
              const completedSteps = steps.filter((s) => s.status === 'Completed').length;

              return (
                <div
                  key={task.id}
                  style={{
                    borderRadius: '14px',
                    border: '1px solid var(--border-color, #e2e8f0)',
                    backgroundColor: 'var(--bg-card, #ffffff)',
                    overflow: 'hidden',
                    transition: 'box-shadow 0.2s ease',
                    boxShadow: isExpanded ? '0 4px 12px rgba(0, 0, 0, 0.05)' : 'none',
                  }}
                >
                  {/* Summary Bar (Bấm để Đóng / Mở) */}
                  <div
                    onClick={() => toggleHistoryExpand(task.id)}
                    style={{
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      backgroundColor: isExpanded ? 'rgba(22, 163, 74, 0.04)' : 'var(--bg-card, #ffffff)',
                      borderBottom: isExpanded ? '1px solid var(--border-color, #e2e8f0)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                      <FontAwesomeIcon icon={faCircleCheck} style={{ fontSize: '15px', color: '#16a34a', flexShrink: 0 }} />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <strong style={{ fontSize: '13px', color: 'var(--text-primary, #0f172a)' }}>
                            {task.title}
                          </strong>
                          <span style={{ fontSize: '10.5px', padding: '1px 7px', borderRadius: '9999px', fontWeight: 700, backgroundColor: 'rgba(22, 163, 74, 0.12)', color: '#16a34a' }}>
                            Hoàn tất
                          </span>
                          <span style={{ fontSize: '10.5px', padding: '1px 6px', borderRadius: '6px', backgroundColor: 'var(--bg-subtle, #f1f5f9)', color: 'var(--text-muted, #64748b)', fontFamily: "'JetBrains Mono', monospace" }}>
                            {task.id}
                          </span>
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)' }}>
                          Người phụ trách: {task.assignee || 'Kỹ sư NOC'}
                          {steps.length > 0 && ` • ${completedSteps}/${steps.length} bước (100%)`}
                          {task.completedDate && ` • Ngày đóng: ${new Date(task.completedDate).toLocaleDateString('vi-VN')}`}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, marginLeft: '12px' }}>
                      <span style={{ fontSize: '11px', color: isExpanded ? '#2563eb' : 'var(--text-muted, #64748b)', fontWeight: 600 }}>
                        {isExpanded ? 'Thu gọn' : 'Xem chi tiết'}
                      </span>
                      <FontAwesomeIcon
                        icon={isExpanded ? faChevronUp : faChevronDown}
                        style={{ fontSize: '11.5px', color: isExpanded ? '#2563eb' : 'var(--text-muted, #94a3b8)' }}
                      />
                    </div>
                  </div>

                  {/* Chi Tiết Nhiệm Vụ (Chỉ hiển thị khi bấm mở) */}
                  {isExpanded && (
                    <div style={{ padding: '14px', backgroundColor: 'var(--bg-subtle, #f8fafc)' }}>
                      <WorkOrderDetailView
                        task={task}
                        onUpdateTask={onUpdateTask}
                        onCompleteTask={onCompleteTask}
                        onReopenTask={(id) => {
                          onReopenTask(id);
                          // Tự đóng mục history này sau khi mở lại thành active
                          setExpandedHistoryIds((prev) => ({ ...prev, [id]: false }));
                        }}
                        onAddNewStep={onAddNewStep}
                        onToggleStepStatus={onToggleStep}
                        onAddActivityNote={onAddActivityNote}
                      />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default DiagnosticsTasksTab;

/**
 * Frontend/src/features/dashboard/components/workorder/WorkOrderSubTasksProgress.tsx
 *
 * Tiến Trình & Các Bước Kỹ Thuật (Dynamic Stepper):
 * - Thêm bước mới, đánh dấu hoàn tất bước, hiển thị thanh tiến độ %.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React, { useState } from 'react';
import {
  FontAwesomeIcon,
  faCircleCheck,
  faCircleDot,
  faPlus,
  faFileLines,
} from '../../../../shared/icons';
import { TaskStepItem, WorkLogEntry } from '../../../../types/task';

interface WorkOrderSubTasksProgressProps {
  steps: TaskStepItem[];
  progressPercent: number;
  workLogs?: WorkLogEntry[];
  onToggleStep: (stepId: string) => void;
  onAddStep: (stepTitle: string) => void;
  onSelectStepFilter?: (stepId: string | null) => void;
  selectedStepIdFilter?: string | null;
}

export const WorkOrderSubTasksProgress: React.FC<WorkOrderSubTasksProgressProps> = ({
  steps,
  progressPercent,
  workLogs = [],
  onToggleStep,
  onAddStep,
  onSelectStepFilter,
  selectedStepIdFilter,
}) => {
  const [newStepTitle, setNewStepTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStepTitle.trim()) return;
    onAddStep(newStepTitle.trim());
    setNewStepTitle('');
    setIsAdding(false);
  };

  const completedCount = steps.filter((s) => s.status === 'Completed').length;
  const effectivePercent = steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : (progressPercent || 0);

  return (
    <div
      style={{
        padding: '16px 18px',
        borderRadius: '16px',
        backgroundColor: 'var(--bg-card, #ffffff)',
        border: '1px solid var(--border-color, #e2e8f0)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      {/* Header & Progress Bar */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <strong style={{ fontSize: '13px', color: 'var(--text-primary, #0f172a)' }}>
            Tiến Trình Xử Lý ({completedCount}/{steps.length} bước)
          </strong>
          <span style={{ fontSize: '12px', fontWeight: 800, color: '#16a34a', fontFamily: "'JetBrains Mono', monospace" }}>
            {effectivePercent}%
          </span>
        </div>
        <div style={{ height: '6px', borderRadius: '9999px', backgroundColor: 'var(--bg-subtle, #f8fafc)', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${effectivePercent}%`,
              backgroundColor: '#16a34a',
              borderRadius: '9999px',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      {/* Stepper List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {steps.map((step, idx) => {
          const isDone = step.status === 'Completed';
          const isFiltered = selectedStepIdFilter === step.id;
          const logCount = workLogs.filter((l) => l.stepId === step.id).length;

          return (
            <div
              key={step.id}
              onClick={() => onSelectStepFilter && onSelectStepFilter(isFiltered ? null : step.id)}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '8px 10px',
                borderRadius: '10px',
                backgroundColor: isFiltered ? 'rgba(37, 99, 235, 0.08)' : 'var(--bg-subtle, #f8fafc)',
                border: isFiltered ? '1px solid #2563eb' : '1px solid var(--border-color, #e2e8f0)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleStep(step.id);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  marginTop: '1px',
                  color: isDone ? '#16a34a' : 'var(--text-muted, #64748b)',
                }}
              >
                {isDone ? (
                  <FontAwesomeIcon icon={faCircleCheck} style={{ fontSize: '15px' }} />
                ) : (
                  <FontAwesomeIcon icon={faCircleDot} style={{ fontSize: '15px' }} />
                )}
              </button>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: isDone ? 'var(--text-muted, #64748b)' : 'var(--text-primary, #0f172a)',
                      textDecoration: isDone ? 'line-through' : 'none',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {idx + 1}. {step.title}
                  </span>

                  {/* Badge đếm số nhật ký thao tác thuộc bước này */}
                  <span
                    title={`Có ${logCount} nhật ký ghi nhận cho bước này. Bấm để lọc nhật ký.`}
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: '9999px',
                      backgroundColor: isFiltered
                        ? '#2563eb'
                        : logCount > 0
                        ? 'rgba(37, 99, 235, 0.12)'
                        : 'rgba(100, 116, 139, 0.08)',
                      color: isFiltered ? '#ffffff' : logCount > 0 ? '#2563eb' : 'var(--text-muted, #94a3b8)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      flexShrink: 0,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <FontAwesomeIcon icon={faFileLines} style={{ fontSize: '9px' }} />
                    <span>{logCount > 0 ? `${logCount} nhật ký` : '0 nhật ký'}</span>
                  </span>
                </div>

                {isFiltered && (
                  <div style={{ fontSize: '10px', color: '#2563eb', fontWeight: 600, marginTop: '2px' }}>
                    ● Đang lọc hiển thị nhật ký của bước này (bấm lại để bỏ lọc)
                  </div>
                )}

                {step.completedAt && (
                  <div style={{ fontSize: '10px', color: '#16a34a', marginTop: '2px' }}>
                    ✓ Hoàn tất {step.completedAt} bởi {step.completedBy || 'Kỹ thuật viên'}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Step Form */}
      {isAdding ? (
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: '6px' }}>
          <input
            type="text"
            placeholder="Tên bước kỹ thuật mới..."
            value={newStepTitle}
            onChange={(e) => setNewStepTitle(e.target.value)}
            autoFocus
            style={{
              flex: 1,
              padding: '6px 10px',
              fontSize: '11.5px',
              borderRadius: '8px',
              border: '1px solid var(--border-color, #e2e8f0)',
            }}
          />
          <button
            type="submit"
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Thêm
          </button>
          <button
            type="button"
            onClick={() => setIsAdding(false)}
            style={{
              padding: '6px 8px',
              borderRadius: '8px',
              backgroundColor: 'transparent',
              border: '1px solid var(--border-color, #e2e8f0)',
              color: 'var(--text-muted, #64748b)',
              fontSize: '11px',
              cursor: 'pointer',
            }}
          >
            Hủy
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '6px',
            borderRadius: '8px',
            border: '1px dashed var(--border-color, #e2e8f0)',
            backgroundColor: 'transparent',
            color: '#2563eb',
            fontSize: '11.5px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <FontAwesomeIcon icon={faPlus} style={{ fontSize: '12px' }} />
          <span>Thêm bước kỹ thuật</span>
        </button>
      )}
    </div>
  );
};


/**
 * Frontend/src/features/dashboard/components/timeline/TimelineTaskBarItem.tsx
 *
 * Thanh Tiến Độ Công Việc Trên Trục Thời Gian (Task Bar Item):
 * - Màu sắc pastel bo góc tròn mềm mại theo phân loại nhiệm vụ.
 * - Khóa boxSizing: border-box tuyệt đối không để padding/border làm tràn ra khỏi ô ngày.
 * - Hỗ trợ tick hoàn thành xanh và hiển thị phần trăm chuẩn JetBrains Mono.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React from 'react';
import { FontAwesomeIcon, faCircleCheck } from '../../../../shared/icons';
import { Task, TaskType } from '../../../../types/task';

interface TimelineTaskBarItemProps {
  task: Task;
  leftPercent?: number;
  widthPercent?: number;
  leftPx?: number;
  widthPx?: number;
  top?: number;
  height?: number;
  onClick: () => void;
  onMouseEnter: (e: React.MouseEvent) => void;
  onMouseLeave: () => void;
}

const TYPE_COLOR_MAP: Record<string, { bg: string; border: string; text: string; fill: string }> = {
  CORRECTIVE_REPAIR: { bg: '#fee2e2', border: '#f87171', text: '#991b1b', fill: '#ef4444' },
  PREVENTIVE_MAINTENANCE: { bg: '#fef3c7', border: '#fcd34d', text: '#92400e', fill: '#f59e0b' },
  SUPPLIES_REPLACEMENT: { bg: '#dcfce7', border: '#86efac', text: '#166534', fill: '#16a34a' },
  SUPPLY_REPLENISHMENT: { bg: '#dcfce7', border: '#86efac', text: '#166534', fill: '#16a34a' },
  ROUTINE_INSPECTION: { bg: '#f3e8ff', border: '#d8b4fe', text: '#6b21a8', fill: '#8b5cf6' },
  HARDWARE_INSPECTION: { bg: '#f3e8ff', border: '#d8b4fe', text: '#6b21a8', fill: '#8b5cf6' },
  GENERAL_MAINTENANCE: { bg: '#e0f2fe', border: '#7dd3fc', text: '#075985', fill: '#0284c7' },
};

export const TimelineTaskBarItem: React.FC<TimelineTaskBarItemProps> = ({
  task,
  leftPercent = 0,
  widthPercent = 0,
  leftPx,
  widthPx,
  top = 6,
  height = 32,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  const isCompleted = task.status === 'Completed';
  const taskType = task.taskType || (task as any).type || 'CORRECTIVE_REPAIR';
  const colors = TYPE_COLOR_MAP[taskType] || TYPE_COLOR_MAP.CORRECTIVE_REPAIR;

  return (
    <div
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        position: 'absolute',
        left: leftPx !== undefined ? `${leftPx}px` : `${Math.max(0, leftPercent)}%`,
        width: widthPx !== undefined ? `${widthPx}px` : `${Math.max(4, Math.min(100 - leftPercent, widthPercent))}%`,
        top: `${top}px`,
        height: `${height}px`,
        backgroundColor: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: '8px',
        padding: '2px 8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'pointer',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
        overflow: 'hidden',
        zIndex: 2,
        boxSizing: 'border-box',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', overflow: 'hidden' }}>
        {isCompleted ? (
          <FontAwesomeIcon icon={faCircleCheck} style={{ fontSize: '11px', color: '#16a34a' }} />
        ) : (
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: colors.fill, flexShrink: 0 }} />
        )}
        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            color: colors.text,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {task.title}
        </span>
      </div>

      <span
        style={{
          fontSize: '10px',
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 800,
          color: colors.text,
          marginLeft: '4px',
          flexShrink: 0,
        }}
      >
        {isCompleted ? '100%' : `${task.progressPercent || 0}%`}
      </span>
    </div>
  );
};

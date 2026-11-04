/**
 * Frontend/src/features/printers/components/workorders/WorkOrderTableRow.tsx
 *
 * Dòng Hiển Thị Lệnh Bảo Trì (Work Order Table Row):
 * - Hỗ trợ bấm mũi tên mở rộng (Expandable Row) và click xem chi tiết lệnh.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React from 'react';
import {
  FontAwesomeIcon,
  faChevronRight,
  faChevronDown,
  faFire,
  faTriangleExclamation,
  faClock,
} from '../../../../shared/icons';
import { Task, TaskPriority, TaskStatus } from '../../../../types/task';
import { Printer } from '../../../../types/printer';

interface WorkOrderTableRowProps {
  task: Task;
  printer?: Printer;
  isExpanded: boolean;
  onToggleExpand: (e: React.MouseEvent) => void;
  onOpenDetail: () => void;
}

export const WorkOrderTableRow: React.FC<WorkOrderTableRowProps> = ({
  task,
  printer,
  isExpanded,
  onToggleExpand,
  onOpenDetail,
}) => {
  const steps = task.dynamicSteps || [];
  const completedSteps = steps.filter((s) => s.status === 'Completed').length;

  const renderPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'P1_Urgent':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#dc2626', fontWeight: 700, fontSize: '11.5px' }}>
            <FontAwesomeIcon icon={faFire} style={{ fontSize: '12px', color: '#dc2626' }} />
            <span>Critical</span>
          </span>
        );
      case 'P2_High':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#ea580c', fontWeight: 600, fontSize: '11.5px' }}>
            <FontAwesomeIcon icon={faTriangleExclamation} style={{ fontSize: '12px', color: '#ea580c' }} />
            <span>High</span>
          </span>
        );
      case 'P3_Medium':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#d97706', fontWeight: 600, fontSize: '11.5px' }}>
            <FontAwesomeIcon icon={faClock} style={{ fontSize: '12px', color: '#d97706' }} />
            <span>Medium</span>
          </span>
        );
      default:
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#0284c7', fontWeight: 500, fontSize: '11.5px' }}>
            <FontAwesomeIcon icon={faChevronDown} style={{ fontSize: '11px', color: '#0284c7' }} />
            <span>Low</span>
          </span>
        );
    }
  };

  const renderStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'In_Progress':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#16a34a' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#16a34a' }} />
            <span>In Progress</span>
          </span>
        );
      case 'Planned':
      case 'Waiting':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#d97706' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#d97706' }} />
            <span>{status === 'Planned' ? 'Scheduled' : 'On-hold'}</span>
          </span>
        );
      case 'Completed':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#059669' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#059669' }} />
            <span>Completed</span>
          </span>
        );
      default:
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#64748b' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#64748b' }} />
            <span>Open</span>
          </span>
        );
    }
  };

  return (
    <tr
      onClick={onOpenDetail}
      style={{
        borderBottom: '1px solid var(--border-color, #e2e8f0)',
        cursor: 'pointer',
        transition: 'background-color 0.12s ease',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-subtle, #f8fafc)')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      {/* 1. Expand Arrow & Title */}
      <td style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
          <button
            type="button"
            onClick={onToggleExpand}
            style={{
              background: 'none',
              border: 'none',
              padding: '2px',
              cursor: 'pointer',
              color: 'var(--text-muted, #64748b)',
              marginTop: '1px',
            }}
          >
            {isExpanded ? (
              <FontAwesomeIcon icon={faChevronDown} style={{ fontSize: '13px' }} />
            ) : (
              <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: '13px' }} />
            )}
          </button>
          <div>
            <strong style={{ fontSize: '13px', color: 'var(--text-primary, #0f172a)' }}>
              {task.title}
            </strong>
            <div style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)', marginTop: '2px' }}>
              Mã: <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{task.id}</span>
              {steps.length > 0 && ` • ${completedSteps}/${steps.length} bước (${task.progressPercent || 0}%)`}
            </div>
          </div>
        </div>
      </td>

      {/* 2. Assignee / Owner */}
      <td style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              fontSize: '10px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {(task.assignee || 'KT')[0]}
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-primary, #0f172a)' }}>
            {task.assignee || 'Kỹ sư NOC'}
          </span>
        </div>
      </td>

      {/* 3. Status */}
      <td style={{ padding: '12px 16px' }}>
        {renderStatusBadge(task.status)}
      </td>

      {/* 4. Priority */}
      <td style={{ padding: '12px 16px' }}>
        {renderPriorityBadge(task.priority)}
      </td>

      {/* 5. Target Asset & Location */}
      <td style={{ padding: '12px 16px' }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary, #0f172a)' }}>
          {task.printerName}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)' }}>
          {task.location}
        </div>
      </td>

      {/* 6. Error Code */}
      <td style={{ padding: '12px 16px' }}>
        {task.errorCode ? (
          <span
            style={{
              padding: '2px 6px',
              borderRadius: '6px',
              fontSize: '11px',
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 700,
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
            }}
          >
            {task.errorCode}
          </span>
        ) : (
          <span style={{ color: 'var(--text-muted, #64748b)', fontSize: '11px' }}>—</span>
        )}
      </td>

      {/* 7. Action */}
      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
        <button
          type="button"
          onClick={onOpenDetail}
          style={{
            padding: '5px 10px',
            borderRadius: '6px',
            backgroundColor: 'var(--bg-subtle, #f8fafc)',
            border: '1px solid var(--border-color, #e2e8f0)',
            color: '#2563eb',
            fontSize: '11.5px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Chi tiết →
        </button>
      </td>
    </tr>
  );
};


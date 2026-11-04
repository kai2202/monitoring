/**
 * Frontend/src/features/printers/components/workorders/WorkOrdersSubStepsRow.tsx
 *
 * Dòng Mở Rộng Hiển Thị Các Bước Kỹ Thuật (Sub-steps Expandable Row):
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React from 'react';
import { FontAwesomeIcon, faCircleCheck, faCircleDot } from '../../../../shared/icons';
import { Task } from '../../../../types/task';

interface WorkOrdersSubStepsRowProps {
  task: Task;
}

export const WorkOrdersSubStepsRow: React.FC<WorkOrdersSubStepsRowProps> = ({ task }) => {
  const steps = task.dynamicSteps || [];
  const workLogs = task.workLogs || [];

  return (
    <tr style={{ backgroundColor: 'var(--bg-subtle, #f8fafc)', borderBottom: '1px solid var(--border-color, #e2e8f0)' }}>
      <td colSpan={7} style={{ padding: '14px 20px 16px 42px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <strong style={{ fontSize: '11.5px', color: 'var(--text-secondary, #475569)' }}>
            Tiến độ chi tiết từng bước kỹ thuật ({steps.length} bước):
          </strong>

          {steps.length === 0 ? (
            <span style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)' }}>Chưa phân chia bước kỹ thuật.</span>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '8px' }}>
              {steps.map((s, idx) => {
                const isDone = s.status === 'Completed';

                return (
                  <div
                    key={s.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-card, #ffffff)',
                      border: '1px solid var(--border-color, #e2e8f0)',
                      fontSize: '11.5px',
                    }}
                  >
                    {isDone ? (
                      <FontAwesomeIcon icon={faCircleCheck} style={{ fontSize: '13px', color: '#16a34a' }} />
                    ) : (
                      <FontAwesomeIcon icon={faCircleDot} style={{ fontSize: '13px', color: '#94a3b8' }} />
                    )}
                    <span style={{ color: isDone ? 'var(--text-muted, #64748b)' : 'var(--text-primary, #0f172a)', textDecoration: isDone ? 'line-through' : 'none' }}>
                      {idx + 1}. {s.title}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {workLogs.length > 0 && (
            <div style={{ marginTop: '6px', fontSize: '11px', color: 'var(--text-muted, #64748b)' }}>
              Nhật ký gần nhất: <em>"{workLogs[workLogs.length - 1].actionsTaken}"</em> bởi {workLogs[workLogs.length - 1].performer}
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};


/**
 * Frontend/src/features/operations/components/OperationsTaskBoard.tsx
 *
 * Bảng Nhiệm Vụ & Công Việc Bảo Trì (Operations Task Board):
 * - Bộ lọc trạng thái, đánh dấu hoàn thành, người phụ trách và ngày hoàn thành.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React from 'react';
import { ClipboardList, CheckCircle2, Clock, Check } from 'lucide-react';
import { Task } from '../../../../types/task';

interface OperationsTaskBoardProps {
  tasks: Task[];
  activeTab: 'all' | 'in_progress' | 'pending' | 'completed';
  onTabChange: (tab: 'all' | 'in_progress' | 'pending' | 'completed') => void;
  onToggleStatus: (task: Task) => void;
}

export const OperationsTaskBoard: React.FC<OperationsTaskBoardProps> = ({
  tasks,
  activeTab,
  onTabChange,
  onToggleStatus,
}) => {
  return (
    <div
      style={{
        padding: '20px 24px',
        borderRadius: '20px',
        backgroundColor: 'var(--bg-card, #ffffff)',
        border: '1px solid var(--border-color, #e2e8f0)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ClipboardList size={18} color="#2563eb" />
          <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: 'var(--text-primary, #0f172a)' }}>
            Quản Lý Công Việc Bảo Trì ({tasks.length})
          </h3>
        </div>

        <div style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--bg-subtle, #f8fafc)', padding: '2px', borderRadius: '8px', border: '1px solid var(--border-color, #e2e8f0)' }}>
          {[
            { id: 'all' as const, label: 'Tất cả' },
            { id: 'in_progress' as const, label: 'Đang làm' },
            { id: 'pending' as const, label: 'Chờ xử lý' },
            { id: 'completed' as const, label: 'Đã xong' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              style={{
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: activeTab === tab.id ? 700 : 500,
                borderRadius: '6px',
                border: 'none',
                backgroundColor: activeTab === tab.id ? 'var(--bg-card, #ffffff)' : 'transparent',
                color: activeTab === tab.id ? '#2563eb' : 'var(--text-muted, #64748b)',
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {tasks.length === 0 ? (
          <span style={{ fontSize: '12px', color: 'var(--text-muted, #64748b)', padding: '20px', textAlign: 'center' }}>
            Không có công việc nào trong danh mục này.
          </span>
        ) : (
          tasks.map((task) => {
            const isCompleted = task.status === 'Completed';

            return (
              <div
                key={task.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  backgroundColor: isCompleted ? 'rgba(22, 163, 74, 0.04)' : 'var(--bg-subtle, #f8fafc)',
                  border: isCompleted ? '1px solid rgba(22, 163, 74, 0.25)' : '1px solid var(--border-color, #e2e8f0)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        padding: '1px 6px',
                        borderRadius: '9999px',
                        fontSize: '10px',
                        fontWeight: 800,
                        backgroundColor: '#2563eb',
                        color: '#ffffff',
                      }}
                    >
                      {task.priority || 'P2'}
                    </span>
                    <strong style={{ fontSize: '13px', color: isCompleted ? 'var(--text-muted, #64748b)' : 'var(--text-primary, #0f172a)', textDecoration: isCompleted ? 'line-through' : 'none' }}>
                      {task.title}
                    </strong>
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-secondary, #475569)', marginTop: '3px' }}>
                    {task.printerName} • Phụ trách: <strong>{task.assignee}</strong> • Hạn: {task.dueDate || 'Hôm nay'}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onToggleStatus(task)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '5px 10px',
                    borderRadius: '8px',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    border: '1px solid var(--border-color, #e2e8f0)',
                    backgroundColor: isCompleted ? '#16a34a' : 'var(--bg-card, #ffffff)',
                    color: isCompleted ? '#ffffff' : 'var(--text-primary, #0f172a)',
                    cursor: 'pointer',
                  }}
                >
                  <Check size={12} />
                  <span>{isCompleted ? 'Hoàn tất' : 'Xong việc'}</span>
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};


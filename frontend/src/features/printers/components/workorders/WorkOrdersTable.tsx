/**
 * Frontend/src/features/printers/components/workorders/WorkOrdersTable.tsx
 *
 * Bảng Quản Lý Lệnh Bảo Trì (Work Orders Table):
 * - Clean architecture, tách nhỏ các sub-component (< 300 LOC/file).
 * - Kết nối WorkOrdersFilterBar, WorkOrderTableRow, WorkOrdersSubStepsRow.
 * - Tuân thủ AGENTS.md Rule 7.1.
 */

import React, { useState, useMemo } from 'react';
import { Task } from '../../../../types/task';
import { Printer } from '../../../../types/printer';
import { WorkOrdersFilterBar } from './WorkOrdersFilterBar';
import { WorkOrderTableRow } from './WorkOrderTableRow';
import { WorkOrdersSubStepsRow } from './WorkOrdersSubStepsRow';

export interface WorkOrdersTableProps {
  tasks: Task[];
  printers?: Printer[];
  onOpenTaskDetail: (printer: Printer, taskId: string) => void;
  onSwitchToTimelineView?: () => void;
}

export const WorkOrdersTable: React.FC<WorkOrdersTableProps> = ({
  tasks = [],
  printers = [],
  onOpenTaskDetail,
  onSwitchToTimelineView,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [scopeFilter, setScopeFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [codeFilter, setCodeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [expandedTaskIds, setExpandedTaskIds] = useState<Record<string, boolean>>({});

  const toggleRowExpand = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedTaskIds((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  const availableCodes = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((t) => {
      if (t.errorCode) set.add(t.errorCode);
    });
    return Array.from(set);
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (scopeFilter === 'active' && t.status === 'Completed') return false;
      if (scopeFilter === 'completed' && t.status !== 'Completed') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          t.title.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q) ||
          t.printerName.toLowerCase().includes(q) ||
          t.assignee.toLowerCase().includes(q) ||
          (t.errorCode && t.errorCode.toLowerCase().includes(q)) ||
          t.location.toLowerCase().includes(q);
        if (!match) return false;
      }

      if (codeFilter !== 'all' && t.errorCode !== codeFilter) return false;
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;

      return true;
    });
  }, [tasks, scopeFilter, searchQuery, codeFilter, statusFilter, priorityFilter]);

  const getPrinterForTask = (printerId: string): Printer | undefined => {
    return printers?.find((p) => p.id === printerId);
  };

  return (
    <div
      style={{
        borderRadius: '20px',
        backgroundColor: 'var(--bg-card, #ffffff)',
        border: '1px solid var(--border-color, #e2e8f0)',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
        overflow: 'hidden',
      }}
    >
      {/* Filter Bar */}
      <WorkOrdersFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        scopeFilter={scopeFilter}
        onScopeFilterChange={setScopeFilter}
        codeFilter={codeFilter}
        onCodeFilterChange={setCodeFilter}
        availableCodes={availableCodes}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        priorityFilter={priorityFilter}
        onPriorityFilterChange={setPriorityFilter}
        onSwitchToTimelineView={onSwitchToTimelineView}
      />

      {/* Table Content */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '980px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color, #e2e8f0)', backgroundColor: 'var(--bg-subtle, #f8fafc)', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted, #64748b)' }}>
              <th style={{ padding: '12px 16px', width: '320px' }}>TÊN LỆNH BẢO TRÌ &amp; MÃ</th>
              <th style={{ padding: '12px 16px', width: '150px' }}>PHỤ TRÁCH</th>
              <th style={{ padding: '12px 16px', width: '130px' }}>TRẠNG THÁI</th>
              <th style={{ padding: '12px 16px', width: '110px' }}>ƯU TIÊN</th>
              <th style={{ padding: '12px 16px', width: '180px' }}>THIẾT BỊ &amp; VỊ TRÍ</th>
              <th style={{ padding: '12px 16px', width: '100px' }}>MÃ LỖI</th>
              <th style={{ padding: '12px 16px', width: '90px', textAlign: 'right' }}>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted, #64748b)' }}>
                  Không tìm thấy lệnh bảo trì nào trong bộ lọc hiện tại.
                </td>
              </tr>
            ) : (
              filteredTasks.map((task) => {
                const targetPrinter = getPrinterForTask(task.printerId) || {
                  id: task.printerId,
                  name: task.printerName,
                  model: task.printerModel || 'Enterprise Model',
                  location: task.location,
                  status: 'Online',
                };
                const isExpanded = Boolean(expandedTaskIds[task.id]);

                return (
                  <React.Fragment key={task.id}>
                    <WorkOrderTableRow
                      task={task}
                      printer={targetPrinter as any}
                      isExpanded={isExpanded}
                      onToggleExpand={(e) => toggleRowExpand(task.id, e)}
                      onOpenDetail={() => onOpenTaskDetail(targetPrinter as any, task.id)}
                    />
                    {isExpanded && <WorkOrdersSubStepsRow task={task} />}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WorkOrdersTable;


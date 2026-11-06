/**
 * Frontend/src/features/printers/components/workorders/WorkOrdersTable.tsx
 *
 * Bảng Quản Lý Lệnh Bảo Trì (Work Orders Table):
 * - Tích hợp WorkOrdersFilterBar, WorkOrderTableRow, WorkOrdersSubStepsRow.
 * - Hỗ trợ Admin điều phối KTV (WorkOrderReassignModal) và Hủy lệnh (WorkOrderCancelModal).
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../app/store';
import { Task } from '../../../../types/task';
import { Printer } from '../../../../types/printer';
import { locationService } from '../../../../services';
import { WorkOrdersFilterBar } from './WorkOrdersFilterBar';
import { WorkOrderTableRow } from './WorkOrderTableRow';
import { WorkOrdersSubStepsRow } from './WorkOrdersSubStepsRow';
import { TechnicianPerformanceCard } from './TechnicianPerformanceCard';
import { WorkOrderReassignModal } from './WorkOrderReassignModal';
import { WorkOrderCancelModal } from './WorkOrderCancelModal';

export interface WorkOrdersTableProps {
  tasks: Task[];
  printers?: Printer[];
  onOpenTaskDetail: (printer: Printer, taskId: string) => void;
  onSwitchToTimelineView?: () => void;
  onRefreshTasks?: () => void;
}

export const WorkOrdersTable: React.FC<WorkOrdersTableProps> = ({
  tasks = [],
  printers = [],
  onOpenTaskDetail,
  onSwitchToTimelineView,
  onRefreshTasks,
}) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === 'ADMIN';
  const isFieldTech = user?.role === 'FIELD_TECH' || user?.role === 'FIELD_TECHNICIAN';

  const [searchQuery, setSearchQuery] = useState('');
  const [scopeFilter, setScopeFilter] = useState<'all' | 'my_tasks' | 'active' | 'completed'>('all');
  const [codeFilter, setCodeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [floorFilter, setFloorFilter] = useState('all');
  const [expandedTaskIds, setExpandedTaskIds] = useState<Record<string, boolean>>({});

  const [reassigningTask, setReassigningTask] = useState<Task | null>(null);
  const [cancellingTask, setCancellingTask] = useState<Task | null>(null);

  const branches = useMemo(() => locationService.getBranchNames(), []);
  const floors = useMemo(() => locationService.getFloorsByBranch(branchFilter), [branchFilter]);

  const myTasksCount = useMemo(() => {
    const userName = user?.fullName?.toLowerCase().trim() || '';
    return tasks.filter((t) => {
      const a = (t.assignee || '').toLowerCase();
      return Boolean(user?.id && t.assigneeId === user.id) || Boolean(userName && a.includes(userName));
    }).length;
  }, [tasks, user]);

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

  const getPrinterForTask = (printerId: string): Printer | undefined => {
    return printers?.find((p) => p.id === printerId);
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (scopeFilter === 'active' && t.status === 'Completed') return false;
      if (scopeFilter === 'completed' && t.status !== 'Completed') return false;
      if (scopeFilter === 'my_tasks') {
        const userName = user?.fullName?.toLowerCase().trim() || '';
        const a = (t.assignee || '').toLowerCase();
        const isMine = Boolean(user?.id && t.assigneeId === user.id) || Boolean(userName && a.includes(userName));
        if (!isMine) return false;
      }

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

      if (branchFilter !== 'all') {
        const p = getPrinterForTask(t.printerId);
        const matchB = (p?.branch && p.branch === branchFilter) || t.location.includes(branchFilter);
        if (!matchB) return false;
      }

      if (floorFilter !== 'all') {
        const p = getPrinterForTask(t.printerId);
        const matchF = (p?.floor && p.floor === floorFilter) || t.location.includes(floorFilter);
        if (!matchF) return false;
      }

      return true;
    });
  }, [tasks, scopeFilter, searchQuery, codeFilter, statusFilter, priorityFilter, branchFilter, floorFilter, printers, user, isFieldTech]);

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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* KPI Performance Card for HR & Management Audit */}
        <TechnicianPerformanceCard tasks={tasks} />
      </div>

      <div
        style={{
          borderRadius: '20px',
          backgroundColor: 'var(--bg-card, #ffffff)',
          borderTop: '1px solid var(--border-color, #e2e8f0)',
          overflow: 'hidden',
        }}
      >
        <WorkOrdersFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          scopeFilter={scopeFilter}
          onScopeFilterChange={setScopeFilter}
          myTasksCount={myTasksCount}
          codeFilter={codeFilter}
          onCodeFilterChange={setCodeFilter}
          availableCodes={availableCodes}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          priorityFilter={priorityFilter}
          onPriorityFilterChange={setPriorityFilter}
          branchFilter={branchFilter}
          onBranchFilterChange={setBranchFilter}
          branches={branches}
          floorFilter={floorFilter}
          onFloorFilterChange={setFloorFilter}
          floors={floors}
          onSwitchToTimelineView={onSwitchToTimelineView}
        />

        {/* Table Content */}
        <div className="custom-scrollbar" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '980px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color, #e2e8f0)', backgroundColor: 'var(--bg-subtle, #f8fafc)', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted, #64748b)' }}>
                <th style={{ padding: '12px 16px', width: '320px' }}>MÃ &amp; NỘI DUNG XỬ LÝ</th>
                <th style={{ padding: '12px 16px', width: '150px' }}>PHỤ TRÁCH</th>
                <th style={{ padding: '12px 16px', width: '130px' }}>TRẠNG THÁI</th>
                <th style={{ padding: '12px 16px', width: '110px' }}>ƯU TIÊN</th>
                <th style={{ padding: '12px 16px', width: '180px' }}>THIẾT BỊ &amp; VỊ TRÍ</th>
                <th style={{ padding: '12px 16px', width: '100px' }}>MÃ LỖI</th>
                <th style={{ padding: '12px 16px', width: '160px', textAlign: 'right' }}>THAO TÁC</th>
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
                        isAdmin={isAdmin}
                        onOpenReassign={(t) => setReassigningTask(t)}
                        onOpenCancel={(t) => setCancellingTask(t)}
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

      {/* Admin Modals */}
      <WorkOrderReassignModal
        task={reassigningTask}
        isOpen={Boolean(reassigningTask)}
        onClose={() => setReassigningTask(null)}
        onReassignSuccess={() => {
          setReassigningTask(null);
          if (onRefreshTasks) onRefreshTasks();
        }}
      />

      <WorkOrderCancelModal
        task={cancellingTask}
        isOpen={Boolean(cancellingTask)}
        onClose={() => setCancellingTask(null)}
        onCancelSuccess={() => {
          setCancellingTask(null);
          if (onRefreshTasks) onRefreshTasks();
        }}
      />
    </div>
  );
};

export default WorkOrdersTable;

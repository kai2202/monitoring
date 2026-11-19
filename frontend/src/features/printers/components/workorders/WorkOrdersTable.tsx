/**
 * Frontend/src/features/printers/components/workorders/WorkOrdersTable.tsx
 *
 * Bảng Quản Lý Lệnh Bảo Trì (Work Orders Table):
 * - Bố cục phẳng 2 khối: Thanh KPI Hiệu Suất KTV ở trên + Bảng Lệnh Bảo Trì ở dưới.
 * - Hỗ trợ Admin điều phối KTV (WorkOrderReassignModal) và Hủy lệnh (WorkOrderCancelModal) qua menu gọn trên dòng.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  const [searchParams] = useSearchParams();
  const initialTaskId = searchParams.get('taskId') || '';

  const [searchQuery, setSearchQuery] = useState(initialTaskId);
  const [scopeFilter, setScopeFilter] = useState<'all' | 'my_tasks' | 'active' | 'completed'>('all');
  const [codeFilter, setCodeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [floorFilter, setFloorFilter] = useState('all');
  const [expandedTaskIds, setExpandedTaskIds] = useState<Record<string, boolean>>({});
  const [openMenuTaskId, setOpenMenuTaskId] = useState<string | null>(null);

  const [reassigningTask, setReassigningTask] = useState<Task | null>(null);
  const [cancellingTask, setCancellingTask] = useState<Task | null>(null);

  useEffect(() => {
    if (!openMenuTaskId) return;
    const closeMenu = () => setOpenMenuTaskId(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, [openMenuTaskId]);

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
      if (scopeFilter === 'active' && (t.status === 'Completed' || t.status === 'Cancelled')) return false;
      if (scopeFilter === 'completed' && t.status !== 'Completed' && t.status !== 'Cancelled') return false;
      if (scopeFilter === 'my_tasks') {
        const userName = user?.fullName?.toLowerCase().trim() || '';
        const a = (t.assignee || '').toLowerCase();
        const isMine = Boolean(user?.id && t.assigneeId === user.id) || Boolean(userName && a.includes(userName));
        if (!isMine) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          (t.title || '').toLowerCase().includes(q) ||
          (t.id || '').toLowerCase().includes(q) ||
          (t.printerName || '').toLowerCase().includes(q) ||
          (t.assignee || '').toLowerCase().includes(q) ||
          (t.errorCode || '').toLowerCase().includes(q) ||
          (t.location || '').toLowerCase().includes(q);
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
  }, [tasks, scopeFilter, searchQuery, codeFilter, statusFilter, priorityFilter, branchFilter, floorFilter, printers, user]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setScopeFilter('all');
    setCodeFilter('all');
    setStatusFilter('all');
    setPriorityFilter('all');
    setBranchFilter('all');
    setFloorFilter('all');
  };

  return (
    <div className="flex flex-col gap-4">
      <TechnicianPerformanceCard tasks={tasks} />

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
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
          onBranchFilterChange={(b) => {
            setBranchFilter(b);
            setFloorFilter('all');
          }}
          branches={branches}
          floorFilter={floorFilter}
          onFloorFilterChange={setFloorFilter}
          floors={floors}
          onResetFilters={handleResetFilters}
          onSwitchToTimelineView={onSwitchToTimelineView}
        />

        <div className="custom-scrollbar overflow-x-auto">
          <table className="w-full border-collapse text-left min-w-[920px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-3 w-[320px]">Mã &amp; Nội dung xử lý</th>
                <th className="px-4 py-3 w-[150px]">Phụ trách</th>
                <th className="px-4 py-3 w-[130px]">Trạng thái</th>
                <th className="px-4 py-3 w-[110px]">Ưu tiên</th>
                <th className="px-4 py-3 w-[180px]">Thiết bị &amp; Vị trí</th>
                <th className="px-4 py-3 w-[100px]">Mã lỗi</th>
                <th className="px-4 py-3 w-[120px] text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 px-6 text-center text-xs text-slate-500">
                    Không tìm thấy lệnh bảo trì nào trong bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => {
                  const targetPrinter =
                    getPrinterForTask(task.printerId) ||
                    ({
                      id: task.printerId,
                      name: task.printerName,
                      model: 'Enterprise Model',
                      location: task.location,
                      status: 'Online',
                    } as Printer);
                  const isExpanded = Boolean(expandedTaskIds[task.id]);

                  return (
                    <React.Fragment key={task.id}>
                      <WorkOrderTableRow
                        task={task}
                        printer={targetPrinter}
                        isExpanded={isExpanded}
                        onToggleExpand={(e) => toggleRowExpand(task.id, e)}
                        onOpenDetail={() => onOpenTaskDetail(targetPrinter, task.id)}
                        isAdmin={isAdmin}
                        isMenuOpen={openMenuTaskId === task.id}
                        onToggleMenu={(e) => {
                          e.stopPropagation();
                          setOpenMenuTaskId((prev) => (prev === task.id ? null : task.id));
                        }}
                        onOpenReassign={(t) => {
                          setOpenMenuTaskId(null);
                          setReassigningTask(t);
                        }}
                        onOpenCancel={(t) => {
                          setOpenMenuTaskId(null);
                          setCancellingTask(t);
                        }}
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

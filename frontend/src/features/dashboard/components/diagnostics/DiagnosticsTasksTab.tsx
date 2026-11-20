/**
 * Frontend/src/features/dashboard/components/diagnostics/DiagnosticsTasksTab.tsx
 *
 * Tab Quản Lý Nhiệm Vụ & Lệnh Bảo Trì trong Diagnostics Drawer:
 * - Bố cục Master-Detail 2 cột: Danh sách lệnh bên trái (Segmented Control Đang xử lý / Lịch sử) + Chi tiết lệnh bên phải.
 * - Loại bỏ Accordion lồng nhau và pills cuộn ngang.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC, 100% FontAwesome).
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../app/store';
import {
  FontAwesomeIcon,
  faPlus,
  faCircleCheck,
  faWrench,
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

const getTaskBadge = (task: Task) => {
  if (task.status === 'Completed') {
    return { label: 'Hoàn tất', dot: 'bg-emerald-500', badge: 'bg-emerald-50/90 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300' };
  }
  if (task.reworkReason && task.status === 'In_Progress') {
    return { label: 'Cần làm lại', dot: 'bg-amber-500', badge: 'bg-amber-50/90 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300' };
  }
  if (task.status === 'Pending_Verification') {
    return { label: 'Chờ duyệt', dot: 'bg-indigo-500', badge: 'bg-indigo-50/90 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300' };
  }
  if (task.status === 'Planned') {
    return { label: 'Chờ nhận', dot: 'bg-slate-400', badge: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' };
  }
  return { label: 'Đang xử lý', dot: 'bg-blue-500', badge: 'bg-blue-50/90 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300' };
};

const formatShortDate = (raw?: string | null, fallback?: string) => {
  if (!raw) return fallback || '';
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

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

  const activeTasks = useMemo(() => tasks.filter((t) => t.status !== 'Completed'), [tasks]);
  const historyTasks = useMemo(() => tasks.filter((t) => t.status === 'Completed'), [tasks]);

  const [filterMode, setFilterMode] = useState<'active' | 'history'>('active');

  // Tự động đồng bộ tab nếu selectedTaskId nằm trong Kho lịch sử
  useEffect(() => {
    if (!selectedTaskId) return;
    if (historyTasks.some((t) => t.id === selectedTaskId)) {
      setFilterMode('history');
    } else if (activeTasks.some((t) => t.id === selectedTaskId)) {
      setFilterMode('active');
    }
  }, [selectedTaskId, activeTasks, historyTasks]);

  const visibleList = filterMode === 'active' ? activeTasks : historyTasks;
  const currentTask = visibleList.find((t) => t.id === selectedTaskId) || visibleList[0] || null;

  return (
    <div className="p-5 flex flex-col gap-4">
      {/* Empty State toàn phần khi máy in chưa có bất kỳ lệnh nào */}
      {tasks.length === 0 ? (
        <div className="py-12 px-6 rounded-2xl bg-slate-100/70 dark:bg-slate-800/40 flex flex-col items-center justify-center text-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg">
            <FontAwesomeIcon icon={faWrench} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 m-0">
              Chưa có lệnh bảo trì nào cho thiết bị này
            </h4>
            <p className="text-xs text-slate-500 mt-1 mb-0">
              Tạo phiếu bảo trì mới để phân công kỹ thuật viên và theo dõi tiến độ xử lý.
            </p>
          </div>
          {isAdmin && (
            <button
              type="button"
              onClick={onOpenCreateTask}
              className="mt-1 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <FontAwesomeIcon icon={faPlus} className="text-[11px]" />
              <span>Tạo công việc mới</span>
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-4 items-start">
          {/* Cột Trái (Master): Segmented Control + Danh sách lệnh */}
          <div className="w-full lg:w-64 shrink-0 flex flex-col gap-2.5">
            <div className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => setFilterMode('active')}
                className={`py-1.5 px-2 rounded-md text-[11.5px] font-semibold transition-all cursor-pointer ${
                  filterMode === 'active'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
              >
                Đang xử lý ({activeTasks.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('history')}
                className={`py-1.5 px-2 rounded-md text-[11.5px] font-semibold transition-all cursor-pointer ${
                  filterMode === 'history'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
              >
                Đã hoàn tất ({historyTasks.length})
              </button>
            </div>

            {isAdmin && (
              <button
                type="button"
                onClick={onOpenCreateTask}
                className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <FontAwesomeIcon icon={faPlus} className="text-[11px]" />
                <span>Tạo công việc mới</span>
              </button>
            )}

            <div className="rounded-2xl bg-slate-100/60 dark:bg-slate-800/40 p-1.5 flex flex-col gap-1.5 max-h-[520px] overflow-y-auto">
              {visibleList.length === 0 ? (
                <div className="p-5 text-center text-xs text-slate-400">
                  {filterMode === 'active' ? 'Không có lệnh nào đang xử lý.' : 'Chưa có lệnh nào hoàn tất.'}
                </div>
              ) : (
                visibleList.map((t) => {
                  const isSelected = currentTask?.id === t.id;
                  const meta = getTaskBadge(t);
                  const dateText =
                    t.status === 'Completed' && t.completedDate
                      ? formatShortDate(t.completedDate)
                      : formatShortDate(t.dueDate, t.id);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => onSelectTask(t.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl flex flex-col gap-2 transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-white dark:bg-slate-900 shadow-xs ring-1 ring-blue-500/15'
                          : 'bg-transparent hover:bg-white/70 dark:hover:bg-slate-900/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className={`text-xs font-semibold line-clamp-2 ${isSelected ? 'text-blue-900 dark:text-blue-200' : 'text-slate-800 dark:text-slate-200'}`}>
                          {t.title}
                        </span>
                        {t.status === 'Completed' ? (
                          <FontAwesomeIcon icon={faCircleCheck} className="text-emerald-500 text-xs mt-0.5 shrink-0" />
                        ) : (
                          <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${meta.dot}`} />
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md whitespace-nowrap shrink-0 ${meta.badge}`}>
                            {meta.label}
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-md whitespace-nowrap shrink-0 ${
                              t.taskType === 'SUPPLY_REPLENISHMENT'
                                ? 'bg-blue-50/90 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300'
                                : 'bg-rose-50/90 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300'
                            }`}
                          >
                            {t.taskType === 'SUPPLY_REPLENISHMENT' ? 'Thay vật tư' : 'Sửa sự cố'}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap shrink-0">
                          {dateText}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Cột Phải (Detail): Chi tiết lệnh đang chọn */}
          <div className="flex-1 min-w-0 w-full">
            {currentTask ? (
              <WorkOrderDetailView
                key={currentTask.id}
                task={currentTask}
                onUpdateTask={onUpdateTask}
                onCompleteTask={onCompleteTask}
                onReopenTask={onReopenTask}
                onAddNewStep={onAddNewStep}
                onToggleStepStatus={onToggleStep}
                onAddActivityNote={onAddActivityNote}
              />
            ) : (
              <div className="py-14 px-6 rounded-2xl bg-slate-100/60 dark:bg-slate-800/40 text-center text-xs text-slate-500">
                {filterMode === 'active'
                  ? 'Không có nhiệm vụ nào đang xử lý. Chuyển sang mục "Đã hoàn tất" hoặc tạo công việc mới.'
                  : 'Chưa có lệnh bảo trì nào đã hoàn tất.'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DiagnosticsTasksTab;

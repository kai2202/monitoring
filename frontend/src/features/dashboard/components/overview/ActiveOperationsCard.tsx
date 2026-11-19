/**
 * Frontend/src/features/dashboard/components/overview/ActiveOperationsCard.tsx
 *
 * Card Lệnh Bảo Trì Đang Mở (Open Work Orders Queue):
 * - Tách bạch hoàn toàn Work State (Lệnh bảo trì đang thực hiện) khỏi Technical Signals
 *   của bảng Thiết Bị Cần Xử Lý bên dưới (AGENTS.md Rule 5.2 & Rule 6).
 * - Lọc nhanh: Tất cả | Đang xử lý | Chờ nhận & Chờ duyệt.
 * - Bấm trực tiếp từng lệnh để mở Tab Tasks trong PrinterDiagnosticsDrawer.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React, { useMemo, useState } from 'react';
import {
  FontAwesomeIcon,
  faWrench,
  faChevronRight,
  faCircleCheck,
  faClock,
} from '@/shared/icons';
import { Printer } from '@/types/printer';
import { Task } from '@/types/task';

export interface ActiveOperationsCardProps {
  tasks: Task[];
  printers: Printer[];
  isLoading?: boolean;
  onSelectTask: (printer: Printer | null, taskId: string) => void;
  onNavigateWorkOrders: () => void;
}

const STATUS_META: Record<string, { label: string; cls: string }> = {
  In_Progress: {
    label: 'Đang sửa',
    cls: 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300',
  },
  Pending_Verification: {
    label: 'Chờ duyệt',
    cls: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300',
  },
  Planned: {
    label: 'Chờ nhận',
    cls: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
  },
};

export const ActiveOperationsCard: React.FC<ActiveOperationsCardProps> = ({
  tasks = [],
  printers = [],
  isLoading = false,
  onSelectTask,
  onNavigateWorkOrders,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'in_progress' | 'planned'>('all');

  const printerMap = useMemo(() => {
    const map = new Map<string, Printer>();
    printers.forEach((p) => map.set(p.id, p));
    return map;
  }, [printers]);

  const activeTasks = useMemo(
    () => tasks.filter((t) => t.status !== 'Completed' && t.status !== 'Cancelled'),
    [tasks]
  );

  const displayedTasks = useMemo(() => {
    const list =
      filterMode === 'in_progress'
        ? activeTasks.filter(
            (t) => t.status === 'In_Progress' || t.status === 'Pending_Verification'
          )
        : filterMode === 'planned'
        ? activeTasks.filter((t) => t.status === 'Planned')
        : activeTasks;
    return list.slice(0, 6);
  }, [activeTasks, filterMode]);

  return (
    <div className="flex flex-col h-full xl:h-[320px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-hidden">
      {/* Header + Filter Switcher */}
      <div className="px-4 sm:px-5 pt-4 pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0" />
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 m-0">
              Lệnh Bảo Trì Đang Mở
            </h3>
            <span className="text-[10.5px] font-semibold font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {activeTasks.length}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 mb-0">
            Tiến độ xử lý phiếu công việc của đội kỹ thuật
          </p>
        </div>

        <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 gap-0.5">
          {[
            { id: 'all' as const, label: 'Tất cả' },
            { id: 'in_progress' as const, label: 'Đang sửa' },
            { id: 'planned' as const, label: 'Chờ nhận' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterMode(tab.id)}
              className={`px-2 py-1 rounded-md text-[11px] font-semibold border-none cursor-pointer transition-all ${
                filterMode === tab.id
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs'
                  : 'bg-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {isLoading ? (
          <div className="p-4 flex flex-col gap-2.5 animate-pulse">
            <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-lg" />
            <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-lg" />
            <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-lg" />
          </div>
        ) : displayedTasks.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center text-xs text-slate-400 gap-1.5">
            <FontAwesomeIcon icon={faCircleCheck} className="text-lg text-emerald-500" />
            <span className="font-semibold text-slate-600 dark:text-slate-300">
              Không có lệnh bảo trì nào trong nhóm này
            </span>
            <span className="text-[11px]">Mọi phiếu công việc đang được kiểm soát tốt</span>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {displayedTasks.map((task) => {
              const matchedPrinter = printerMap.get(task.printerId) || null;
              const statusMeta = STATUS_META[task.status] || STATUS_META.Planned;
              const steps = task.dynamicSteps || [];
              const doneSteps = steps.filter((s) => s.status === 'Completed').length;
              const totalSteps = steps.length;

              return (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => onSelectTask(matchedPrinter, task.id)}
                  className="w-full px-4 sm:px-5 py-2.5 flex items-center justify-between gap-3 text-left bg-transparent hover:bg-slate-50/80 dark:hover:bg-slate-800/40 border-none cursor-pointer transition-colors group"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <FontAwesomeIcon
                      icon={task.status === 'Planned' ? faClock : faWrench}
                      className={`text-xs mt-1 shrink-0 ${
                        task.status === 'Planned'
                          ? 'text-slate-400'
                          : 'text-blue-600 dark:text-blue-400'
                      }`}
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {task.title}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {task.printerName} · {task.assignee || 'Chưa phân công'}
                        {totalSteps > 0 ? ` · ${doneSteps}/${totalSteps} bước` : ''}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusMeta.cls}`}>
                      {statusMeta.label}
                    </span>
                    <FontAwesomeIcon
                      icon={faChevronRight}
                      className="text-[10px] text-slate-300 group-hover:text-blue-500 transition-colors"
                    />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer link */}
      <div className="px-4 sm:px-5 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between text-[11px] shrink-0">
        <span className="text-slate-400">Bấm vào lệnh để cập nhật tiến độ</span>
        <button
          type="button"
          onClick={onNavigateWorkOrders}
          className="text-blue-600 dark:text-blue-400 hover:underline font-bold bg-transparent border-none p-0 cursor-pointer inline-flex items-center gap-1"
        >
          <span>Xem tất cả Lệnh bảo trì</span>
          <FontAwesomeIcon icon={faChevronRight} className="text-[9px]" />
        </button>
      </div>
    </div>
  );
};

export default ActiveOperationsCard;

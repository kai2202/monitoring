/**
 * Frontend/src/features/dashboard/components/workorder/WorkOrderSubTasksProgress.tsx
 *
 * Tiến Trình & Các Bước Kỹ Thuật (Dynamic Stepper & To-Do List):
 * - Áp dụng thiết kế danh sách việc cần làm To-Do (Image 3) kèm cờ ưu tiên.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React, { useState } from 'react';
import {
  FontAwesomeIcon,
  faCircleCheck,
  faCircle,
  faPlus,
  faFileLines,
  faFlag,
} from '../../../../shared/icons';
import { TaskStepItem, WorkLogEntry } from '../../../../types/task';
import { getTaskProgressColor } from '../../utils';

interface WorkOrderSubTasksProgressProps {
  steps: TaskStepItem[];
  progressPercent: number;
  isReworking?: boolean;
  workLogs?: WorkLogEntry[];
  isReadOnly?: boolean;
  embedded?: boolean;
  onToggleStep: (stepId: string) => void;
  onAddStep: (stepTitle: string) => void;
  onSelectStepFilter?: (stepId: string | null) => void;
  selectedStepIdFilter?: string | null;
}

export const WorkOrderSubTasksProgress: React.FC<WorkOrderSubTasksProgressProps> = ({
  steps,
  progressPercent,
  isReworking = false,
  workLogs = [],
  isReadOnly = false,
  embedded = false,
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
  const colorStyle = getTaskProgressColor(effectivePercent, Boolean(isReworking));

  return (
    <div
      className={
        embedded
          ? 'p-4 rounded-xl bg-white dark:bg-slate-900 shadow-xs ring-1 ring-slate-900/[0.04] dark:ring-white/[0.06] flex flex-col gap-3'
          : 'p-5 rounded-xl bg-white dark:bg-slate-900 shadow-xs ring-1 ring-slate-900/[0.05] dark:ring-white/[0.06] flex flex-col gap-3.5'
      }
    >
      {/* Header & Progress Bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <strong className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">
            Tiến Độ Quy Chuẩn ({completedCount}/{steps.length} bước)
          </strong>
          <span className={`text-xs font-bold font-mono ${colorStyle.textTailwind}`}>
            {effectivePercent}%
          </span>
        </div>
        <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${colorStyle.barTailwind}`}
            style={{ width: `${effectivePercent}%` }}
          />
        </div>
      </div>

      {/* Stepper To-Do List - Không dùng border cho mỗi task */}
      <div className="flex flex-col gap-2">
        {steps.map((step, idx) => {
          const isDone = step.status === 'Completed';
          const isFiltered = selectedStepIdFilter === step.id;
          const logCount = workLogs.filter((l) => l.stepId === step.id).length;

          return (
            <div
              key={step.id}
              onClick={() => onSelectStepFilter && onSelectStepFilter(isFiltered ? null : step.id)}
              className={`flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer ${
                isFiltered
                  ? 'bg-indigo-50/90 dark:bg-indigo-950/70 shadow-xs'
                  : 'bg-slate-50/80 dark:bg-slate-800/50 hover:bg-slate-100/80 dark:hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  disabled={isReadOnly}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isReadOnly) onToggleStep(step.id);
                  }}
                  className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                    isDone
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-300 dark:text-slate-600 hover:text-slate-500'
                  } ${isReadOnly ? 'cursor-default' : ''}`}
                >
                  <FontAwesomeIcon icon={isDone ? faCircleCheck : faCircle} className="text-sm" />
                </button>

                <div className="min-w-0">
                  <span className={`text-xs font-semibold block truncate ${
                    isDone ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'
                  }`}>
                    {idx + 1}. {step.title}
                  </span>
                  {step.completedAt && (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium block">
                      ✓ Hoàn tất {step.completedAt}
                    </span>
                  )}
                </div>
              </div>

              {/* Badges: Priority flag + Log count (Image 3) */}
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                  isDone ? 'bg-slate-100 dark:bg-slate-800 text-slate-400' : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                }`}>
                  <FontAwesomeIcon icon={faFlag} className="text-[9px]" />
                  <span>{isDone ? 'Đạt' : 'Cần xử lý'}</span>
                </span>

                <span
                  title={`Có ${logCount} nhật ký kỹ thuật ghi nhận`}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    logCount > 0
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}
                >
                  <FontAwesomeIcon icon={faFileLines} className="text-[9px]" />
                  <span>{logCount}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Step Form */}
      {!isReadOnly && (
        isAdding ? (
          <form onSubmit={handleAdd} className="flex gap-2">
            <input
              type="text"
              placeholder="Tên bước kỹ thuật mới..."
              value={newStepTitle}
              onChange={(e) => setNewStepTitle(e.target.value)}
              autoFocus
              className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-slate-100/80 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-xs cursor-pointer"
            >
              Thêm
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-2.5 py-1.5 rounded-xl text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
            >
              Hủy
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="w-full py-2 rounded-xl bg-indigo-50/70 hover:bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <FontAwesomeIcon icon={faPlus} className="text-[10px]" />
            <span>Thêm bước kỹ thuật vào quy trình</span>
          </button>
        )
      )}
    </div>
  );
};

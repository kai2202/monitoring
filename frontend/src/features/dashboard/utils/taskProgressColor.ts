/**
 * Frontend/src/features/dashboard/utils/taskProgressColor.ts
 *
 * Tiện ích tính toán tiến độ & phân bổ màu sắc trạng thái dùng chung:
 * - Đồng bộ tuyệt đối giữa WorkOrder, Drawer, Kanban và Gantt Timeline.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import { Task } from '../../../types/task';

export interface TaskProgressColorResult {
  /** Mã màu hex cho background dạng nhạt (Pastel) */
  bgHex: string;
  /** Mã màu hex cho chữ (Text) */
  textHex: string;
  /** Mã màu hex cho icon / dot chỉ báo */
  fillHex: string;
  /** Tailwind class cho thanh progress bar fill */
  barTailwind: string;
  /** Tailwind class cho chữ % */
  textTailwind: string;
}

export interface TaskProgressCalculation {
  effectivePercent: number;
  completedStepsCount: number;
  totalStepsCount: number;
  allStepsCompleted: boolean;
  isCompleted: boolean;
  isReworking: boolean;
  colorStyle: TaskProgressColorResult;
}

/**
 * Phân bổ dải màu theo % tiến độ và trạng thái nghiệp vụ (Rework, Completed, ...)
 */
export const getTaskProgressColor = (
  percent: number,
  isRework: boolean = false,
  isCompleted: boolean = false
): TaskProgressColorResult => {
  if (isRework) {
    return {
      bgHex: '#ffedd5',
      textHex: '#c2410c',
      fillHex: '#ea580c',
      barTailwind: 'bg-amber-500 dark:bg-amber-400',
      textTailwind: 'text-amber-600 dark:text-amber-400',
    };
  }

  if (isCompleted || percent >= 100) {
    return {
      bgHex: '#dcfce7',
      textHex: '#15803d',
      fillHex: '#16a34a',
      barTailwind: 'bg-emerald-500 dark:bg-emerald-400',
      textTailwind: 'text-emerald-600 dark:text-emerald-400',
    };
  }

  if (percent >= 70) {
    return {
      bgHex: '#e0e7ff',
      textHex: '#4338ca',
      fillHex: '#6366f1',
      barTailwind: 'bg-indigo-500 dark:bg-indigo-400',
      textTailwind: 'text-indigo-600 dark:text-indigo-400',
    };
  }

  if (percent >= 35) {
    return {
      bgHex: '#e0f2fe',
      textHex: '#0369a1',
      fillHex: '#0284c7',
      barTailwind: 'bg-sky-500 dark:bg-sky-400',
      textTailwind: 'text-sky-600 dark:text-sky-400',
    };
  }

  if (percent > 0) {
    return {
      bgHex: '#fef3c7',
      textHex: '#b45309',
      fillHex: '#f59e0b',
      barTailwind: 'bg-amber-500 dark:bg-amber-400',
      textTailwind: 'text-amber-600 dark:text-amber-400',
    };
  }

  return {
    bgHex: '#f1f5f9',
    textHex: '#475569',
    fillHex: '#94a3b8',
    barTailwind: 'bg-slate-300 dark:bg-slate-700',
    textTailwind: 'text-slate-400 dark:text-slate-500',
  };
};

/**
 * Tính toán toàn bộ thông số tiến độ từ một Task cụ thể
 */
export const calculateTaskProgress = (task: Task): TaskProgressCalculation => {
  const isCompleted = task.status === 'Completed';
  const isReworking = Boolean(task.reworkReason && task.status === 'In_Progress');
  const steps = task.dynamicSteps || [];
  const completedStepsCount = steps.filter((s) => s.status === 'Completed').length;
  const totalStepsCount = steps.length;
  const allStepsCompleted = totalStepsCount > 0 && completedStepsCount === totalStepsCount;

  let effectivePercent = 0;
  if (totalStepsCount > 0) {
    effectivePercent = Math.round((completedStepsCount / totalStepsCount) * 100);
  } else if (task.progressPercent !== undefined && task.progressPercent !== null) {
    effectivePercent = task.progressPercent;
  } else if (isCompleted) {
    effectivePercent = 100;
  }

  // Khóa biên 0 - 100%
  effectivePercent = Math.max(0, Math.min(100, effectivePercent));

  const colorStyle = getTaskProgressColor(effectivePercent, isReworking, isCompleted);

  return {
    effectivePercent,
    completedStepsCount,
    totalStepsCount,
    allStepsCompleted,
    isCompleted,
    isReworking,
    colorStyle,
  };
};

export default {
  getTaskProgressColor,
  calculateTaskProgress,
};

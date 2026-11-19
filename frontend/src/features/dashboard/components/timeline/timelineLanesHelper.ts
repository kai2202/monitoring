/**
 * Frontend/src/features/dashboard/components/timeline/timelineLanesHelper.ts
 *
 * Tiện ích phân bổ làn Gantt và tọa độ điểm đặt Task:
 * - Chuẩn hóa định dạng ngày cục bộ (Local Date YYYY-MM-DD), triệt tiêu lỗi lệch múi giờ UTC/Local.
 * - Tính toán chính xác vị trí bắt đầu (leftPx) và bề rộng (widthPx) theo ngày.
 * - Thuật toán xếp làn không đè chồng (Greedy Lane Allocation).
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import { Task } from '../../../../types/task';

export interface DayItem {
  date: Date;
  dateStr: string;
  dayNumber: number;
  dayOfWeekStr: string;
  isToday: boolean;
  isWeekend: boolean;
}

export interface TaskPlacedLane {
  task: Task;
  leftPx: number;
  widthPx: number;
  laneIndex: number;
}

/**
 * Định dạng Date object thành chuỗi YYYY-MM-DD theo giờ địa phương (tránh lỗi lùi ngày của toISOString)
 */
export const formatLocalDate = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

/**
 * Rút trích chuỗi ngày YYYY-MM-DD từ string hoặc Date an toàn (hỗ trợ mọi định dạng ISO, DMY, timestamp)
 */
export const getTaskDateString = (dateVal?: string | Date | number): string => {
  if (!dateVal && dateVal !== 0) return '';
  if (dateVal instanceof Date) {
    return formatLocalDate(dateVal);
  }
  if (typeof dateVal === 'number') {
    return formatLocalDate(new Date(dateVal));
  }
  const str = String(dateVal).trim();
  // Nếu đã ở dạng YYYY-MM-DD hoặc bắt đầu bằng YYYY-MM-DD (ISO)
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    return str.slice(0, 10);
  }
  // Nếu ở dạng DD/MM/YYYY hoặc D/M/YYYY
  const dmyMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (dmyMatch) {
    const [, d, m, y] = dmyMatch;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  // Thử parse Date
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return formatLocalDate(parsed);
  }
  return str.slice(0, 10);
};

export const getTaskDayIndices = (task: Task, days: DayItem[]): { startIndex: number; endIndex: number } | null => {
  if (!days || days.length === 0) return null;
  const sStr = getTaskDateString(task.startDate || task.dueDate);
  const eStr = getTaskDateString(task.dueDate || task.startDate);
  if (!sStr && !eStr) return null;

  const actualS = sStr || eStr;
  const actualE = eStr || sStr;
  const minDate = actualS <= actualE ? actualS : actualE;
  const maxDate = actualS <= actualE ? actualE : actualS;

  const firstDateStr = days[0]?.dateStr || '';
  const lastDateStr = days[days.length - 1]?.dateStr || '';
  if (maxDate < firstDateStr || minDate > lastDateStr) return null;

  let startIndex = days.findIndex((d) => d.dateStr === minDate);
  if (startIndex === -1) {
    startIndex = minDate < firstDateStr ? 0 : days.length - 1;
  }

  let endIndex = days.findIndex((d) => d.dateStr === maxDate);
  if (endIndex === -1) {
    endIndex = maxDate > lastDateStr ? days.length - 1 : 0;
  }

  if (endIndex < startIndex) endIndex = startIndex;
  return { startIndex, endIndex };
};

export const computePrinterTaskLanes = (
  tasks: Task[],
  days: DayItem[],
  dayOffsets: number[],
  dayWidths: number[]
): { placedTasks: TaskPlacedLane[]; totalLanes: number } => {
  if (!tasks || tasks.length === 0) {
    return { placedTasks: [], totalLanes: 1 };
  }

  const inViewTasks: { task: Task; startIndex: number; endIndex: number; leftPx: number; widthPx: number }[] = [];

  tasks.forEach((task) => {
    if (task.status === 'Completed' || task.status === 'Cancelled') return;
    const indices = getTaskDayIndices(task, days);
    if (!indices) return;

    const leftPx = dayOffsets[indices.startIndex] + 4;
    const rightPx = dayOffsets[indices.endIndex] + dayWidths[indices.endIndex] - 4;
    const widthPx = Math.max(38, rightPx - leftPx);

    inViewTasks.push({
      task,
      startIndex: indices.startIndex,
      endIndex: indices.endIndex,
      leftPx,
      widthPx,
    });
  });

  inViewTasks.sort((a, b) => a.startIndex - b.startIndex || (b.endIndex - b.startIndex) - (a.endIndex - a.startIndex));

  const laneEndIndices: number[] = [];
  const placedTasks: TaskPlacedLane[] = [];

  for (const item of inViewTasks) {
    let chosenLane = -1;
    for (let l = 0; l < laneEndIndices.length; l++) {
      if (laneEndIndices[l] < item.startIndex) {
        chosenLane = l;
        laneEndIndices[l] = item.endIndex;
        break;
      }
    }
    if (chosenLane === -1) {
      chosenLane = laneEndIndices.length;
      laneEndIndices.push(item.endIndex);
    }
    placedTasks.push({
      task: item.task,
      leftPx: item.leftPx,
      widthPx: item.widthPx,
      laneIndex: chosenLane,
    });
  }

  return { placedTasks, totalLanes: Math.max(1, laneEndIndices.length) };
};

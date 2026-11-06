/**
 * Frontend/src/features/dashboard/components/timeline/TaskTimelineCalendar.tsx
 *
 * Bảng Lịch Trình Tiến Độ Công Việc (Timeline Gantt Calendar):
 * - Khắc phục hoàn toàn lệch múi giờ UTC/Local thông qua formatLocalDate.
 * - Tự động nới rộng chiều ngang ô ngày có việc (230px), các ngày trống giữ nhỏ gọn.
 * - Lọc máy in linh hoạt (tìm kiếm, loại việc, nút lọc 'Có gắn task').
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../app/store';
import { Printer } from '../../../../types/printer';
import { Task } from '../../../../types/task';
import { taskService } from '../../../../services';
import { TimelineCalendarHeader } from './TimelineCalendarHeader';
import { TimelineCalendarGrid } from './TimelineCalendarGrid';
import { TimelineCreateTaskModal } from './TimelineCreateTaskModal';
import { formatLocalDate } from './timelineLanesHelper';

export interface TaskTimelineCalendarProps {
  printers: Printer[];
  tasks: Task[];
  onOpenDrawer: (printer: Printer, tab?: 'diag' | 'tasks' | 'counters', taskId?: string) => void;
  onRefreshTasks?: () => void;
}

export const TaskTimelineCalendar: React.FC<TaskTimelineCalendarProps> = ({
  printers = [],
  tasks = [],
  onOpenDrawer,
  onRefreshTasks,
}) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const isFieldTech = user?.role === 'FIELD_TECH' || user?.role === 'FIELD_TECHNICIAN';

  const [viewDuration, setViewDuration] = useState<7 | 14 | 30>(14);
  const [baseDate, setBaseDate] = useState<Date>(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate() - 4);
  });

  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyWithTasks, setOnlyWithTasks] = useState<boolean>(false);
  const [myTasksOnly, setMyTasksOnly] = useState<boolean>(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [hoveredTask, setHoveredTask] = useState<{ task: Task; x: number; y: number } | null>(null);

  // Số lượng task đang phân công cho user/KTV đang đăng nhập
  const myTasksCount = useMemo(() => {
    const userName = user?.fullName?.toLowerCase().trim() || '';
    return tasks.filter((t) => {
      if (t.status === 'Completed' || t.status === 'Cancelled') return false;
      const a = (t.assignee || '').toLowerCase();
      return Boolean(user?.id && t.assigneeId === user.id) || Boolean(userName && a.includes(userName));
    }).length;
  }, [tasks, user]);

  // Mảng các ngày hiển thị theo giờ địa phương (Local Timezone Safe)
  const days = useMemo(() => {
    const result = [];
    const today = new Date();
    const todayStr = formatLocalDate(today);
    const weekdays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

    for (let i = 0; i < viewDuration; i++) {
      const d = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() + i);
      const dateStr = formatLocalDate(d);
      const dayOfWeek = d.getDay();

      result.push({
        date: d,
        dateStr,
        dayNumber: d.getDate(),
        dayOfWeekStr: weekdays[dayOfWeek],
        isToday: dateStr === todayStr,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      });
    }
    return result;
  }, [baseDate, viewDuration]);

  const dateRangeLabel = useMemo(() => {
    if (days.length === 0) return '';
    const first = days[0].date;
    const last = days[days.length - 1].date;
    const formatD = (d: Date) => `${d.getDate()} Th${d.getMonth() + 1}`;
    return `${formatD(first)} — ${formatD(last)}, ${last.getFullYear()}`;
  }, [days]);

  // Lọc máy in và map tasks
  const { filteredPrinters, printerTasksMap, printersWithTasksCount } = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    const tMap = new Map<string, Task[]>();
    tasks.forEach((t) => {
      // Khi 1 task trong lịch trình được hoàn thành hoặc hủy thì xóa khỏi biểu đồ Gantt
      if (t.status === 'Completed' || t.status === 'Cancelled') {
        return;
      }

      const taskType = t.taskType || (t as any).type;
      if (typeFilter !== 'all' && taskType !== typeFilter) return;
      const list = tMap.get(t.printerId) || [];
      list.push(t);
      tMap.set(t.printerId, list);
    });

    const withTasksCount = printers.filter((p) => (tMap.get(p.id) || []).length > 0).length;

    let pList = printers.filter(
      (p) => !q || p.name.toLowerCase().includes(q) || p.location.toLowerCase().includes(q)
    );

    if (onlyWithTasks) {
      pList = pList.filter((p) => (tMap.get(p.id) || []).length > 0);
    }

    if (myTasksOnly) {
      const userName = user?.fullName?.toLowerCase().trim() || '';
      pList = pList.filter((p) => {
        const pTasks = tMap.get(p.id) || [];
        return pTasks.some((t) => {
          const a = (t.assignee || '').toLowerCase();
          return Boolean(user?.id && t.assigneeId === user.id) || Boolean(userName && a.includes(userName));
        });
      });
    }

    return {
      filteredPrinters: pList,
      printerTasksMap: tMap,
      printersWithTasksCount: withTasksCount,
    };
  }, [printers, tasks, searchQuery, typeFilter, onlyWithTasks, myTasksOnly, user]);

  const handleCreateTask = async (newTask: Partial<Task>) => {
    try {
      await taskService.createTask(newTask as any, user?.fullName || 'Quản trị viên');
      if (onRefreshTasks) onRefreshTasks();
    } catch (err) {
      console.error('Lỗi tạo task timeline:', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      {/* 1. Header Controls */}
      <TimelineCalendarHeader
        viewDuration={viewDuration}
        onChangeViewDuration={setViewDuration}
        dateRangeLabel={dateRangeLabel}
        onPrevRange={() => setBaseDate((prev) => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() - viewDuration))}
        onNextRange={() => setBaseDate((prev) => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + viewDuration))}
        onJumpToToday={() => {
          const today = new Date();
          const half = Math.floor(viewDuration / 2);
          setBaseDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() - half));
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        onlyWithTasks={onlyWithTasks}
        onToggleOnlyWithTasks={() => setOnlyWithTasks((prev) => !prev)}
        printersWithTasksCount={printersWithTasksCount}
        myTasksOnly={myTasksOnly}
        onToggleMyTasksOnly={() => setMyTasksOnly((prev) => !prev)}
        myTasksCount={myTasksCount}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
      />

      {/* 2. Gantt Calendar Grid */}
      <TimelineCalendarGrid
        days={days}
        printers={filteredPrinters}
        printerTasksMap={printerTasksMap}
        onSelectTask={(printer, taskId) => onOpenDrawer(printer, 'tasks', taskId)}
        onHoverTask={(task, e) => {
          if (task && e) {
            setHoveredTask({ task, x: e.clientX, y: e.clientY });
          } else {
            setHoveredTask(null);
          }
        }}
      />

      {/* 3. Modal Create Task */}
      <TimelineCreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        printers={printers}
        onCreateTask={handleCreateTask}
      />
    </div>
  );
};

export default TaskTimelineCalendar;

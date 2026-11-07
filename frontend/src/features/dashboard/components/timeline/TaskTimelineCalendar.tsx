/**
 * Frontend/src/features/dashboard/components/timeline/TaskTimelineCalendar.tsx
 *
 * Bảng Lịch Trình Tiến Độ Công Việc (Timeline Gantt Calendar):
 * - Khắc phục hoàn toàn lệch múi giờ UTC/Local thông qua formatLocalDate.
 * - Tự động nới rộng chiều ngang ô ngày có việc (230px), các ngày trống giữ nhỏ gọn.
 * - Lọc máy in linh hoạt (tìm kiếm, loại việc, nút lọc 'Có gắn task', dropdown lọc KTV).
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../app/store';
import { Printer } from '../../../../types/printer';
import { Task } from '../../../../types/task';
import { taskService } from '../../../../services';
import { useAvailableTechnicians } from '../../../../shared/hooks/useAvailableTechnicians';
import { TimelineCalendarHeader, AvailableTechnician } from './TimelineCalendarHeader';
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

  const [viewDuration, setViewDuration] = useState<7 | 14 | 30>(14);
  const [baseDate, setBaseDate] = useState<Date>(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate() - 4);
  });

  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyWithTasks, setOnlyWithTasks] = useState<boolean>(false);
  const [technicianFilter, setTechnicianFilter] = useState<string>('all');
  const [myTasksOnly, setMyTasksOnly] = useState<boolean>(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [, setHoveredTask] = useState<{ task: Task; x: number; y: number } | null>(null);

  // Nạp danh sách Kỹ thuật viên từ CSDL qua Hook useAvailableTechnicians
  const { technicians: loadedTechnicians } = useAvailableTechnicians({ enabled: true });

  // Hợp nhất danh sách KTV từ hệ thống và danh sách KTV đang có task thực tế
  const availableTechnicians: AvailableTechnician[] = useMemo(() => {
    const map = new Map<string, AvailableTechnician>();
    loadedTechnicians.forEach((t) => {
      if (t.name) {
        map.set(t.name.toLowerCase().trim(), { id: t.id, name: t.name, role: t.role });
      }
    });
    tasks.forEach((t) => {
      const name = t.assignee?.trim();
      if (name && !map.has(name.toLowerCase())) {
        map.set(name.toLowerCase(), { id: t.assigneeId, name, role: 'FIELD_TECH' });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, 'vi'));
  }, [loadedTechnicians, tasks]);

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

  // Điều khiển lọc theo Kỹ thuật viên từ Dropdown
  const handleTechnicianFilterChange = (selected: string) => {
    setTechnicianFilter(selected);
    const userName = (user?.fullName || '').toLowerCase().trim();
    if (selected === 'all') {
      setMyTasksOnly(false);
    } else if (userName && selected.toLowerCase().trim() === userName) {
      setMyTasksOnly(true);
      setOnlyWithTasks(true);
    } else {
      setMyTasksOnly(false);
      setOnlyWithTasks(true);
    }
  };

  // Điều khiển nút bật/tắt Việc của tôi
  const handleToggleMyTasksOnly = () => {
    if (myTasksOnly) {
      setMyTasksOnly(false);
      setTechnicianFilter('all');
    } else {
      setMyTasksOnly(true);
      if (user?.fullName) {
        setTechnicianFilter(user.fullName);
      }
      setOnlyWithTasks(true);
    }
  };

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

      // Lọc theo Kỹ thuật viên (Dropdown KTV hoặc nút Việc của tôi)
      if (technicianFilter !== 'all') {
        const filterLower = technicianFilter.toLowerCase().trim();
        const assigneeLower = (t.assignee || '').toLowerCase().trim();
        const matchName = assigneeLower === filterLower || assigneeLower.includes(filterLower);
        const matchId = Boolean(t.assigneeId && t.assigneeId === technicianFilter);
        if (!matchName && !matchId) {
          return;
        }
      }

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

    return {
      filteredPrinters: pList,
      printerTasksMap: tMap,
      printersWithTasksCount: withTasksCount,
    };
  }, [printers, tasks, searchQuery, typeFilter, technicianFilter, onlyWithTasks]);

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
        technicianFilter={technicianFilter}
        onTechnicianFilterChange={handleTechnicianFilterChange}
        availableTechnicians={availableTechnicians}
        myTasksOnly={myTasksOnly}
        onToggleMyTasksOnly={handleToggleMyTasksOnly}
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

/**
 * Frontend/src/features/dashboard/components/timeline/TimelineCalendarGrid.tsx
 *
 * Lưới Lịch Trình Gantt Timeline:
 * - Tự động nới rộng CHIỀU NGANG ô ngày (240px) khi có task để task nằm trọn vẹn, không tràn ô.
 * - getTaskDayIndices đồng bộ 100% giữa hàm đếm task và xếp làn đặt thẻ task.
 * - Cấu trúc table-layout: fixed + colgroup khóa cứng tỷ lệ pixel của từng cột ngày.
 * - Cột thiết bị cố định (sticky) khi cuộn ngang.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React, { useMemo } from 'react';
import { Printer } from '../../../../types/printer';
import { Task } from '../../../../types/task';
import { TimelineTaskBarItem } from './TimelineTaskBarItem';
import { DayItem, computePrinterTaskLanes, getTaskDayIndices } from './timelineLanesHelper';

interface TimelineCalendarGridProps {
  days: DayItem[];
  printers: Printer[];
  printerTasksMap: Map<string, Task[]>;
  onSelectTask: (printer: Printer, taskId: string) => void;
  onHoverTask: (task: Task | null, e?: React.MouseEvent) => void;
}

export const TimelineCalendarGrid: React.FC<TimelineCalendarGridProps> = ({
  days,
  printers,
  printerTasksMap,
  onSelectTask,
  onHoverTask,
}) => {
  const viewDuration = days.length;
  const LANE_HEIGHT = 34;
  const LANE_GAP = 6;
  const PADDING_Y = 10;
  const DEVICE_COL_WIDTH = 220;

  // 1. Đếm số lượng task trên từng ngày bằng getTaskDayIndices đồng bộ tuyệt đối
  const dayTaskCounts = useMemo(() => {
    const counts = new Map<string, number>();
    days.forEach((day, dayIndex) => {
      let count = 0;
      printers.forEach((printer) => {
        const pTasks = printerTasksMap.get(printer.id) || [];
        pTasks.forEach((t) => {
          if (t.status === 'Completed' || t.status === 'Cancelled') return;
          const indices = getTaskDayIndices(t, days);
          if (indices && dayIndex >= indices.startIndex && dayIndex <= indices.endIndex) {
            count++;
          }
        });
      });
      counts.set(day.dateStr, count);
    });
    return counts;
  }, [days, printers, printerTasksMap]);

  // 2. Chiều rộng cột ngày: Tự động nới rộng (240px) nếu có việc, ngày trống giữ nhỏ gọn
  const COMPACT_DAY_WIDTH = viewDuration === 7 ? 120 : viewDuration === 14 ? 90 : 65;
  const EXPANDED_DAY_WIDTH = 240;

  const dayWidths = useMemo(() => {
    return days.map((day) => {
      const count = dayTaskCounts.get(day.dateStr) || 0;
      return count > 0 ? EXPANDED_DAY_WIDTH : COMPACT_DAY_WIDTH;
    });
  }, [days, dayTaskCounts, COMPACT_DAY_WIDTH]);

  const { dayOffsets, totalTimelineWidth } = useMemo(() => {
    const offsets: number[] = [];
    let current = 0;
    for (let i = 0; i < dayWidths.length; i++) {
      offsets.push(current);
      current += dayWidths[i];
    }
    return { dayOffsets: offsets, totalTimelineWidth: current };
  }, [dayWidths]);

  const tableTotalWidth = DEVICE_COL_WIDTH + totalTimelineWidth;

  return (
    <div style={{ borderRadius: '20px', backgroundColor: 'var(--bg-card, #ffffff)', border: '1px solid var(--border-color, #e2e8f0)', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)', overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto', width: '100%' }}>
        <table style={{ width: `${tableTotalWidth}px`, minWidth: `${tableTotalWidth}px`, maxWidth: `${tableTotalWidth}px`, tableLayout: 'fixed', borderCollapse: 'collapse', textAlign: 'left' }}>
          <colgroup>
            <col style={{ width: `${DEVICE_COL_WIDTH}px` }} />
            {days.map((d, i) => (
              <col key={d.dateStr} style={{ width: `${dayWidths[i]}px` }} />
            ))}
          </colgroup>

          {/* Header Row: Days & Dates */}
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color, #e2e8f0)', backgroundColor: 'var(--bg-subtle, #f8fafc)' }}>
              <th style={{ width: `${DEVICE_COL_WIDTH}px`, minWidth: `${DEVICE_COL_WIDTH}px`, maxWidth: `${DEVICE_COL_WIDTH}px`, padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted, #64748b)', position: 'sticky', left: 0, backgroundColor: 'var(--bg-subtle, #f8fafc)', zIndex: 5, boxSizing: 'border-box' }}>
                THIẾT BỊ &amp; VỊ TRÍ
              </th>
              {days.map((d, i) => {
                const count = dayTaskCounts.get(d.dateStr) || 0;
                const isExpanded = count > 0;
                return (
                  <th
                    key={d.dateStr}
                    style={{
                      width: `${dayWidths[i]}px`,
                      minWidth: `${dayWidths[i]}px`,
                      maxWidth: `${dayWidths[i]}px`,
                      padding: '8px 4px',
                      textAlign: 'center',
                      backgroundColor: d.isToday ? 'rgba(37, 99, 235, 0.08)' : isExpanded ? 'rgba(241, 245, 249, 0.85)' : d.isWeekend ? 'rgba(0,0,0,0.02)' : 'transparent',
                      borderLeft: '1px solid var(--border-color, #e2e8f0)',
                      boxSizing: 'border-box',
                      overflow: 'hidden',
                      transition: 'width 0.2s ease',
                    }}
                  >
                    <div style={{ fontSize: '10px', color: d.isToday ? '#2563eb' : 'var(--text-muted, #64748b)', fontWeight: 600 }}>{d.dayOfWeekStr}</div>
                    <div style={{ fontSize: '12.5px', fontWeight: 800, color: d.isToday ? '#2563eb' : 'var(--text-primary, #0f172a)', fontFamily: "'JetBrains Mono', monospace" }}>
                      {d.dayNumber}
                    </div>
                    {count > 0 && (
                      <div style={{ marginTop: '3px', display: 'flex', justifyContent: 'center' }}>
                        <span style={{ fontSize: '9.5px', padding: '1.5px 7px', borderRadius: '999px', fontWeight: 700, backgroundColor: 'rgba(37, 99, 235, 0.12)', color: '#2563eb', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#2563eb' }} />
                          <span>{count} việc</span>
                        </span>
                      </div>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Body Rows */}
          <tbody>
            {printers.length === 0 ? (
              <tr>
                <td colSpan={viewDuration + 1} style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text-muted, #64748b)', fontSize: '13px' }}>
                  Không tìm thấy máy in nào phù hợp với bộ lọc hiện tại.
                </td>
              </tr>
            ) : (
              printers.map((printer) => {
                const tasks = printerTasksMap.get(printer.id) || [];
                const { placedTasks, totalLanes } = computePrinterTaskLanes(tasks, days, dayOffsets, dayWidths);
                const rowHeight = Math.max(54, PADDING_Y * 2 + totalLanes * LANE_HEIGHT + (totalLanes - 1) * LANE_GAP);

                return (
                  <tr key={printer.id} style={{ borderBottom: '1px solid var(--border-color, #e2e8f0)', height: `${rowHeight}px` }}>
                    <td style={{ width: `${DEVICE_COL_WIDTH}px`, minWidth: `${DEVICE_COL_WIDTH}px`, maxWidth: `${DEVICE_COL_WIDTH}px`, padding: '8px 16px', verticalAlign: 'middle', height: `${rowHeight}px`, position: 'sticky', left: 0, backgroundColor: 'var(--bg-card, #ffffff)', zIndex: 4, boxShadow: '2px 0 5px rgba(0,0,0,0.02)', boxSizing: 'border-box' }}>
                      <div style={{ minHeight: `${rowHeight - 16}px`, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary, #0f172a)' }}>{printer.name}</div>
                        <div style={{ fontSize: '10.5px', color: 'var(--text-muted, #64748b)' }}>{printer.model} • {printer.location}</div>
                      </div>
                    </td>

                    <td colSpan={viewDuration} style={{ width: `${totalTimelineWidth}px`, minWidth: `${totalTimelineWidth}px`, maxWidth: `${totalTimelineWidth}px`, padding: 0, verticalAlign: 'top', height: `${rowHeight}px`, borderLeft: '1px solid var(--border-color, #e2e8f0)', boxSizing: 'border-box' }}>
                      <div style={{ position: 'relative', width: `${totalTimelineWidth}px`, minWidth: `${totalTimelineWidth}px`, maxWidth: `${totalTimelineWidth}px`, height: `${rowHeight}px`, minHeight: `${rowHeight}px`, overflow: 'hidden' }}>
                        {/* Vạch kẻ chia cột ngày nền */}
                        <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: `${totalTimelineWidth}px`, height: '100%', display: 'flex', pointerEvents: 'none' }}>
                          {days.map((d, i) => (
                            <div
                              key={d.dateStr}
                              style={{
                                width: `${dayWidths[i]}px`,
                                minWidth: `${dayWidths[i]}px`,
                                maxWidth: `${dayWidths[i]}px`,
                                flexShrink: 0,
                                boxSizing: 'border-box',
                                height: '100%',
                                borderRight: '1px solid var(--border-color, #e2e8f0)',
                                backgroundColor: d.isToday ? 'rgba(37, 99, 235, 0.05)' : (dayTaskCounts.get(d.dateStr) || 0) > 0 ? 'rgba(241, 245, 249, 0.55)' : 'transparent',
                              }}
                            />
                          ))}
                        </div>

                        {/* Thanh task bar nằm gọn gàng bên trong các làn */}
                        {placedTasks.map((item) => (
                          <TimelineTaskBarItem
                            key={item.task.id}
                            task={item.task}
                            leftPx={item.leftPx}
                            widthPx={item.widthPx}
                            top={PADDING_Y + item.laneIndex * (LANE_HEIGHT + LANE_GAP)}
                            height={LANE_HEIGHT}
                            onClick={() => onSelectTask(printer, item.task.id)}
                            onMouseEnter={(e) => onHoverTask(item.task, e)}
                            onMouseLeave={() => onHoverTask(null)}
                          />
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

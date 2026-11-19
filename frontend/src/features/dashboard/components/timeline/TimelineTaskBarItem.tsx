/**
 * Frontend/src/features/dashboard/components/timeline/TimelineTaskBarItem.tsx
 *
 * Thanh Tiến Độ Công Việc Trên Trục Thời Gian (Task Bar Item):
 * - Màu sắc biến đổi động theo % tiến trình và trạng thái làm lại (isReworking).
 * - Không dùng border, bo góc tròn 8px mềm mại, bóng đổ nhẹ tự nhiên.
 * - Khóa boxSizing: border-box tuyệt đối không để padding làm tràn ra khỏi ô ngày.
 * - Hỗ trợ tick hoàn thành xanh và hiển thị phần trăm chuẩn JetBrains Mono.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React from 'react';
import { FontAwesomeIcon, faCircleCheck } from '../../../../shared/icons';
import { Task } from '../../../../types/task';
import { calculateTaskProgress } from '../../utils';

interface TimelineTaskBarItemProps {
  task: Task;
  leftPercent?: number;
  widthPercent?: number;
  leftPx?: number;
  widthPx?: number;
  top?: number;
  height?: number;
  onClick: () => void;
  onMouseEnter: (e: React.MouseEvent) => void;
  onMouseLeave: () => void;
}

export const TimelineTaskBarItem: React.FC<TimelineTaskBarItemProps> = ({
  task,
  leftPercent = 0,
  widthPercent = 0,
  leftPx,
  widthPx,
  top = 6,
  height = 32,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  const { effectivePercent, isCompleted, colorStyle } = calculateTaskProgress(task);

  return (
    <div
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        position: 'absolute',
        left: leftPx !== undefined ? `${leftPx}px` : `${Math.max(0, leftPercent)}%`,
        width: widthPx !== undefined ? `${widthPx}px` : `${Math.max(4, Math.min(100 - leftPercent, widthPercent))}%`,
        top: `${top}px`,
        height: `${height}px`,
        backgroundColor: colorStyle.bgHex,
        border: 'none',
        borderRadius: '8px',
        padding: '2px 8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'pointer',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        overflow: 'hidden',
        zIndex: 2,
        boxSizing: 'border-box',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', overflow: 'hidden' }}>
        {isCompleted || effectivePercent >= 100 ? (
          <FontAwesomeIcon icon={faCircleCheck} style={{ fontSize: '11px', color: colorStyle.fillHex }} />
        ) : (
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: colorStyle.fillHex, flexShrink: 0 }} />
        )}
        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            color: colorStyle.textHex,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {task.title}
        </span>
      </div>

      <span
        style={{
          fontSize: '10px',
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 800,
          color: colorStyle.textHex,
          marginLeft: '4px',
          flexShrink: 0,
        }}
      >
        {isCompleted || effectivePercent >= 100 ? '100%' : `${effectivePercent}%`}
      </span>
    </div>
  );
};

/**
 * Frontend/src/features/dashboard/components/timeline/TimelineCalendarHeader.tsx
 *
 * Header điều khiển Lịch Trình Tiến Độ Công Việc (Timeline Gantt Calendar):
 * - Bộ chuyển đổi dải ngày (7 ngày, 14 ngày, 30 ngày), nút Hôm nay, Prev/Next.
 * - Bộ lọc loại công việc, tìm kiếm máy in và nút Tạo việc mới.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React from 'react';
import {
  FontAwesomeIcon,
  faChevronLeft,
  faChevronRight,
  faPlus,
  faMagnifyingGlass,
  faFilter,
} from '../../../../shared/icons';

interface TimelineCalendarHeaderProps {
  viewDuration: 7 | 14 | 30;
  onChangeViewDuration: (v: 7 | 14 | 30) => void;
  dateRangeLabel: string;
  onPrevRange: () => void;
  onNextRange: () => void;
  onJumpToToday: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  typeFilter: string;
  onTypeFilterChange: (t: string) => void;
  onlyWithTasks: boolean;
  onToggleOnlyWithTasks: () => void;
  printersWithTasksCount: number;
  onOpenCreateModal: () => void;
}

export const TimelineCalendarHeader: React.FC<TimelineCalendarHeaderProps> = ({
  viewDuration,
  onChangeViewDuration,
  dateRangeLabel,
  onPrevRange,
  onNextRange,
  onJumpToToday,
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  onlyWithTasks,
  onToggleOnlyWithTasks,
  printersWithTasksCount,
  onOpenCreateModal,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '14px',
        padding: '16px 20px',
        borderRadius: '20px',
        backgroundColor: 'var(--bg-card, #ffffff)',
        border: '1px solid var(--border-color, #e2e8f0)',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
      }}
    >
      {/* 1. Date Navigation & View Duration */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            type="button"
            onClick={onPrevRange}
            style={{
              padding: '6px',
              borderRadius: '8px',
              border: '1px solid var(--border-color, #e2e8f0)',
              background: 'transparent',
              cursor: 'pointer',
              color: 'var(--text-secondary, #475569)',
            }}
          >
            <FontAwesomeIcon icon={faChevronLeft} style={{ fontSize: '13px' }} />
          </button>
          <button
            type="button"
            onClick={onNextRange}
            style={{
              padding: '6px',
              borderRadius: '8px',
              border: '1px solid var(--border-color, #e2e8f0)',
              background: 'transparent',
              cursor: 'pointer',
              color: 'var(--text-secondary, #475569)',
            }}
          >
            <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: '13px' }} />
          </button>
        </div>

        <strong style={{ fontSize: '13.5px', color: 'var(--text-primary, #0f172a)', minWidth: '160px' }}>
          {dateRangeLabel}
        </strong>

        <button
          type="button"
          onClick={onJumpToToday}
          style={{
            padding: '5px 12px',
            borderRadius: '8px',
            fontSize: '11.5px',
            fontWeight: 700,
            border: '1px solid var(--border-color, #e2e8f0)',
            backgroundColor: 'var(--bg-subtle, #f8fafc)',
            color: '#2563eb',
            cursor: 'pointer',
          }}
        >
          Hôm nay
        </button>

        {/* Duration Pills */}
        <div style={{ display: 'flex', backgroundColor: 'var(--bg-subtle, #f8fafc)', padding: '2px', borderRadius: '8px', border: '1px solid var(--border-color, #e2e8f0)' }}>
          {[
            { val: 7 as const, label: '7 ngày' },
            { val: 14 as const, label: '14 ngày' },
            { val: 30 as const, label: '30 ngày' },
          ].map((item) => (
            <button
              key={item.val}
              type="button"
              onClick={() => onChangeViewDuration(item.val)}
              style={{
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: viewDuration === item.val ? 700 : 500,
                borderRadius: '6px',
                border: 'none',
                backgroundColor: viewDuration === item.val ? 'var(--bg-card, #ffffff)' : 'transparent',
                color: viewDuration === item.val ? '#2563eb' : 'var(--text-muted, #64748b)',
                cursor: 'pointer',
                boxShadow: viewDuration === item.val ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Filters & Create Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--bg-subtle, #f8fafc)', border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '10px', padding: '5px 10px' }}>
          <FontAwesomeIcon icon={faMagnifyingGlass} style={{ fontSize: '12px', color: '#64748b' }} />
          <input
            type="text"
            placeholder="Tìm máy in..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '11.5px', width: '130px' }}
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => onTypeFilterChange(e.target.value)}
          style={{
            padding: '5px 10px',
            fontSize: '11.5px',
            borderRadius: '10px',
            border: '1px solid var(--border-color, #e2e8f0)',
            backgroundColor: 'var(--bg-card, #ffffff)',
          }}
        >
          <option value="all">Tất cả loại việc</option>
          <option value="CORRECTIVE_REPAIR">Sửa chữa P1</option>
          <option value="PREVENTIVE_MAINTENANCE">Bảo trì</option>
          <option value="SUPPLIES_REPLACEMENT">Cấp phát vật tư</option>
          <option value="ROUTINE_INSPECTION">Kiểm tra định kỳ</option>
        </select>

        {/* Nút lọc máy in có task */}
        <button
          type="button"
          onClick={onToggleOnlyWithTasks}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 12px',
            fontSize: '11.5px',
            fontWeight: 600,
            borderRadius: '10px',
            border: `1px solid ${onlyWithTasks ? '#2563eb' : 'var(--border-color, #e2e8f0)'}`,
            backgroundColor: onlyWithTasks ? 'rgba(37, 99, 235, 0.08)' : 'var(--bg-card, #ffffff)',
            color: onlyWithTasks ? '#2563eb' : 'var(--text-secondary, #475569)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap',
          }}
          title={onlyWithTasks ? 'Hiển thị tất cả máy in' : 'Chỉ hiển thị máy in có lịch trình task'}
        >
          <FontAwesomeIcon
            icon={faFilter}
            style={{ fontSize: '11px', color: onlyWithTasks ? '#2563eb' : '#64748b' }}
          />
          <span>Có gắn task</span>
          <span
            style={{
              padding: '1px 6px',
              borderRadius: '999px',
              fontSize: '10px',
              fontWeight: 700,
              backgroundColor: onlyWithTasks ? '#2563eb' : 'var(--bg-subtle, #f1f5f9)',
              color: onlyWithTasks ? '#ffffff' : 'var(--text-muted, #64748b)',
            }}
          >
            {printersWithTasksCount}
          </span>
        </button>

        <button
          type="button"
          onClick={onOpenCreateModal}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: '10px',
            backgroundColor: '#16a34a',
            color: '#ffffff',
            fontSize: '12px',
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)',
          }}
        >
          <FontAwesomeIcon icon={faPlus} style={{ fontSize: '12px' }} />
          <span>Tạo việc mới</span>
        </button>
      </div>
    </div>
  );
};


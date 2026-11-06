/**
 * Frontend/src/features/printers/components/workorders/WorkOrdersFilterBar.tsx
 *
 * Thanh lọc & tìm kiếm đa chiều cho Bảng Lệnh Bảo Trì (Work Orders Table):
 * - Tìm kiếm, Scope (Tất cả / Đang xử lý / Kho lịch sử), Mã lỗi, Ưu tiên.
 * - Bổ sung lọc theo Chi nhánh và Tầng đồng bộ với Danh mục máy in.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React from 'react';
import {
  FontAwesomeIcon,
  faMagnifyingGlass,
  faCalendarDays,
  faBuilding,
  faLocationDot,
} from '../../../../shared/icons';

interface WorkOrdersFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  scopeFilter: 'all' | 'my_tasks' | 'active' | 'completed';
  onScopeFilterChange: (s: 'all' | 'my_tasks' | 'active' | 'completed') => void;
  myTasksCount?: number;
  codeFilter: string;
  onCodeFilterChange: (c: string) => void;
  availableCodes: string[];
  statusFilter: string;
  onStatusFilterChange: (st: string) => void;
  priorityFilter: string;
  onPriorityFilterChange: (p: string) => void;
  branchFilter?: string;
  onBranchFilterChange?: (b: string) => void;
  branches?: string[];
  floorFilter?: string;
  onFloorFilterChange?: (f: string) => void;
  floors?: string[];
  onSwitchToTimelineView?: () => void;
}

export const WorkOrdersFilterBar: React.FC<WorkOrdersFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  scopeFilter,
  onScopeFilterChange,
  myTasksCount,
  codeFilter,
  onCodeFilterChange,
  availableCodes,
  priorityFilter,
  onPriorityFilterChange,
  branchFilter = 'all',
  onBranchFilterChange,
  branches = [],
  floorFilter = 'all',
  onFloorFilterChange,
  floors = [],
  onSwitchToTimelineView,
}) => {
  return (
    <div
      style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--border-color, #e2e8f0)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        backgroundColor: 'var(--bg-card, #ffffff)',
      }}
    >
      {/* 1. Scope filter pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--bg-subtle, #f8fafc)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-color, #e2e8f0)' }}>
        {[
          { id: 'all' as const, label: 'Tất cả' },
          { id: 'my_tasks' as const, label: myTasksCount !== undefined ? `⚡ Việc của tôi (${myTasksCount})` : 'Việc của tôi' },
          { id: 'active' as const, label: 'Đang xử lý' },
          { id: 'completed' as const, label: 'Kho lịch sử' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onScopeFilterChange(tab.id)}
            style={{
              padding: '4px 12px',
              fontSize: '11.5px',
              fontWeight: scopeFilter === tab.id ? 700 : 500,
              borderRadius: '6px',
              border: 'none',
              backgroundColor: scopeFilter === tab.id ? 'var(--bg-card, #ffffff)' : 'transparent',
              color: scopeFilter === tab.id ? '#2563eb' : 'var(--text-muted, #64748b)',
              cursor: 'pointer',
              boxShadow: scopeFilter === tab.id ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 2. Search & Dropdowns */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--bg-subtle, #f8fafc)', border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '8px', padding: '5px 10px' }}>
          <FontAwesomeIcon icon={faMagnifyingGlass} style={{ fontSize: '12px', color: '#64748b' }} />
          <input
            type="text"
            placeholder="Tìm theo lệnh, máy, KTV..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '11.5px', width: '150px' }}
          />
        </div>

        {/* Branch Filter */}
        {onBranchFilterChange && branches.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <FontAwesomeIcon icon={faBuilding} style={{ fontSize: '11px', color: '#94a3b8' }} />
            <select
              value={branchFilter}
              onChange={(e) => onBranchFilterChange(e.target.value)}
              style={{ padding: '5px 8px', fontSize: '11.5px', borderRadius: '8px', border: '1px solid var(--border-color, #e2e8f0)', backgroundColor: 'var(--bg-card, #ffffff)', outline: 'none' }}
            >
              <option value="all">Tất cả chi nhánh</option>
              {branches.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
        )}

        {/* Floor Filter */}
        {onFloorFilterChange && floors.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <FontAwesomeIcon icon={faLocationDot} style={{ fontSize: '11px', color: '#94a3b8' }} />
            <select
              value={floorFilter}
              onChange={(e) => onFloorFilterChange(e.target.value)}
              style={{ padding: '5px 8px', fontSize: '11.5px', borderRadius: '8px', border: '1px solid var(--border-color, #e2e8f0)', backgroundColor: 'var(--bg-card, #ffffff)', outline: 'none' }}
            >
              <option value="all">Tất cả tầng</option>
              {floors.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
        )}

        {/* Code Filter */}
        {availableCodes.length > 0 && (
          <select
            value={codeFilter}
            onChange={(e) => onCodeFilterChange(e.target.value)}
            style={{ padding: '5px 8px', fontSize: '11.5px', borderRadius: '8px', border: '1px solid var(--border-color, #e2e8f0)', backgroundColor: 'var(--bg-card, #ffffff)', outline: 'none' }}
          >
            <option value="all">Mã lỗi (Tất cả)</option>
            {availableCodes.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        )}

        {/* Priority Filter */}
        <select
          value={priorityFilter}
          onChange={(e) => onPriorityFilterChange(e.target.value)}
          style={{ padding: '5px 8px', fontSize: '11.5px', borderRadius: '8px', border: '1px solid var(--border-color, #e2e8f0)', backgroundColor: 'var(--bg-card, #ffffff)', outline: 'none' }}
        >
          <option value="all">Ưu tiên (Tất cả)</option>
          <option value="P1_Urgent">Critical</option>
          <option value="P2_High">High</option>
          <option value="P3_Medium">Medium</option>
          <option value="P4_Low">Low</option>
        </select>

        {onSwitchToTimelineView && (
          <button
            type="button"
            onClick={onSwitchToTimelineView}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-subtle, #f8fafc)',
              border: '1px solid var(--border-color, #e2e8f0)',
              color: '#2563eb',
              fontSize: '11.5px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <FontAwesomeIcon icon={faCalendarDays} style={{ fontSize: '12px' }} />
            <span>Xem lịch trình</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default WorkOrdersFilterBar;

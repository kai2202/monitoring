/**
 * Frontend/src/features/printers/components/PrinterFilterToolbar.tsx
 *
 * Thanh Công Cụ & Bộ Lọc Nâng Cao Máy In:
 * - Hỗ trợ lọc theo Chi nhánh, Tầng, Hãng sản xuất, Loại in (Mono/Màu), Chức năng (MFP/SFP).
 * - Tinh gọn loại bỏ nút trạng thái trùng lặp với FleetHealthBar.
 * - Nút "Đặt lại bộ lọc" kèm huy hiệu đếm số tiêu chí đang lọc.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React, { useState } from 'react';
import {
  FontAwesomeIcon,
  faMagnifyingGlass,
  faBuilding,
  faLocationDot,
  faRotate,
  faChevronDown,
} from '../../../shared/icons';

export interface PrinterFilterToolbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  statusFilter: string;
  onStatusFilterChange: (s: string) => void;
  mfrFilter: string;
  onMfrFilterChange: (m: string) => void;
  manufacturers: string[];
  branchFilter: string;
  onBranchFilterChange: (b: string) => void;
  branches: string[];
  floorFilter: string;
  onFloorFilterChange: (f: string) => void;
  floors: string[];
  colorFilter: string;
  onColorFilterChange: (c: string) => void;
  functionFilter: string;
  onFunctionFilterChange: (fn: string) => void;
  totalPrinters: number;
  onResetAllFilters: () => void;
}

export const PrinterFilterToolbar: React.FC<PrinterFilterToolbarProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  mfrFilter,
  onMfrFilterChange,
  manufacturers,
  branchFilter,
  onBranchFilterChange,
  branches,
  floorFilter,
  onFloorFilterChange,
  floors,
  colorFilter,
  onColorFilterChange,
  functionFilter,
  onFunctionFilterChange,
  onResetAllFilters,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const advancedActiveCount = (colorFilter !== 'all' ? 1 : 0) + (functionFilter !== 'all' ? 1 : 0);

  // Đếm số tiêu chí đang áp dụng khác mặc định
  let activeFilterCount = 0;
  if (searchQuery.trim()) activeFilterCount++;
  if (statusFilter !== 'all') activeFilterCount++;
  if (branchFilter !== 'all') activeFilterCount++;
  if (floorFilter !== 'all') activeFilterCount++;
  if (mfrFilter !== 'all') activeFilterCount++;
  if (colorFilter !== 'all') activeFilterCount++;
  if (functionFilter !== 'all') activeFilterCount++;

  const selectStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '6px 11px',
    borderRadius: '8px',
    backgroundColor: isActive ? 'rgba(37, 99, 235, 0.08)' : 'var(--bg-subtle, #f8fafc)',
    border: isActive ? '1px solid #2563eb' : '1px solid var(--border-color, #e2e8f0)',
    color: isActive ? '#2563eb' : 'var(--text-secondary, #475569)',
    fontSize: '11.5px',
    cursor: 'pointer',
    outline: 'none',
    fontWeight: isActive ? 700 : 500,
    transition: 'all 0.15s ease',
  });

  return (
    <div
      style={{
        padding: '12px 18px',
        borderRadius: 'var(--radius-card, 16px)',
        backgroundColor: 'var(--bg-card, #ffffff)',
        border: '1px solid var(--border-color, #e2e8f0)',
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* 1. Ô tìm kiếm chính */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: 'var(--bg-subtle, #f8fafc)',
          border: '1px solid var(--border-color, #e2e8f0)',
          borderRadius: '9999px',
          padding: '6px 14px',
          minWidth: '240px',
          flex: '1 1 260px',
        }}
      >
        <FontAwesomeIcon icon={faMagnifyingGlass} style={{ fontSize: '12px', color: 'var(--text-muted, #94a3b8)' }} />
        <input
          type="text"
          placeholder="Tìm theo mã máy, IP, model, sê-ri, chi nhánh, tầng..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-primary, #0f172a)',
            fontSize: '12px',
            width: '100%',
          }}
        />
      </div>

      {/* 2. Cụm Dropdowns Bộ Lọc */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        {/* Dropdown Chi nhánh */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <FontAwesomeIcon icon={faBuilding} style={{ fontSize: '11px', color: 'var(--text-muted, #94a3b8)' }} />
          <select
            value={branchFilter}
            onChange={(e) => onBranchFilterChange(e.target.value)}
            style={selectStyle(branchFilter !== 'all')}
          >
            <option value="all">Tất cả chi nhánh</option>
            {branches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        {/* Dropdown Tầng */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <FontAwesomeIcon icon={faLocationDot} style={{ fontSize: '11px', color: 'var(--text-muted, #94a3b8)' }} />
          <select
            value={floorFilter}
            onChange={(e) => onFloorFilterChange(e.target.value)}
            style={selectStyle(floorFilter !== 'all')}
          >
            <option value="all">Tất cả tầng</option>
            {floors.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>

        {/* Dropdown Hãng sản xuất */}
        <select
          value={mfrFilter}
          onChange={(e) => onMfrFilterChange(e.target.value)}
          style={selectStyle(mfrFilter !== 'all')}
        >
          <option value="all">Tất cả hãng</option>
          {manufacturers.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        {/* Nút Toggle Bộ lọc nâng cao (Mono/Color, MFP/SFP) */}
        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          style={{
            ...selectStyle(advancedActiveCount > 0 || showAdvanced),
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
          title="Bấm để ẩn/hiện bộ lọc loại in và chức năng thiết bị"
        >
          <span>Bộ lọc khác</span>
          {advancedActiveCount > 0 && (
            <span
              style={{
                padding: '0 5px',
                borderRadius: '9999px',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                fontSize: '9.5px',
                fontWeight: 800,
              }}
            >
              {advancedActiveCount}
            </span>
          )}
          <FontAwesomeIcon
            icon={faChevronDown}
            style={{
              fontSize: '9px',
              transform: showAdvanced ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.15s ease',
            }}
          />
        </button>

        {/* Dropdown Loại in & Chức năng (Hiển thị khi mở rộng hoặc khi đang lọc) */}
        {(showAdvanced || advancedActiveCount > 0) && (
          <>
            <select
              value={colorFilter}
              onChange={(e) => onColorFilterChange(e.target.value)}
              style={selectStyle(colorFilter !== 'all')}
            >
              <option value="all">Màu / Đơn sắc</option>
              <option value="mono">Đen trắng (Mono)</option>
              <option value="color">In màu (Color)</option>
            </select>

            <select
              value={functionFilter}
              onChange={(e) => onFunctionFilterChange(e.target.value)}
              style={selectStyle(functionFilter !== 'all')}
            >
              <option value="all">Đa / Đơn năng</option>
              <option value="mfp">Đa năng (MFP)</option>
              <option value="sfp">Đơn năng (SFP)</option>
            </select>
          </>
        )}

        {/* Nút Đặt lại tất cả bộ lọc khi có bộ lọc đang áp dụng */}
        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={onResetAllFilters}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 12px',
              borderRadius: '8px',
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#ef4444',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title="Xóa toàn bộ các bộ lọc đang áp dụng"
          >
            <FontAwesomeIcon icon={faRotate} style={{ fontSize: '10px' }} />
            <span>Đặt lại ({activeFilterCount})</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default PrinterFilterToolbar;

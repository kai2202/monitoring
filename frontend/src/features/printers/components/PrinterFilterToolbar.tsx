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
  branchSubnets?: Record<string, string | null | undefined>;
  subnetFilter?: string;
  onSubnetFilterChange?: (s: string) => void;
  subnets?: string[];
  floorFilter: string;
  onFloorFilterChange: (f: string) => void;
  floors: string[];
  colorFilter: string;
  onColorFilterChange: (c: string) => void;
  functionFilter: string;
  onFunctionFilterChange: (fn: string) => void;
  sizeFilter?: 'all' | 'desktop' | 'large';
  onSizeFilterChange?: (s: 'all' | 'desktop' | 'large') => void;
  managingTeamFilter?: string;
  onManagingTeamFilterChange?: (team: string) => void;
  managingTeams?: string[];
  totalPrinters: number;
  filteredCount?: number;
  embedded?: boolean;
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
  branchSubnets = {},
  subnetFilter = 'all',
  onSubnetFilterChange,
  subnets = [],
  floorFilter,
  onFloorFilterChange,
  floors,
  colorFilter,
  onColorFilterChange,
  functionFilter,
  onFunctionFilterChange,
  sizeFilter = 'all',
  onSizeFilterChange,
  managingTeamFilter = 'all',
  onManagingTeamFilterChange,
  managingTeams = [],
  totalPrinters,
  filteredCount,
  embedded = false,
  onResetAllFilters,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const advancedActiveCount = (colorFilter !== 'all' ? 1 : 0) + (functionFilter !== 'all' ? 1 : 0) + (managingTeamFilter !== 'all' ? 1 : 0);

  // Đếm số tiêu chí đang áp dụng khác mặc định
  let activeFilterCount = 0;
  if (searchQuery.trim()) activeFilterCount++;
  if (statusFilter !== 'all') activeFilterCount++;
  if (branchFilter !== 'all') activeFilterCount++;
  if (subnetFilter !== 'all') activeFilterCount++;
  if (floorFilter !== 'all') activeFilterCount++;
  if (mfrFilter !== 'all') activeFilterCount++;
  if (colorFilter !== 'all') activeFilterCount++;
  if (functionFilter !== 'all') activeFilterCount++;
  if (sizeFilter !== 'all') activeFilterCount++;
  if (managingTeamFilter !== 'all') activeFilterCount++;

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
      style={
        embedded
          ? {
              padding: '12px 16px',
              backgroundColor: 'var(--bg-card, #ffffff)',
              borderBottom: '1px solid var(--border-color, #e2e8f0)',
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px',
            }
          : {
              padding: '12px 18px',
              borderRadius: '12px',
              backgroundColor: 'var(--bg-card, #ffffff)',
              border: '1px solid var(--border-color, #e2e8f0)',
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px',
            }
      }
    >
      {/* 1. Ô tìm kiếm chính */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: 'var(--bg-subtle, #f8fafc)',
          border: '1px solid var(--border-color, #e2e8f0)',
          borderRadius: '8px',
          padding: '6px 12px',
          minWidth: '230px',
          flex: '1 1 250px',
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
            <option value="all">Tất cả Site / Chi nhánh</option>
            {branches.map((b) => (
              <option key={b} value={b}>
                {branchSubnets[b] ? `${b} (${branchSubnets[b]})` : b}
              </option>
            ))}
          </select>
        </div>

        {/* Dropdown Dải mạng (Subnet) */}
        {onSubnetFilterChange && subnets.length > 0 && (
          <select
            value={subnetFilter}
            onChange={(e) => onSubnetFilterChange(e.target.value)}
            style={selectStyle(subnetFilter !== 'all')}
            title="Lọc theo dải mạng IP (/24)"
          >
            <option value="all">Tất cả dải mạng</option>
            {subnets.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        )}

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

        {onSizeFilterChange && (
          <select
            value={sizeFilter}
            onChange={(e) => onSizeFilterChange(e.target.value as 'all' | 'desktop' | 'large')}
            style={selectStyle(sizeFilter !== 'all')}
            title="Lọc theo kích thước / kiểu dáng máy in"
          >
            <option value="all">Tất cả kích thước</option>
            <option value="desktop">Máy nhỏ để bàn</option>
            <option value="large">Máy công nghiệp / Cỡ lớn</option>
          </select>
        )}

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

            {onManagingTeamFilterChange && (
              <select
                value={managingTeamFilter}
                onChange={(e) => onManagingTeamFilterChange(e.target.value)}
                style={selectStyle(managingTeamFilter !== 'all')}
                title="Lọc theo Team quản lý / chịu trách nhiệm tài sản"
              >
                <option value="all">Tất cả Team quản lý</option>
                {managingTeams.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            )}
          </>
        )}

        {/* Nút Đặt lại cố định vị trí bên phải (không biến mất để tránh giật layout) */}
        <div style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          {filteredCount !== undefined && (
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--text-muted, #64748b)',
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {filteredCount}/{totalPrinters} máy
            </span>
          )}
          <button
            type="button"
            onClick={onResetAllFilters}
            disabled={activeFilterCount === 0}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              backgroundColor: activeFilterCount > 0 ? 'rgba(239, 68, 68, 0.08)' : 'var(--bg-subtle, #f8fafc)',
              border: activeFilterCount > 0 ? '1px solid rgba(239, 68, 68, 0.25)' : '1px solid var(--border-color, #e2e8f0)',
              color: activeFilterCount > 0 ? '#ef4444' : 'var(--text-muted, #94a3b8)',
              fontSize: '11.5px',
              fontWeight: 600,
              cursor: activeFilterCount > 0 ? 'pointer' : 'not-allowed',
              opacity: activeFilterCount > 0 ? 1 : 0.65,
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            }}
            title={activeFilterCount > 0 ? 'Xóa toàn bộ các bộ lọc đang áp dụng' : 'Chưa có bộ lọc nào đang áp dụng'}
          >
            <FontAwesomeIcon icon={faRotate} style={{ fontSize: '10.5px' }} />
            <span>Đặt lại</span>
            {activeFilterCount > 0 && (
              <span
                style={{
                  padding: '0 5px',
                  borderRadius: '9999px',
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  fontSize: '9.5px',
                  fontWeight: 800,
                }}
              >
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrinterFilterToolbar;

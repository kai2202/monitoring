import React from 'react';
import { Search, RotateCcw } from 'lucide-react';

interface PrinterFiltersProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  deviceTypeFilter: string;
  setDeviceTypeFilter: (t: string) => void;
  deviceTypes: string[];
  mfrFilter: string;
  setMfrFilter: (m: string) => void;
  manufacturers: string[];
  sortBy: string;
  setSortBy: (s: string) => void;
  pageSize: number;
  setPageSize: (s: number) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
  onResetPage: () => void;
}

export const PrinterFilters: React.FC<PrinterFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  deviceTypeFilter,
  setDeviceTypeFilter,
  deviceTypes,
  mfrFilter,
  setMfrFilter,
  manufacturers,
  sortBy,
  setSortBy,
  pageSize,
  setPageSize,
  onResetFilters,
  hasActiveFilters,
  onResetPage,
}) => {
  return (
    <div
      className="card"
      style={{
        padding: '1rem',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '0.75rem'
      }}
    >
      {/* Search Input */}
      <div style={{ position: 'relative', flex: '1 1 240px', minWidth: '220px' }}>
        <Search
          size={16}
          style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }}
        />
        <input
          type="text"
          className="form-input"
          style={{ width: '100%', paddingLeft: '2.25rem' }}
          placeholder="Tìm theo tên, ID (PRN-xxx), IP, model, hãng, vị trí..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            onResetPage();
          }}
        />
      </div>

      {/* Device Type Filter */}
      <div style={{ flex: '0 1 180px' }}>
        <select
          className="form-select"
          style={{ width: '100%' }}
          value={deviceTypeFilter}
          onChange={(e) => {
            setDeviceTypeFilter(e.target.value);
            onResetPage();
          }}
        >
          <option value="all">Mọi Chủng Loại Máy</option>
          {deviceTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {/* Brand / Manufacturer Filter */}
      <div style={{ flex: '0 1 160px' }}>
        <select
          className="form-select"
          style={{ width: '100%' }}
          value={mfrFilter}
          onChange={(e) => {
            setMfrFilter(e.target.value);
            onResetPage();
          }}
        >
          <option value="all">Mọi Hãng Sản Xuất</option>
          {manufacturers.map(mfr => (
            <option key={mfr} value={mfr}>{mfr}</option>
          ))}
        </select>
      </div>

      {/* Sort Dropdown */}
      <div style={{ flex: '0 1 200px' }}>
        <select
          className="form-select"
          style={{ width: '100%' }}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="severity">Sắp xếp: Mức độ lỗi (Nguy cấp trước)</option>
          <option value="downtime">Sắp xếp: Thời gian Offline lâu nhất</option>
          <option value="name">Sắp xếp: Tên máy in (A-Z)</option>
          <option value="id">Sắp xếp: Mã máy in (ID)</option>
          <option value="ip">Sắp xếp: Địa chỉ IP</option>
          <option value="mfr">Sắp xếp: Hãng sản xuất</option>
          <option value="type">Sắp xếp: Chủng loại thiết bị</option>
        </select>
      </div>

      {/* Page Size Dropdown */}
      <div style={{ flex: '0 1 110px' }}>
        <select
          className="form-select"
          style={{ width: '100%' }}
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
            onResetPage();
          }}
        >
          <option value={10}>10 máy/trang</option>
          <option value={20}>20 máy/trang</option>
        </select>
      </div>

      {/* Reset Button */}
      {hasActiveFilters && (
        <button
          onClick={onResetFilters}
          className="btn btn-secondary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          title="Xóa bộ lọc nâng cao"
        >
          <RotateCcw size={14} />
          <span>Đặt lại</span>
        </button>
      )}
    </div>
  );
};

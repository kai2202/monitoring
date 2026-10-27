import React from 'react';
import { Search, RotateCcw } from 'lucide-react';

interface SuppliesFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  mfrFilter: string;
  onMfrChange: (mfr: string) => void;
  manufacturers: string[];
  deviceTypeFilter: string;
  onDeviceTypeChange: (type: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
  onReset: () => void;
}

export const SuppliesFilters: React.FC<SuppliesFiltersProps> = ({
  searchQuery,
  onSearchChange,
  mfrFilter,
  onMfrChange,
  manufacturers,
  deviceTypeFilter,
  onDeviceTypeChange,
  statusFilter,
  onStatusChange,
  onReset
}) => {
  return (
    <div
      className="card"
      style={{
        padding: '0.85rem 1rem',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '0.75rem'
      }}
    >
      {/* Search */}
      <div style={{ position: 'relative', flex: '1 1 240px', minWidth: '180px' }}>
        <Search
          size={16}
          style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }}
        />
        <input
          type="text"
          className="form-input"
          style={{ width: '100%', paddingLeft: '2.25rem' }}
          placeholder="Lọc vật tư theo tên máy, ID (PRN-xxx), model, hãng, vị trí..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Brand Filter */}
      <div style={{ flex: '0 1 150px' }}>
        <select
          className="form-select"
          style={{ width: '100%' }}
          value={mfrFilter}
          onChange={(e) => onMfrChange(e.target.value)}
        >
          <option value="all">Mọi Hãng SX</option>
          {manufacturers.map(mfr => (
            <option key={mfr} value={mfr}>{mfr}</option>
          ))}
        </select>
      </div>

      {/* Device Type Filter */}
      <div style={{ flex: '0 1 170px' }}>
        <select
          className="form-select"
          style={{ width: '100%' }}
          value={deviceTypeFilter}
          onChange={(e) => onDeviceTypeChange(e.target.value)}
        >
          <option value="all">Mọi loại thiết bị</option>
          <option value="Color MFP">Đa năng màu (Color MFP)</option>
          <option value="Mono MFP">Đa năng đơn sắc (Mono MFP)</option>
          <option value="Mono Laser">Laser đơn sắc (Mono Laser)</option>
          <option value="Industrial Thermal">Máy in nhiệt (Thermal)</option>
          <option value="Large Format Plotter">Khổ lớn (Plotter)</option>
        </select>
      </div>

      {/* Status Filter */}
      <div style={{ flex: '0 1 200px' }}>
        <select
          className="form-select"
          style={{ width: '100%' }}
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          <option value="all">Tất cả trạng thái vật tư</option>
          <option value="low">Mực thấp (&lt;15%)</option>
          <option value="waste_full">Mực thải đầy (≥85%)</option>
          <option value="normal">Mức an toàn (≥15%)</option>
          <option value="monochrome">Máy in đơn sắc (Mono)</option>
          <option value="unavailable">Mất kết nối / Offline</option>
          <option value="unknown">Chưa xác định MIB</option>
        </select>
      </div>

      <button
        onClick={onReset}
        className="btn btn-secondary btn-sm"
        style={{ padding: '0.45rem 0.75rem', gap: '0.35rem' }}
      >
        <RotateCcw size={13} />
        <span>Đặt lại</span>
      </button>
    </div>
  );
};

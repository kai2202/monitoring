import React from 'react';
import { Search, RotateCcw } from 'lucide-react';

interface IncidentFiltersProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  severityFilter: string;
  setSeverityFilter: (s: string) => void;
  printerFilter: string;
  setPrinterFilter: (p: string) => void;
  categoryFilter: string;
  setCategoryFilter: (c: string) => void;
  uniquePrinters: string[];
  uniqueCategories: string[];
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

export const IncidentFilters: React.FC<IncidentFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  severityFilter,
  setSeverityFilter,
  printerFilter,
  setPrinterFilter,
  categoryFilter,
  setCategoryFilter,
  uniquePrinters,
  uniqueCategories,
  onResetFilters,
  hasActiveFilters,
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
      {/* Search Input */}
      <div style={{ position: 'relative', flex: '1 1 200px', minWidth: '180px' }}>
        <Search
          size={16}
          style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }}
        />
        <input
          type="text"
          className="form-input"
          style={{ width: '100%', paddingLeft: '2.25rem' }}
          placeholder="Tìm theo mã sự cố (INC-xxx), máy in, lỗi..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Severity Filter */}
      <div style={{ flex: '0 1 150px' }}>
        <select
          className="form-select"
          style={{ width: '100%' }}
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
        >
          <option value="all">Tất cả mức độ</option>
          <option value="Critical">Khẩn cấp</option>
          <option value="Warning">Cảnh báo</option>
          <option value="Info">Thông tin</option>
        </select>
      </div>

      {/* Printer Filter */}
      <div style={{ flex: '0 1 180px' }}>
        <select
          className="form-select"
          style={{ width: '100%' }}
          value={printerFilter}
          onChange={(e) => setPrinterFilter(e.target.value)}
        >
          <option value="all">Tất cả máy in</option>
          {uniquePrinters.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {/* Category Filter */}
      <div style={{ flex: '0 1 160px' }}>
        <select
          className="form-select"
          style={{ width: '100%' }}
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="all">Mọi danh mục lỗi</option>
          {uniqueCategories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Reset Button */}
      {hasActiveFilters && (
        <button
          onClick={onResetFilters}
          className="btn btn-ghost btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)' }}
          title="Xóa toàn bộ bộ lọc"
        >
          <RotateCcw size={14} />
          <span>Đặt lại</span>
        </button>
      )}
    </div>
  );
};

import React from 'react';
import { FontAwesomeIcon, faMagnifyingGlass, faXmark, faFilter, faRotate } from '../../../../shared/icons';

interface DeviceExplorerFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  filterBrand: string;
  onFilterBrandChange: (brand: string) => void;
  filterFloor: string;
  onFilterFloorChange: (floor: string) => void;
  filterStatus: string;
  onFilterStatusChange: (status: string) => void;
  availableBrands: string[];
  availableFloors: string[];
  isFiltered: boolean;
  onResetFilters: () => void;
}

export const DeviceExplorerFilters: React.FC<DeviceExplorerFiltersProps> = ({
  searchTerm,
  onSearchChange,
  pageSize,
  onPageSizeChange,
  filterBrand,
  onFilterBrandChange,
  filterFloor,
  onFilterFloorChange,
  filterStatus,
  onFilterStatusChange,
  availableBrands,
  availableFloors,
  isFiltered,
  onResetFilters,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* Hàng 1: Search Bar & Phân trang */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '7px 12px',
            borderRadius: '8px',
            backgroundColor: 'var(--bg-subtle)',
            border: '1px solid var(--border-color)',
            flex: '1 1 240px',
          }}
        >
          <FontAwesomeIcon icon={faMagnifyingGlass} style={{ color: 'var(--text-muted)', fontSize: '13px' }} />
          <input
            type="text"
            placeholder="Tìm kiếm máy in theo tên, model, tầng, phòng ban hoặc IP..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              backgroundColor: 'transparent',
              fontSize: '12px',
              color: 'var(--text-primary)',
            }}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
            >
              <FontAwesomeIcon icon={faXmark} style={{ fontSize: '12px' }} />
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Mỗi trang:</span>
          {[20, 50].map((sz) => (
            <button
              key={sz}
              type="button"
              onClick={() => onPageSizeChange(sz)}
              style={{
                padding: '3px 8px',
                borderRadius: '5px',
                fontSize: '11px',
                fontWeight: pageSize === sz ? 700 : 500,
                backgroundColor: pageSize === sz ? 'var(--bg-card)' : 'transparent',
                color: pageSize === sz ? '#2563eb' : 'var(--text-muted)',
                border: '1px solid var(--border-color)',
                cursor: 'pointer',
              }}
            >
              {sz}
            </button>
          ))}
        </div>
      </div>

      {/* Hàng 2: Dropdowns Đa Tiêu Chí */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexWrap: 'wrap',
          padding: '8px 10px',
          borderRadius: '8px',
          backgroundColor: 'var(--bg-subtle)',
          border: '1px solid var(--border-color)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600 }}>
          <FontAwesomeIcon icon={faFilter} style={{ fontSize: '11px' }} />
          <span>Bộ lọc:</span>
        </div>

        {/* Dropdown 1: Hãng */}
        <select
          value={filterBrand}
          onChange={(e) => onFilterBrandChange(e.target.value)}
          style={{
            padding: '4px 8px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: filterBrand !== 'all' ? 700 : 500,
            backgroundColor: filterBrand !== 'all' ? 'rgba(37, 99, 235, 0.1)' : 'var(--bg-card)',
            color: filterBrand !== 'all' ? '#2563eb' : 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          <option value="all">Tất cả thương hiệu ({availableBrands.length})</option>
          {availableBrands.map((b) => (
            <option key={b} value={b}>
              Hãng {b}
            </option>
          ))}
        </select>

        {/* Dropdown 2: Tầng */}
        <select
          value={filterFloor}
          onChange={(e) => onFilterFloorChange(e.target.value)}
          style={{
            padding: '4px 8px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: filterFloor !== 'all' ? 700 : 500,
            backgroundColor: filterFloor !== 'all' ? 'rgba(37, 99, 235, 0.1)' : 'var(--bg-card)',
            color: filterFloor !== 'all' ? '#2563eb' : 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          <option value="all">Tất cả các tầng ({availableFloors.length})</option>
          {availableFloors.map((fl) => (
            <option key={fl} value={fl}>
              {fl}
            </option>
          ))}
        </select>

        {/* Dropdown 3: Trạng thái */}
        <select
          value={filterStatus}
          onChange={(e) => onFilterStatusChange(e.target.value)}
          style={{
            padding: '4px 8px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: filterStatus !== 'all' ? 700 : 500,
            backgroundColor: filterStatus !== 'all' ? 'rgba(37, 99, 235, 0.1)' : 'var(--bg-card)',
            color: filterStatus !== 'all' ? '#2563eb' : 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="Online">Chỉ máy Hoạt động (Online)</option>
          <option value="Offline">Chỉ máy Mất kết nối (Offline)</option>
        </select>

        {isFiltered && (
          <button
            type="button"
            onClick={onResetFilters}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              borderRadius: '6px',
              border: '1px dashed #ef4444',
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              color: '#ef4444',
              fontSize: '10.5px',
              fontWeight: 600,
              cursor: 'pointer',
              marginLeft: 'auto',
            }}
            title="Đặt lại toàn bộ tiêu chí lọc"
          >
            <FontAwesomeIcon icon={faRotate} style={{ fontSize: '11px' }} />
            <span>Xóa lọc</span>
          </button>
        )}
      </div>
    </div>
  );
};

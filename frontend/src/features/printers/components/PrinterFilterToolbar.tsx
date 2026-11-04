import React from 'react';
import { FontAwesomeIcon, faMagnifyingGlass } from '../../../shared/icons';

interface PrinterFilterToolbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  statusFilter: string;
  onStatusFilterChange: (s: string) => void;
  mfrFilter: string;
  onMfrFilterChange: (m: string) => void;
  manufacturers: string[];
  totalPrinters: number;
}

export const PrinterFilterToolbar: React.FC<PrinterFilterToolbarProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  mfrFilter,
  onMfrFilterChange,
  manufacturers,
  totalPrinters,
}) => {
  return (
    <div
      style={{
        padding: '14px 18px',
        borderRadius: 'var(--radius-card)',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: 'var(--bg-subtle)',
          border: '1px solid var(--border-color)',
          borderRadius: '9999px',
          padding: '7px 14px',
          minWidth: '280px',
          flex: '1 1 300px',
        }}
      >
        <FontAwesomeIcon icon={faMagnifyingGlass} style={{ fontSize: '13px', color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Tìm theo mã, tên, IP, model, sê-ri, vị trí..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-primary)',
            fontSize: '12px',
            width: '100%',
          }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {[
            { id: 'all', label: `Tất cả (${totalPrinters})` },
            { id: 'online', label: 'Trực tuyến' },
            { id: 'offline', label: 'Ngoại tuyến' },
            { id: 'critical', label: 'Nguy cấp' },
            { id: 'warning', label: 'Cảnh báo' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => onStatusFilterChange(tab.id)}
              style={{
                padding: '5px 12px',
                borderRadius: '9999px',
                fontSize: '11.5px',
                fontWeight: statusFilter === tab.id ? 700 : 500,
                backgroundColor: statusFilter === tab.id ? 'var(--status-online-bg)' : 'transparent',
                color: statusFilter === tab.id ? 'var(--status-online)' : 'var(--text-secondary)',
                border: statusFilter === tab.id ? '1px solid var(--status-online-border)' : '1px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <select
          value={mfrFilter}
          onChange={(e) => onMfrFilterChange(e.target.value)}
          style={{
            padding: '5px 12px',
            borderRadius: '9999px',
            backgroundColor: 'var(--bg-subtle)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-secondary)',
            fontSize: '11.5px',
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          <option value="all">Tất cả hãng sản xuất</option>
          {manufacturers.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};


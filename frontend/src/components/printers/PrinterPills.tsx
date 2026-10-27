import React from 'react';
import { Printer } from '../../types/printer';

interface PrinterPillsProps {
  printers: Printer[];
  quickFilter: string;
  setQuickFilter: (key: string) => void;
  onResetPage: () => void;
}

export const PrinterPills: React.FC<PrinterPillsProps> = ({
  printers,
  quickFilter,
  setQuickFilter,
  onResetPage,
}) => {
  const pills = [
    { key: 'all', label: `Tất cả (${printers.length})` },
    { key: 'Online', label: `Trực tuyến (${printers.filter(p => p.connectionStatus === 'Online').length})` },
    { key: 'Offline', label: `Ngoại tuyến (${printers.filter(p => p.connectionStatus === 'Offline').length})` },
    { key: 'Attention', label: `Cần xử lý (${printers.filter(p => p.connectionStatus === 'Offline' || p.alertSeverity === 'critical' || p.alertSeverity === 'warning' || p.isStale).length})` },
    { key: 'Critical', label: `Khẩn cấp (${printers.filter(p => p.alertSeverity === 'critical' || p.connectionStatus === 'Offline').length})` },
    { key: 'Warning', label: `Cảnh báo (${printers.filter(p => p.alertSeverity === 'warning').length})` },
    { key: 'Stale', label: `Dữ liệu tạm (${printers.filter(p => p.isStale).length})` }
  ];

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.45rem' }}>
      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginRight: '0.35rem' }}>
        Bộ lọc nhanh:
      </span>
      {pills.map(item => {
        const isActive = quickFilter === item.key;
        return (
          <button
            key={item.key}
            onClick={() => {
              setQuickFilter(item.key);
              onResetPage();
            }}
            className={`filter-pill ${isActive ? 'active' : ''}`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
};

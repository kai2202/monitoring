import React from 'react';
import { Download } from 'lucide-react';
import { Printer } from '../../types/printer';

interface AnalyticsHeaderProps {
  printers: Printer[];
  onExportCSV: () => void;
}

export const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = ({
  printers,
  onExportCSV,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid var(--border-color)'
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
            Phân Tích Sản Lượng & Bộ Đếm
          </h1>
          <span
            style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              backgroundColor: printers.length > 0 ? 'var(--status-online-bg)' : 'var(--bg-subtle)',
              color: printers.length > 0 ? 'var(--status-online)' : 'var(--text-muted)',
              padding: '0.15rem 0.5rem',
              borderRadius: '6px',
              border: 'none'
            }}
          >
            {printers.length > 0 ? 'GIÁM SÁT TRỰC TIẾP' : 'ZABBIX CHỜ KẾT NỐI'}
          </span>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem', marginBottom: 0 }}>
          Đối soát dữ liệu đo đạc (telemetry), xu hướng in ấn theo thời gian và xếp hạng sản lượng toàn hệ thống máy in.
          <span style={{ color: 'var(--status-online)', fontWeight: 600 }}> [Chất lượng dữ liệu: Delta quét hàng ngày đã xác thực]</span>
        </p>
      </div>

      <button
        onClick={onExportCSV}
        className="btn btn-primary"
        style={{ gap: '0.45rem' }}
      >
        <Download size={15} />
        <span>Xuất Dữ Liệu CSV</span>
      </button>
    </div>
  );
};

import React from 'react';
import { Activity } from 'lucide-react';
import { Printer } from '../../../types/printer';

interface PrinterHealthSectionProps {
  printer: Printer;
}

export const PrinterHealthSection: React.FC<PrinterHealthSectionProps> = ({ printer }) => {
  const isOffline = printer.connectionStatus === 'Offline';

  return (
    <div>
      <h3 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--brand-600)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
        <Activity size={15} /> 2. Sức Khỏe & Chẩn Đoán Hệ Thống Con
      </h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '0.75rem'
        }}
      >
        <div className="card" style={{ padding: '0.85rem' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Sức Khỏe Tổng Thể</span>
          <span
            style={{
              fontSize: '0.82rem',
              fontWeight: 700,
              color: isOffline ? 'var(--status-offline)' : (printer.health === 'Warning' ? 'var(--status-warning)' : 'var(--status-online)')
            }}
          >
            {printer.health === 'Healthy' ? 'Bình thường' : (printer.health === 'Warning' ? 'Cảnh báo' : (printer.health === 'Critical' ? 'Khẩn cấp' : (printer.health === 'Offline' ? 'Ngoại tuyến' : printer.health)))}
          </span>
        </div>

        <div className="card" style={{ padding: '0.85rem' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Hệ Thống Quét (Scanner)</span>
          <span style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-primary)' }}>
            {printer.scannerErr}
          </span>
        </div>

        <div className="card" style={{ padding: '0.85rem' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Bộ Nạp Tự Động (ADF)</span>
          <span style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-primary)' }}>
            {printer.adfErr}
          </span>
        </div>

        <div className="card" style={{ padding: '0.85rem' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Bộ Phận Copy</span>
          <span style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-primary)' }}>
            {printer.copierErr}
          </span>
        </div>

        <div className="card" style={{ padding: '0.85rem' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Bộ Điều Khiển MFP</span>
          <span style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-primary)' }}>
            {printer.mfpErr}
          </span>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { FileText } from 'lucide-react';
import { Printer } from '../../../types/printer';

interface PrinterCountersSectionProps {
  printer: Printer;
}

export const PrinterCountersSection: React.FC<PrinterCountersSectionProps> = ({ printer }) => {
  return (
    <div>
      <h3 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--brand-600)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
        <FileText size={15} /> 4. Sản Lượng Sử Dụng & Bộ Đếm Vòng Đời (SNMP)
      </h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '0.75rem'
        }}
      >
        <div className="card" style={{ padding: '0.75rem', textAlign: 'center' }}>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>Tổng Bộ Đếm Vòng Đời</span>
          <span style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'JetBrains Mono', color: 'var(--text-primary)' }}>
            {typeof printer.counters.total === 'number' ? printer.counters.total.toLocaleString() : (printer.counters.total ?? 'N/A')}
          </span>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.1rem' }}>Tổng số trang đã in</span>
        </div>

        <div className="card" style={{ padding: '0.75rem', textAlign: 'center' }}>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>Sản Lượng In 30 Ngày</span>
          <span style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'JetBrains Mono', color: 'var(--brand-600)' }}>
            {typeof printer.thirtyDayVolume === 'number' ? printer.thirtyDayVolume.toLocaleString() : (printer.thirtyDayVolume ?? 'N/A')}
          </span>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.1rem' }}>Delta chu kỳ 30 ngày</span>
        </div>

        <div className="card" style={{ padding: '0.75rem', textAlign: 'center' }}>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>Bộ Phận Copy</span>
          <span style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'JetBrains Mono', color: 'var(--text-primary)' }}>
            {typeof printer.counters.copier === 'number' ? printer.counters.copier.toLocaleString() : (printer.counters.copier ?? 'N/A')}
          </span>
        </div>

        <div className="card" style={{ padding: '0.75rem', textAlign: 'center' }}>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>Truyền Nhận Fax</span>
          <span style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'JetBrains Mono', color: 'var(--text-primary)' }}>
            {typeof printer.counters.fax === 'number' ? printer.counters.fax.toLocaleString() : (printer.counters.fax ?? 'N/A')}
          </span>
        </div>

        <div className="card" style={{ padding: '0.75rem', textAlign: 'center' }}>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>Quét Ảnh (Scan)</span>
          <span style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'JetBrains Mono', color: 'var(--text-primary)' }}>
            {typeof printer.counters.scanner === 'number' ? printer.counters.scanner.toLocaleString() : (printer.counters.scanner ?? 'N/A')}
          </span>
        </div>
      </div>
    </div>
  );
};

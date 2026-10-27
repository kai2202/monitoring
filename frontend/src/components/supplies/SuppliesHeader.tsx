import React from 'react';

interface SuppliesHeaderProps {
  totalCount: number;
  hasPrinters: boolean;
}

export const SuppliesHeader: React.FC<SuppliesHeaderProps> = ({
  totalCount,
  hasPrinters
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
          <h1 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Giám Sát Mực & Vật Tư Tiêu Hao
          </h1>
          <span
            style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              backgroundColor: hasPrinters ? 'var(--status-online-bg)' : 'var(--bg-subtle)',
              color: hasPrinters ? 'var(--status-online)' : 'var(--text-muted)',
              padding: '0.15rem 0.5rem',
              borderRadius: '6px',
              border: 'none'
            }}
          >
            {hasPrinters ? 'GIÁM SÁT TRỰC TIẾP' : 'ZABBIX CHỜ KẾT NỐI'}
          </span>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
          Theo dõi mức mực K-C-M-Y, hộp mực thải (waste toner) và ruy-băng nhiệt theo quy tắc cảnh báo: &lt; 15% (Mực thấp) hoặc ≥ 85% (Mực thải đầy).
        </p>
      </div>

      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
        Tổng số: <strong style={{ color: 'var(--brand-600)' }}>{totalCount}</strong> thiết bị giám sát
      </div>
    </div>
  );
};

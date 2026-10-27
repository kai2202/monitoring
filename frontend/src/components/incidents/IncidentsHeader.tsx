import React from 'react';

interface IncidentsHeaderProps {
  totalCount: number;
  activeCount: number;
  resolvedCount: number;
  filterStatus: 'all' | 'active' | 'resolved';
  setFilterStatus: (status: 'all' | 'active' | 'resolved') => void;
}

export const IncidentsHeader: React.FC<IncidentsHeaderProps> = ({
  totalCount,
  activeCount,
  resolvedCount,
  filterStatus,
  setFilterStatus,
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
            Nhật Ký Sự Cố &amp; Cảnh Báo
          </h1>
          <span
            style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              backgroundColor: totalCount > 0 ? 'var(--status-online-bg)' : 'var(--bg-subtle)',
              color: totalCount > 0 ? 'var(--status-online)' : 'var(--text-muted)',
              padding: '0.15rem 0.5rem',
              borderRadius: '6px',
              border: 'none'
            }}
          >
            {totalCount > 0 ? 'GIÁM SÁT TRỰC TIẾP' : 'ZABBIX CHỜ KẾT NỐI'}
          </span>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem', marginBottom: 0 }}>
          Theo dõi vòng đời sự cố (SNMP traps, lỗi phần cứng, hết giấy khay nạp, cạn mực) và xác nhận khắc phục trực tiếp.
        </p>
      </div>

      {/* Status Filter Tabs */}
      <div className="segmented-control">
        {(['all', 'active', 'resolved'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilterStatus(tab)}
            className={`segmented-control-btn ${filterStatus === tab ? 'active' : ''}`}
            style={{ padding: '0.35rem 0.85rem' }}
          >
            {tab === 'all'
              ? `Tất cả (${totalCount})`
              : tab === 'active'
              ? `Đang xử lý (${activeCount})`
              : `Đã xử lý (${resolvedCount})`}
          </button>
        ))}
      </div>
    </div>
  );
};

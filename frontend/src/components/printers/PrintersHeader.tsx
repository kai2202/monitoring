import React from 'react';

interface PrintersHeaderProps {
  totalCount: number;
  quickFilter: string;
  setQuickFilter: (filter: string) => void;
  onResetPage: () => void;
  counts: {
    total: number;
    online: number;
    offline: number;
    attention: number;
  };
}

export const PrintersHeader: React.FC<PrintersHeaderProps> = ({
  totalCount,
  quickFilter,
  setQuickFilter,
  onResetPage,
  counts,
}) => {
  const tabs = [
    { id: 'all', label: `Tất cả (${counts.total})` },
    { id: 'Online', label: `Trực tuyến (${counts.online})` },
    { id: 'Attention', label: `Cần chú ý (${counts.attention})` },
    { id: 'Offline', label: `Mất kết nối (${counts.offline})` },
  ];

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
            Danh Sách Thiết Bị Máy In
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
          Theo dõi trạng thái kết nối, mức độ nghiêm trọng cảnh báo và thông tin chi tiết từng máy in trong mạng.
        </p>
      </div>

      <div className="segmented-control">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setQuickFilter(tab.id);
              onResetPage();
            }}
            className={`segmented-control-btn ${quickFilter === tab.id ? 'active' : ''}`}
            style={{ padding: '0.35rem 0.85rem' }}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

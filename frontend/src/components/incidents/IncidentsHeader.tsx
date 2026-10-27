import React, { useState, useEffect } from 'react';
import { Clock, RefreshCw } from 'lucide-react';

interface IncidentsHeaderProps {
  totalCount: number;
  activeCount: number;
  resolvedCount: number;
  filterStatus: 'all' | 'active' | 'resolved';
  setFilterStatus: (status: 'all' | 'active' | 'resolved') => void;
  isRefreshing?: boolean;
  onRefresh?: () => Promise<void>;
}

export const IncidentsHeader: React.FC<IncidentsHeaderProps> = ({
  totalCount,
  activeCount,
  resolvedCount,
  filterStatus,
  setFilterStatus,
  isRefreshing = false,
  onRefresh,
}) => {
  const [vietnamTime, setVietnamTime] = useState<string>('');

  useEffect(() => {
    const updateVietnamTime = () => {
      const now = new Date();
      const datePart = new Intl.DateTimeFormat('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(now);

      const timePart = new Intl.DateTimeFormat('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).format(now);

      setVietnamTime(`${datePart} • ${timePart}`);
    };

    updateVietnamTime();
    const interval = setInterval(updateVietnamTime, 1000);
    return () => clearInterval(interval);
  }, []);

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

      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
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

        {/* Real-time Vietnam Date & Time (GMT+7) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.55rem',
            padding: '0.4rem 0.85rem',
            borderRadius: '0.55rem',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            fontSize: '0.8rem',
            fontFamily: 'JetBrains Mono',
            color: 'var(--text-primary)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <Clock size={15} style={{ color: 'var(--brand-500)', flexShrink: 0 }} />
          <span style={{ fontWeight: 600 }}>{vietnamTime || 'Đang đồng bộ giờ VN...'}</span>
          <span
            className="badge badge-info"
            style={{
              fontSize: '0.65rem',
              padding: '0.1rem 0.4rem',
              borderRadius: '4px',
              fontWeight: 700
            }}
          >
            GMT+7
          </span>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.4rem 0.65rem', borderRadius: '0.5rem' }}
            title="Làm mới chu kỳ quét dữ liệu từ Zabbix"
            disabled={isRefreshing}
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
        )}
      </div>
    </div>
  );
};

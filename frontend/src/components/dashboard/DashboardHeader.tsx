import React, { useState, useEffect } from 'react';
import { Clock, RefreshCw } from 'lucide-react';

interface DashboardHeaderProps {
  totalPrinters: number;
  isRefreshing: boolean;
  onRefresh?: () => Promise<void>;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  totalPrinters,
  isRefreshing,
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
        paddingBottom: '0.85rem',
        borderBottom: '1px solid var(--border-color)'
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <h1
            style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              textTransform: 'uppercase'
            }}
          >
            GIÁM SÁT & VẬN HÀNH THIẾT BỊ
          </h1>
          <span className="badge badge-info" style={{ fontSize: '0.68rem', fontWeight: 700 }}>
            {totalPrinters > 0 ? `${totalPrinters} MÁY IN` : '0 MÁY IN'}
          </span>
          <span
            className={totalPrinters > 0 ? 'badge badge-online' : 'badge badge-neutral'}
            style={{ fontSize: '0.65rem', fontWeight: 700 }}
          >
            {totalPrinters > 0 ? 'GIÁM SÁT TRỰC TIẾP' : 'ZABBIX CHỜ KẾT NỐI'}
          </span>
        </div>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
          Giám sát thời gian thực trạng thái SNMP, tính sẵn sàng, vật tư tiêu hao và cảnh báo sự cố phần cứng.
        </p>
      </div>

      {/* Real-time Vietnam Date & Time (GMT+7) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
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

        <button
          onClick={onRefresh}
          className="btn btn-secondary btn-sm"
          style={{ padding: '0.4rem 0.65rem', borderRadius: '0.5rem' }}
          title="Làm mới chu kỳ quét dữ liệu từ Zabbix"
          disabled={isRefreshing}
        >
          <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
        </button>
      </div>
    </div>
  );
};

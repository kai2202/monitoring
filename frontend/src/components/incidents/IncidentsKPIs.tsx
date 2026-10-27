import React from 'react';

interface IncidentsKPIsProps {
  totalCount: number;
  activeCount: number;
  criticalCount: number;
  resolvedCount: number;
}

export const IncidentsKPIs: React.FC<IncidentsKPIsProps> = ({
  totalCount,
  activeCount,
  criticalCount,
  resolvedCount,
}) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '0.85rem'
      }}
    >
      {/* Card 1: Total Incidents */}
      <div className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
          Tổng Số Sự Cố
        </span>
        <div style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'JetBrains Mono', color: 'var(--text-primary)', marginTop: '0.25rem' }}>
          {totalCount > 0 ? totalCount : '—'}
        </div>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          {totalCount > 0 ? 'Ghi nhận qua SNMP Trap' : 'Chưa có sự cố'}
        </span>
      </div>

      {/* Card 2: Active Incidents */}
      <div className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--status-warning)', textTransform: 'uppercase' }}>
          Đang Diễn Ra (Active)
        </span>
        <div style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'JetBrains Mono', color: 'var(--status-warning)', marginTop: '0.25rem' }}>
          {totalCount > 0 ? activeCount : '—'}
        </div>
        <span style={{ fontSize: '0.7rem', color: 'var(--status-warning)', marginTop: '0.25rem' }}>
          {totalCount > 0 ? 'Cần hỗ trợ kỹ thuật' : 'Hệ thống ổn định'}
        </span>
      </div>

      {/* Card 3: Critical Incidents */}
      <div className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--status-offline)', textTransform: 'uppercase' }}>
          Khẩn Cấp (Critical)
        </span>
        <div style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'JetBrains Mono', color: 'var(--status-offline)', marginTop: '0.25rem' }}>
          {totalCount > 0 ? criticalCount : '—'}
        </div>
        <span style={{ fontSize: '0.7rem', color: 'var(--status-offline)', marginTop: '0.25rem' }}>
          {totalCount > 0 ? 'Mất kết nối / Ngừng trệ' : '0 lỗi nghiêm trọng'}
        </span>
      </div>

      {/* Card 4: Resolved */}
      <div className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--status-online)', textTransform: 'uppercase' }}>
          Đã Khắc Phục (Resolved)
        </span>
        <div style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'JetBrains Mono', color: 'var(--status-online)', marginTop: '0.25rem' }}>
          {totalCount > 0 ? resolvedCount : '—'}
        </div>
        <span style={{ fontSize: '0.7rem', color: 'var(--status-online)', marginTop: '0.25rem' }}>
          {totalCount > 0 ? 'Đã đóng phiếu thành công' : 'Chưa có phiếu đóng'}
        </span>
      </div>
    </div>
  );
};

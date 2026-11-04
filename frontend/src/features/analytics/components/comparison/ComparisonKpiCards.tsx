import React from 'react';
import { ComparisonDeviceKPIs } from '../../../../types/analyticsUI';

interface ComparisonKpiCardsProps {
  devicesKPIs: ComparisonDeviceKPIs[];
}

export const ComparisonKpiCards: React.FC<ComparisonKpiCardsProps> = ({ devicesKPIs }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <span
        style={{
          fontSize: '11px',
          fontWeight: 800,
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          letterSpacing: '0.4px',
        }}
      >
        Chỉ Số Hiệu Suất Tổng Quan (Performance Overview)
      </span>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px' }}>
        {/* 1. Tổng Sản Lượng */}
        <div style={{ padding: '14px', borderRadius: '14px', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>TỔNG SẢN LƯỢNG</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {devicesKPIs.map((d) => (
              <div key={d.printerId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', maxWidth: '90px', overflow: 'hidden' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: d.color, flexShrink: 0 }} />
                  <span style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', color: 'var(--text-secondary)' }}>{d.model}</span>
                </span>
                <strong style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-primary)' }}>
                  {d.totalPages !== null ? d.totalPages.toLocaleString('vi-VN') : '—'}
                </strong>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Tốc Độ Thực Tế (PPM) */}
        <div style={{ padding: '14px', borderRadius: '14px', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>TỐC ĐỘ THỰC TẾ</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {devicesKPIs.map((d) => (
              <div key={d.printerId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', maxWidth: '90px', overflow: 'hidden' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: d.color, flexShrink: 0 }} />
                  <span style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', color: 'var(--text-secondary)' }}>{d.model}</span>
                </span>
                <strong style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-primary)' }}>
                  {d.ppmActual !== null ? `${d.ppmActual} PPM` : '—'}
                </strong>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Độ Khả Dụng (Uptime %) */}
        <div style={{ padding: '14px', borderRadius: '14px', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>ĐỘ KHẢ DỤNG (UPTIME)</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {devicesKPIs.map((d) => (
              <div key={d.printerId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', maxWidth: '90px', overflow: 'hidden' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: d.color, flexShrink: 0 }} />
                  <span style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', color: 'var(--text-secondary)' }}>{d.model}</span>
                </span>
                <strong style={{ fontFamily: "'JetBrains Mono', monospace", color: '#16a34a' }}>
                  {d.uptimePercent !== null ? `${d.uptimePercent}%` : '—'}
                </strong>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Độ Ổn Định (MTBF) */}
        <div style={{ padding: '14px', borderRadius: '14px', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>ĐỘ ỔN ĐỊNH (MTBF)</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {devicesKPIs.map((d) => (
              <div key={d.printerId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', maxWidth: '90px', overflow: 'hidden' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: d.color, flexShrink: 0 }} />
                  <span style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', color: 'var(--text-secondary)' }}>{d.model}</span>
                </span>
                <strong style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-primary)' }}>
                  {d.mtbfHours !== null ? `${d.mtbfHours}h` : '—'}
                </strong>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Số Lần Lỗi */}
        <div style={{ padding: '14px', borderRadius: '14px', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>SỐ LẦN SỰ CỐ</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {devicesKPIs.map((d) => (
              <div key={d.printerId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', maxWidth: '90px', overflow: 'hidden' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: d.color, flexShrink: 0 }} />
                  <span style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', color: 'var(--text-secondary)' }}>{d.model}</span>
                </span>
                <strong
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    color: d.failureCount && d.failureCount > 2 ? '#dc2626' : 'var(--text-primary)',
                  }}
                >
                  {d.failureCount !== null ? `${d.failureCount} lần` : '—'}
                </strong>
              </div>
            ))}
          </div>
        </div>

        {/* 6. Thời Gian Dừng Máy (Downtime) */}
        <div style={{ padding: '14px', borderRadius: '14px', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>THỜI GIAN DỪNG</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {devicesKPIs.map((d) => (
              <div key={d.printerId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', maxWidth: '90px', overflow: 'hidden' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: d.color, flexShrink: 0 }} />
                  <span style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', color: 'var(--text-secondary)' }}>{d.model}</span>
                </span>
                <strong
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    color: d.downtimeHours && d.downtimeHours > 10 ? '#ea580c' : 'var(--text-primary)',
                  }}
                >
                  {d.downtimeHours !== null ? `${d.downtimeHours}h` : '—'}
                </strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};


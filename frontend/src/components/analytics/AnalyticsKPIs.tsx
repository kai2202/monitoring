import React from 'react';
import {
  FileSpreadsheet,
  Calendar,
  TrendingUp,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { Printer } from '../../types/printer';

interface AnalyticsKPIsProps {
  printers: Printer[];
  totalLifetimePages: number;
  total30DayVolume: number;
  hasValid30DayData: boolean;
  avgDailyVolume: number;
  telemetryCoveragePercent: string;
  validTelemetryCount: number;
  isLight: boolean;
}

export const AnalyticsKPIs: React.FC<AnalyticsKPIsProps> = ({
  printers,
  totalLifetimePages,
  total30DayVolume,
  hasValid30DayData,
  avgDailyVolume,
  telemetryCoveragePercent,
  validTelemetryCount,
  isLight,
}) => {
  const anomalyPrinters = printers.filter(p => p.anomalyNote);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* KPI Cards (4 Cards) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem'
        }}
      >
        {/* KPI 1: Lifetime Total Counter */}
        <div className="card" style={{ padding: '1.15rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Tổng Bộ Đếm Vòng Đời
            </span>
            <FileSpreadsheet size={16} style={{ color: 'var(--brand-600)' }} />
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 700, fontFamily: 'JetBrains Mono', color: 'var(--text-primary)' }}>
            {totalLifetimePages > 0 ? totalLifetimePages.toLocaleString() : '—'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            {totalLifetimePages > 0 ? 'Tổng số trang phần cứng ghi nhận qua MIB-II' : 'Chưa có dữ liệu bộ đếm MIB-II'}
          </div>
        </div>

        {/* KPI 2: 30-Day Period Volume */}
        <div className="card" style={{ padding: '1.15rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--brand-600)', textTransform: 'uppercase' }}>
              Sản Lượng 30 Ngày
            </span>
            <Calendar size={16} style={{ color: 'var(--brand-600)' }} />
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 700, fontFamily: 'JetBrains Mono', color: 'var(--brand-600)' }}>
            {hasValid30DayData ? total30DayVolume.toLocaleString() : '—'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            {hasValid30DayData ? 'Tổng delta trang in xác thực trong 30 ngày' : 'Chưa có delta đo đạc chu kỳ'}
          </div>
        </div>

        {/* KPI 3: Daily Average Volume */}
        <div className="card" style={{ padding: '1.15rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--status-online)', textTransform: 'uppercase' }}>
              Sản Lượng Bình Quân / Ngày
            </span>
            <TrendingUp size={16} style={{ color: 'var(--status-online)' }} />
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 700, fontFamily: 'JetBrains Mono', color: 'var(--status-online)' }}>
            {hasValid30DayData ? avgDailyVolume.toLocaleString() : '—'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            {hasValid30DayData ? 'Số trang in trung bình mỗi ngày (30d mean)' : 'Chưa có dữ liệu bình quân ngày'}
          </div>
        </div>

        {/* KPI 4: Telemetry Coverage */}
        <div className="card" style={{ padding: '1.15rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Độ Phủ Dữ Liệu Đo Đạc
            </span>
            <CheckCircle2 size={16} style={{ color: 'var(--status-online)' }} />
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 700, fontFamily: 'JetBrains Mono', color: 'var(--text-primary)' }}>
            {printers.length > 0 ? `${telemetryCoveragePercent}%` : '—%'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            {printers.length > 0 ? `${validTelemetryCount}/${printers.length} máy báo cáo` : 'Chưa có thiết bị kết nối'}
          </div>
        </div>
      </div>

      {/* Counter Audit & Telemetry Integrity Panel */}
      <div
        className="card"
        style={{
          padding: '1.15rem 1.35rem',
          borderLeft: '4px solid var(--brand-600)',
          backgroundColor: isLight ? 'rgba(59, 130, 246, 0.03)' : 'rgba(59, 130, 246, 0.06)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={18} style={{ color: 'var(--brand-600)' }} />
            <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Kiểm Toán Độ Tin Cậy Bộ Đếm & Dữ Liệu Bất Thường
            </h3>
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
            UI/05-USAGE-ANALYTICS.md §5.3
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '0.75rem' }}>
          {anomalyPrinters.length === 0 ? (
            <div style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem', gridColumn: '1 / -1' }}>
              Chưa phát hiện bất thường bộ đếm. Hệ thống sẽ tự động kích hoạt kiểm toán khi phát hiện cờ cảnh báo telemetry từ Zabbix.
            </div>
          ) : (
            anomalyPrinters.map(p => (
              <div
                key={p.id}
                style={{
                  padding: '0.65rem 0.85rem',
                  borderRadius: '0.5rem',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.76rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>{p.id}</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{p.name}</strong>
                  </div>
                  <span style={{ color: 'var(--status-warning)', fontWeight: 600, fontSize: '0.7rem' }}>Cảnh Báo Kiểm Toán</span>
                </div>
                <p style={{ color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                  {p.anomalyNote}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

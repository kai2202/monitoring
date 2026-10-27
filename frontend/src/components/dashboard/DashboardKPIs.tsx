import React from 'react';
import {
  Printer as PrinterIcon,
  CheckCircle2,
  Droplets,
  ShieldAlert,
  BarChart3,
} from 'lucide-react';
import { FleetStats } from '../../services/fleetService';
import { TabType } from '../../types/printer';

interface DashboardKPIsProps {
  stats: FleetStats;
  totalPageVolume: number | null;
  palette: {
    cyan: string;
    emerald: string;
    rose: string;
    slate: string;
    amber: string;
    purple: string;
  };
  onNavigateTab: (tab: TabType, filterParam?: string) => void;
}

export const DashboardKPIs: React.FC<DashboardKPIsProps> = ({
  stats,
  totalPageVolume,
  palette,
  onNavigateTab,
}) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '0.85rem'
      }}
    >
      {/* KPI 1: TOTAL PRINTERS */}
      <div
        onClick={() => onNavigateTab('printers', 'all')}
        className="kpi-card card-interactive"
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              TỔNG SỐ MÁY IN
            </span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'JetBrains Mono', color: 'var(--text-primary)', marginTop: '0.25rem', lineHeight: 1 }}>
              {stats.totalPrinters > 0 ? stats.totalPrinters : '0'}
            </div>
          </div>
          <div className="kpi-icon-box" style={{ color: palette.cyan }}>
            <PrinterIcon size={18} strokeWidth={2.2} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginTop: '0.75rem' }}>
          <span className="badge-trend-up">
            {stats.totalPrinters > 0 ? '100% Đang giám sát' : 'Chưa có dữ liệu'}
          </span>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Mạng LAN nội bộ</span>
        </div>
      </div>

      {/* KPI 2: ONLINE RATE / AVAILABILITY */}
      <div
        onClick={() => onNavigateTab('printers', 'Online')}
        className="kpi-card card-interactive"
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              TỶ LỆ KHẢ DỤNG
            </span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'JetBrains Mono', color: palette.emerald, marginTop: '0.25rem', lineHeight: 1 }}>
              {stats.totalPrinters > 0 ? `${stats.onlinePct}%` : '—%'}
            </div>
          </div>
          <div className="kpi-icon-box" style={{ color: palette.emerald }}>
            <CheckCircle2 size={18} strokeWidth={2.2} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginTop: '0.75rem' }}>
          <span className="badge-trend-up">
            {stats.onlineCount} / {stats.totalPrinters || 0} Trực tuyến
          </span>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Ping & SNMP v2c</span>
        </div>
      </div>

      {/* KPI 3: ACTIVE INCIDENTS */}
      <div
        onClick={() => onNavigateTab('incidents')}
        className="kpi-card card-interactive"
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              SỰ CỐ ĐANG MỞ
            </span>
            <div
              style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                fontFamily: 'JetBrains Mono',
                color: stats.activeIncidentsCount > 0 ? palette.rose : palette.slate,
                marginTop: '0.25rem',
                lineHeight: 1
              }}
            >
              {stats.activeIncidentsCount}
            </div>
          </div>
          <div className="kpi-icon-box" style={{ color: stats.activeIncidentsCount > 0 ? palette.rose : palette.slate }}>
            <ShieldAlert size={18} strokeWidth={2.2} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginTop: '0.75rem' }}>
          <span className={stats.criticalIncidentsCount > 0 ? 'badge-trend-down' : 'badge-trend-neutral'}>
            {stats.criticalIncidentsCount} Khẩn cấp
          </span>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
            {stats.warningIncidentsCount} Cảnh báo
          </span>
        </div>
      </div>

      {/* KPI 4: LOW CONSUMABLES */}
      <div
        onClick={() => onNavigateTab('supplies')}
        className="kpi-card card-interactive"
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              VẬT TƯ CẦN THAY
            </span>
            <div
              style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                fontFamily: 'JetBrains Mono',
                color: stats.lowSuppliesCount > 0 ? palette.amber : palette.purple,
                marginTop: '0.25rem',
                lineHeight: 1
              }}
            >
              {stats.lowSuppliesCount}
            </div>
          </div>
          <div className="kpi-icon-box" style={{ color: palette.purple }}>
            <Droplets size={18} strokeWidth={2.2} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginTop: '0.75rem' }}>
          <span className="badge-trend-neutral">
            Mực in &lt; 15%
          </span>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Hộp mực & thải</span>
        </div>
      </div>

      {/* KPI 5: TOTAL PRINT VOLUME / LIFETIME */}
      <div
        onClick={() => onNavigateTab('analytics')}
        className="kpi-card card-interactive"
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              SẢN LƯỢNG TRANG IN
            </span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'JetBrains Mono', color: palette.cyan, marginTop: '0.25rem', lineHeight: 1 }}>
              {totalPageVolume !== null
                ? totalPageVolume >= 1000
                  ? `${(totalPageVolume / 1000).toFixed(1)}k`
                  : totalPageVolume
                : '—'}
            </div>
          </div>
          <div className="kpi-icon-box" style={{ color: palette.cyan }}>
            <BarChart3 size={18} strokeWidth={2.2} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginTop: '0.75rem' }}>
          <span className="badge-trend-up">
            Xác thực SNMP
          </span>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Bộ đếm tổng tích luỹ</span>
        </div>
      </div>
    </div>
  );
};

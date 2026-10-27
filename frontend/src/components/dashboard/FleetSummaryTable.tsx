import React from 'react';
import { Layers, ChevronRight, Server, Eye } from 'lucide-react';
import { Printer, TabType } from '../../types/printer';

interface FleetSummaryTableProps {
  printers: Printer[];
  onOpenPrinterModal: (printer: Printer) => void;
  onNavigateTab: (tab: TabType, filterParam?: string) => void;
  palette: {
    cyan: string;
    emerald: string;
    amber: string;
    rose: string;
  };
}

export const FleetSummaryTable: React.FC<FleetSummaryTableProps> = ({
  printers,
  onOpenPrinterModal,
  onNavigateTab,
  palette,
}) => {
  return (
    <div className="card" style={{ padding: '1.15rem', display: 'flex', flexDirection: 'column', minWidth: 0, width: '100%' }}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
          marginBottom: '0.85rem',
          paddingBottom: '0.65rem',
          borderBottom: '1px solid var(--border-color)'
        }}
      >
        <div>
          <h3
            style={{
              fontSize: '0.88rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem'
            }}
          >
            <Layers size={15} style={{ color: palette.cyan }} />
            DANH SÁCH MÁY IN & TRẠNG THÁI
          </h3>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
            Danh sách thiết bị chẩn đoán kèm thanh tiến trình khả dụng và mức vật tư tiêu hao
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('printers')}
          className="btn btn-ghost btn-sm"
          style={{ color: palette.cyan, fontSize: '0.72rem' }}
        >
          Xem toàn bộ ({printers.length}) <ChevronRight size={14} />
        </button>
      </div>

      {/* Styled Table */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '85px' }}>MÃ / IP</th>
              <th>THIẾT BỊ & MODEL</th>
              <th style={{ width: '180px' }}>TỶ LỆ KHẢ DỤNG</th>
              <th style={{ width: '100px' }}>MỰC IN</th>
              <th>CẢNH BÁO</th>
              <th style={{ textAlign: 'center', width: '60px' }}>XEM</th>
            </tr>
          </thead>
          <tbody>
            {printers.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
                  <Server size={24} style={{ opacity: 0.4, marginBottom: '0.4rem' }} />
                  <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>Chưa có dữ liệu từ hệ thống giám sát</div>
                  <div style={{ fontSize: '0.72rem', marginTop: '0.2rem' }}>
                    Dữ liệu máy in sẽ tự động cập nhật ngay khi Zabbix API và Backend kết nối thành công.
                  </div>
                </td>
              </tr>
            ) : (
              printers.slice(0, 5).map(printer => {
                const isOnline = printer.connectionStatus === 'Online';
                const isOff = printer.connectionStatus === 'Offline';
                const hasCrit = printer.alertSeverity === 'critical' || isOff;
                const statusColor = isOff ? palette.rose : (printer.alertSeverity === 'warning' ? palette.amber : palette.emerald);
                const availabilityPct = isOnline ? (printer.alertSeverity === 'warning' ? 85 : 98) : 0;

                const s = printer.supplies;
                const blackLevel = typeof s.black === 'number' ? s.black : 0;

                return (
                  <tr key={printer.id}>
                    <td>
                      <span
                        style={{
                          fontFamily: 'JetBrains Mono',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: 'var(--text-primary)'
                        }}
                      >
                        {printer.id}
                      </span>
                      <span style={{ display: 'block', fontSize: '0.65rem', fontFamily: 'JetBrains Mono', color: 'var(--text-muted)' }}>
                        {printer.ip}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.8rem' }}>
                        {printer.name}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                        {printer.mfr} {printer.model} • {printer.deviceType}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div className="progress-track" style={{ height: '6px', flex: 1, backgroundColor: 'var(--bg-card-subtle)' }}>
                          <div
                            className="progress-fill"
                            style={{
                              width: `${availabilityPct}%`,
                              backgroundColor: statusColor,
                              boxShadow: `0 0 6px ${statusColor}88`
                            }}
                          />
                        </div>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontFamily: 'JetBrains Mono',
                            fontWeight: 700,
                            color: statusColor,
                            width: '30px',
                            textAlign: 'right'
                          }}
                        >
                          {availabilityPct}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <span
                          title={`Mực đen: ${blackLevel}%`}
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: blackLevel < 15 ? palette.rose : '#000000',
                            border: '1px solid rgba(255, 255, 255, 0.12)'
                          }}
                        />
                        {typeof s.cyan === 'number' && (
                          <span
                            title={`Cyan: ${s.cyan}%`}
                            style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: palette.cyan }}
                          />
                        )}
                        {typeof s.magenta === 'number' && (
                          <span
                            title={`Magenta: ${s.magenta}%`}
                            style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: palette.rose }}
                          />
                        )}
                        {typeof s.yellow === 'number' && (
                          <span
                            title={`Yellow: ${s.yellow}%`}
                            style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: palette.amber }}
                          />
                        )}
                      </div>
                    </td>
                    <td>
                      <span
                        className={hasCrit ? 'badge badge-offline' : (printer.alertSeverity === 'warning' ? 'badge badge-warning' : 'badge badge-online')}
                        style={{ fontSize: '0.65rem' }}
                      >
                        {printer.diagnostic?.errorName || printer.alertText || 'Bình thường'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => onOpenPrinterModal(printer)}
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '0.25rem', color: palette.cyan }}
                        title="Xem chi tiết máy in"
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

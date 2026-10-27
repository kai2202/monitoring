import React from 'react';
import { Clock, AlertTriangle, AlertOctagon, Terminal } from 'lucide-react';
import { Printer } from '../../../types/printer';
import { resolveDiagnostic } from '../../../diagnostics';
import { formatDateTime } from '../../../utils/formatDate';

interface PrinterDiagnosticBannerProps {
  printer: Printer;
}

export const PrinterDiagnosticBanner: React.FC<PrinterDiagnosticBannerProps> = ({ printer }) => {
  const activeDiag = printer.diagnostic || (printer.alertText && printer.alertSeverity !== 'clear'
    ? resolveDiagnostic(printer.alertText, printer.mfr, printer.model)
    : null);

  return (
    <>
      {/* Stale / Cached Data Banner if offline */}
      {printer.isStale && (
        <div
          style={{
            backgroundColor: 'var(--status-warning-bg)',
            border: '1px solid var(--status-warning-border)',
            borderRadius: '0.65rem',
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem'
          }}
        >
          <Clock size={18} style={{ color: 'var(--status-warning)', flexShrink: 0 }} />
          <div style={{ fontSize: '0.78rem', color: 'var(--text-primary)' }}>
            <strong>Đang hiển thị dữ liệu lưu tạm / Đã lưu:</strong> Thiết bị hiện mất tín hiệu kết nối (gián đoạn {printer.downtimeDuration || 'không rõ thời lượng'}). Các chỉ số đo đạc dưới đây phản ánh lần quét SNMP thành công gần nhất vào lúc <strong>{formatDateTime(printer.lastSuccessfulScrape)}</strong>.
          </div>
        </div>
      )}

      {/* Active Diagnostic & SNMP Trap Banner */}
      {activeDiag && printer.alertSeverity !== 'clear' && (
        <div
          className="card"
          style={{
            padding: '1.1rem 1.25rem',
            borderRadius: '0.75rem',
            backgroundColor: printer.alertSeverity === 'critical' ? 'var(--status-offline-bg)' : 'var(--status-warning-bg)',
            border: `1px solid ${printer.alertSeverity === 'critical' ? 'var(--status-offline-border)' : 'var(--status-warning-border)'}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              {printer.alertSeverity === 'critical' ? (
                <AlertOctagon size={18} style={{ color: 'var(--status-offline)', flexShrink: 0 }} />
              ) : (
                <AlertTriangle size={18} style={{ color: 'var(--status-warning)', flexShrink: 0 }} />
              )}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: printer.alertSeverity === 'critical' ? 'var(--status-offline)' : 'var(--status-warning)' }}>
                    Chi Tiết Chẩn Đoán (SNMP Trap)
                  </span>
                  <span
                    className="badge"
                    style={{
                      fontFamily: 'JetBrains Mono',
                      fontSize: '0.68rem',
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontWeight: 700
                    }}
                  >
                    Mã lỗi gốc: {activeDiag.rawCode}
                  </span>
                  {activeDiag.isIdentified ? (
                    <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>
                      Xác thực ({activeDiag.vendor})
                    </span>
                  ) : (
                    <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>
                      Chưa xác định
                    </span>
                  )}
                </div>
                <h4 style={{ margin: '0.2rem 0 0 0', fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {activeDiag.errorName}
                </h4>
              </div>
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
              Phân hệ: <strong style={{ color: 'var(--text-primary)' }}>{activeDiag.subsystem}</strong>
            </div>
          </div>

          <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {activeDiag.description}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
            <Terminal size={12} /> Payload gốc: {printer.alertText}
          </div>
        </div>
      )}
    </>
  );
};

import React from 'react';
import { X, AlertTriangle, AlertOctagon, HelpCircle, Wifi, WifiOff, CheckCircle2 } from 'lucide-react';
import { Printer } from '../../../types/printer';

interface PrinterModalHeaderProps {
  printer: Printer;
  onClose: () => void;
}

export const PrinterModalHeader: React.FC<PrinterModalHeaderProps> = ({
  printer,
  onClose
}) => {
  const isOnline = printer.connectionStatus === 'Online';
  const isOffline = printer.connectionStatus === 'Offline';
  const isUnknown = printer.connectionStatus === 'Unknown';

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        backgroundColor: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-color)',
        padding: '1rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            {printer.name}
          </h2>
          <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
            {printer.id}
          </span>
          {/* Connection Status Badge */}
          {isOnline && (
            <span className="badge badge-online">
              <Wifi size={12} /> Trực tuyến
            </span>
          )}
          {isOffline && (
            <span className="badge badge-offline">
              <WifiOff size={12} /> Ngoại tuyến
            </span>
          )}
          {isUnknown && (
            <span className="badge badge-neutral">
              <HelpCircle size={12} /> Chưa rõ
            </span>
          )}

          {/* Current Alert Badge */}
          {printer.alertSeverity === 'critical' ? (
            <span className="badge badge-offline">
              <AlertOctagon size={12} /> {printer.alertText}
            </span>
          ) : printer.alertSeverity === 'warning' ? (
            <span className="badge badge-warning">
              <AlertTriangle size={12} /> {printer.alertText}
            </span>
          ) : printer.alertSeverity === 'unknown' ? (
            <span className="badge badge-neutral">
              <HelpCircle size={12} /> Dữ liệu không đủ
            </span>
          ) : (
            <span className="badge badge-online">
              <CheckCircle2 size={12} /> Bình thường
            </span>
          )}
        </div>

        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', marginTop: '0.2rem' }}>
          {printer.mfr} {printer.model} • IP: <strong style={{ color: 'var(--text-primary)' }}>{printer.ip}</strong>
        </div>
      </div>

      <button
        onClick={onClose}
        className="btn btn-ghost btn-sm"
        style={{ padding: '0.4rem', borderRadius: '0.375rem' }}
        title="Đóng cửa sổ (Esc)"
      >
        <X size={20} />
      </button>
    </div>
  );
};

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Printer } from '../../types/printer';
import { formatDateTime } from '../../utils/formatDate';

interface SuppliesAlertCardsProps {
  lowPrinters: Printer[];
  onOpenPrinterModal: (printer: Printer) => void;
}

export const SuppliesAlertCards: React.FC<SuppliesAlertCardsProps> = ({
  lowPrinters,
  onOpenPrinterModal
}) => {
  if (lowPrinters.length === 0) return null;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
        <h2 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--status-warning)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <AlertTriangle size={15} />
          Vật Tư Cần Bổ Sung Hoặc Thay Thế Khẩn Cấp ({lowPrinters.length} máy in)
        </h2>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
          Quy ước: Mực &lt; 15% • Mực thải Ricoh &amp; Canon ≥ 85%
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1rem'
        }}
      >
        {lowPrinters.map(printer => {
          const wasteFullness = typeof printer.supplies.waste === 'number' ? Math.min(100, Math.max(0, 100 - printer.supplies.waste)) : null;
          const isWaste = wasteFullness !== null && wasteFullness >= 85;
          return (
            <div
              key={printer.id}
              className="card"
              style={{
                padding: '1rem',
                borderColor: 'var(--status-warning-border)',
                backgroundColor: 'var(--status-warning-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                    {printer.name}
                  </span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
                    ({printer.id})
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', marginTop: '0.1rem' }}>
                  {printer.mfr} {printer.model} • {printer.location}
                </div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'var(--status-warning)',
                    marginTop: '0.35rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <AlertTriangle size={14} />
                  {isWaste ? `Hộp mực thải đã đầy (${wasteFullness}%)` : printer.alertText}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', marginTop: '0.2rem' }}>
                  Đồng bộ telemetry: {formatDateTime(printer.suppliesUpdated)}
                </div>
              </div>

              <div>
                <button
                  onClick={() => onOpenPrinterModal(printer)}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem', fontWeight: 600 }}
                >
                  Chi tiết máy
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

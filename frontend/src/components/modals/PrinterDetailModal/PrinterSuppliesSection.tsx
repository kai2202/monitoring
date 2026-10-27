import React from 'react';
import { Layers } from 'lucide-react';
import { Printer } from '../../../types/printer';

interface PrinterSuppliesSectionProps {
  printer: Printer;
}

export const PrinterSuppliesSection: React.FC<PrinterSuppliesSectionProps> = ({ printer }) => {
  const supplyList = [
    { key: 'black' as const, label: 'Hộp mực đen (K)', color: '#334155' },
    { key: 'cyan' as const, label: 'Hộp mực xanh (C)', color: '#00FFFF' },
    { key: 'magenta' as const, label: 'Hộp mực đỏ (M)', color: '#FF00FF' },
    { key: 'yellow' as const, label: 'Hộp mực vàng (Y)', color: '#FFFF00 ' },
    { key: 'waste' as const, label: 'Hộp mực thải (Waste)', color: '#8b5cf6' }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <h3 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--brand-600)', display: 'flex', alignItems: 'center', gap: '0.45rem', margin: 0 }}>
          <Layers size={15} /> 3. Vật Tư Tiêu Hao & Hộp Mực
        </h3>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
          Đồng bộ telemetry: {printer.suppliesUpdated || printer.lastSuccessfulScrape}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        {supplyList.map(item => {
          const val = printer.supplies[item.key];
          const isNumeric = typeof val === 'number';

          return (
            <div key={item.key} className="card" style={{ padding: '0.75rem 1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isNumeric ? '0.35rem' : 0 }}>
                <span style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                  {item.label}
                </span>

                {isNumeric ? (
                  <span
                    style={{
                      fontFamily: 'JetBrains Mono',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      color:
                        item.key === 'waste'
                          ? ((val as number) >= 85 ? 'var(--status-offline)' : 'var(--text-primary)')
                          : ((val as number) < 15 ? 'var(--status-offline)' : 'var(--text-primary)')
                    }}
                  >
                    {val}% {item.key === 'waste' ? ((val as number) >= 85 ? '(Đầy / Cần thay)' : '') : (((val as number) < 15) ? '(Sắp hết)' : '')}
                  </span>
                ) : (printer.status === 'Offline' || printer.connectionStatus === 'Offline') ? (
                  <span className="badge badge-offline" style={{ fontSize: '0.7rem' }}>
                    Không có dữ liệu (Thiết bị ngoại tuyến)
                  </span>
                ) : (
                  <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                    Chưa xác định (Chưa nhận được OID)
                  </span>
                )}
              </div>

              {isNumeric && (
                <div className="progress-track" style={{ height: '0.5rem' }}>
                  <div
                    className="progress-fill"
                    style={{
                      width: `${Math.min(100, val as number)}%`,
                      backgroundColor:
                        item.key === 'waste'
                          ? ((val as number) >= 85 ? 'var(--status-offline)' : item.color)
                          : ((val as number) < 15 ? 'var(--status-offline)' : item.color)
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

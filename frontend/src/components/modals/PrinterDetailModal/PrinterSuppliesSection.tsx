import React from 'react';
import { Layers } from 'lucide-react';
import { Printer } from '../../../types/printer';
import { formatDateTime } from '../../../utils/formatDate';

interface PrinterSuppliesSectionProps {
  printer: Printer;
}

export const PrinterSuppliesSection: React.FC<PrinterSuppliesSectionProps> = ({ printer }) => {
  const isMono = printer.colorCapability === 'Monochrome';
  const isCanonDesktop = printer.model?.includes('LBP') || printer.model?.includes('MF');
  const isPrintServer = printer.model?.includes('Windows') || printer.model?.includes('Print Server') || printer.name.includes('Epson 1802') || printer.name.includes('HP/Epson') || printer.ip === '10.48.3.55' || printer.ip === '10.48.90.77' || printer.ip === '192.168.2.6';

  const allSupplies = [
    { key: 'black' as const, label: 'Hộp mực đen (K)', color: '#334155' },
    { key: 'cyan' as const, label: 'Hộp mực xanh (C)', color: '#00FFFF' },
    { key: 'magenta' as const, label: 'Hộp mực đỏ (M)', color: '#FF00FF' },
    { key: 'yellow' as const, label: 'Hộp mực vàng (Y)', color: '#FFFF00 ' },
    { key: 'waste' as const, label: 'Hộp mực thải (Waste)', color: '#8b5cf6' }
  ];

  // Với máy in đơn sắc, không hiển thị các hộp mực màu C, M, Y không tồn tại
  const supplyList = isMono
    ? allSupplies.filter(item => item.key === 'black' || item.key === 'waste')
    : allSupplies;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <h3 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--brand-600)', display: 'flex', alignItems: 'center', gap: '0.45rem', margin: 0 }}>
          <Layers size={15} /> 3. Vật Tư Tiêu Hao & Hộp Mực
        </h3>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
          Đồng bộ telemetry: {formatDateTime(printer.suppliesUpdated || printer.lastSuccessfulScrape)}
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

                {isNumeric ? (() => {
                  const isWaste = item.key === 'waste';
                  const numVal = val as number;
                  const fullness = isWaste ? Math.min(100, Math.max(0, 100 - numVal)) : numVal;
                  const remainingSpace = isWaste ? Math.min(100, Math.max(0, numVal)) : null;

                  const isWasteCritical = isWaste && fullness >= 85;
                  const isWasteWarning = isWaste && fullness >= 65 && fullness < 85;
                  const isTonerCritical = !isWaste && numVal < 15;

                  const textColor = (isWasteCritical || isTonerCritical)
                    ? 'var(--status-offline)'
                    : isWasteWarning
                    ? 'var(--status-warning)'
                    : 'var(--text-primary)';

                  const statusText = isWasteCritical
                    ? '(Đầy / Cần thay)'
                    : isWasteWarning
                    ? '(Sắp đầy)'
                    : isTonerCritical
                    ? '(Sắp hết)'
                    : '';

                  const displayText = isWaste
                    ? `${fullness}% đầy (Còn trống ${remainingSpace}%) ${statusText}`.trim()
                    : `${val}% ${statusText}`.trim();

                  return (
                    <span
                      style={{
                        fontFamily: 'JetBrains Mono',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        color: textColor
                      }}
                    >
                      {displayText}
                    </span>
                  );
                })() : (printer.status === 'Offline' || printer.connectionStatus === 'Offline') ? (
                  <span className="badge badge-offline" style={{ fontSize: '0.7rem' }}>
                    Không có dữ liệu (Thiết bị ngoại tuyến)
                  </span>
                ) : item.key === 'black' && printer.alertText?.toLowerCase().includes('toner') ? (
                  <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>
                    Cần kiểm tra: {printer.alertText}
                  </span>
                ) : item.key === 'black' && isCanonDesktop ? (
                  <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }} title="Hộp mực Canon All-in-One 057 không đo % liên tục qua SNMP">
                    Không hỗ trợ % (Hộp mực All-in-One)
                  </span>
                ) : item.key === 'waste' && isCanonDesktop ? (
                  <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                    Tích hợp trong hộp mực All-in-One
                  </span>
                ) : isPrintServer ? (
                  <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                    Không hỗ trợ qua Máy chủ in Windows
                  </span>
                ) : (
                  <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                    Chưa xác định (Chưa nhận được OID)
                  </span>
                )}
              </div>

              {isNumeric && (() => {
                const isWaste = item.key === 'waste';
                const numVal = val as number;
                const fullness = isWaste ? Math.min(100, Math.max(0, 100 - numVal)) : numVal;

                const isWasteCritical = isWaste && fullness >= 85;
                const isWasteWarning = isWaste && fullness >= 65 && fullness < 85;
                const isTonerCritical = !isWaste && numVal < 15;

                const fillColor = (isWasteCritical || isTonerCritical)
                  ? 'var(--status-offline)'
                  : isWasteWarning
                  ? 'var(--status-warning)'
                  : item.color;

                return (
                  <div className="progress-track" style={{ height: '0.5rem' }}>
                    <div
                      className="progress-fill"
                      style={{
                        width: `${Math.min(100, Math.max(0, fullness))}%`,
                        backgroundColor: fillColor
                      }}
                    />
                  </div>
                );
              })()}
            </div>
          );
        })}
      </div>
    </div>
  );
};

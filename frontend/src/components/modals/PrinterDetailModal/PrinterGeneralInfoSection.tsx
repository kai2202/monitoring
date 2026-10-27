import React, { useState, useEffect } from 'react';
import { Cpu, Pencil, Check, X } from 'lucide-react';
import { Printer } from '../../../types/printer';
import { formatDateTime } from '../../../utils/formatDate';

interface PrinterGeneralInfoSectionProps {
  printer: Printer;
  onUpdateLocation?: (printerId: string, location: string) => void;
}

export const PrinterGeneralInfoSection: React.FC<PrinterGeneralInfoSectionProps> = ({
  printer,
  onUpdateLocation
}) => {
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [locationInput, setLocationInput] = useState('');

  useEffect(() => {
    setIsEditingLocation(false);
    setLocationInput(printer.location || '');
  }, [printer.id, printer.location]);

  const handleSaveLocation = () => {
    if (onUpdateLocation) {
      onUpdateLocation(printer.id, locationInput.trim());
    }
    setIsEditingLocation(false);
  };

  const isOffline = printer.connectionStatus === 'Offline';

  return (
    <div>
      <h3 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--brand-600)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
        <Cpu size={15} /> 1. Thông Tin Chung & Đồng Bộ SNMP
      </h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '0.85rem',
          backgroundColor: 'var(--bg-subtle)',
          padding: '1rem',
          borderRadius: '0.65rem',
          border: 'none',
          fontSize: '0.8rem'
        }}
      >
        <div>
          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Tên Thiết Bị</span>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{printer.name}</span>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Địa Chỉ IPv4</span>
          <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 600, color: 'var(--text-primary)' }}>{printer.ip}</span>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Model Phần Cứng</span>
          <span style={{ color: 'var(--text-primary)' }}>{printer.mfr} {printer.model}</span>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Chủng Loại & Khả Năng In</span>
          <span style={{ fontWeight: 600, color: 'var(--brand-600)' }}>
            {printer.deviceType} ({printer.colorCapability || 'Tiêu chuẩn'})
          </span>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Số Seri</span>
          <span style={{ fontFamily: 'JetBrains Mono', color: 'var(--text-primary)' }}>{printer.serial}</span>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Phiên Bản Firmware</span>
          <span style={{ fontFamily: 'JetBrains Mono', color: 'var(--text-primary)' }}>{printer.firmware}</span>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Vị Trí Lắp Đặt</span>
          {isEditingLocation ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
              <input
                type="text"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveLocation();
                  if (e.key === 'Escape') setIsEditingLocation(false);
                }}
                autoFocus
                placeholder="Nhập vị trí đặt máy..."
                style={{
                  padding: '0.2rem 0.5rem',
                  fontSize: '0.75rem',
                  borderRadius: '4px',
                  border: '1px solid var(--brand-500)',
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  width: '160px'
                }}
              />
              <button
                onClick={handleSaveLocation}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.2rem 0.35rem', color: 'var(--status-online)' }}
                title="Lưu (Enter)"
              >
                <Check size={13} />
              </button>
              <button
                onClick={() => setIsEditingLocation(false)}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.2rem 0.35rem', color: 'var(--text-muted)' }}
                title="Hủy (Esc)"
              >
                <X size={13} />
              </button>
            </div>
          ) : (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                cursor: 'pointer',
                marginTop: '0.1rem',
                padding: '0.15rem 0.35rem',
                marginLeft: '-0.35rem',
                borderRadius: '4px',
                transition: 'background-color 0.15s ease'
              }}
              onClick={() => {
                setLocationInput(printer.location || '');
                setIsEditingLocation(true);
              }}
              title="Nhấp để chỉnh sửa vị trí lắp đặt"
            >
              <span style={{
                color: printer.location ? 'var(--text-primary)' : 'var(--text-muted)',
                fontStyle: printer.location ? 'normal' : 'italic'
              }}>
                {printer.location || 'Chưa thiết lập'}
              </span>
              <Pencil
                size={13}
                style={{
                  color: 'var(--brand-500)',
                  opacity: 0.85,
                  flexShrink: 0
                }}
              />
            </div>
          )}
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Cấu Hình & Giao Thức SNMP</span>
          <span style={{ fontFamily: 'JetBrains Mono', color: 'var(--text-primary)' }}>{printer.snmpStatus}</span>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Lần Quét Gần Nhất</span>
          <span style={{ fontFamily: 'JetBrains Mono', color: isOffline ? 'var(--status-offline)' : 'var(--text-primary)' }}>
            {formatDateTime(printer.lastScrape)}
          </span>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Lần Quét Thành Công (Xác thực)</span>
          <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 600, color: 'var(--status-online)' }}>
            {formatDateTime(printer.lastSuccessfulScrape)}
          </span>
        </div>
        {printer.anomalyNote && (
          <div style={{ gridColumn: '1 / -1', color: 'var(--status-warning)', fontSize: '0.75rem', fontFamily: 'JetBrains Mono' }}>
            ⚠️ Ghi chú chẩn đoán: {printer.anomalyNote}
          </div>
        )}
      </div>
    </div>
  );
};

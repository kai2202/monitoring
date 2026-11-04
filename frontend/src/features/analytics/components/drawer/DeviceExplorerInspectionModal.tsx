import React from 'react';
import { FontAwesomeIcon, faXmark, faPrint, faThumbtack } from '../../../../shared/icons';
import { DeviceFloorContributionItem } from '../../../../types/analyticsUI';

interface DeviceExplorerInspectionModalProps {
  device: DeviceFloorContributionItem | null;
  onClose: () => void;
  isPinned: boolean;
  onTogglePin: (id: string) => void;
}

export const DeviceExplorerInspectionModal: React.FC<DeviceExplorerInspectionModalProps> = ({
  device,
  onClose,
  isPinned,
  onTogglePin,
}) => {
  if (!device) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          borderRadius: '16px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-xl)',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FontAwesomeIcon icon={faPrint} style={{ fontSize: '16px' }} />
            </div>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                {device.printerName}
              </h4>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
                {device.printerId} • {device.model}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
          >
            <FontAwesomeIcon icon={faXmark} style={{ fontSize: '14px' }} />
          </button>
        </div>

        {/* Thông số kỹ thuật */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11.5px' }}>
          <div style={{ padding: '8px 10px', borderRadius: '8px', backgroundColor: 'var(--bg-subtle)' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '10.5px' }}>Thương hiệu:</span>
            <strong style={{ display: 'block', color: 'var(--text-primary)' }}>
              {device.brand}
            </strong>
          </div>

          <div style={{ padding: '8px 10px', borderRadius: '8px', backgroundColor: 'var(--bg-subtle)' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '10.5px' }}>Địa chỉ IP:</span>
            <strong style={{ display: 'block', color: 'var(--text-primary)', fontFamily: "'JetBrains Mono', monospace" }}>
              {device.ip || '192.168.1.100'}
            </strong>
          </div>

          <div style={{ padding: '8px 10px', borderRadius: '8px', backgroundColor: 'var(--bg-subtle)' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '10.5px' }}>Serial Number:</span>
            <strong style={{ display: 'block', color: 'var(--text-primary)', fontFamily: "'JetBrains Mono', monospace" }}>
              {device.serial || 'SN-2026-0001'}
            </strong>
          </div>

          <div style={{ padding: '8px 10px', borderRadius: '8px', backgroundColor: 'var(--bg-subtle)' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '10.5px' }}>Vị trí &amp; Tầng:</span>
            <strong style={{ display: 'block', color: 'var(--text-primary)' }}>
              {device.floor}
            </strong>
          </div>

          <div style={{ padding: '8px 10px', borderRadius: '8px', backgroundColor: 'var(--bg-subtle)' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '10.5px' }}>Sản lượng trong kỳ:</span>
            <strong style={{ display: 'block', color: '#2563eb', fontFamily: "'JetBrains Mono', monospace" }}>
              {device.totalVolume.toLocaleString('vi-VN')} trang
            </strong>
          </div>

          <div style={{ padding: '8px 10px', borderRadius: '8px', backgroundColor: 'var(--bg-subtle)' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '10.5px' }}>Tốc độ in danh định:</span>
            <strong style={{ display: 'block', color: 'var(--text-primary)', fontFamily: "'JetBrains Mono', monospace" }}>
              {device.ppm ?? 50} PPM
            </strong>
          </div>
        </div>

        {/* Mực in & Vật tư */}
        <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: 'var(--bg-subtle)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Mực in &amp; Tuổi thọ trống (Toner &amp; Drum)
          </span>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px' }}>
                <span>Black (K)</span>
                <strong>{device.tonerK ?? 70}%</strong>
              </div>
              <div style={{ width: '100%', height: '4px', borderRadius: '2px', backgroundColor: '#e2e8f0', marginTop: '2px' }}>
                <div style={{ width: `${device.tonerK ?? 70}%`, height: '100%', backgroundColor: '#0f172a', borderRadius: '2px' }} />
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px' }}>
                <span>Trống (Drum)</span>
                <strong>{device.drumLife ?? 85}%</strong>
              </div>
              <div style={{ width: '100%', height: '4px', borderRadius: '2px', backgroundColor: '#e2e8f0', marginTop: '2px' }}>
                <div style={{ width: `${device.drumLife ?? 85}%`, height: '100%', backgroundColor: '#10b981', borderRadius: '2px' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '4px' }}>
          <button
            type="button"
            onClick={onClose}
            style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'transparent', fontSize: '11.5px', cursor: 'pointer' }}
          >
            Đóng
          </button>

          <button
            type="button"
            onClick={() => onTogglePin(device.printerId)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '6px 14px',
              borderRadius: '6px',
              backgroundColor: isPinned ? '#16a34a' : '#2563eb',
              color: '#ffffff',
              fontSize: '11.5px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <FontAwesomeIcon icon={faThumbtack} style={{ fontSize: '11px' }} />
            <span>{isPinned ? '✓ Đã ghim so sánh' : 'Ghim vào so sánh'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

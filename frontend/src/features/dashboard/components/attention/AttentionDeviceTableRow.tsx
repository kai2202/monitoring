/**
 * Frontend/src/features/dashboard/components/attention/AttentionDeviceTableRow.tsx
 *
 * Dòng Hiển Thị Thiết Bị Cần Chú Ý:
 * - Phân biệt rành mạch Ngoại tuyến (Offline), Lỗi phần cứng (Hardware), Cảnh báo vật tư.
 * - Hỗ trợ sao chép IP, nút [Chẩn đoán] và [+ Lập lệnh].
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../app/store';
import {
  FontAwesomeIcon,
  faTriangleExclamation,
  faWifi,
  faBox,
  faCopy,
  faCheck,
  faWrench,
} from '../../../../shared/icons';
import { Printer } from '../../../../types/printer';
import { AttentionCmykMiniBar } from './AttentionCmykMiniBar';

interface AttentionDeviceTableRowProps {
  printer: Printer;
  copiedIp: string | null;
  onCopyIp: (e: React.MouseEvent, ip: string) => void;
  onSelectPrinter: (printer: Printer) => void;
  onCreateTask?: (printer: Printer) => void;
}

export const AttentionDeviceTableRow: React.FC<AttentionDeviceTableRowProps> = ({
  printer,
  copiedIp,
  onCopyIp,
  onSelectPrinter,
  onCreateTask,
}) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === 'ADMIN';

  const isOffline = printer.connectionStatus === 'Offline';
  const isHardware = !isOffline && (
    printer.alertSeverity === 'critical' ||
    printer.health === 'Critical' ||
    Boolean(printer.copierErr) ||
    Boolean(printer.mfpErr)
  );

  return (
    <tr
      onClick={() => onSelectPrinter(printer)}
      style={{
        borderBottom: '1px solid var(--border-color, #e2e8f0)',
        cursor: 'pointer',
        transition: 'background-color 0.15s ease',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-subtle, #f8fafc)')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      {/* IP & Copy */}
      <td style={{ padding: '10px 16px' }}>
        <button
          type="button"
          onClick={(e) => onCopyIp(e, printer.ip)}
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: "'JetBrains Mono', monospace", fontSize: '11.5px', color: '#2563eb' }}
        >
          <span>{printer.ip}</span>
          {copiedIp === printer.ip ? (
            <FontAwesomeIcon icon={faCheck} style={{ fontSize: '11px', color: '#16a34a' }} />
          ) : (
            <FontAwesomeIcon icon={faCopy} style={{ fontSize: '11px' }} />
          )}
        </button>
      </td>

      {/* Name & Model */}
      <td style={{ padding: '10px 16px' }}>
        <strong style={{ color: 'var(--text-primary, #0f172a)' }}>{printer.name}</strong>
        <div style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)' }}>{printer.model}</div>
      </td>

      {/* Location */}
      <td style={{ padding: '10px 16px', color: 'var(--text-secondary, #475569)' }}>
        {printer.location}
      </td>

      {/* CMYK Mini Bar */}
      <td style={{ padding: '10px 16px' }}>
        <AttentionCmykMiniBar printer={printer} />
      </td>

      {/* Sự Cố Hiện Tại (Tách biệt Offline vs Hardware vs Consumables) */}
      <td style={{ padding: '10px 16px' }}>
        {isOffline ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FontAwesomeIcon icon={faWifi} style={{ fontSize: '11px', color: '#64748b' }} />
            <div>
              <div style={{ color: '#475569', fontWeight: 700, fontSize: '11.5px' }}>Mất kết nối mạng (Offline)</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted, #94a3b8)' }}>Mất SNMP / Không ping được IP</div>
            </div>
          </div>
        ) : isHardware ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FontAwesomeIcon icon={faTriangleExclamation} style={{ fontSize: '11px', color: '#ef4444' }} />
            <div>
              <div style={{ color: '#ef4444', fontWeight: 700, fontSize: '11.5px' }}>Lỗi phần cứng (Hardware)</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted, #94a3b8)' }}>{printer.alertText || printer.copierErr || 'Sự cố cơ khí / linh kiện'}</div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FontAwesomeIcon icon={faBox} style={{ fontSize: '11px', color: '#f59e0b' }} />
            <div>
              <div style={{ color: '#d97706', fontWeight: 700, fontSize: '11.5px' }}>Vật tư chạm ngưỡng thấp</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted, #94a3b8)' }}>{printer.alertText || 'Mực in hoặc linh kiện cần thay'}</div>
            </div>
          </div>
        )}
      </td>

      {/* Trạng Thái Badge */}
      <td style={{ padding: '10px 16px' }}>
        <span
          style={{
            padding: '2px 8px',
            borderRadius: '9999px',
            fontSize: '10.5px',
            fontWeight: 700,
            backgroundColor: isOffline
              ? 'var(--bg-subtle, #f1f5f9)'
              : isHardware
              ? 'rgba(239, 68, 68, 0.1)'
              : 'rgba(245, 158, 11, 0.1)',
            color: isOffline
              ? '#475569'
              : isHardware
              ? '#ef4444'
              : '#d97706',
            border: isOffline ? '1px solid var(--border-color, #cbd5e1)' : 'none',
          }}
        >
          {isOffline ? 'Ngoại tuyến' : isHardware ? 'Khẩn cấp' : 'Cảnh báo'}
        </span>
      </td>

      {/* Thao Tác Kép: [Chẩn đoán] + [+ Lập lệnh] */}
      <td style={{ padding: '10px 16px', textAlign: 'right' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => onSelectPrinter(printer)}
            title="Mở bảng OID và chẩn đoán kỹ thuật thiết bị"
            style={{
              padding: '4px 8px',
              borderRadius: '6px',
              backgroundColor: 'var(--bg-subtle, #f8fafc)',
              border: '1px solid var(--border-color, #e2e8f0)',
              color: '#2563eb',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Chẩn đoán
          </button>
          {isAdmin ? (
            <button
              type="button"
              onClick={() => {
                if (onCreateTask) onCreateTask(printer);
                else onSelectPrinter(printer);
              }}
              title="Lập lệnh bảo trì / công việc mới"
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                backgroundColor: '#2563eb',
                border: 'none',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <FontAwesomeIcon icon={faWrench} style={{ fontSize: '9.5px' }} />
              <span>Lập lệnh</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onSelectPrinter(printer)}
              title="Xem chi tiết thiết bị &amp; lệnh bảo trì"
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                backgroundColor: 'rgba(37, 99, 235, 0.08)',
                border: '1px solid rgba(37, 99, 235, 0.25)',
                color: '#2563eb',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <FontAwesomeIcon icon={faWrench} style={{ fontSize: '9.5px' }} />
              <span>Xem lệnh</span>
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};


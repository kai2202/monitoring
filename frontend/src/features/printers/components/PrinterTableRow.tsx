/**
 * Frontend/src/features/printers/components/PrinterTableRow.tsx
 *
 * Dòng Dữ Liệu Máy In (Printer Table Row Component):
 * - Hiển thị chi tiết từng máy in trong bảng danh mục.
 * - Tinh gọn nhóm nút thao tác Admin (Icon-only với Tooltip rõ ràng).
 * - Tuân thủ AGENTS.md Rule 5 (MetricValue = number | null) và Rule 7.1 (< 300 LOC).
 */

import React from 'react';
import {
  FontAwesomeIcon,
  faCopy,
  faCheck,
  faChevronRight,
} from '../../../shared/icons';
import { Printer } from '../../../types/printer';
import { getPrinterSizeMeta } from '../utils/deviceSize';

export interface PrinterTableRowProps {
  printer: Printer;
  copiedIp: string | null;
  onCopyIp: (e: React.MouseEvent, ip: string) => void;
  onOpenDrawer: (printer: Printer, tab: 'diag' | 'location' | 'tasks' | 'counters' | 'history', taskId?: string) => void;
}

export const PrinterTableRow: React.FC<PrinterTableRowProps> = ({
  printer: p,
  copiedIp,
  onCopyIp,
  onOpenDrawer,
}) => {
  const isOnline = p.connectionStatus === 'Online';
  const isCritical = p.health === 'Critical' || p.alertSeverity === 'critical';
  const isWarning = p.health === 'Warning' || p.alertSeverity === 'warning';
  const isStored = p.monitoringStatus === 'Storage' || p.monitoringStatus === 'Decommissioned' || p.monitoringStatus === 'Suspended';

  return (
    <tr
      onClick={() => onOpenDrawer(p, 'diag')}
      style={{ borderBottom: '1px solid var(--border-color)', cursor: 'pointer', transition: 'background-color 0.15s ease' }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-subtle)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
    >
      <td style={{ padding: '12px 14px', verticalAlign: 'middle' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontWeight: 700, fontSize: '12.5px', color: 'var(--text-primary)', fontFamily: "'JetBrains Mono', monospace" }}>
            {p.ip || '—'}
          </span>
          {p.ip && (
            <button onClick={(e) => onCopyIp(e, p.ip)} style={{ color: copiedIp === p.ip ? 'var(--status-online)' : 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <FontAwesomeIcon icon={copiedIp === p.ip ? faCheck : faCopy} style={{ fontSize: '11px' }} />
            </button>
          )}
        </div>
      </td>
      <td style={{ padding: '12px 14px', verticalAlign: 'middle' }}>
        <div style={{ fontWeight: 600, fontSize: '12.5px', color: 'var(--text-primary)' }}>{p.name}</div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
          {p.model}
          {p.serial && <span style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-secondary)' }}> • S/N: {p.serial}</span>}
        </div>
      </td>
      <td style={{ padding: '12px 14px', verticalAlign: 'middle' }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>{p.mfr}</div>
        {(() => {
          const sizeMeta = getPrinterSizeMeta(p.deviceType);
          return (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '2px' }} title={sizeMeta.label}>
              <FontAwesomeIcon icon={sizeMeta.icon} style={{ fontSize: '10px', color: sizeMeta.category === 'large' ? '#7c3aed' : '#2563eb' }} />
              <span>{p.deviceType}</span>
              <span style={{ padding: '0 5px', borderRadius: '4px', fontSize: '9.5px', fontWeight: 700, backgroundColor: sizeMeta.category === 'large' ? 'rgba(124, 58, 237, 0.1)' : 'rgba(37, 99, 235, 0.08)', color: sizeMeta.category === 'large' ? '#6d28d9' : '#1d4ed8' }}>
                {sizeMeta.shortLabel}
              </span>
            </div>
          );
        })()}
      </td>
      <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
        {(() => {
          const siteName = (p.branch || p.building || '').trim();
          const subLoc = [p.floor, p.room || p.department].filter(Boolean).join(' • ') || p.location || '—';
          return (
            <>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {siteName || subLoc}
              </div>
              {siteName && (
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {subLoc}
                </div>
              )}
            </>
          );
        })()}
      </td>
      <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
        {p.monitoringStatus === 'Storage' ? (
          <span style={{ padding: '2px 8px', borderRadius: '9999px', fontSize: '10.5px', fontWeight: 700, backgroundColor: 'rgba(100, 116, 139, 0.12)', color: '#475569' }}>Lưu kho</span>
        ) : p.monitoringStatus === 'Decommissioned' ? (
          <span style={{ padding: '2px 8px', borderRadius: '9999px', fontSize: '10.5px', fontWeight: 700, backgroundColor: 'rgba(148, 163, 184, 0.15)', color: '#64748b' }}>Đã thanh lý</span>
        ) : (
          <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '2px 9px',
                borderRadius: '9999px',
                fontSize: '11px',
                fontWeight: 700,
                backgroundColor: isOnline ? 'var(--status-online-bg)' : 'var(--status-critical-bg)',
                color: isOnline ? 'var(--status-online)' : 'var(--status-critical)',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '9999px',
                  backgroundColor: isOnline ? 'var(--status-online)' : 'var(--status-critical)',
                }}
              />
              {isOnline ? 'Online' : 'Offline'}
            </span>
            {(p.icmpStatus && p.icmpStatus !== 'UNKNOWN') || (p.snmpStatus && p.snmpStatus !== 'UNKNOWN') ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '2px' }}>
                {p.icmpStatus && p.icmpStatus !== 'UNKNOWN' && (
                  <span
                    title={`ICMP Ping: ${p.icmpStatus}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '10px',
                      fontWeight: 600,
                      color: p.icmpStatus === 'UP' ? '#64748b' : '#dc2626',
                    }}
                  >
                    <span
                      style={{
                        width: '5px',
                        height: '5px',
                        borderRadius: '9999px',
                        backgroundColor: p.icmpStatus === 'UP' ? '#22c55e' : '#ef4444',
                      }}
                    />
                    {p.icmpStatus === 'UP' ? 'ICMP' : 'ICMP lỗi'}
                  </span>
                )}
                {p.snmpStatus && p.snmpStatus !== 'UNKNOWN' && (() => {
                  const snmpOk =
                    p.snmpStatus === 'UP' ||
                    p.snmpStatus === 'SNMP_AGENT_OK' ||
                    p.snmpStatus === 'OK';
                  return (
                    <span
                      title={`SNMP Poll: ${p.snmpStatus}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '10px',
                        fontWeight: 600,
                        color: snmpOk ? '#64748b' : '#b45309',
                      }}
                    >
                      <span
                        style={{
                          width: '5px',
                          height: '5px',
                          borderRadius: '9999px',
                          backgroundColor: snmpOk ? '#22c55e' : '#f59e0b',
                        }}
                      />
                      {snmpOk ? 'SNMP' : 'SNMP lỗi'}
                    </span>
                  );
                })()}
              </div>
            ) : null}
            {p.isStale && (
              <span
                title="Dữ liệu giám sát đã quá hạn làm mới, chưa xác nhận trạng thái hiện tại"
                style={{ fontSize: '10px', fontWeight: 600, color: '#b45309', paddingLeft: '2px' }}
              >
                • Dữ liệu đã cũ
              </span>
            )}
          </div>
        )}
      </td>
      <td style={{ padding: '12px 14px', verticalAlign: 'middle' }}>
        <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start', gap: '3px' }}>
          <span style={{ padding: '2px 8px', borderRadius: '9999px', fontSize: '10.5px', fontWeight: 700, backgroundColor: isCritical ? 'rgba(239, 68, 68, 0.12)' : isWarning ? 'rgba(245, 158, 11, 0.12)' : 'rgba(22, 163, 74, 0.12)', color: isCritical ? '#ef4444' : isWarning ? '#f59e0b' : '#16a34a' }}>
            {p.health}
          </span>
          {p.currentFaultType && p.currentFaultType !== 'NONE' && (
            <span
              title={p.currentFaultText || p.alertText || ''}
              style={{
                padding: '1px 6px',
                borderRadius: '4px',
                fontSize: '9.5px',
                fontWeight: 600,
                backgroundColor: p.currentFaultType === 'PAPER_JAM' ? 'rgba(245, 158, 11, 0.14)' : 'rgba(239, 68, 68, 0.12)',
                color: p.currentFaultType === 'PAPER_JAM' ? '#b45309' : '#dc2626',
              }}
            >
              {p.currentFaultType === 'PAPER_JAM' ? 'Kẹt giấy' : 'Lỗi phần cứng'}
            </span>
          )}
        </div>
      </td>
      <td style={{ padding: '12px 14px', verticalAlign: 'middle', textAlign: 'right' }}>
        <button
          type="button"
          onClick={() => onOpenDrawer(p, 'diag')}
          style={{
            padding: '5px 12px',
            borderRadius: '8px',
            backgroundColor: 'var(--bg-subtle, #f8fafc)',
            color: '#2563eb',
            fontSize: '11.5px',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            border: '1px solid var(--border-color, #cbd5e1)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <span>Chi tiết</span>
          <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: '9px' }} />
        </button>
      </td>
    </tr>
  );
};

export default PrinterTableRow;


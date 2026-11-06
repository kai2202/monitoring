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
  faLocationDot,
  faPenToSquare,
  faBan,
} from '../../../shared/icons';
import { Printer } from '../../../types/printer';
import { Task } from '../../../types/task';
import { PrinterInkStatusCell } from './PrinterInkStatusCell';

export interface PrinterTableRowProps {
  printer: Printer;
  taskInfo?: { active: number; total: number; latestTask?: Task };
  copiedIp: string | null;
  isAdmin?: boolean;
  onCopyIp: (e: React.MouseEvent, ip: string) => void;
  onOpenDrawer: (printer: Printer, tab: 'diag' | 'tasks' | 'counters', taskId?: string) => void;
  onOpenRelocate?: (printer: Printer) => void;
  onOpenEdit?: (printer: Printer) => void;
  onDecommissionPrinter?: (printer: Printer) => void;
}

export const PrinterTableRow: React.FC<PrinterTableRowProps> = ({
  printer: p,
  taskInfo,
  copiedIp,
  isAdmin,
  onCopyIp,
  onOpenDrawer,
  onOpenRelocate,
  onOpenEdit,
  onDecommissionPrinter,
}) => {
  const isOnline = p.connectionStatus === 'Online';
  const isCritical = p.health === 'Critical' || p.alertSeverity === 'critical';
  const isWarning = p.health === 'Warning' || p.alertSeverity === 'warning';
  const totalCounter = p.counters?.total;

  return (
    <tr
      onClick={() => onOpenDrawer(p, 'diag')}
      style={{ borderBottom: '1px solid var(--border-color)', cursor: 'pointer', transition: 'background-color 0.15s ease' }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-subtle)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
    >
      <td style={{ padding: '12px 14px', verticalAlign: 'middle' }}>
        <div style={{ fontWeight: 700, fontSize: '12.5px', color: 'var(--text-primary)', fontFamily: "'JetBrains Mono', monospace" }}>{p.id}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>{p.ip || '—'}</span>
          {p.ip && (
            <button onClick={(e) => onCopyIp(e, p.ip)} style={{ color: copiedIp === p.ip ? 'var(--status-online)' : 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <FontAwesomeIcon icon={copiedIp === p.ip ? faCheck : faCopy} style={{ fontSize: '10px' }} />
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
        <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '2px' }}>{p.deviceType}</div>
      </td>
      <td style={{ padding: '12px 14px', verticalAlign: 'middle' }}>
        <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>{p.location || '—'}</div>
      </td>
      <td style={{ padding: '12px 14px', verticalAlign: 'middle' }}>
        <PrinterInkStatusCell printer={p} />
      </td>
      <td style={{ padding: '12px 14px', verticalAlign: 'middle' }}>
        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: "'JetBrains Mono', monospace" }}>
          {totalCounter !== null && totalCounter !== undefined ? totalCounter.toLocaleString('vi-VN') : '—'}
        </span>
        <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>trang</span>
      </td>
      <td style={{ padding: '12px 14px', verticalAlign: 'middle' }}>
        {p.monitoringStatus === 'Storage' ? (
          <span style={{ padding: '2px 8px', borderRadius: '9999px', fontSize: '10.5px', fontWeight: 700, backgroundColor: 'rgba(100, 116, 139, 0.12)', color: '#475569' }}>Lưu kho</span>
        ) : p.monitoringStatus === 'Decommissioned' ? (
          <span style={{ padding: '2px 8px', borderRadius: '9999px', fontSize: '10.5px', fontWeight: 700, backgroundColor: 'rgba(148, 163, 184, 0.15)', color: '#64748b' }}>Đã thanh lý</span>
        ) : (
          <span style={{ padding: '2px 8px', borderRadius: '9999px', fontSize: '10.5px', fontWeight: 700, backgroundColor: isOnline ? 'var(--status-online-bg)' : 'var(--status-critical-bg)', color: isOnline ? 'var(--status-online)' : 'var(--status-critical)' }}>
            {isOnline ? 'Online' : 'Offline'}
          </span>
        )}
      </td>
      <td style={{ padding: '12px 14px', verticalAlign: 'middle' }}>
        <span style={{ padding: '2px 8px', borderRadius: '9999px', fontSize: '10.5px', fontWeight: 700, backgroundColor: isCritical ? 'rgba(239, 68, 68, 0.12)' : isWarning ? 'rgba(245, 158, 11, 0.12)' : 'rgba(22, 163, 74, 0.12)', color: isCritical ? '#ef4444' : isWarning ? '#f59e0b' : '#16a34a' }}>
          {p.health}
        </span>
      </td>
      <td style={{ padding: '12px 14px', verticalAlign: 'middle', textAlign: 'right' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
          {isAdmin && onOpenEdit && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onOpenEdit(p); }}
              title="Sửa cấu hình (Admin)"
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '6px',
                backgroundColor: 'var(--bg-subtle, #f1f5f9)',
                color: 'var(--text-secondary, #475569)',
                border: '1px solid var(--border-color, #cbd5e1)',
                fontSize: '11px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FontAwesomeIcon icon={faPenToSquare} />
            </button>
          )}
          {isAdmin && onOpenRelocate && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onOpenRelocate(p); }}
              title="Điều chuyển vị trí (Admin)"
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '6px',
                backgroundColor: 'rgba(37, 99, 235, 0.08)',
                color: '#2563eb',
                border: '1px solid rgba(37, 99, 235, 0.2)',
                fontSize: '11px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FontAwesomeIcon icon={faLocationDot} />
            </button>
          )}
          {isAdmin && onDecommissionPrinter && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onDecommissionPrinter(p); }}
              title={taskInfo && taskInfo.active > 0 ? 'Đang có lệnh bảo trì chưa đóng, không thể ngưng/xóa' : 'Ngưng giám sát (Admin)'}
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '6px',
                backgroundColor: taskInfo && taskInfo.active > 0 ? 'rgba(148, 163, 184, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                color: taskInfo && taskInfo.active > 0 ? '#94a3b8' : '#ef4444',
                border: taskInfo && taskInfo.active > 0 ? '1px solid #cbd5e1' : '1px solid rgba(239, 68, 68, 0.25)',
                fontSize: '11px',
                cursor: taskInfo && taskInfo.active > 0 ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FontAwesomeIcon icon={faBan} />
            </button>
          )}
          <button
            type="button"
            onClick={() => onOpenDrawer(p, 'diag')}
            style={{
              padding: '4px 8px',
              borderRadius: '6px',
              backgroundColor: 'var(--bg-subtle)',
              color: '#2563eb',
              fontSize: '11px',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              border: '1px solid var(--border-color)',
              cursor: 'pointer',
            }}
          >
            <span>Chi tiết</span>
            <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: '9px' }} />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default PrinterTableRow;


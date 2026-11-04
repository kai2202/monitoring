import React from 'react';
import { FontAwesomeIcon, faCopy, faCheck, faChevronRight } from '../../../shared/icons';
import { Printer } from '../../../types/printer';
import { Task } from '../../../types/task';
import { PrinterInkStatusCell } from './PrinterInkStatusCell';

interface PrinterTableViewProps {
  printers: Printer[];
  printerTaskMap: Map<string, { active: number; total: number; latestTask?: Task }>;
  copiedIp: string | null;
  onCopyIp: (e: React.MouseEvent, ip: string) => void;
  onOpenDrawer: (printer: Printer, tab: 'diag' | 'tasks' | 'counters', taskId?: string) => void;
}

export const PrinterTableView: React.FC<PrinterTableViewProps> = ({
  printers,
  printerTaskMap,
  copiedIp,
  onCopyIp,
  onOpenDrawer,
}) => {
  return (
    <div style={{ borderRadius: 'var(--radius-card)', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1120px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-subtle)' }}>
              <th style={{ padding: '12px 18px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', width: '130px' }}>MÃ / ĐỊA CHỈ IP</th>
              <th style={{ padding: '12px 18px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', width: '280px' }}>THIẾT BỊ &amp; MODEL</th>
              <th style={{ padding: '12px 18px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', width: '130px' }}>HÃNG &amp; LOẠI</th>
              <th style={{ padding: '12px 18px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', width: '210px' }}>VỊ TRÍ PHÒNG BAN</th>
              <th style={{ padding: '12px 18px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', width: '140px' }}>MỰC IN</th>
              <th style={{ padding: '12px 18px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', width: '115px' }}>KẾT NỐI</th>
              <th style={{ padding: '12px 18px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', width: '120px' }}>SỨC KHỎE</th>
              <th style={{ padding: '12px 18px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', width: '95px', textAlign: 'right' }}>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {printers.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                  Không tìm thấy máy in nào khớp với bộ lọc hiện tại.
                </td>
              </tr>
            ) : (
              printers.map((p) => {
                const isOnline = p.connectionStatus === 'Online';
                const isCritical = p.health === 'Critical' || p.alertSeverity === 'critical';
                const isWarning = p.health === 'Warning' || p.alertSeverity === 'warning';
                const taskInfo = printerTaskMap.get(p.id);

                return (
                  <tr
                    key={p.id}
                    onClick={() => onOpenDrawer(p, 'diag')}
                    style={{ borderBottom: '1px solid var(--border-color)', cursor: 'pointer', transition: 'background-color 0.15s ease' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-subtle)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <td style={{ padding: '14px 18px', verticalAlign: 'middle' }}>
                      <div style={{ fontWeight: 700, fontSize: '12.5px', color: 'var(--text-primary)', fontFamily: "'JetBrains Mono', monospace" }}>{p.id}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>{p.ip || '—'}</span>
                        {p.ip && (
                          <button onClick={(e) => onCopyIp(e, p.ip)} style={{ color: copiedIp === p.ip ? 'var(--status-online)' : 'var(--text-muted)' }}>
                            {copiedIp === p.ip ? (
                              <FontAwesomeIcon icon={faCheck} style={{ fontSize: '11px' }} />
                            ) : (
                              <FontAwesomeIcon icon={faCopy} style={{ fontSize: '11px' }} />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px', verticalAlign: 'middle' }}>
                      <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>{p.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{p.model}</div>
                    </td>
                    <td style={{ padding: '14px 18px', verticalAlign: 'middle' }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>{p.mfr}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{p.deviceType}</div>
                    </td>
                    <td style={{ padding: '14px 18px', verticalAlign: 'middle' }}>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{p.location || '—'}</div>
                    </td>
                    <td style={{ padding: '14px 18px', verticalAlign: 'middle' }}>
                      <PrinterInkStatusCell printer={p} />
                    </td>
                    <td style={{ padding: '14px 18px', verticalAlign: 'middle' }}>
                      <span style={{ padding: '2px 8px', borderRadius: '9999px', fontSize: '11px', fontWeight: 700, backgroundColor: isOnline ? 'var(--status-online-bg)' : 'var(--status-critical-bg)', color: isOnline ? 'var(--status-online)' : 'var(--status-critical)' }}>
                        {isOnline ? 'Online' : 'Offline'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', verticalAlign: 'middle' }}>
                      <span style={{ padding: '2px 8px', borderRadius: '9999px', fontSize: '11px', fontWeight: 700, backgroundColor: isCritical ? 'rgba(239, 68, 68, 0.12)' : isWarning ? 'rgba(245, 158, 11, 0.12)' : 'rgba(22, 163, 74, 0.12)', color: isCritical ? '#ef4444' : isWarning ? '#f59e0b' : '#16a34a' }}>
                        {p.health}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', verticalAlign: 'middle', textAlign: 'right' }}>
                      <button style={{ padding: '6px 10px', borderRadius: '8px', backgroundColor: 'var(--bg-subtle)', color: '#2563eb', fontSize: '11.5px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <span>Chi tiết</span>
                        <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: '11px' }} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};


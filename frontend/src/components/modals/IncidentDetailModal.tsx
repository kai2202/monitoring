import React, { useEffect } from 'react';
import { X, AlertTriangle, AlertOctagon, Terminal, Clock, CheckCircle2, History } from 'lucide-react';
import { Incident } from '../../types/printer';
import { resolveDiagnostic } from '../../diagnostics';
import { formatDateTime } from '../../utils/formatDate';

export interface IncidentDetailModalProps {
  incident: Incident | null;
  onClose: () => void;
  onResolveIncident?: (incidentId: string) => void;
  onUpdateIncidentStatus?: (incidentId: string, status: 'Active' | 'Resolved') => void;
}

export const IncidentDetailModal: React.FC<IncidentDetailModalProps> = ({
  incident,
  onClose,
  onResolveIncident,
  onUpdateIncidentStatus
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!incident) return null;

  const isCritical = incident.severity === 'Critical';
  const diag = incident.diagnostic || resolveDiagnostic(incident.desc, incident.printer);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '580px', maxHeight: '88vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            backgroundColor: 'var(--bg-card)',
            zIndex: 10
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {isCritical ? (
              <AlertOctagon size={18} style={{ color: 'var(--status-offline)' }} />
            ) : (
              <AlertTriangle size={18} style={{ color: 'var(--status-warning)' }} />
            )}
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Chi Tiết Chẩn Đoán Sự Cố
            </h2>
            <span className="badge badge-neutral">{incident.id}</span>
          </div>

          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding: '0.35rem' }} title="Đóng (Esc)">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.82rem' }}>
          {/* Chi Tiết Chẩn Đoán (SNMP Trap) Enriched Card */}
          <div
            style={{
              padding: '1rem',
              borderRadius: '0.65rem',
              border: `1px solid ${isCritical ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
              backgroundColor: isCritical ? 'rgba(239, 68, 68, 0.05)' : 'rgba(245, 158, 11, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: isCritical ? 'var(--status-offline)' : 'var(--status-warning)', letterSpacing: '0.04em' }}>
                  Chi Tiết Chẩn Đoán (SNMP Trap)
                </span>
                <span className="badge badge-neutral" style={{ fontFamily: 'JetBrains Mono', fontSize: '0.72rem', fontWeight: 700 }}>
                  Mã lỗi gốc: {diag.rawCode}
                </span>
                {diag.isIdentified ? (
                  <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>
                    Xác thực ({diag.vendor})
                  </span>
                ) : (
                  <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>
                    Chưa xác định
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
                Phân hệ: <strong style={{ color: 'var(--text-primary)' }}>{diag.subsystem}</strong>
              </div>
            </div>

            <div>
              <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {diag.errorName}
              </h4>
              <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {diag.description}
              </p>
            </div>
          </div>
          {/* Metadata Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '140px 1fr',
              gap: '0.65rem',
              backgroundColor: 'var(--bg-subtle)',
              padding: '1rem',
              borderRadius: '0.65rem',
              border: '1px solid var(--border-color)'
            }}
          >
            <span style={{ color: 'var(--text-muted)' }}>Mã sự cố:</span>
            <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, color: 'var(--brand-600)' }}>{incident.id}</span>

            <span style={{ color: 'var(--text-muted)' }}>Thiết bị máy in (IP):</span>
            <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 600, color: 'var(--text-primary)' }}>{incident.printer || 'N/A'}</span>

            <span style={{ color: 'var(--text-muted)' }}>Phân loại sự cố:</span>
            <span style={{ color: 'var(--text-secondary)' }}>{incident.type}</span>

            <span style={{ color: 'var(--text-muted)' }}>Mức độ nghiêm trọng:</span>
            <div>
              <span className={isCritical ? 'badge badge-offline' : 'badge badge-warning'}>
                {incident.severity === 'Critical' ? 'Khẩn cấp' : (incident.severity === 'Warning' ? 'Cảnh báo' : 'Thông tin')}
              </span>
            </div>

            <span style={{ color: 'var(--text-muted)' }}>Thời điểm bắt đầu:</span>
            <span style={{ fontFamily: 'JetBrains Mono', color: 'var(--text-secondary)' }}>{formatDateTime(incident.start)}</span>

            {/* End / Recovery Time */}
            <span style={{ color: 'var(--text-muted)' }}>Thời điểm kết thúc:</span>
            <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 600, color: incident.status === 'Active' ? 'var(--status-warning)' : 'var(--status-online)' }}>
              {incident.status === 'Active' ? 'Đang diễn ra (Đang xử lý)' : (incident.endTime ? formatDateTime(incident.endTime) : 'Đã xử lý')}
            </span>

            <span style={{ color: 'var(--text-muted)' }}>Thời gian diễn ra:</span>
            <span style={{ fontFamily: 'JetBrains Mono', color: 'var(--text-secondary)' }}>{incident.duration}</span>

            {/* Notification delivery status */}
            <span style={{ color: 'var(--text-muted)' }}>Gửi thông báo:</span>
            <div>
              <span className={incident.notificationStatus === 'Sent' ? 'badge badge-online' : (incident.notificationStatus === 'Failed' ? 'badge badge-offline' : 'badge badge-neutral')}>
                {incident.notificationStatus === 'Sent' ? 'Đã gửi' : (incident.notificationStatus === 'Failed' ? 'Thất bại' : incident.notificationStatus === 'Pending' ? 'Đang chờ' : incident.notificationStatus)}
              </span>
            </div>

            {/* Single lifecycle deduplicated ticket */}
            <span style={{ color: 'var(--text-muted)' }}>Vòng đời sự cố:</span>
            <span style={{ color: 'var(--text-primary)', fontFamily: 'JetBrains Mono', fontSize: '0.75rem' }}>
              {incident.lifecycle || 'Thực thể sự cố được quản lý'}
            </span>
          </div>

          {/* Status History Timeline */}
          {incident.statusHistory && incident.statusHistory.length > 0 && (
            <div>
              <h3 style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <History size={14} /> Nhật Ký Chuyển Đổi Trạng Thái
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {incident.statusHistory.map((h, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.65rem',
                      padding: '0.6rem 0.85rem',
                      borderRadius: '0.5rem',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-card)'
                    }}
                  >
                    <div style={{ marginTop: '0.2rem' }}>
                      <CheckCircle2 size={14} style={{ color: 'var(--brand-600)' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: '0.78rem', color: 'var(--text-primary)' }}>{h.status === 'Active' ? 'Đang mở' : (h.status === 'Resolved' ? 'Đã xử lý' : h.status)}</strong>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>{h.time}</span>
                      </div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{h.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Raw Diagnostic Log */}
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.45rem' }}>
              <Terminal size={13} /> Dữ Liệu Chẩn Đoán Gốc & Tải Tin Sự Cố
            </span>
            <div
              style={{
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border-color)',
                borderRadius: '0.5rem',
                padding: '0.75rem 1rem',
                fontFamily: 'JetBrains Mono',
                fontSize: '0.75rem',
                color: 'var(--text-primary)',
                lineHeight: 1.5
              }}
            >
              {incident.desc}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.75rem',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'var(--bg-subtle)'
          }}
        >
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
            Mã sự kiện: {incident.id}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {onUpdateIncidentStatus ? (
              <button
                onClick={() => {
                  const nextStatus = incident.status === 'Active' ? 'Resolved' : 'Active';
                  onUpdateIncidentStatus(incident.id, nextStatus);
                }}
                className="btn btn-secondary btn-sm"
                style={{
                  backgroundColor: incident.status === 'Active' ? 'var(--status-online-bg)' : 'var(--status-warning-bg)',
                  borderColor: incident.status === 'Active' ? 'var(--status-online-border)' : 'var(--status-warning-border)',
                  color: incident.status === 'Active' ? 'var(--status-online)' : 'var(--status-warning)',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                {incident.status === 'Active' ? (
                  <>
                    <CheckCircle2 size={14} />
                    Chuyển sang "Đã xử lý"
                  </>
                ) : (
                  <>
                    <Clock size={14} />
                    Mở lại "Đang xử lý"
                  </>
                )}
              </button>
            ) : (
              incident.status === 'Active' && onResolveIncident && (
                <button
                  onClick={() => onResolveIncident(incident.id)}
                  className="btn btn-secondary btn-sm"
                  style={{
                    backgroundColor: 'var(--status-online-bg)',
                    borderColor: 'var(--status-online-border)',
                    color: 'var(--status-online)',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <CheckCircle2 size={14} />
                  Đánh dấu Đã xử lý sự cố
                </button>
              )
            )}
            <button onClick={onClose} className="btn btn-secondary btn-sm">
              Đóng (Esc)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

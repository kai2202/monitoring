import React from 'react';
import {
  CheckCircle2,
  Send,
  BellOff,
  Check,
} from 'lucide-react';
import { Incident } from '../../types/printer';
import { resolveDiagnostic } from '../../diagnostics';
import { formatDateTime } from '../../utils/formatDate';

interface IncidentTableProps {
  incidents: Incident[];
  filteredIncidents: Incident[];
  onOpenIncidentModal: (incident: Incident) => void;
  onUpdateIncidentStatus?: (incidentId: string, status: 'Active' | 'Resolved') => void;
}

export const IncidentTable: React.FC<IncidentTableProps> = ({
  incidents,
  filteredIncidents,
  onOpenIncidentModal,
  onUpdateIncidentStatus,
}) => {
  return (
    <div className="data-table-container">
      <table className="data-table">
          <thead>
            <tr>
              <th>Mã Sự Cố</th>
              <th>Thiết Bị (IP)</th>
              <th>Phân Loại</th>
              <th>Chi Tiết Chẩn Đoán (SNMP Trap)</th>
              <th>Mức Độ</th>
              <th>Thời Điểm Phát Hiện</th>
              <th>Thời Điểm Xử Lý</th>
              <th>Thời Gian Gián Đoạn</th>
              <th>Thông Báo</th>
              <th>Trạng Thái</th>
              <th style={{ textAlign: 'right' }}>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredIncidents.length === 0 ? (
              <tr>
                <td colSpan={11} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <CheckCircle2 size={32} style={{ margin: '0 auto 0.5rem auto', color: 'var(--status-online)' }} />
                  {incidents.length === 0 ? (
                    <>
                      <p style={{ fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 0.25rem 0' }}>Chưa ghi nhận sự cố nào từ hệ thống</p>
                      <p style={{ fontSize: '0.75rem', margin: 0 }}>Toàn bộ thiết bị đang hoạt động bình thường hoặc đang chờ Zabbix Trigger / Problem API.</p>
                    </>
                  ) : (
                    <>
                      <p style={{ fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 0.25rem 0' }}>Không có sự cố nào phù hợp</p>
                      <p style={{ fontSize: '0.75rem', margin: 0 }}>Không tìm thấy bản ghi sự cố nào theo bộ lọc hiện tại.</p>
                    </>
                  )}
                </td>
              </tr>
            ) : (
              filteredIncidents.map(inc => {
                const isCrit = inc.severity === 'Critical';
                const isWarn = inc.severity === 'Warning';
                const isActive = inc.status === 'Active';

                return (
                  <tr
                    key={inc.id}
                    onClick={() => onOpenIncidentModal(inc)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, color: 'var(--brand-600)' }}>
                      {inc.id}
                    </td>

                    <td>
                      <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {inc.printer}
                      </span>
                    </td>

                    <td>
                      <span className="badge badge-neutral" style={{ fontSize: '0.68rem' }}>
                        {inc.type}
                      </span>
                    </td>

                    <td style={{ maxWidth: '280px', fontSize: '0.75rem' }}>
                      {(() => {
                        const diag = inc.diagnostic || resolveDiagnostic(inc.desc, inc.printer);
                        return (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                {diag.errorName}
                              </span>
                              <span className="badge badge-neutral" style={{ fontFamily: 'JetBrains Mono', fontSize: '0.65rem' }}>
                                {diag.rawCode}
                              </span>
                              {diag.isIdentified ? (
                                <span className="badge badge-info" style={{ fontSize: '0.62rem', padding: '0.1rem 0.35rem' }}>
                                  {diag.vendor}
                                </span>
                              ) : (
                                <span className="badge badge-neutral" style={{ fontSize: '0.62rem', padding: '0.1rem 0.35rem' }}>
                                  Chưa xác định
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <span>Phân hệ: <strong style={{ color: 'var(--text-secondary)' }}>{diag.subsystem}</strong></span>
                            </div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '260px' }} title={inc.desc}>
                              Gốc: {inc.desc}
                            </div>
                          </div>
                        );
                      })()}
                    </td>

                    <td>
                      <span className={isCrit ? 'badge badge-offline' : (isWarn ? 'badge badge-warning' : 'badge badge-info')}>
                        {inc.severity === 'Critical' ? 'Khẩn cấp' : (inc.severity === 'Warning' ? 'Cảnh báo' : 'Thông tin')}
                      </span>
                    </td>

                    <td style={{ fontFamily: 'JetBrains Mono', fontSize: '0.72rem' }}>
                      {formatDateTime(inc.start)}
                    </td>

                    <td style={{ fontFamily: 'JetBrains Mono', fontSize: '0.72rem', color: isActive ? 'var(--status-warning)' : 'var(--status-online)' }}>
                      {inc.endTime ? formatDateTime(inc.endTime) : 'Đang diễn ra'}
                    </td>

                    <td style={{ fontFamily: 'JetBrains Mono', fontSize: '0.72rem', fontWeight: 600 }}>
                      {inc.duration}
                    </td>

                    <td>
                      <span style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.3rem', color: inc.notificationStatus === 'Sent' ? 'var(--status-online)' : (inc.notificationStatus === 'Failed' ? 'var(--status-offline)' : 'var(--text-muted)') }}>
                        {inc.notificationStatus === 'Sent' && <Send size={11} />}
                        {inc.notificationStatus === 'Failed' && <BellOff size={11} />}
                        {inc.notificationStatus === 'Sent' ? 'Đã gửi' : (inc.notificationStatus === 'Failed' ? 'Thất bại' : (inc.notificationStatus === 'Pending' ? 'Đang chờ' : inc.notificationStatus))}
                      </span>
                    </td>

                    <td>
                      <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
                        <select
                          value={inc.status}
                          onChange={(e) => {
                            const newStatus = e.target.value as 'Active' | 'Resolved';
                            if (onUpdateIncidentStatus) {
                              onUpdateIncidentStatus(inc.id, newStatus);
                            }
                          }}
                          style={{
                            cursor: 'pointer',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '6px',
                            fontWeight: 600,
                            fontSize: '0.72rem',
                            outline: 'none',
                            border: isActive ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(16, 185, 129, 0.4)',
                            backgroundColor: isActive ? 'var(--status-warning-bg)' : 'var(--status-online-bg)',
                            color: isActive ? 'var(--status-warning)' : 'var(--status-online)',
                          }}
                          title="Chỉnh thủ công trạng thái (Đang xử lý / Đã xử lý)"
                        >
                          <option value="Active" style={{ backgroundColor: '#1e293b', color: '#f8fafc' }}>
                            Đang xử lý
                          </option>
                          <option value="Resolved" style={{ backgroundColor: '#1e293b', color: '#f8fafc' }}>
                            Đã xử lý
                          </option>
                        </select>
                      </div>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }} onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onOpenIncidentModal(inc)}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}
                        >
                          Chi tiết
                        </button>
                        {onUpdateIncidentStatus && (
                          <button
                            onClick={() => {
                              const nextStatus = inc.status === 'Active' ? 'Resolved' : 'Active';
                              onUpdateIncidentStatus(inc.id, nextStatus);
                            }}
                            className="btn btn-ghost btn-sm"
                            style={{
                              fontSize: '0.7rem',
                              padding: '0.2rem 0.4rem',
                              color: isActive ? 'var(--status-online)' : 'var(--status-warning)'
                            }}
                            title={isActive ? 'Đánh dấu đã giải quyết' : 'Mở lại sự cố'}
                          >
                            <Check size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
    </div>
  );
};

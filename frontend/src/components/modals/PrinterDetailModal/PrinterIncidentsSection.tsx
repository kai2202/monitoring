import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Printer } from '../../../types/printer';
import { resolveDiagnostic } from '../../../diagnostics';

interface PrinterIncidentsSectionProps {
  printer: Printer;
}

export const PrinterIncidentsSection: React.FC<PrinterIncidentsSectionProps> = ({ printer }) => {
  return (
    <div>
      <h3 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--brand-600)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
        <AlertCircle size={15} /> 5. Sự Cố & Cảnh Báo Gần Đây ({printer.incidents.length})
      </h3>
      {printer.incidents.length === 0 ? (
        <div className="card" style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>
          Không ghi nhận sự cố đang mở hoặc lịch sử cảnh báo cho thiết bị này.
        </div>
      ) : (
        <div className="data-table-container">
          <table className="data-table" style={{ fontSize: '0.75rem' }}>
            <thead>
              <tr>
                <th>Mã sự kiện</th>
                <th>Phân loại</th>
                <th>Chi Tiết Chẩn Đoán (SNMP Trap)</th>
                <th>Mức độ</th>
                <th>Thời điểm bắt đầu</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {printer.incidents.map(inc => {
                const incDiag = inc.diagnostic || resolveDiagnostic(inc.desc, printer.mfr, printer.model);
                return (
                  <tr key={inc.id}>
                    <td style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, color: 'var(--brand-600)' }}>
                      {inc.id}
                    </td>
                    <td>
                      <span className="badge badge-neutral" style={{ fontSize: '0.68rem' }}>
                        {inc.type}
                      </span>
                    </td>
                    <td style={{ maxWidth: '280px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.78rem' }}>
                        {incDiag.errorName}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                          Mã gốc: <strong>{incDiag.rawCode}</strong>
                        </span>
                        {incDiag.isIdentified ? (
                          <span className="badge badge-info" style={{ fontSize: '0.6rem', padding: '0.05rem 0.35rem' }}>
                            {incDiag.vendor}
                          </span>
                        ) : (
                          <span className="badge badge-neutral" style={{ fontSize: '0.6rem', padding: '0.05rem 0.35rem' }}>
                            Chưa xác định
                          </span>
                        )}
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                          • {incDiag.subsystem}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={inc.severity === 'Critical' ? 'badge badge-offline' : (inc.severity === 'Warning' ? 'badge badge-warning' : 'badge badge-info')}>
                        {inc.severity === 'Critical' ? 'Khẩn cấp' : (inc.severity === 'Warning' ? 'Cảnh báo' : 'Thông tin')}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'JetBrains Mono' }}>{inc.start}</td>
                    <td>
                      <span className={inc.status === 'Active' ? 'badge badge-warning' : 'badge badge-online'}>
                        {inc.status === 'Active' ? 'Đang mở' : 'Đã xử lý'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

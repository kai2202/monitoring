import React from 'react';
import { ComparisonDeviceKPIs } from '../../../../types/analyticsUI';

interface ComparisonDetailedTableProps {
  devicesKPIs: ComparisonDeviceKPIs[];
}

export const ComparisonDetailedTable: React.FC<ComparisonDetailedTableProps> = ({ devicesKPIs }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div>
        <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
          Bảng Ma Trận Chi Tiết (Detailed Comparison)
        </h3>
        <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
          Đối chiếu 5 nhóm kỹ thuật: Sản xuất, Tốc độ, Độ tin cậy, Khả dụng và Vật tư
        </p>
      </div>

      <div
        style={{
          border: '1px solid var(--border-color)',
          borderRadius: '14px',
          overflow: 'hidden',
          backgroundColor: 'var(--bg-card)',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '10px 16px', fontWeight: 700, color: 'var(--text-secondary)', width: '32%' }}>
                  Hạng Mục Kỹ Thuật
                </th>
                {devicesKPIs.map((d) => (
                  <th key={d.printerId} style={{ padding: '10px 16px', fontWeight: 800, color: 'var(--text-primary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: d.color, flexShrink: 0 }} />
                      <span>{d.model}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {/* NHÓM 1: PRODUCTION */}
              <tr style={{ backgroundColor: 'rgba(37, 99, 235, 0.05)' }}>
                <td colSpan={devicesKPIs.length + 1} style={{ padding: '8px 16px', fontWeight: 800, color: '#2563eb', fontSize: '11px', textTransform: 'uppercase' }}>
                  1. Sản Xuất &amp; Tải In (Production)
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '9px 16px', color: 'var(--text-secondary)' }}>Tổng sản lượng (trang)</td>
                {devicesKPIs.map((d) => (
                  <td key={d.printerId} style={{ padding: '9px 16px', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: 'var(--text-primary)' }}>
                    {d.totalPages?.toLocaleString('vi-VN') ?? '—'}
                  </td>
                ))}
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '9px 16px', color: 'var(--text-secondary)' }}>Trang Đơn Sắc (B&amp;W)</td>
                {devicesKPIs.map((d) => (
                  <td key={d.printerId} style={{ padding: '9px 16px', fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-primary)' }}>
                    {d.production.monoPages?.toLocaleString('vi-VN') ?? '—'}
                  </td>
                ))}
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '9px 16px', color: 'var(--text-secondary)' }}>Trang In Màu (Color)</td>
                {devicesKPIs.map((d) => (
                  <td key={d.printerId} style={{ padding: '9px 16px', fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-primary)' }}>
                    {d.production.colorPages?.toLocaleString('vi-VN') ?? '—'}
                  </td>
                ))}
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '9px 16px', color: 'var(--text-secondary)' }}>Tỷ lệ In Màu (%)</td>
                {devicesKPIs.map((d) => (
                  <td key={d.printerId} style={{ padding: '9px 16px', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: '#4f46e5' }}>
                    {d.production.colorRatioPercent !== null ? `${d.production.colorRatioPercent}%` : '—'}
                  </td>
                ))}
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '9px 16px', color: 'var(--text-secondary)' }}>Trung bình / ngày (trang)</td>
                {devicesKPIs.map((d) => (
                  <td key={d.printerId} style={{ padding: '9px 16px', fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-primary)' }}>
                    {d.production.avgDailyPages?.toLocaleString('vi-VN') ?? '—'}
                  </td>
                ))}
              </tr>

              {/* NHÓM 2: SPEED */}
              <tr style={{ backgroundColor: 'rgba(6, 182, 212, 0.05)' }}>
                <td colSpan={devicesKPIs.length + 1} style={{ padding: '8px 16px', fontWeight: 800, color: '#0891b2', fontSize: '11px', textTransform: 'uppercase' }}>
                  2. Tốc Độ Vận Hành (Speed)
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '9px 16px', color: 'var(--text-secondary)' }}>Tốc độ danh định (PPM)</td>
                {devicesKPIs.map((d) => (
                  <td key={d.printerId} style={{ padding: '9px 16px', fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-primary)' }}>
                    {d.ppmNominal ?? '—'} PPM
                  </td>
                ))}
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '9px 16px', color: 'var(--text-secondary)' }}>Tốc độ thực tế (PPM)</td>
                {devicesKPIs.map((d) => (
                  <td key={d.printerId} style={{ padding: '9px 16px', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: '#0284c7' }}>
                    {d.ppmActual ?? '—'} PPM
                  </td>
                ))}
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '9px 16px', color: 'var(--text-secondary)' }}>Thời gian ra trang đầu (FPOT)</td>
                {devicesKPIs.map((d) => (
                  <td key={d.printerId} style={{ padding: '9px 16px', fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-primary)' }}>
                    {d.speed.firstPageOutSeconds !== null ? `${d.speed.firstPageOutSeconds}s` : '—'}
                  </td>
                ))}
              </tr>

              {/* NHÓM 3: RELIABILITY */}
              <tr style={{ backgroundColor: 'rgba(234, 88, 12, 0.05)' }}>
                <td colSpan={devicesKPIs.length + 1} style={{ padding: '8px 16px', fontWeight: 800, color: '#ea580c', fontSize: '11px', textTransform: 'uppercase' }}>
                  3. Độ Tin Cậy &amp; Sự Cố (Reliability)
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '9px 16px', color: 'var(--text-secondary)' }}>MTBF (Thời gian giữa 2 lỗi)</td>
                {devicesKPIs.map((d) => (
                  <td key={d.printerId} style={{ padding: '9px 16px', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: 'var(--text-primary)' }}>
                    {d.mtbfHours !== null ? `${d.mtbfHours} giờ` : '—'}
                  </td>
                ))}
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '9px 16px', color: 'var(--text-secondary)' }}>MTTR (Thời gian phục hồi lỗi)</td>
                {devicesKPIs.map((d) => (
                  <td key={d.printerId} style={{ padding: '9px 16px', fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-primary)' }}>
                    {d.reliability.mttrHours !== null ? `${d.reliability.mttrHours} giờ` : '—'}
                  </td>
                ))}
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '9px 16px', color: 'var(--text-secondary)' }}>Số lần lỗi phần cứng</td>
                {devicesKPIs.map((d) => (
                  <td key={d.printerId} style={{ padding: '9px 16px', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: d.failureCount && d.failureCount > 2 ? '#dc2626' : 'var(--text-primary)' }}>
                    {d.failureCount !== null ? `${d.failureCount} lần` : '—'}
                  </td>
                ))}
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '9px 16px', color: 'var(--text-secondary)' }}>Số lần kẹt giấy</td>
                {devicesKPIs.map((d) => (
                  <td key={d.printerId} style={{ padding: '9px 16px', fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-primary)' }}>
                    {d.reliability.paperJamCount !== null ? `${d.reliability.paperJamCount} lần` : '—'}
                  </td>
                ))}
              </tr>

              {/* NHÓM 4: AVAILABILITY */}
              <tr style={{ backgroundColor: 'rgba(22, 163, 74, 0.05)' }}>
                <td colSpan={devicesKPIs.length + 1} style={{ padding: '8px 16px', fontWeight: 800, color: '#16a34a', fontSize: '11px', textTransform: 'uppercase' }}>
                  4. Tính Khả Dụng (Availability)
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '9px 16px', color: 'var(--text-secondary)' }}>Tỷ lệ khả dụng SLA (Uptime)</td>
                {devicesKPIs.map((d) => (
                  <td key={d.printerId} style={{ padding: '9px 16px', fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, color: '#16a34a' }}>
                    {d.uptimePercent !== null ? `${d.uptimePercent}%` : '—'}
                  </td>
                ))}
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '9px 16px', color: 'var(--text-secondary)' }}>Thời gian dừng máy (Downtime)</td>
                {devicesKPIs.map((d) => (
                  <td key={d.printerId} style={{ padding: '9px 16px', fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-primary)' }}>
                    {d.downtimeHours !== null ? `${d.downtimeHours} giờ` : '—'}
                  </td>
                ))}
              </tr>

              {/* NHÓM 5: CONSUMABLES */}
              <tr style={{ backgroundColor: 'rgba(139, 92, 246, 0.05)' }}>
                <td colSpan={devicesKPIs.length + 1} style={{ padding: '8px 16px', fontWeight: 800, color: '#7c3aed', fontSize: '11px', textTransform: 'uppercase' }}>
                  5. Mức Tiêu Hao Vật Tư (Consumables)
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '9px 16px', color: 'var(--text-secondary)' }}>Mực Đen (Black - K)</td>
                {devicesKPIs.map((d) => (
                  <td key={d.printerId} style={{ padding: '9px 16px', fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, color: 'var(--text-primary)' }}>
                    {d.consumables.tonerBlackPercent !== null ? `${d.consumables.tonerBlackPercent}%` : '—'}
                  </td>
                ))}
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '9px 16px', color: 'var(--text-secondary)' }}>Mực Màu (Cyan / Magenta / Yellow)</td>
                {devicesKPIs.map((d) => (
                  <td key={d.printerId} style={{ padding: '9px 16px', fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-secondary)' }}>
                    {d.consumables.tonerCyanPercent !== null
                      ? `${d.consumables.tonerCyanPercent}% C | ${d.consumables.tonerMagentaPercent}% M | ${d.consumables.tonerYellowPercent}% Y`
                      : 'Không hỗ trợ màu (Mono)'}
                  </td>
                ))}
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '9px 16px', color: 'var(--text-secondary)' }}>Tuổi thọ Trống từ (Drum Life)</td>
                {devicesKPIs.map((d) => (
                  <td key={d.printerId} style={{ padding: '9px 16px', fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-primary)' }}>
                    {d.consumables.drumLifePercent !== null ? `${d.consumables.drumLifePercent}%` : '—'}
                  </td>
                ))}
              </tr>
              <tr>
                <td style={{ padding: '9px 16px', color: 'var(--text-secondary)' }}>Hộp mực thải (Waste Toner Box)</td>
                {devicesKPIs.map((d) => (
                  <td key={d.printerId} style={{ padding: '9px 16px' }}>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 700,
                        backgroundColor: d.consumables.wasteTonerBoxStatus === 'OK' ? 'rgba(22, 163, 74, 0.12)' : 'rgba(234, 88, 12, 0.12)',
                        color: d.consumables.wasteTonerBoxStatus === 'OK' ? '#16a34a' : '#ea580c',
                      }}
                    >
                      {d.consumables.wasteTonerBoxStatus}
                    </span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};


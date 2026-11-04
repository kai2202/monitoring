/**
 * Frontend/src/features/analytics/components/sla/SLAIncidentWaveChart.tsx
 *
 * Biểu đồ Đường Sóng Điểm Nóng Bố Cục Side-by-Side (Bento Layout):
 * - Cột Trái (~52%): Sóng Spline nét mảnh 1.75px màu Rose kèm Capsule highlight chuyển động theo tuần.
 * - Cột Phải (~48%): Bảng Chi Tiết Tuần Đang Chọn (MTBF, MTTR, Tỷ lệ lỗi % và Danh sách sự cố cụ thể).
 * - Tương tác 2 chiều: Hover hoặc click tuần trên sóng -> Bảng phải cập nhật chi tiết tức thì.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React, { useState, useMemo } from 'react';
import { FontAwesomeIcon, faTriangleExclamation, faCircleCheck, faClock } from '../../../../shared/icons';
import { SLAComboDataPoint } from '../../../../types/analyticsUI';

interface SLAIncidentWaveChartProps {
  series?: SLAComboDataPoint[];
}

interface IncidentItem {
  time: string;
  desc: string;
  device: string;
  location: string;
  severity: 'critical' | 'warning' | 'normal';
}

const WEEKLY_INCIDENTS_MAP: Record<string, IncidentItem[]> = {
  'Tuần 1': [
    { time: '14:20 T2', desc: 'Kẹt giấy cụm sấy nhiệt (Fuser)', device: 'HP LaserJet M554dn', location: 'Tầng 1 • Kế toán', severity: 'critical' },
    { time: '09:35 T5', desc: 'Lỗi nạp giấy khay 2 (Pick Roller)', device: 'Canon iR C3226i', location: 'Tầng 2 • Marketing', severity: 'warning' },
  ],
  'Tuần 2': [
    { time: '11:15 T3', desc: 'Mực thải gần đầy (Waste Toner 92%)', device: 'Xerox VersaLink C7020', location: 'Tầng 3 • Kỹ thuật', severity: 'warning' },
    { time: '16:40 T6', desc: 'Kẹt giấy khay nạp ADF', device: 'Konica bizhub C360i', location: 'Tầng 4 • Giám đốc', severity: 'warning' },
  ],
  'Tuần 3': [
    { time: '10:05 T4', desc: 'Trống quang học mờ ảnh (Drum life 12%)', device: 'Brother MFC-L8690', location: 'Tầng 5 • Pháp chế', severity: 'warning' },
  ],
  'Tuần 4': [
    { time: '08:50 T2', desc: 'Kẹt giấy cửa hông duplex', device: 'HP LaserJet E82650', location: 'Tầng 1 • Nhân sự', severity: 'warning' },
    { time: '15:10 T5', desc: 'Sensor nhận diện giấy bám bụi', device: 'Canon iR C3226i', location: 'Tầng 2 • Marketing', severity: 'warning' },
  ],
  'Tuần 5': [
    { time: '13:20 T3', desc: 'Cảnh báo nhiệt độ sấy cao tạm thời', device: 'Konica bizhub C360i', location: 'Tầng 4 • Giám đốc', severity: 'warning' },
  ],
  'Tuần 6': [
    { time: '09:40 T2', desc: 'Kẹt giấy khay chính khay 1', device: 'HP LaserJet M554dn', location: 'Tầng 1 • Kế toán', severity: 'warning' },
    { time: '14:50 T4', desc: 'Cần vệ sinh thanh gạt cao su Drum', device: 'Xerox VersaLink C7020', location: 'Tầng 3 • Kỹ thuật', severity: 'warning' },
  ],
  'Tuần 7': [
    { time: 'Toàn tuần', desc: 'Hạm đội vận hành hoàn hảo, không ghi nhận sự cố phần cứng', device: '35/35 Máy Trực Tuyến', location: 'Toàn tòa nhà', severity: 'normal' },
  ],
};

export const SLAIncidentWaveChart: React.FC<SLAIncidentWaveChartProps> = ({
  series = [],
}) => {
  const safeSeries = useMemo(() => {
    if (!series || series.length === 0) {
      return [
        { timeLabel: 'Tuần 1', mtbfHours: 460, mttrMinutes: 44, jamRatePercent: 2.2, totalIncidents: 3 },
        { timeLabel: 'Tuần 2', mtbfHours: 485, mttrMinutes: 39, jamRatePercent: 1.8, totalIncidents: 2 },
        { timeLabel: 'Tuần 3', mtbfHours: 510, mttrMinutes: 32, jamRatePercent: 1.3, totalIncidents: 1 },
        { timeLabel: 'Tuần 4', mtbfHours: 495, mttrMinutes: 36, jamRatePercent: 1.5, totalIncidents: 2 },
        { timeLabel: 'Tuần 5', mtbfHours: 530, mttrMinutes: 28, jamRatePercent: 1.1, totalIncidents: 1 },
        { timeLabel: 'Tuần 6', mtbfHours: 520, mttrMinutes: 35, jamRatePercent: 1.4, totalIncidents: 2 },
        { timeLabel: 'Tuần 7', mtbfHours: 545, mttrMinutes: 26, jamRatePercent: 0.9, totalIncidents: 0 },
      ];
    }
    return series;
  }, [series]);

  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const currentIdx = hoverIdx !== null ? hoverIdx : activeIdx;
  const activePoint = safeSeries[currentIdx] || safeSeries[0];
  const activeIncidents = WEEKLY_INCIDENTS_MAP[activePoint.timeLabel] || WEEKLY_INCIDENTS_MAP['Tuần 1'];

  // SVG Geometry
  const width = 340;
  const height = 180;
  const paddingLeft = 32;
  const paddingRight = 32;
  const paddingTop = 26;
  const paddingBottom = 34;

  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  const mtbfValues = safeSeries.map((s) => s?.mtbfHours || 400);
  const minMtbf = Math.min(...mtbfValues);
  const maxMtbf = Math.max(...mtbfValues);

  const getX = (idx: number) => {
    if (safeSeries.length <= 1) return paddingLeft + chartW / 2;
    return paddingLeft + (idx / (safeSeries.length - 1)) * chartW;
  };

  const getY = (val: number) => {
    const range = maxMtbf - minMtbf || 1;
    const ratio = (val - minMtbf) / range;
    return paddingTop + chartH - ratio * (chartH * 0.7) - chartH * 0.15;
  };

  const splinePath = useMemo(() => {
    if (safeSeries.length < 2) return '';
    const points = safeSeries.map((s, i) => ({ x: getX(i), y: getY(s.mtbfHours) }));

    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  }, [safeSeries, chartW, chartH]);

  const activeX = getX(currentIdx);
  const activeY = getY(activePoint?.mtbfHours || minMtbf);
  const isHighJam = (activePoint?.jamRatePercent || 0) >= 2.0;

  return (
    <div
      style={{
        padding: '22px 24px',
        borderRadius: '24px',
        backgroundColor: 'var(--bg-card, #ffffff)',
        border: '1px solid var(--border-color, #e2e8f0)',
        boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        height: '100%',
      }}
    >
      {/* 1. Header Khối */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#e11d48', boxShadow: '0 0 8px rgba(225, 29, 72, 0.5)' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary, #0f172a)', margin: 0 }}>
            Vận Hành &amp; Điểm Nóng Sự Cố
          </h3>
        </div>
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#e11d48' }}>
          Độ tin cậy liên tục: {minMtbf}-{maxMtbf}h MTBF
        </span>
      </div>

      {/* 2. Bố cục Side-by-Side: Trái (Sóng Spline) + Phải (Chi tiết Tuần & Sự cố) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', alignItems: 'center', flex: 1 }}>
        {/* CỘT TRÁI: SVG Sóng Điểm Nóng Nét Mảnh */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', maxWidth: '340px', height: 'auto', display: 'block', overflow: 'visible' }}>
            <defs>
              <linearGradient id="hotspotGradBento" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#e11d48" stopOpacity="0.22" />
                <stop offset="60%" stopColor="#e11d48" stopOpacity="0.05" />
                <stop offset="100%" stopColor="#e11d48" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <line x1={paddingLeft} y1={paddingTop + chartH * 0.5} x2={width - paddingRight} y2={paddingTop + chartH * 0.5} stroke="var(--border-color, #f1f5f9)" strokeDasharray="4 4" strokeWidth="1" />
            <rect x={activeX - 13} y={activeY - 5} width="26" height={Math.max(12, height - paddingBottom - activeY + 5)} rx="6" ry="6" fill="url(#hotspotGradBento)" style={{ transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)' }} />
            <line x1={activeX} y1={activeY} x2={activeX} y2={paddingTop + chartH} stroke="#e11d48" strokeDasharray="3 3" strokeWidth="1.2" style={{ transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)' }} />
            <path d={splinePath} fill="none" stroke="#e11d48" strokeWidth="1.75" strokeLinecap="round" style={{ filter: 'drop-shadow(0 2px 4px rgba(225, 29, 72, 0.2))' }} />

            {/* Chấm tròn & Nhãn trục X */}
            {safeSeries.map((s, i) => {
              const x = getX(i);
              const isCurrent = i === currentIdx;

              return (
                <g key={s.timeLabel} onClick={() => setActiveIdx(i)} onMouseEnter={() => setHoverIdx(i)} onMouseLeave={() => setHoverIdx(null)} style={{ cursor: 'pointer' }}>
                  <rect x={x - chartW / (safeSeries.length * 2)} y={paddingTop - 10} width={chartW / safeSeries.length} height={chartH + 20} fill="transparent" />
                  {isCurrent && (
                    <circle cx={activeX} cy={activeY} r="5.5" fill="#ffffff" stroke="#e11d48" strokeWidth="3" style={{ transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)' }} />
                  )}
                  <text x={x} y={height - 10} textAnchor="middle" fontSize="11" fontWeight={isCurrent ? 800 : 500} fill={isCurrent ? '#e11d48' : 'var(--text-muted, #94a3b8)'} style={{ transition: 'all 0.18s ease' }}>
                    {s.timeLabel}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* CỘT PHẢI: Bảng Chi Tiết Tuần Đang Chọn & Sự Cố Cụ Thể */}
        <div
          style={{
            padding: '14px 16px',
            borderRadius: '16px',
            backgroundColor: 'var(--bg-subtle, #f8fafc)',
            border: '1px solid var(--border-color, #e2e8f0)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          {/* Header Tuần + Badge Mức Độ */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12.5px', fontWeight: 800, color: 'var(--text-primary, #0f172a)' }}>
              {activePoint.timeLabel} • Phân Tích SLA
            </span>

            <span
              style={{
                fontSize: '10.5px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '9999px',
                backgroundColor: isHighJam ? '#ffe4e6' : '#ecfdf5',
                color: isHighJam ? '#e11d48' : '#059669',
              }}
            >
              {isHighJam ? `Lỗi: ${activePoint.jamRatePercent}%` : `Ổn định: ${activePoint.jamRatePercent}%`}
            </span>
          </div>

          {/* Quick Metrics Grid 4 ô */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div style={{ padding: '6px 8px', borderRadius: '8px', backgroundColor: 'var(--bg-card, #ffffff)', border: '1px solid var(--border-color, #e2e8f0)' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted, #64748b)' }}>Độ Ổn Định MTBF</div>
              <div style={{ fontSize: '14px', fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: '#0f172a' }}>
                {activePoint.mtbfHours} giờ
              </div>
            </div>
            <div style={{ padding: '6px 8px', borderRadius: '8px', backgroundColor: 'var(--bg-card, #ffffff)', border: '1px solid var(--border-color, #e2e8f0)' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted, #64748b)' }}>Khắc Phục MTTR</div>
              <div style={{ fontSize: '14px', fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: '#8b5cf6' }}>
                {activePoint.mttrMinutes} phút
              </div>
            </div>
          </div>

          {/* Sự cố nổi cộm trong tuần */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--text-muted, #64748b)' }}>
              SỰ CỐ NỔI CỘM TRONG TUẦN ({activePoint.totalIncidents} VỤ):
            </div>

            {activeIncidents.map((inc, idx) => (
              <div
                key={idx}
                style={{
                  padding: '6px 8px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-card, #ffffff)',
                  border: inc.severity === 'critical' ? '1px solid #fda4af' : '1px solid var(--border-color, #e2e8f0)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '6px',
                }}
              >
                <FontAwesomeIcon
                  icon={inc.severity === 'normal' ? faCircleCheck : faTriangleExclamation}
                  style={{ fontSize: '11px', color: inc.severity === 'critical' ? '#e11d48' : inc.severity === 'normal' ? '#059669' : '#f59e0b', marginTop: '2px', flexShrink: 0 }}
                />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary, #0f172a)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {inc.desc}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted, #64748b)' }}>
                    {inc.time} • {inc.device} ({inc.location})
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SLAIncidentWaveChart;

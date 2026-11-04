/**
 * Frontend/src/features/analytics/components/sla/SLAIncidentHeatmapMatrix.tsx
 *
 * Ma Trận Nhiệt Điểm Nóng Sự Cố & Vận Hành (Incident Hotspot Matrix Heatmap):
 * - Ma trận nhiệt 5 Khu vực x 7 Tuần trực quan hóa mật độ sự cố hạm đội.
 * - Tương tác 2 chiều: Hover/click bất kỳ ô ma trận nào -> Bảng inspector cập nhật chi tiết tức thì.
 * - Thang đo màu Heatmap chuẩn UX: Xanh (0 vụ) -> Vàng (1 vụ) -> Đỏ (Điểm nóng 2+ vụ).
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React, { useState } from 'react';
import { FontAwesomeIcon, faTriangleExclamation, faCircleCheck, faFire } from '../../../../shared/icons';
import {
  HEATMAP_FLOORS,
  HEATMAP_WEEKS,
  INCIDENT_MATRIX_COUNTS,
  getMatrixCellData,
} from './slaHeatmapData';

export const SLAIncidentHeatmapMatrix: React.FC = () => {
  const [selectedCell, setSelectedCell] = useState<{ floorIdx: number; weekIdx: number }>({
    floorIdx: 0,
    weekIdx: 0,
  });
  const [hoveredCell, setHoveredCell] = useState<{ floorIdx: number; weekIdx: number } | null>(null);

  const activeCell = hoveredCell || selectedCell;
  const currentDetail = getMatrixCellData(activeCell.floorIdx, activeCell.weekIdx);

  // Tính tổng sự cố theo tuần (cột)
  const weekTotals = HEATMAP_WEEKS.map((_, wIdx) =>
    INCIDENT_MATRIX_COUNTS.reduce((sum, row) => sum + (row[wIdx] || 0), 0)
  );

  // Hàm lấy màu sắc và style cho từng ô ma trận
  const getCellVisual = (count: number, isSelected: boolean) => {
    let bg = 'rgba(241, 245, 249, 0.65)';
    let border = 'var(--border-color, #e2e8f0)';
    let text = 'var(--text-muted, #94a3b8)';

    if (count === 1) {
      bg = '#fef3c7';
      border = '#fde68a';
      text = '#b45309';
    } else if (count >= 2) {
      bg = '#ffe4e6';
      border = '#fda4af';
      text = '#e11d48';
    }

    return {
      backgroundColor: bg,
      border: isSelected ? '2px solid #e11d48' : `1px solid ${border}`,
      color: text,
      transform: isSelected ? 'scale(1.08)' : 'scale(1)',
      boxShadow: isSelected ? '0 4px 12px rgba(225, 29, 72, 0.25)' : 'none',
      zIndex: isSelected ? 3 : 1,
    };
  };

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
        boxSizing: 'border-box',
      }}
    >
      {/* 1. Header Khối */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#e11d48', boxShadow: '0 0 8px rgba(225, 29, 72, 0.5)' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary, #0f172a)', margin: 0 }}>
            Điểm nóng sự cố
          </h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <FontAwesomeIcon icon={faFire} style={{ fontSize: '11px', color: '#e11d48' }} />
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#e11d48' }}>
            5 khu vực • 7 tuần
          </span>
        </div>
      </div>

      {/* 2. Bố cục Side-by-Side: Trái (Heatmap Matrix) + Phải (Hotspot Inspector) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '18px', alignItems: 'start', flex: 1 }}>
        {/* CỘT TRÁI: Ma trận Heatmap 5x7 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
          <div style={{ overflowX: 'auto', paddingBottom: '4px' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '5px' }}>
              <thead>
                <tr>
                  <th style={{ width: '70px', padding: '0 4px', textAlign: 'left', fontSize: '10.5px', color: 'var(--text-muted, #94a3b8)', fontWeight: 600 }}>
                    KHU VỰC
                  </th>
                  {HEATMAP_WEEKS.map((w, wIdx) => (
                    <th key={w} style={{ textAlign: 'center', padding: '2px 0', fontSize: '10.5px', fontWeight: 700, color: 'var(--text-muted, #64748b)' }}>
                      T{wIdx + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {HEATMAP_FLOORS.map((floor, fIdx) => (
                  <tr key={floor.id}>
                    {/* Tên khu vực */}
                    <td style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary, #0f172a)', whiteSpace: 'nowrap', paddingRight: '4px' }}>
                      <span title={floor.room}>{floor.shortName}</span>
                    </td>

                    {/* 7 Ô sự cố trong tuần */}
                    {HEATMAP_WEEKS.map((_, wIdx) => {
                      const count = INCIDENT_MATRIX_COUNTS[fIdx]?.[wIdx] ?? 0;
                      const isSelected = activeCell.floorIdx === fIdx && activeCell.weekIdx === wIdx;
                      const visual = getCellVisual(count, isSelected);

                      return (
                        <td key={wIdx} style={{ padding: 0, textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => setSelectedCell({ floorIdx: fIdx, weekIdx: wIdx })}
                            onMouseEnter={() => setHoveredCell({ floorIdx: fIdx, weekIdx: wIdx })}
                            onMouseLeave={() => setHoveredCell(null)}
                            style={{
                              width: '100%',
                              minWidth: '28px',
                              height: '32px',
                              borderRadius: '8px',
                              fontSize: '11px',
                              fontWeight: count > 0 ? 800 : 500,
                              fontFamily: "'JetBrains Mono', monospace",
                              cursor: 'pointer',
                              outline: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.15s ease',
                              ...visual,
                            }}
                            title={`${floor.name} (${floor.room}) • Tuần ${wIdx + 1}: ${count} sự cố`}
                          >
                            {count > 0 ? count : '·'}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* Hàng tổng cộng tuần */}
                <tr>
                  <td style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted, #94a3b8)', paddingTop: '6px' }}>
                    TỔNG
                  </td>
                  {weekTotals.map((tot, idx) => (
                    <td key={idx} style={{ textAlign: 'center', fontSize: '10.5px', fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: tot > 1 ? '#e11d48' : 'var(--text-secondary, #475569)', paddingTop: '6px' }}>
                      {tot}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Thang đo chú thích màu Heatmap */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', borderRadius: '10px', backgroundColor: 'var(--bg-subtle, #f8fafc)', border: '1px solid var(--border-color, #f1f5f9)', fontSize: '10px', color: 'var(--text-muted, #64748b)' }}>
            <span style={{ fontWeight: 700 }}>Mức độ:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: 'rgba(241, 245, 249, 0.9)', border: '1px solid #cbd5e1' }} />
              <span>0 (An toàn)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: '#fef3c7', border: '1px solid #fde68a' }} />
              <span>1 (Cảnh báo)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: '#ffe4e6', border: '1px solid #fda4af' }} />
              <span>≥2 (Điểm nóng)</span>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: Bảng Inspector Chi Tiết Điểm Nóng Đang Chọn */}
        <div style={{ padding: '14px 16px', borderRadius: '16px', backgroundColor: 'var(--bg-subtle, #f8fafc)', border: '1px solid var(--border-color, #e2e8f0)', display: 'flex', flexDirection: 'column', gap: '10px', minHeight: '220px' }}>
          {/* Header ô đang chọn + Badge */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
            <div>
              <div style={{ fontSize: '12.5px', fontWeight: 800, color: 'var(--text-primary, #0f172a)' }}>{currentDetail.floorLabel}</div>
              <div style={{ fontSize: '10.5px', color: 'var(--text-muted, #64748b)' }}>Điểm đo {currentDetail.weekLabel} • Phân tích độ tin cậy</div>
            </div>

            <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '9999px', backgroundColor: currentDetail.incidentCount >= 2 ? '#ffe4e6' : currentDetail.incidentCount === 1 ? '#fef3c7' : '#ecfdf5', color: currentDetail.incidentCount >= 2 ? '#e11d48' : currentDetail.incidentCount === 1 ? '#b45309' : '#059669', flexShrink: 0 }}>
              {currentDetail.incidentCount >= 2 ? 'Điểm nóng' : currentDetail.incidentCount === 1 ? 'Cần theo dõi' : 'An toàn'}
            </span>
          </div>

          {/* Quick Metrics Grid 2 ô */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div style={{ padding: '6px 8px', borderRadius: '8px', backgroundColor: 'var(--bg-card, #ffffff)', border: '1px solid var(--border-color, #e2e8f0)' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted, #64748b)' }}>Độ Ổn Định MTBF</div>
              <div style={{ fontSize: '13.5px', fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: '#0f172a' }}>{currentDetail.mtbfHours} giờ</div>
            </div>
            <div style={{ padding: '6px 8px', borderRadius: '8px', backgroundColor: 'var(--bg-card, #ffffff)', border: '1px solid var(--border-color, #e2e8f0)' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted, #64748b)' }}>Tỷ Lệ Lỗi / Kẹt</div>
              <div style={{ fontSize: '13.5px', fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: currentDetail.jamRatePercent > 1 ? '#e11d48' : '#059669' }}>{currentDetail.jamRatePercent}%</div>
            </div>
          </div>

          {/* Danh sách sự cố chi tiết tại ô */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted, #64748b)' }}>
              CHI TIẾT SỰ CỐ GHI NHẬN ({currentDetail.incidentCount} VỤ):
            </div>

            {currentDetail.incidents.length === 0 ? (
              <div style={{ padding: '12px 10px', borderRadius: '8px', backgroundColor: 'var(--bg-card, #ffffff)', border: '1px solid var(--border-color, #e2e8f0)', display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', fontSize: '11px', fontWeight: 600 }}>
                <FontAwesomeIcon icon={faCircleCheck} style={{ fontSize: '13px' }} />
                <span>Hoạt động hoàn hảo, không có sự cố nào ghi nhận.</span>
              </div>
            ) : (
              currentDetail.incidents.map((inc, idx) => (
                <div key={idx} style={{ padding: '6px 8px', borderRadius: '8px', backgroundColor: 'var(--bg-card, #ffffff)', border: inc.severity === 'critical' ? '1px solid #fda4af' : '1px solid var(--border-color, #e2e8f0)', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                  <FontAwesomeIcon icon={faTriangleExclamation} style={{ fontSize: '11px', color: inc.severity === 'critical' ? '#e11d48' : '#f59e0b', marginTop: '2px', flexShrink: 0 }} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary, #0f172a)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inc.desc}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted, #64748b)' }}>{inc.time} • {inc.device} (MTTR: {inc.mttrMinutes}p)</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SLAIncidentHeatmapMatrix;

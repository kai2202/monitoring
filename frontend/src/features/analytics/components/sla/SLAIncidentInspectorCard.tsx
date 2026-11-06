/**
 * Frontend/src/features/analytics/components/sla/SLAIncidentInspectorCard.tsx
 *
 * Thẻ Chi Tiết Điểm Nóng Sự Cố (SLA Incident Hotspot Inspector):
 * - Hiển thị phân tích độ tin cậy MTBF, tỷ lệ kẹt giấy của ô ma trận được chọn.
 * - Danh sách sự cố chi tiết kèm nút tương tác xử lý / tạo phiếu kỹ thuật tức thì.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React from 'react';
import { toast } from 'sonner';
import {
  FontAwesomeIcon,
  faTriangleExclamation,
  faCircleCheck,
  faWrench,
  faFire,
} from '../../../../shared/icons';
import { MatrixCellData, MatrixCellIncident } from './slaHeatmapData';

interface SLAIncidentInspectorCardProps {
  detail: MatrixCellData;
  onActionIncident?: (incident: MatrixCellIncident) => void;
}

export const SLAIncidentInspectorCard: React.FC<SLAIncidentInspectorCardProps> = ({
  detail,
  onActionIncident,
}) => {
  const handleAction = (inc: MatrixCellIncident) => {
    if (onActionIncident) {
      onActionIncident(inc);
    } else {
      toast.info(`Khởi tạo phiếu kỹ thuật: ${inc.desc}`, {
        description: `Thiết bị: ${inc.device} • Thời gian dự kiến: ${inc.mttrMinutes} phút`,
      });
    }
  };

  const isCriticalHotspot = detail.incidentCount >= 5;
  const isHotspot = detail.incidentCount >= 2 && detail.incidentCount < 5;
  const isWarning = detail.incidentCount === 1;

  const criticalCount = detail.incidents.filter((i) => i.severity === 'critical').length;

  return (
    <div
      style={{
        padding: '14px 16px',
        borderRadius: '16px',
        backgroundColor: 'var(--bg-subtle, #f8fafc)',
        border: isCriticalHotspot ? '1.5px solid #ef4444' : '1px solid var(--border-color, #e2e8f0)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        minHeight: '220px',
      }}
    >
      {/* 1. Header ô đang chọn + Badge */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
        <div>
          <div style={{ fontSize: '12.5px', fontWeight: 800, color: 'var(--text-primary, #0f172a)' }}>
            {detail.floorLabel}
          </div>
          <div style={{ fontSize: '10.5px', color: 'var(--text-muted, #64748b)' }}>
            Điểm đo {detail.weekLabel} • Phân tích độ tin cậy
          </div>
        </div>

        <span
          style={{
            fontSize: '10px',
            fontWeight: 700,
            padding: '3px 9px',
            borderRadius: '9999px',
            backgroundColor: isCriticalHotspot
              ? '#fee2e2'
              : isHotspot
              ? '#ffe4e6'
              : isWarning
              ? '#fef3c7'
              : '#ecfdf5',
            color: isCriticalHotspot
              ? '#991b1b'
              : isHotspot
              ? '#e11d48'
              : isWarning
              ? '#b45309'
              : '#059669',
            border: isCriticalHotspot ? '1px solid #ef4444' : 'none',
            flexShrink: 0,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          {isCriticalHotspot ? (
            <>
              <FontAwesomeIcon icon={faFire} style={{ color: '#ef4444' }} />
              <span>Điểm nóng nghiêm trọng ({detail.incidentCount} vụ)</span>
            </>
          ) : isHotspot ? (
            <>
              <FontAwesomeIcon icon={faFire} style={{ color: '#e11d48' }} />
              <span>Điểm nóng ({detail.incidentCount} vụ)</span>
            </>
          ) : isWarning ? (
            'Cần theo dõi (1 vụ)'
          ) : (
            'An toàn (0 vụ)'
          )}
        </span>
      </div>

      {/* 2. Quick Metrics Grid 2 ô */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <div style={{ padding: '6px 8px', borderRadius: '8px', backgroundColor: 'var(--bg-card, #ffffff)', border: '1px solid var(--border-color, #e2e8f0)' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-muted, #64748b)' }}>Độ Ổn Định MTBF</div>
          <div
            style={{
              fontSize: '13.5px',
              fontWeight: 800,
              fontFamily: "'JetBrains Mono', monospace",
              color: isCriticalHotspot ? '#991b1b' : isHotspot ? '#e11d48' : isWarning ? '#b45309' : '#0f172a',
              marginTop: '2px',
            }}
          >
            {detail.mtbfHours} giờ
          </div>
        </div>
        <div style={{ padding: '6px 8px', borderRadius: '8px', backgroundColor: 'var(--bg-card, #ffffff)', border: '1px solid var(--border-color, #e2e8f0)' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-muted, #64748b)' }}>Tỷ Lệ Lỗi / Kẹt</div>
          <div
            style={{
              fontSize: '13.5px',
              fontWeight: 800,
              fontFamily: "'JetBrains Mono', monospace",
              color: isCriticalHotspot ? '#991b1b' : detail.jamRatePercent > 1 ? '#e11d48' : '#059669',
              marginTop: '2px',
            }}
          >
            {detail.jamRatePercent}%
          </div>
        </div>
      </div>

      {/* 3. Danh sách sự cố chi tiết tại ô */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10px', fontWeight: 700, color: 'var(--text-muted, #64748b)' }}>
          <span>
            CHI TIẾT SỰ CỐ GHI NHẬN ({detail.incidentCount} VỤ)
            {detail.incidents.length > 3 && (
              <span style={{ fontSize: '9.5px', fontWeight: 500, color: 'var(--text-muted, #94a3b8)', marginLeft: '6px' }}>
                (Cuộn để xem hết)
              </span>
            )}
          </span>
          {criticalCount > 0 && (
            <span style={{ color: '#e11d48', fontWeight: 600 }}>{criticalCount} vụ nghiêm trọng</span>
          )}
        </div>

        {detail.incidentCount === 0 ? (
          <div style={{ padding: '12px 10px', borderRadius: '8px', backgroundColor: 'var(--bg-card, #ffffff)', border: '1px solid var(--border-color, #e2e8f0)', display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', fontSize: '11px', fontWeight: 600 }}>
            <FontAwesomeIcon icon={faCircleCheck} style={{ fontSize: '13px' }} />
            <span>Hoạt động hoàn hảo, không có sự cố nào ghi nhận.</span>
          </div>
        ) : detail.incidents.length === 0 ? (
          <div style={{ padding: '12px 10px', borderRadius: '8px', backgroundColor: 'var(--bg-card, #ffffff)', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', gap: '8px', color: '#b45309', fontSize: '11px', fontWeight: 600 }}>
            <FontAwesomeIcon icon={faTriangleExclamation} style={{ fontSize: '13px' }} />
            <span>Ghi nhận {detail.incidentCount} sự cố - đang đồng bộ chi tiết kỹ thuật...</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '185px', overflowY: 'auto', paddingRight: '4px' }}>
            {detail.incidents.map((inc, idx) => (
              <div
                key={idx}
                style={{
                  padding: '6px 8px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-card, #ffffff)',
                  border: inc.severity === 'critical' ? '1px solid #fda4af' : '1px solid var(--border-color, #e2e8f0)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '6px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', minWidth: 0, flex: 1 }}>
                  <FontAwesomeIcon
                    icon={faTriangleExclamation}
                    style={{
                      fontSize: '11px',
                      color: inc.severity === 'critical' ? '#e11d48' : '#f59e0b',
                      marginTop: '2px',
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: 'var(--text-primary, #0f172a)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={inc.desc}
                    >
                      {inc.desc}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted, #64748b)' }}>
                      {inc.time} • {inc.device} (MTTR: {inc.mttrMinutes}p)
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleAction(inc)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color, #e2e8f0)',
                    backgroundColor: 'var(--bg-subtle, #f8fafc)',
                    color: '#2563eb',
                    fontSize: '10px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    transition: 'all 0.15s ease',
                  }}
                  title={`Khởi tạo phiếu kỹ thuật cho ${inc.device}`}
                >
                  <FontAwesomeIcon icon={faWrench} style={{ fontSize: '9px' }} />
                  <span>Xử lý</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SLAIncidentInspectorCard;

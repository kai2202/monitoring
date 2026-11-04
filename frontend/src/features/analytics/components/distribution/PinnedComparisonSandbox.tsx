/**
 * Frontend/src/features/analytics/components/distribution/PinnedComparisonSandbox.tsx
 *
 * Khung So Sánh Riêng (Pinned Comparison Sandbox Bento Dock):
 * - Đặt song song bên cạnh Biểu đồ cột ngang.
 * - Chứa các thanh ngang của các máy được ghim, căn chỉnh CÙNG THANG ĐO (scale).
 * - So sánh trực diện độ dài thanh, độ chênh lệch sản lượng, tỷ lệ Mono/Color, PPM, MTBF.
 * - Nút gỡ ghim trực tiếp và nút mở Modal phân tích sâu 1:1.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React, { useMemo } from 'react';
import {
  FontAwesomeIcon,
  faThumbtack,
  faScaleBalanced,
  faXmark,
  faTrashCan,
  faPlus,
} from '../../../../shared/icons';
import { AnalyticsTimeframe } from '../../../../types/analyticsUI';
import { MOCK_PRINTER_DEFINITIONS } from '../../../../mocks/mockAnalyticsUIData';

export interface PinnedComparisonSandboxProps {
  timeframe: AnalyticsTimeframe;
  pinnedPrinterIds: string[];
  onTogglePinPrinter: (printerId: string) => void;
  onClearAllPinned?: () => void;
  onOpenComparisonModal?: () => void;
  onPinTopPrinters?: () => void;
}

export const PinnedComparisonSandbox: React.FC<PinnedComparisonSandboxProps> = ({
  timeframe,
  pinnedPrinterIds,
  onTogglePinPrinter,
  onClearAllPinned,
  onOpenComparisonModal,
  onPinTopPrinters,
}) => {
  const pinnedDevices = useMemo(() => {
    return pinnedPrinterIds
      .map((id) => MOCK_PRINTER_DEFINITIONS.find((p) => p.id === id))
      .filter((p): p is NonNullable<typeof p> => Boolean(p))
      .map((p) => {
        const arr = timeframe === 'hourly' ? p.baseHourly : timeframe === '7days' ? p.base7Days : p.base30Days;
        const totalVol = arr.reduce((sum, v) => sum + (v || 0), 0);
        const monoVol = Math.round(totalVol * (p.monoRatio ?? 1));
        const colorVol = totalVol - monoVol;
        return {
          ...p,
          totalVol,
          monoVol,
          colorVol,
          monoPercent: totalVol > 0 ? Math.round((monoVol / totalVol) * 100) : 100,
          colorPercent: totalVol > 0 ? Math.round((colorVol / totalVol) * 100) : 0,
        };
      })
      .sort((a, b) => b.totalVol - a.totalVol);
  }, [pinnedPrinterIds, timeframe]);

  const maxPinnedVolume = useMemo(() => {
    if (pinnedDevices.length === 0) return 100;
    return Math.max(...pinnedDevices.map((d) => d.totalVol), 100);
  }, [pinnedDevices]);

  const topDeviceVol = pinnedDevices[0]?.totalVol || 1;

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
      {/* 1. Header Khung Đối Chiếu */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ec4899' }} />
            <h3 style={{ fontSize: '15.5px', fontWeight: 800, color: 'var(--text-primary, #0f172a)', margin: 0 }}>
              Đối chiếu thiết bị
            </h3>
            <span
              style={{
                padding: '1px 8px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                color: '#2563eb',
                fontSize: '11px',
                fontWeight: 700,
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {pinnedDevices.length} máy
            </span>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)', margin: '2px 0 0 0' }}>
            So sánh trực quan theo cùng thang đo
          </p>
        </div>

        {pinnedDevices.length > 0 && onClearAllPinned && (
          <button
            type="button"
            onClick={onClearAllPinned}
            title="Xóa tất cả máy ghim"
            style={{
              padding: '4px 8px',
              borderRadius: '8px',
              border: '1px solid var(--border-color, #e2e8f0)',
              backgroundColor: 'transparent',
              color: 'var(--text-muted, #94a3b8)',
              cursor: 'pointer',
              fontSize: '11px',
            }}
          >
            <FontAwesomeIcon icon={faTrashCan} />
          </button>
        )}
      </div>

      {/* 2. Thân Khung Đối Chiếu */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', minHeight: '220px' }}>
        {pinnedDevices.length === 0 ? (
          <div
            style={{
              flex: 1,
              borderRadius: '16px',
              border: '2px dashed var(--border-color, #cbd5e1)',
              backgroundColor: 'var(--bg-subtle, #f8fafc)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
              textAlign: 'center',
              gap: '10px',
            }}
          >
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: 'rgba(37, 99, 235, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
              <FontAwesomeIcon icon={faScaleBalanced} style={{ fontSize: '18px' }} />
            </div>
            <div>
              <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary, #0f172a)' }}>
                Chưa chọn máy đối chiếu
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)', maxWidth: '280px', marginTop: '2px' }}>
                Bấm biểu tượng <FontAwesomeIcon icon={faThumbtack} style={{ color: '#2563eb' }} /> ở danh sách bên cạnh để so sánh sản lượng.
              </div>
            </div>

            {onPinTopPrinters && (
              <button
                type="button"
                onClick={onPinTopPrinters}
                style={{
                  marginTop: '4px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
                }}
              >
                <FontAwesomeIcon icon={faPlus} />
                <span>Ghim Top 2 máy tải cao</span>
              </button>
            )}
          </div>
        ) : (
          pinnedDevices.map((p, idx) => {
            const barWidthPercent = maxPinnedVolume > 0 ? (p.totalVol / maxPinnedVolume) * 100 : 0;
            const diffWithTop = idx === 0 ? 0 : Math.round(((topDeviceVol - p.totalVol) / topDeviceVol) * 100);

            return (
              <div
                key={p.id}
                style={{
                  padding: '10px 12px',
                  borderRadius: '14px',
                  backgroundColor: 'var(--bg-subtle, #f8fafc)',
                  border: '1px solid var(--border-color, #e2e8f0)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '10.5px', fontWeight: 800, color: idx === 0 ? '#ec4899' : '#2563eb', fontFamily: "'JetBrains Mono', monospace" }}>
                      #{idx + 1}
                    </span>
                    <strong style={{ fontSize: '12px', color: 'var(--text-primary, #0f172a)' }}>{p.name}</strong>
                    <span style={{ fontSize: '10.5px', color: 'var(--text-muted, #64748b)' }}>({p.model})</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {idx > 0 && (
                      <span style={{ fontSize: '10px', color: '#e11d48', backgroundColor: 'rgba(225, 29, 72, 0.08)', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
                        -{diffWithTop}% vs #1
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => onTogglePinPrinter(p.id)}
                      title="Gỡ khỏi đối chiếu"
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted, #94a3b8)', cursor: 'pointer', padding: '2px', fontSize: '11px' }}
                    >
                      <FontAwesomeIcon icon={faXmark} />
                    </button>
                  </div>
                </div>

                {/* Thanh Ngang Cùng Thang Đo */}
                <div style={{ width: '100%', height: '14px', backgroundColor: 'rgba(0, 0, 0, 0.05)', borderRadius: '9999px', overflow: 'hidden', display: 'flex' }}>
                  <div style={{ width: `${(barWidthPercent * p.monoPercent) / 100}%`, height: '100%', backgroundColor: '#2563eb' }} title={`Mono: ${p.monoVol.toLocaleString('vi-VN')} trang`} />
                  <div style={{ width: `${(barWidthPercent * p.colorPercent) / 100}%`, height: '100%', backgroundColor: '#ec4899' }} title={`Color: ${p.colorVol.toLocaleString('vi-VN')} trang`} />
                </div>

                {/* Micro KPI Row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10.5px', color: 'var(--text-muted, #64748b)', flexWrap: 'wrap', gap: '4px' }}>
                  <div>
                    <strong style={{ color: '#0f172a', fontFamily: "'JetBrains Mono', monospace" }}>{p.totalVol.toLocaleString('vi-VN')}</strong>{' '}
                    trang ({p.monoPercent}% M / {p.colorPercent}% C)
                  </div>
                  <div>Tốc độ: <strong>{p.ppmActual}</strong> ppm • MTBF: <strong>{p.mtbfHours}h</strong></div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 3. Nút Kích Hoạt So Sánh Chi Tiết 1:1 */}
      {onOpenComparisonModal && (
        <button
          type="button"
          onClick={onOpenComparisonModal}
          disabled={pinnedDevices.length < 1}
          style={{
            width: '100%',
            padding: '10px 16px',
            borderRadius: '14px',
            backgroundColor: pinnedDevices.length >= 1 ? '#2563eb' : 'var(--bg-subtle, #f1f5f9)',
            color: pinnedDevices.length >= 1 ? '#ffffff' : 'var(--text-muted, #94a3b8)',
            fontWeight: 700,
            fontSize: '12.5px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: pinnedDevices.length >= 1 ? 'pointer' : 'not-allowed',
            border: 'none',
            boxShadow: pinnedDevices.length >= 1 ? '0 4px 12px rgba(37, 99, 235, 0.25)' : 'none',
            transition: 'all 0.15s ease',
          }}
        >
          <FontAwesomeIcon icon={faScaleBalanced} />
          <span>Xem so sánh chi tiết 1:1 →</span>
        </button>
      )}
    </div>
  );
};

export default PinnedComparisonSandbox;

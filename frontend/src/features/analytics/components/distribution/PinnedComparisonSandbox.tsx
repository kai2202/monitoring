/**
 * Frontend/src/features/analytics/components/distribution/PinnedComparisonSandbox.tsx
 *
 * Khung So Sánh Riêng (Pinned Comparison Sandbox Bento Dock):
 * - Đặt song song bên cạnh Biểu đồ cột ngang khi mở đối chiếu.
 * - Căn chỉnh CÙNG THANG ĐO (scale) để so sánh trực diện sản lượng, Mono/Color, PPM, MTBF.
 * - Hỗ trợ gỡ ghim, xoá tất cả, thu gọn khung và mở Modal chi tiết 1:1.
 * - Dữ liệu thiết bị lấy từ nguồn duy nhất (availableDevices prop), loại bỏ mock data.
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
import { DeviceProductionItem } from '../../../../types/api';

export interface PinnedComparisonSandboxProps {
  timeframe: AnalyticsTimeframe;
  pinnedPrinterIds: string[];
  onTogglePinPrinter: (printerId: string) => void;
  onClearAllPinned?: () => void;
  onOpenComparisonModal?: () => void;
  onPinTopPrinters?: () => void;
  onClose?: () => void;
  availableDevices?: DeviceProductionItem[];
}

export const PinnedComparisonSandbox: React.FC<PinnedComparisonSandboxProps> = ({
  timeframe: _timeframe,
  pinnedPrinterIds,
  onTogglePinPrinter,
  onClearAllPinned,
  onOpenComparisonModal,
  onPinTopPrinters,
  onClose,
  availableDevices = [],
}) => {
  const pinnedDevices = useMemo(() => {
    return pinnedPrinterIds
      .map((id) => availableDevices.find((p) => p.id === id))
      .filter((p): p is DeviceProductionItem => Boolean(p))
      .sort((a, b) => b.totalVol - a.totalVol);
  }, [pinnedPrinterIds, availableDevices]);

  const maxPinnedVolume = useMemo(() => {
    if (pinnedDevices.length === 0) return 100;
    return Math.max(...pinnedDevices.map((d) => d.totalVol), 100);
  }, [pinnedDevices]);

  const topDeviceVol = pinnedDevices[0]?.totalVol || 1;

  return (
    <div
      style={{
        padding: '22px 24px', borderRadius: '24px', backgroundColor: 'var(--bg-card, #ffffff)',
        border: '1px solid var(--border-color, #e2e8f0)', boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.04)',
        display: 'flex', flexDirection: 'column', gap: '16px', height: '100%', boxSizing: 'border-box',
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
            <span style={{ padding: '1px 8px', borderRadius: '9999px', backgroundColor: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', fontSize: '11px', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
              {pinnedDevices.length} máy
            </span>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)', margin: '2px 0 0 0' }}>
            So sánh trực quan theo cùng thang đo
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {pinnedDevices.length > 0 && onClearAllPinned && (
            <button
              type="button"
              onClick={onClearAllPinned}
              title="Xóa tất cả máy ghim"
              style={{
                padding: '5px 10px', borderRadius: '8px', border: '1px solid var(--border-color, #e2e8f0)',
                backgroundColor: 'var(--bg-subtle, #f8fafc)', color: '#ef4444', fontSize: '11px',
                fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
              }}
            >
              <FontAwesomeIcon icon={faTrashCan} />
              <span>Xóa hết</span>
            </button>
          )}

          {pinnedDevices.length > 0 && onOpenComparisonModal && (
            <button
              type="button"
              onClick={onOpenComparisonModal}
              title="Mở bảng so sánh chuyên sâu"
              style={{
                padding: '5px 12px', borderRadius: '8px', border: 'none',
                backgroundColor: '#2563eb', color: '#ffffff', fontSize: '11px',
                fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px',
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
              }}
            >
              <FontAwesomeIcon icon={faScaleBalanced} />
              <span>So sánh 1:1</span>
            </button>
          )}

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              title="Thu gọn sàn đối chiếu"
              style={{
                padding: '6px', borderRadius: '8px', border: '1px solid var(--border-color, #e2e8f0)',
                backgroundColor: 'var(--bg-subtle, #f8fafc)', color: 'var(--text-muted, #94a3b8)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <FontAwesomeIcon icon={faXmark} style={{ fontSize: '12px' }} />
            </button>
          )}
        </div>
      </div>

      {/* 2. Danh Sách Thiết Bị Đang Ghim */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, minHeight: '260px', overflowY: 'auto' }}>
        {pinnedDevices.length === 0 ? (
          <div
            style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', padding: '32px 16px', textAlign: 'center',
              border: '2px dashed var(--border-color, #e2e8f0)', borderRadius: '16px', gap: '10px',
            }}
          >
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(37, 99, 235, 0.08)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FontAwesomeIcon icon={faThumbtack} style={{ fontSize: '16px' }} />
            </div>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary, #0f172a)', margin: 0 }}>
                Chưa có máy in nào được ghim
              </p>
              <p style={{ fontSize: '11.5px', color: 'var(--text-muted, #64748b)', margin: '4px 0 0 0', maxWidth: '280px' }}>
                Bấm vào biểu tượng ghim ở danh sách bên cạnh hoặc bấm nút bên dưới để chọn nhanh.
              </p>
            </div>
            {onPinTopPrinters && (
              <button
                type="button"
                onClick={onPinTopPrinters}
                style={{
                  marginTop: '6px', padding: '6px 14px', borderRadius: '9999px',
                  border: '1px solid #2563eb', backgroundColor: 'transparent',
                  color: '#2563eb', fontSize: '11px', fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '5px',
                }}
              >
                <FontAwesomeIcon icon={faPlus} />
                <span>Ghim nhanh Top 2 máy tải cao</span>
              </button>
            )}
          </div>
        ) : (
          pinnedDevices.map((p) => {
            const widthPct = Math.max(4, Math.round((p.totalVol / maxPinnedVolume) * 100));
            const diffWithTop = Math.round(p.totalVol - topDeviceVol);

            return (
              <div
                key={p.id}
                style={{
                  padding: '12px 14px', borderRadius: '14px',
                  backgroundColor: 'var(--bg-subtle, #f8fafc)', border: '1px solid var(--border-color, #e2e8f0)',
                  display: 'flex', flexDirection: 'column', gap: '8px',
                }}
              >
                {/* Hàng 1: Tên & Nút gỡ ghim */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '12.5px', fontWeight: 800, color: 'var(--text-primary, #0f172a)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {p.name}
                      </span>
                      <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '4px', backgroundColor: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', fontWeight: 700 }}>
                        {p.floorName}
                      </span>
                    </div>
                    <p style={{ fontSize: '10.5px', color: 'var(--text-muted, #64748b)', margin: '2px 0 0 0' }}>
                      {p.model} • {p.department}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onTogglePinPrinter(p.id)}
                    title="Gỡ ghim"
                    style={{
                      padding: '4px', border: 'none', background: 'transparent',
                      color: 'var(--text-muted, #94a3b8)', cursor: 'pointer',
                    }}
                  >
                    <FontAwesomeIcon icon={faXmark} style={{ fontSize: '12px' }} />
                  </button>
                </div>

                {/* Hàng 2: Thanh so sánh cùng thang đo */}
                <div>
                  <div style={{ height: '7px', borderRadius: '9999px', backgroundColor: 'var(--border-color, #e2e8f0)', overflow: 'hidden', display: 'flex', width: '100%' }}>
                    <div style={{ width: `${widthPct}%`, height: '100%', borderRadius: '9999px', backgroundColor: '#2563eb', transition: 'width 0.3s ease' }} />
                  </div>
                </div>

                {/* Hàng 3: Số liệu chi tiết Mono/Color & Chênh lệch */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10.5px', color: 'var(--text-secondary, #475569)', fontFamily: "'JetBrains Mono', monospace" }}>
                  <span>
                    Tổng: <strong>{p.totalVol.toLocaleString()}</strong> trang
                  </span>
                  <span>
                    Đen: {p.monoVol.toLocaleString()} • Màu: {p.colorVol.toLocaleString()}
                  </span>
                  {diffWithTop !== 0 && (
                    <span style={{ color: diffWithTop < 0 ? '#ef4444' : '#10b981', fontWeight: 700 }}>
                      {diffWithTop > 0 ? `+${diffWithTop.toLocaleString()}` : diffWithTop.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default PinnedComparisonSandbox;

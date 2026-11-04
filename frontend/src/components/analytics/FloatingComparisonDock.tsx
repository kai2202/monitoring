/**
 * Frontend/src/components/analytics/FloatingComparisonDock.tsx
 *
 * Thanh dock so sánh nổi ở đáy màn hình (Bottom Floating Comparison Dock)
 * Tự động hiện lên khi có ít nhất 1 máy in được ghim so sánh.
 *
 * Tuân thủ AGENTS.md: Giao diện tiếng Việt tự nhiên, tương tác mượt mà.
 */

import React from 'react';
import { FontAwesomeIcon, faScaleBalanced, faXmark, faTrashCan, faArrowRight } from '../../shared/icons';
import { MOCK_PRINTER_DEFINITIONS, DEVICE_PALETTE, MockFleetDeviceDefinition, findAnyFleetDevice } from '../../mocks/mockAnalyticsUIData';

interface FloatingComparisonDockProps {
  pinnedPrinterIds: string[];
  onRemovePinnedPrinter: (printerId: string) => void;
  onClearAllPinned: () => void;
  onOpenComparisonModal: () => void;
}

export const FloatingComparisonDock: React.FC<FloatingComparisonDockProps> = ({
  pinnedPrinterIds,
  onRemovePinnedPrinter,
  onClearAllPinned,
  onOpenComparisonModal,
}) => {
  if (pinnedPrinterIds.length === 0) return null;

  const pinnedDevices = pinnedPrinterIds
    .map((id, index) => {
      const dev = findAnyFleetDevice(id) || MOCK_PRINTER_DEFINITIONS.find((p) => p.id === id);
      return dev ? { ...dev, color: DEVICE_PALETTE[index % DEVICE_PALETTE.length] } : null;
    })
    .filter((d): d is (MockFleetDeviceDefinition & { color: string }) => Boolean(d));

  return (
    <aside
      aria-label="Thanh công cụ so sánh máy in"
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 50,
        width: '90%',
        maxWidth: '780px',
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(10px)',
        color: '#ffffff',
        borderRadius: '16px',
        padding: '10px 18px',
        boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.45)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        boxSizing: 'border-box',
      }}
    >
      {/* Thông tin số máy & Chip tag */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflowX: 'auto', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <span
            style={{
              padding: '4px 6px',
              borderRadius: '6px',
              backgroundColor: 'rgba(37, 99, 235, 0.3)',
              color: '#60a5fa',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <FontAwesomeIcon icon={faScaleBalanced} style={{ fontSize: '13px' }} />
          </span>
          <span style={{ fontSize: '12px', fontWeight: 700, whiteSpace: 'nowrap' }}>
            So sánh ({pinnedDevices.length}):
          </span>
        </div>

        {/* Danh sách chip máy in */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto' }}>
          {pinnedDevices.map((d) => (
            <span
              key={d.id}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 8px',
                borderRadius: '20px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                fontSize: '11px',
                fontWeight: 600,
                color: '#f8fafc',
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: d.color,
                }}
              />
              <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {d.name}
              </span>
              <button
                type="button"
                onClick={() => onRemovePinnedPrinter(d.id)}
                style={{
                  color: 'rgba(255, 255, 255, 0.6)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  background: 'none',
                  border: 'none',
                }}
                title="Gỡ khỏi so sánh"
              >
                <FontAwesomeIcon icon={faXmark} style={{ fontSize: '11px' }} />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Các nút hành động */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <button
          type="button"
          onClick={onClearAllPinned}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '5px 8px',
            fontSize: '11.5px',
            color: 'rgba(255, 255, 255, 0.6)',
            cursor: 'pointer',
            borderRadius: '6px',
            background: 'none',
            border: 'none',
          }}
          title="Xóa tất cả thiết bị đã ghim"
        >
          <FontAwesomeIcon icon={faTrashCan} style={{ fontSize: '12px' }} />
          <span>Xóa hết</span>
        </button>

        <button
          type="button"
          onClick={onOpenComparisonModal}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            fontSize: '12px',
            fontWeight: 700,
            backgroundColor: '#2563eb',
            color: '#ffffff',
            borderRadius: '10px',
            cursor: 'pointer',
            boxShadow: '0 2px 10px rgba(37, 99, 235, 0.4)',
            whiteSpace: 'nowrap',
            border: 'none',
          }}
        >
          <span>So sánh chi tiết</span>
          <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: '12px' }} />
        </button>
      </div>
    </aside>
  );
};

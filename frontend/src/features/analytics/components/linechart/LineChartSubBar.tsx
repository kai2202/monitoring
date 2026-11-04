/**
 * Frontend/src/features/analytics/components/linechart/LineChartSubBar.tsx
 *
 * Thanh Điều Khiển Phụ (Sub-Bar) cho Biểu đồ Xu Hướng:
 * - Chọn tầng (Tất cả, Tầng 1 - 5).
 * - Nút chọn máy in kèm counter số máy active.
 * - Chú giải trực quan: Kỳ hiện tại (#2563eb), Kỳ trước (nét đứt xám), Điểm đỉnh tải (⚡ Đỉnh).
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React from 'react';
import { FontAwesomeIcon, faPrint, faChevronDown } from '../../../../shared/icons';
import { FloorTabId } from '../../../../types/analyticsUI';

interface LineChartSubBarProps {
  activeFloorTab: FloorTabId;
  onSelectFloorTab: (floorId: FloorTabId) => void;
  floorLabel: string;
  activePrintersCount: number;
  totalFloorPrintersCount: number;
  onOpenFilterModal: () => void;
}

export const LineChartSubBar: React.FC<LineChartSubBarProps> = ({
  activeFloorTab,
  onSelectFloorTab,
  floorLabel,
  activePrintersCount,
  totalFloorPrintersCount,
  onOpenFilterModal,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        paddingBottom: '4px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        {/* Floor Tabs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'var(--bg-subtle, #f8fafc)',
            padding: '3px',
            borderRadius: '9999px',
            border: '1px solid var(--border-color, #e2e8f0)',
            gap: '2px',
          }}
        >
          {[
            { id: 'all' as FloorTabId, label: 'Tất cả' },
            { id: 'floor-1' as FloorTabId, label: 'Tầng 1' },
            { id: 'floor-2' as FloorTabId, label: 'Tầng 2' },
            { id: 'floor-3' as FloorTabId, label: 'Tầng 3' },
            { id: 'floor-4' as FloorTabId, label: 'Tầng 4' },
            { id: 'floor-5' as FloorTabId, label: 'Tầng 5' },
          ].map((tab) => {
            const isActive = activeFloorTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectFloorTab(tab.id)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '9999px',
                  fontSize: '12px',
                  fontWeight: isActive ? 700 : 500,
                  backgroundColor: isActive ? 'var(--bg-card, #ffffff)' : 'transparent',
                  color: isActive ? '#2563eb' : 'var(--text-muted, #64748b)',
                  border: 'none',
                  boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Nút mở Modal Chọn Máy In */}
        <button
          type="button"
          onClick={onOpenFilterModal}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '9999px',
            backgroundColor: 'var(--bg-subtle, #f8fafc)',
            border: '1px solid var(--border-color, #e2e8f0)',
            color: 'var(--text-primary, #0f172a)',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <FontAwesomeIcon icon={faPrint} style={{ fontSize: '12px', color: '#2563eb' }} />
          <span>
            Đang xem: <strong>{floorLabel}</strong> ({activePrintersCount}/{totalFloorPrintersCount} máy)
          </span>
          <FontAwesomeIcon icon={faChevronDown} style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)' }} />
        </button>
      </div>

      {/* Chú giải đường vẽ (Legend) chuẩn Phương án 1 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              width: '18px',
              height: '3px',
              backgroundColor: '#2563eb',
              borderRadius: '2px',
            }}
          />
          <span style={{ fontWeight: 600, color: 'var(--text-primary, #0f172a)' }}>Kỳ hiện tại</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              width: '18px',
              borderTop: '2px dashed #94a3b8',
            }}
          />
          <span style={{ fontWeight: 500, color: 'var(--text-muted, #64748b)' }}>Kỳ trước</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              padding: '1px 7px',
              borderRadius: '9999px',
              backgroundColor: '#0f172a',
              color: '#ffffff',
              fontSize: '10px',
              fontWeight: 700,
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            Đỉnh tải
          </span>
        </div>
      </div>
    </div>
  );
};

export default LineChartSubBar;

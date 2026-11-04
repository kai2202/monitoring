/**
 * Frontend/src/features/analytics/components/supplies/SuppliesFilterToolbar.tsx
 *
 * Thanh điều khiển và bộ lọc cho Tab Dự báo vật tư & Linh kiện:
 * - Bộ lọc ngưỡng tồn: Tất cả, Sắp hết (<15%), Cần lưu ý (<25%), Bình thường (≥25%), Mực thải sắp đầy.
 * - Bộ lọc vị trí tầng: Tất cả, Tầng 1..5.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React from 'react';
import { FloorTabId } from '../../../../types/analyticsUI';

export type SuppliesFilterMode = 'all' | 'critical' | 'warning' | 'normal' | 'waste_warning';

interface SuppliesFilterToolbarProps {
  statusFilter: SuppliesFilterMode;
  onStatusFilterChange: (status: SuppliesFilterMode) => void;
  activeFloor: FloorTabId;
  onFloorChange: (floor: FloorTabId) => void;
  criticalCount: number;
  warningCount: number;
  wasteWarningCount?: number;
}

export const SuppliesFilterToolbar: React.FC<SuppliesFilterToolbarProps> = ({
  statusFilter,
  onStatusFilterChange,
  activeFloor,
  onFloorChange,
  criticalCount,
  warningCount,
  wasteWarningCount = 0,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        padding: '14px 20px',
        borderRadius: '20px',
        backgroundColor: 'var(--bg-card, #ffffff)',
        border: '1px solid var(--border-color, #e2e8f0)',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
      }}
    >
      {/* Bộ lọc trạng thái vật tư */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary, #475569)' }}>
          Trạng thái:
        </span>

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
            { id: 'all' as SuppliesFilterMode, label: 'Tất cả' },
            { id: 'critical' as SuppliesFilterMode, label: 'Sắp hết (< 15%)', badge: criticalCount, color: '#ef4444' },
            { id: 'warning' as SuppliesFilterMode, label: 'Lưu ý (< 25%)', badge: warningCount, color: '#f59e0b' },
            { id: 'waste_warning' as SuppliesFilterMode, label: 'Mực thải sắp đầy', badge: wasteWarningCount, color: '#ea580c' },
            { id: 'normal' as SuppliesFilterMode, label: 'Bình thường (≥ 25%)' },
          ].map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onStatusFilterChange(tab.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 12px',
                  borderRadius: '9999px',
                  fontSize: '11.5px',
                  fontWeight: isActive ? 700 : 500,
                  backgroundColor: isActive ? 'var(--bg-card, #ffffff)' : 'transparent',
                  color: isActive ? (tab.color || 'var(--text-primary, #0f172a)') : 'var(--text-muted, #64748b)',
                  border: 'none',
                  boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    style={{
                      padding: '1px 6px',
                      fontSize: '10px',
                      fontWeight: 700,
                      borderRadius: '9999px',
                      backgroundColor: isActive ? tab.color : 'rgba(239, 68, 68, 0.12)',
                      color: isActive ? '#ffffff' : (tab.color || '#ef4444'),
                    }}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bộ lọc vị trí tầng */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary, #475569)' }}>
          Khu vực:
        </span>
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
            { id: 'all' as FloorTabId, label: 'Toàn tòa nhà' },
            { id: 'floor-1' as FloorTabId, label: 'Tầng 1' },
            { id: 'floor-2' as FloorTabId, label: 'Tầng 2' },
            { id: 'floor-3' as FloorTabId, label: 'Tầng 3' },
            { id: 'floor-4' as FloorTabId, label: 'Tầng 4' },
            { id: 'floor-5' as FloorTabId, label: 'Tầng 5' },
          ].map((fl) => {
            const isActive = activeFloor === fl.id;
            return (
              <button
                key={fl.id}
                type="button"
                onClick={() => onFloorChange(fl.id)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '9999px',
                  fontSize: '11.5px',
                  fontWeight: isActive ? 700 : 500,
                  backgroundColor: isActive ? 'var(--bg-card, #ffffff)' : 'transparent',
                  color: isActive ? '#2563eb' : 'var(--text-muted, #64748b)',
                  border: 'none',
                  boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {fl.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

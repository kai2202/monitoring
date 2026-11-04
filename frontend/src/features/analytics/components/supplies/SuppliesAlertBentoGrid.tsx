/**
 * Frontend/src/features/analytics/components/supplies/SuppliesAlertBentoGrid.tsx
 *
 * Khu vực Cảnh báo Khẩn cấp & Dự báo Cạn kiệt (Alert Bento Cards Grid):
 * - Tích hợp SuppliesSummaryBentoCards và danh sách SuppliesAlertCardItem.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React from 'react';
import { ConsumableAlertItem } from '../../../../types/analyticsUI';
import { SuppliesSummaryBentoCards } from './SuppliesSummaryBentoCards';
import { SuppliesAlertCardItem } from './SuppliesAlertCardItem';

interface SuppliesAlertBentoGridProps {
  alerts: ConsumableAlertItem[];
  criticalCount: number;
  warningCount: number;
  soonestEmptyDays: number;
  onSelectAlertToDispatch: (item: ConsumableAlertItem) => void;
}

export const SuppliesAlertBentoGrid: React.FC<SuppliesAlertBentoGridProps> = ({
  alerts,
  criticalCount,
  warningCount,
  soonestEmptyDays,
  onSelectAlertToDispatch,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. TOP SUMMARY BENTO STATS */}
      <SuppliesSummaryBentoCards
        criticalCount={criticalCount}
        warningCount={warningCount}
        soonestEmptyDays={soonestEmptyDays}
      />

      {/* 2. ALERT BENTO CARDS GRID */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: '#ef4444',
                boxShadow: '0 0 8px rgba(239, 68, 68, 0.5)',
              }}
            />
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary, #0f172a)', margin: 0 }}>
              Cảnh Báo Cạn Kiệt Chủ Động (Alert Bento Cards)
            </h3>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted, #64748b)' }}>
            Hiển thị: <strong>{alerts.length}</strong> cảnh báo
          </span>
        </div>

        {alerts.length === 0 ? (
          <div
            style={{
              padding: '36px',
              borderRadius: '20px',
              backgroundColor: 'var(--bg-card, #ffffff)',
              border: '1px solid var(--border-color, #e2e8f0)',
              textAlign: 'center',
              color: 'var(--text-muted, #64748b)',
            }}
          >
            Không có cảnh báo vật tư nào trong bộ lọc hiện tại.
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '16px',
            }}
          >
            {alerts.map((item) => (
              <SuppliesAlertCardItem
                key={item.id}
                item={item}
                onDispatch={onSelectAlertToDispatch}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

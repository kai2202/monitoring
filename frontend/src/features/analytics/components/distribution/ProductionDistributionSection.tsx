/**
 * Frontend/src/features/analytics/components/distribution/ProductionDistributionSection.tsx
 *
 * Khối Phân Bố Sản Lượng & Sàn Đối Chiếu Hạm Đội (Horizontal Bars & Pinned Comparison Sandbox):
 * - Bố cục Side-by-side Bento Grid:
 *   + Cột Trái: ProductionHorizontalBarChart (Cột ngang phân định Mono/Color, nút ghim nhanh 📌).
 *   + Cột Phải: PinnedComparisonSandbox (Sàn đối chiếu cùng thang đo, thẻ KPI so sánh & nút mở Modal 1:1).
 * - Đồng bộ bộ lọc tầng (Tất cả, T1 - T5) và chu kỳ (30 ngày, 7 ngày, 24 giờ).
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React, { useState } from 'react';
import { AnalyticsTimeframe, FloorTabId } from '../../../../types/analyticsUI';
import { MOCK_PRINTER_DEFINITIONS } from '../../../../mocks/mockAnalyticsUIData';
import { ProductionHorizontalBarChart } from './ProductionHorizontalBarChart';
import { PinnedComparisonSandbox } from './PinnedComparisonSandbox';

export interface ProductionDistributionSectionProps {
  timeframe: AnalyticsTimeframe;
  pinnedPrinterIds: string[];
  onTogglePinPrinter: (printerId: string) => void;
  onAddMultiplePinnedPrinters?: (printerIds: string[]) => void;
  onOpenComparisonModal?: () => void;
  onClearAllPinned?: () => void;
}

export const ProductionDistributionSection: React.FC<ProductionDistributionSectionProps> = ({
  timeframe,
  pinnedPrinterIds,
  onTogglePinPrinter,
  onAddMultiplePinnedPrinters,
  onOpenComparisonModal,
  onClearAllPinned,
}) => {
  const [activeFloorTab, setActiveFloorTab] = useState<FloorTabId>('all');

  // Hành động ghim nhanh Top 2 máy có sản lượng cao nhất
  const handlePinTopPrinters = () => {
    const top2 = [...MOCK_PRINTER_DEFINITIONS]
      .sort((a, b) => {
        const arrA =
          timeframe === 'hourly'
            ? a.baseHourly
            : timeframe === '7days'
            ? a.base7Days
            : a.base30Days;
        const arrB =
          timeframe === 'hourly'
            ? b.baseHourly
            : timeframe === '7days'
            ? b.base7Days
            : b.base30Days;
        return (
          arrB.reduce((s, v) => s + (v || 0), 0) - arrA.reduce((s, v) => s + (v || 0), 0)
        );
      })
      .slice(0, 2)
      .map((d) => d.id);

    if (onAddMultiplePinnedPrinters) {
      onAddMultiplePinnedPrinters(top2);
    } else {
      top2.forEach((id) => onTogglePinPrinter(id));
    }
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
        gap: '20px',
        alignItems: 'stretch',
        width: '100%',
      }}
    >
      {/* Cột Trái: Biểu đồ Cột Ngang Sản Lượng Hạm Đội */}
      <div style={{ minWidth: 0, height: '100%' }}>
        <ProductionHorizontalBarChart
          timeframe={timeframe}
          activeFloorTab={activeFloorTab}
          onSelectFloorTab={setActiveFloorTab}
          pinnedPrinterIds={pinnedPrinterIds}
          onTogglePinPrinter={onTogglePinPrinter}
        />
      </div>

      {/* Cột Phải: Sàn Đối Chiếu Trực Quan (Pinned Comparison Sandbox) */}
      <div style={{ minWidth: 0, height: '100%' }}>
        <PinnedComparisonSandbox
          timeframe={timeframe}
          pinnedPrinterIds={pinnedPrinterIds}
          onTogglePinPrinter={onTogglePinPrinter}
          onClearAllPinned={onClearAllPinned}
          onOpenComparisonModal={onOpenComparisonModal}
          onPinTopPrinters={handlePinTopPrinters}
        />
      </div>
    </div>
  );
};

export default ProductionDistributionSection;

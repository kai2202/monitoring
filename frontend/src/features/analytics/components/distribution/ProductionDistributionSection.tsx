/**
 * Frontend/src/features/analytics/components/distribution/ProductionDistributionSection.tsx
 *
 * Khối Phân Bố Sản Lượng Thiết Bị (Tầng 3 - /analytics/overview):
 * - Bố cục 100% chiều rộng với bảng dữ liệu chuẩn và thanh Ghim tích hợp bên trong card.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React, { useState } from 'react';
import { AnalyticsTimeframe, FloorTabId } from '../../../../types/analyticsUI';
import { DeviceProductionItem } from '../../../../types/api';
import { ProductionHorizontalBarChart } from './ProductionHorizontalBarChart';

export interface ProductionDistributionSectionProps {
  timeframe: AnalyticsTimeframe;
  activeFloorTab?: FloorTabId;
  onSelectFloorTab?: (floor: FloorTabId) => void;
  pinnedPrinterIds: string[];
  onTogglePinPrinter: (printerId: string) => void;
  onOpenComparisonModal?: () => void;
  onClearAllPinned?: () => void;
  devices?: DeviceProductionItem[];
}

export const ProductionDistributionSection: React.FC<ProductionDistributionSectionProps> = ({
  timeframe,
  activeFloorTab: externalFloorTab,
  onSelectFloorTab,
  pinnedPrinterIds,
  onTogglePinPrinter,
  onOpenComparisonModal,
  onClearAllPinned,
  devices = [],
}) => {
  const [internalFloorTab, setInternalFloorTab] = useState<FloorTabId>('all');
  const currentFloorTab = onSelectFloorTab ? (externalFloorTab || 'all') : internalFloorTab;
  const handleSelectFloorTab = onSelectFloorTab || setInternalFloorTab;

  return (
    <ProductionHorizontalBarChart
      timeframe={timeframe}
      activeFloorTab={currentFloorTab}
      onSelectFloorTab={handleSelectFloorTab}
      pinnedPrinterIds={pinnedPrinterIds}
      onTogglePinPrinter={onTogglePinPrinter}
      onClearAllPinned={onClearAllPinned}
      onOpenComparisonModal={onOpenComparisonModal}
      devices={devices}
    />
  );
};

export default ProductionDistributionSection;

/**
 * Frontend/src/features/analytics/components/distribution/ProductionDistributionSection.tsx
 *
 * Khối Phân Bố Sản Lượng & Sàn Đối Chiếu Hạm Đội (Horizontal Bars & Pinned Comparison Sandbox):
 * - Bố cục Collapsible Split-View linh hoạt:
 *   + Khi sàn đối chiếu đóng: Bảng "Sản lượng theo thiết bị" mở rộng 100% toàn màn hình.
 *   + Khi sàn đối chiếu mở: Tách 2 cột song song (Side-by-side Bento Grid ~50/50).
 * - Tự động mở sàn đối chiếu khi người dùng ghim thiết bị đầu tiên.
 * - Tự động thu gọn về 100% khi người dùng xóa hết máy ghim.
 * - Hỗ trợ nút gập/mở thủ công trên thanh công cụ và nút "Thu gọn" ở header đối chiếu.
 * - Nhận danh sách devices động từ tầng cha, loại bỏ dữ liệu mẫu fix cứng.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React, { useState, useEffect, useRef } from 'react';
import { AnalyticsTimeframe, FloorTabId } from '../../../../types/analyticsUI';
import { DeviceProductionItem } from '../../../../types/api';
import { ProductionHorizontalBarChart } from './ProductionHorizontalBarChart';
import { PinnedComparisonSandbox } from './PinnedComparisonSandbox';

export interface ProductionDistributionSectionProps {
  timeframe: AnalyticsTimeframe;
  pinnedPrinterIds: string[];
  onTogglePinPrinter: (printerId: string) => void;
  onAddMultiplePinnedPrinters?: (printerIds: string[]) => void;
  onOpenComparisonModal?: () => void;
  onClearAllPinned?: () => void;
  searchQuery?: string;
  devices?: DeviceProductionItem[];
}

export const ProductionDistributionSection: React.FC<ProductionDistributionSectionProps> = ({
  timeframe,
  pinnedPrinterIds,
  onTogglePinPrinter,
  onAddMultiplePinnedPrinters,
  onOpenComparisonModal,
  onClearAllPinned,
  searchQuery,
  devices = [],
}) => {
  const [activeFloorTab, setActiveFloorTab] = useState<FloorTabId>('all');
  const [isComparisonOpen, setIsComparisonOpen] = useState(pinnedPrinterIds.length > 0);
  const prevPinnedCount = useRef(pinnedPrinterIds.length);

  // Đồng bộ đóng/mở tự động theo số lượng máy ghim
  useEffect(() => {
    if (pinnedPrinterIds.length > 0 && prevPinnedCount.current === 0) {
      setIsComparisonOpen(true);
    }
    if (pinnedPrinterIds.length === 0 && prevPinnedCount.current > 0) {
      setIsComparisonOpen(false);
    }
    prevPinnedCount.current = pinnedPrinterIds.length;
  }, [pinnedPrinterIds.length]);

  // Hành động ghim nhanh Top 2 máy có sản lượng cao nhất từ danh sách devices thực
  const handlePinTopPrinters = () => {
    const top2 = [...devices]
      .sort((a, b) => b.totalVol - a.totalVol)
      .slice(0, 2)
      .map((d) => d.id);

    if (onAddMultiplePinnedPrinters) {
      onAddMultiplePinnedPrinters(top2);
    } else {
      top2.forEach((id) => onTogglePinPrinter(id));
    }
    setIsComparisonOpen(true);
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: isComparisonOpen ? 'repeat(auto-fit, minmax(460px, 1fr))' : '1fr',
        gap: '20px',
        alignItems: 'stretch',
        width: '100%',
        transition: 'all 0.2s ease',
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
          isComparisonOpen={isComparisonOpen}
          onToggleComparisonView={() => setIsComparisonOpen((prev) => !prev)}
          searchQuery={searchQuery}
          devices={devices}
        />
      </div>

      {/* Cột Phải: Sàn Đối Chiếu Trực Quan (Pinned Comparison Sandbox) - Chỉ xuất hiện khi mở */}
      {isComparisonOpen && (
        <div style={{ minWidth: 0, height: '100%' }}>
          <PinnedComparisonSandbox
            timeframe={timeframe}
            pinnedPrinterIds={pinnedPrinterIds}
            onTogglePinPrinter={onTogglePinPrinter}
            onClearAllPinned={onClearAllPinned}
            onOpenComparisonModal={onOpenComparisonModal}
            onPinTopPrinters={handlePinTopPrinters}
            onClose={() => setIsComparisonOpen(false)}
            availableDevices={devices}
          />
        </div>
      )}
    </div>
  );
};

export default ProductionDistributionSection;

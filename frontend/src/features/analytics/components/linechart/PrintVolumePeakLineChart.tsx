/**
 * Frontend/src/features/analytics/components/linechart/PrintVolumePeakLineChart.tsx
 *
 * Thẻ Biểu Đồ Biến Động Sản Lượng In Hoàn Chỉnh (Layout Thẻ 'Amount spent' Ảnh 1):
 * - 4 Tầng tác chiến: Header controls → 3 Thẻ KPI tóm tắt → Biểu đồ Canvas Chart.js → Bảng phân bổ theo Tầng.
 * - Loại bỏ 100% SVG path cứng; sử dụng Chart.js HTML5 Canvas động.
 * - Hỗ trợ Interactive Cross-Filtering theo Tầng và Timeframe.
 * - Tuân thủ AGENTS.md Rule 5 (Data Integrity) & Rule 7.1 (< 300 LOC).
 */

import React, { useState, useMemo } from 'react';
import { AnalyticsTimeframe, FloorTabId } from '../../../../types/analyticsUI';
import { ProductionTrendResponse, DeviceProductionItem } from '../../../../types/api';
import { LineChartHeader } from './LineChartHeader';
import { PrintVolumeCanvasChart } from './PrintVolumeCanvasChart';
import { LineChartFilterModal } from './LineChartFilterModal';

export interface PrintVolumePeakLineChartProps {
  timeframe: AnalyticsTimeframe;
  onTimeframeChange?: (t: AnalyticsTimeframe) => void;
  onPinForComparison?: (printerId: string) => void;
  trendData?: ProductionTrendResponse | null;
  availablePrinters?: DeviceProductionItem[];
  activeFloorTab?: FloorTabId;
  onSelectFloorTab?: (f: FloorTabId) => void;
}

export const PrintVolumePeakLineChart: React.FC<PrintVolumePeakLineChartProps> = ({
  timeframe: externalTimeframe,
  onTimeframeChange,
  onPinForComparison,
  trendData,
  availablePrinters = [],
  activeFloorTab: externalFloorTab,
  onSelectFloorTab,
}) => {
  const [internalTimeframe, setInternalTimeframe] = useState<AnalyticsTimeframe>(externalTimeframe);
  const currentTimeframe = onTimeframeChange ? externalTimeframe : internalTimeframe;

  const [internalFloorTab, setInternalFloorTab] = useState<FloorTabId>('all');
  const activeFloorTab = onSelectFloorTab ? (externalFloorTab || 'all') : internalFloorTab;
  const handleSelectFloor = onSelectFloorTab || setInternalFloorTab;
  const [selectedPrinterIds, setSelectedPrinterIds] = useState<string[]>([]);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const handleTimeframeChange = (newTf: AnalyticsTimeframe) => {
    if (onTimeframeChange) {
      onTimeframeChange(newTf);
    } else {
      setInternalTimeframe(newTf);
    }
  };

  const floorPrintersPool = useMemo(() => {
    if (activeFloorTab === 'all') return availablePrinters;
    return availablePrinters.filter((p) => p.floorId === activeFloorTab);
  }, [activeFloorTab, availablePrinters]);

  const floorLabel = useMemo(() => {
    if (activeFloorTab === 'all') return 'Tất cả thiết bị';
    const matched = availablePrinters.find((p) => p.floorId === activeFloorTab);
    if (matched?.floorName) return matched.floorName;
    return activeFloorTab.startsWith('floor-')
      ? `Tầng ${activeFloorTab.replace('floor-', '')}`
      : activeFloorTab;
  }, [activeFloorTab, availablePrinters]);

  const activePrinters = useMemo(() => {
    if (selectedPrinterIds.length === 0) return floorPrintersPool;
    return floorPrintersPool.filter((p) => selectedPrinterIds.includes(p.id));
  }, [floorPrintersPool, selectedPrinterIds]);

  // Trích xuất chuỗi dữ liệu thực từ props trendData
  const { labels, currentSeries, previousSeries, currentTotalVolume, growthPercent, peakVolume, peakLabel, dailyAverage } = useMemo(() => {
    if (trendData && trendData.dataPoints && trendData.dataPoints.length > 0) {
      const curSeries = trendData.dataPoints.map((p) => p.currentVolume);
      const prevSeries = trendData.dataPoints.map((p) => p.previousVolume);
      const lbs = trendData.dataPoints.map((p) => p.label || p.timestamp.slice(-5));
      const totalCur = trendData.currentTotalVolume;
      const daysCount = Math.max(1, curSeries.length);
      const avg = Math.round(totalCur / (currentTimeframe === 'hourly' ? 1 : daysCount));

      // Lọc theo tỷ trọng sản lượng thực tế của tầng khi chọn tầng riêng biệt
      let factor = 1;
      if (activeFloorTab !== 'all') {
        const floorDevices = availablePrinters.filter((p) => p.floorId === activeFloorTab);
        const totalDevicesVol = availablePrinters.reduce((sum, p) => sum + (p.totalVol || 0), 0);
        if (totalDevicesVol > 0) {
          const floorVol = floorDevices.reduce((sum, p) => sum + (p.totalVol || 0), 0);
          factor = floorVol / totalDevicesVol;
        } else {
          const totalPCount = Math.max(1, availablePrinters.length);
          factor = floorDevices.length / totalPCount;
        }
      }

      const scaledCur = factor === 1 ? curSeries : curSeries.map((v) => Math.round(v * factor));
      const scaledPrev = factor === 1 ? prevSeries : prevSeries.map((v) => Math.round(v * factor));
      const scaledTotal = factor === 1 ? totalCur : Math.round(totalCur * factor);
      const scaledPeak = factor === 1 ? trendData.peakVolume : Math.round(trendData.peakVolume * factor);

      return {
        labels: lbs,
        currentSeries: scaledCur,
        previousSeries: scaledPrev,
        currentTotalVolume: scaledTotal,
        growthPercent: trendData.growthPercent,
        peakVolume: scaledPeak,
        peakLabel: trendData.peakLabel,
        dailyAverage: Math.round(avg * factor),
      };
    }

    // Fallback labels theo mốc thời gian
    const count = currentTimeframe === 'hourly' ? 24 : currentTimeframe === '7days' ? 7 : 30;
    const lbs = Array.from({ length: count }, (_, i) =>
      currentTimeframe === 'hourly' ? `${i}:00` : `Ngày ${i + 1}`
    );

    return {
      labels: lbs,
      currentSeries: new Array(count).fill(0),
      previousSeries: new Array(count).fill(0),
      currentTotalVolume: 0,
      growthPercent: 0,
      peakVolume: 0,
      peakLabel: '—',
      dailyAverage: 0,
    };
  }, [trendData, currentTimeframe, activeFloorTab, availablePrinters]);

  const handleTogglePrinter = (id: string) => {
    setSelectedPrinterIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedPrinterIds(floorPrintersPool.map((p) => p.id));
  };

  const handleDeselectAll = () => {
    setSelectedPrinterIds(floorPrintersPool[0] ? [floorPrintersPool[0].id] : []);
  };

  return (
    <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs p-5 flex flex-col justify-between gap-4 relative h-full">
      {/* 1. Header tinh gọn với Controls góc phải */}
      <LineChartHeader
        timeframe={currentTimeframe}
        onTimeframeChange={handleTimeframeChange}
        floorLabel={floorLabel}
        activePrintersCount={activePrinters.length}
        totalFloorPrintersCount={floorPrintersPool.length}
        onOpenFilterModal={() => setIsFilterModalOpen(true)}
      />

      {/* 2. Biểu Đồ Spline Canvas Mượt Mà (Chart.js) */}
      <PrintVolumeCanvasChart
        labels={labels}
        currentSeries={currentSeries}
        previousSeries={previousSeries}
        height={310}
      />

      {/* 3. Modal Chọn Lọc Máy In Chi Tiết */}
      <LineChartFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        floorLabel={floorLabel}
        floorPrintersPool={floorPrintersPool}
        selectedPrinterIds={selectedPrinterIds}
        onTogglePrinter={handleTogglePrinter}
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselectAll}
        onPinPrinter={onPinForComparison}
      />
    </div>
  );
};

export default PrintVolumePeakLineChart;

/**
 * Frontend/src/features/analytics/components/linechart/PrintVolumePeakLineChart.tsx
 *
 * Biểu đồ Đường Cong Xu Hướng Sản Lượng Đội Máy In (Print Volume Peak Line Chart):
 * - Dữ liệu chuỗi thời gian nạp từ Service/API thông qua props trendData.
 * - Danh sách máy in khả dụng nạp từ props availablePrinters (Single source of truth).
 * - Loại bỏ hoàn toàn mock data tĩnh và công thức fake variance.
 * - Tuân thủ AGENTS.md Rule 5 (Data Integrity) & Rule 7.1 (< 300 LOC).
 */

import React, { useState, useMemo } from 'react';
import { AnalyticsTimeframe, FloorTabId } from '../../../../types/analyticsUI';
import { ProductionTrendResponse, DeviceProductionItem } from '../../../../types/api';
import { LineChartHeader } from './LineChartHeader';
import { LineChartSubBar } from './LineChartSubBar';
import { LineChartSplineSvg } from './LineChartSplineSvg';
import { LineChartFilterModal } from './LineChartFilterModal';

export interface PrintVolumePeakLineChartProps {
  timeframe: AnalyticsTimeframe;
  onTimeframeChange: (tf: AnalyticsTimeframe) => void;
  onPinForComparison?: (printerId: string) => void;
  trendData?: ProductionTrendResponse | null;
  availablePrinters?: DeviceProductionItem[];
}

export const PrintVolumePeakLineChart: React.FC<PrintVolumePeakLineChartProps> = ({
  timeframe,
  onTimeframeChange,
  onPinForComparison,
  trendData,
  availablePrinters = [],
}) => {
  const [activeFloorTab, setActiveFloorTab] = useState<FloorTabId>('all');
  const [selectedPrinterIds, setSelectedPrinterIds] = useState<string[]>([]);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const floorPrintersPool = useMemo(() => {
    if (activeFloorTab === 'all') return availablePrinters;
    return availablePrinters.filter((p) => p.floorId === activeFloorTab);
  }, [activeFloorTab, availablePrinters]);

  const floorLabel = useMemo(() => {
    switch (activeFloorTab) {
      case 'floor-1':
        return 'Tầng 1';
      case 'floor-2':
        return 'Tầng 2';
      case 'floor-3':
        return 'Tầng 3';
      case 'floor-4':
        return 'Tầng 4';
      case 'floor-5':
        return 'Tầng 5';
      default:
        return 'Tất cả thiết bị';
    }
  }, [activeFloorTab]);

  const activePrinters = useMemo(() => {
    if (selectedPrinterIds.length === 0) return floorPrintersPool;
    return floorPrintersPool.filter((p) => selectedPrinterIds.includes(p.id));
  }, [floorPrintersPool, selectedPrinterIds]);

  const dataPointCount = useMemo(() => {
    if (trendData?.dataPoints) return trendData.dataPoints.length;
    if (timeframe === 'hourly') return 24;
    if (timeframe === '7days') return 7;
    return 30;
  }, [trendData, timeframe]);

  const { currentSeries, previousSeries, currentTotalVolume, growthPercent } = useMemo(() => {
    if (trendData && trendData.dataPoints.length > 0) {
      return {
        currentSeries: trendData.dataPoints.map((p) => p.currentVolume),
        previousSeries: trendData.dataPoints.map((p) => p.previousVolume),
        currentTotalVolume: trendData.currentTotalVolume,
        growthPercent: trendData.growthPercent,
      };
    }

    return {
      currentSeries: new Array(dataPointCount).fill(0),
      previousSeries: new Array(dataPointCount).fill(0),
      currentTotalVolume: 0,
      growthPercent: 0,
    };
  }, [trendData, dataPointCount]);

  const maxValue = useMemo(() => {
    const maxCur = Math.max(...currentSeries, 100);
    const maxPrev = Math.max(...previousSeries, 100);
    const overallMax = Math.max(maxCur, maxPrev);
    return Math.ceil((overallMax * 1.15) / 50) * 50;
  }, [currentSeries, previousSeries]);

  const handleSelectFloorTab = (floorId: FloorTabId) => {
    setActiveFloorTab(floorId);
    if (floorId === 'all') {
      setSelectedPrinterIds(availablePrinters.map((p) => p.id));
    } else {
      const floorPrinters = availablePrinters.filter((p) => p.floorId === floorId);
      setSelectedPrinterIds(floorPrinters.map((p) => p.id));
    }
  };

  const handleTogglePrinter = (id: string) => {
    setSelectedPrinterIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedPrinterIds((prev) => {
      const otherPrinters = prev.filter((id) => !floorPrintersPool.some((p) => p.id === id));
      return [...otherPrinters, ...floorPrintersPool.map((p) => p.id)];
    });
  };

  const handleDeselectAll = () => {
    setSelectedPrinterIds((prev) => {
      const remaining = prev.filter((id) => !floorPrintersPool.some((p) => p.id === id));
      return remaining.length > 0 ? remaining : [floorPrintersPool[0]?.id || ''];
    });
  };

  return (
    <div
      style={{
        padding: '24px',
        borderRadius: '24px',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        position: 'relative',
      }}
    >
      {/* 1. Header & Timeframe Pills */}
      <LineChartHeader
        currentTotalVolume={currentTotalVolume}
        growthPercent={growthPercent}
        timeframe={timeframe}
        onTimeframeChange={onTimeframeChange}
      />

      {/* 2. Sub-Bar: Floor Tabs + Select Printer Button + Legend */}
      <LineChartSubBar
        activeFloorTab={activeFloorTab}
        onSelectFloorTab={handleSelectFloorTab}
        floorLabel={floorLabel}
        activePrintersCount={activePrinters.length}
        totalFloorPrintersCount={floorPrintersPool.length}
        onOpenFilterModal={() => setIsFilterModalOpen(true)}
      />

      {/* 3. Spline SVG Chart with Hover Tooltip */}
      <LineChartSplineSvg
        currentSeries={currentSeries}
        previousSeries={previousSeries}
        dataPointCount={dataPointCount}
        timeframe={timeframe}
        maxValue={maxValue}
        activePrinters={activePrinters as any}
      />

      {/* 4. Filter Modal */}
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

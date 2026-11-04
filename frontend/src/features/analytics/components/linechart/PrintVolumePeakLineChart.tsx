import React, { useState, useMemo } from 'react';
import { AnalyticsTimeframe, FloorTabId } from '../../../../types/analyticsUI';
import { MOCK_PRINTER_DEFINITIONS } from '../../../../mocks/mockAnalyticsUIData';
import { LineChartHeader } from './LineChartHeader';
import { LineChartSubBar } from './LineChartSubBar';
import { LineChartSplineSvg } from './LineChartSplineSvg';
import { LineChartFilterModal } from './LineChartFilterModal';

export interface PrintVolumePeakLineChartProps {
  timeframe: AnalyticsTimeframe;
  onTimeframeChange: (tf: AnalyticsTimeframe) => void;
  onPinForComparison?: (printerId: string) => void;
}

export const PrintVolumePeakLineChart: React.FC<PrintVolumePeakLineChartProps> = ({
  timeframe,
  onTimeframeChange,
  onPinForComparison,
}) => {
  const [activeFloorTab, setActiveFloorTab] = useState<FloorTabId>('all');
  const [selectedPrinterIds, setSelectedPrinterIds] = useState<string[]>(() =>
    MOCK_PRINTER_DEFINITIONS.map((p) => p.id)
  );
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const handleSelectFloorTab = (floorId: FloorTabId) => {
    setActiveFloorTab(floorId);
    if (floorId === 'all') {
      setSelectedPrinterIds(MOCK_PRINTER_DEFINITIONS.map((p) => p.id));
    } else {
      const floorPrinters = MOCK_PRINTER_DEFINITIONS.filter((p) => p.floorId === floorId);
      setSelectedPrinterIds(floorPrinters.map((p) => p.id));
    }
  };

  const floorPrintersPool = useMemo(() => {
    if (activeFloorTab === 'all') return MOCK_PRINTER_DEFINITIONS;
    return MOCK_PRINTER_DEFINITIONS.filter((p) => p.floorId === activeFloorTab);
  }, [activeFloorTab]);

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
    return floorPrintersPool.filter((p) => selectedPrinterIds.includes(p.id));
  }, [floorPrintersPool, selectedPrinterIds]);

  const dataPointCount = useMemo(() => {
    if (timeframe === 'hourly') return 24;
    if (timeframe === '7days') return 7;
    return 30;
  }, [timeframe]);

  const { currentSeries, previousSeries, currentTotalVolume, growthPercent } = useMemo(() => {
    const current: number[] = [];
    const previous: number[] = [];

    for (let i = 0; i < dataPointCount; i++) {
      const curSum = activePrinters.reduce((sum, p) => {
        const arr =
          timeframe === 'hourly'
            ? p.baseHourly
            : timeframe === '7days'
            ? p.base7Days
            : p.base30Days;
        return sum + (arr[i] || 0);
      }, 0);

      current.push(curSum);
      const variance = 0.85 + (((i * 7 + 3) % 10) / 100);
      const prevSum = Math.round(curSum * variance);
      previous.push(prevSum);
    }

    const curTotal = current.reduce((a, b) => a + b, 0);
    const prevTotal = previous.reduce((a, b) => a + b, 0);
    const growth = prevTotal > 0 ? Number((((curTotal - prevTotal) / prevTotal) * 100).toFixed(1)) : 0;

    return {
      currentSeries: current,
      previousSeries: previous,
      currentTotalVolume: curTotal,
      growthPercent: growth,
    };
  }, [activePrinters, timeframe, dataPointCount]);

  const maxValue = useMemo(() => {
    const maxCur = Math.max(...currentSeries, 100);
    const maxPrev = Math.max(...previousSeries, 100);
    const overallMax = Math.max(maxCur, maxPrev);
    return Math.ceil((overallMax * 1.15) / 50) * 50;
  }, [currentSeries, previousSeries]);

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
      return remaining.length > 0 ? remaining : [floorPrintersPool[0]?.id || MOCK_PRINTER_DEFINITIONS[0].id];
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
        activePrinters={activePrinters}
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


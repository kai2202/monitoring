import React, { useMemo } from 'react';
import { AnalyticsTimeframe, FloorSummaryItem } from '../../../../types/analyticsUI';
import { MOCK_PRINTER_DEFINITIONS } from '../../../../mocks/mockAnalyticsUIData';
import { AnalyticsBannerSearchPins } from './AnalyticsBannerSearchPins';
import { AnalyticsBannerVolumeCard } from './AnalyticsBannerVolumeCard';
import { AnalyticsBannerPerformanceTable } from './AnalyticsBannerPerformanceTable';

export interface AnalyticsHeaderBannerProps {
  timeframe: AnalyticsTimeframe;
  onTimeframeChange: (tf: AnalyticsTimeframe) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  pinnedPrinterIds: string[];
  onRemovePinnedPrinter: (id: string) => void;
  onAddPinnedPrinter: (id: string) => void;
  onOpenComparisonModal: () => void;
  floorSummaries: FloorSummaryItem[];
  totalFleetVolume: number;
}

export const AnalyticsHeaderBanner: React.FC<AnalyticsHeaderBannerProps> = ({
  timeframe,
  onTimeframeChange,
  searchQuery,
  onSearchChange,
  pinnedPrinterIds,
  onRemovePinnedPrinter,
  onAddPinnedPrinter,
  onOpenComparisonModal,
  floorSummaries,
  totalFleetVolume,
}) => {
  const topDevices = useMemo(() => {
    return [...MOCK_PRINTER_DEFINITIONS]
      .map((d) => {
        const volume =
          timeframe === 'hourly'
            ? d.baseHourly.reduce((a, b) => a + b, 0)
            : timeframe === '7days'
            ? d.base7Days.reduce((a, b) => a + b, 0)
            : d.base30Days.reduce((a, b) => a + b, 0);
        return {
          id: d.id,
          name: d.name,
          brand: d.brand,
          floorName: d.floorName,
          department: d.department,
          timeframeVolume: volume,
        };
      })
      .sort((a, b) => b.timeframeVolume - a.timeframeVolume)
      .slice(0, 5);
  }, [timeframe]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 1. TOP BAR: TÌM KIẾM, GHIM SO SÁNH & CHỌN THỜI GIAN */}
      <AnalyticsBannerSearchPins
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        pinnedPrinterIds={pinnedPrinterIds}
        onRemovePinnedPrinter={onRemovePinnedPrinter}
        onAddPinnedPrinter={onAddPinnedPrinter}
        onOpenComparisonModal={onOpenComparisonModal}
        timeframe={timeframe}
        onTimeframeChange={onTimeframeChange}
      />

      {/* 2. HERO SUMMARY BANNER */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px',
          padding: '24px',
          borderRadius: '20px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)',
          alignItems: 'center',
        }}
      >
        <AnalyticsBannerVolumeCard
          timeframe={timeframe}
          totalFleetVolume={totalFleetVolume}
          floorSummaries={floorSummaries}
        />

        <AnalyticsBannerPerformanceTable topDevices={topDevices} />
      </div>
    </div>
  );
};


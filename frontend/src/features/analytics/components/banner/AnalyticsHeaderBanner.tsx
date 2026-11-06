/**
 * Frontend/src/features/analytics/components/banner/AnalyticsHeaderBanner.tsx
 *
 * Header Banner Phân Tích Sản Lượng & Phân Bổ Tầng:
 * - Tinh gọn: Loại bỏ thanh chọn chi nhánh trùng lặp (đã chuyển lên AnalyticsPageHeader).
 * - Kết nối ô tìm kiếm nhanh và dải ghim đối chiếu thiết bị.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React, { useMemo } from 'react';
import { AnalyticsTimeframe, FloorSummaryItem } from '@/types/analyticsUI';
import { DeviceProductionItem } from '@/types/api';
import { AnalyticsBannerSearchPins } from './AnalyticsBannerSearchPins';
import { AnalyticsBannerVolumeCard } from './AnalyticsBannerVolumeCard';
import { AnalyticsBannerPerformanceTable } from './AnalyticsBannerPerformanceTable';

export interface AnalyticsHeaderBannerProps {
  timeframe: AnalyticsTimeframe;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  pinnedPrinterIds: string[];
  onRemovePinnedPrinter: (id: string) => void;
  onAddPinnedPrinter: (id: string) => void;
  onOpenComparisonModal: () => void;
  floorSummaries: FloorSummaryItem[];
  totalFleetVolume: number;
  devices?: DeviceProductionItem[];
}

export const AnalyticsHeaderBanner: React.FC<AnalyticsHeaderBannerProps> = ({
  timeframe,
  searchQuery,
  onSearchChange,
  pinnedPrinterIds,
  onRemovePinnedPrinter,
  onAddPinnedPrinter,
  onOpenComparisonModal,
  floorSummaries,
  totalFleetVolume,
  devices = [],
}) => {
  const topDevices = useMemo(() => {
    if (!devices || devices.length === 0) return [];
    return [...devices]
      .sort((a, b) => b.totalVol - a.totalVol)
      .slice(0, 5)
      .map((d) => ({
        id: d.id,
        name: d.name,
        brand: d.mfr || 'Ricoh',
        floorName: d.floorName,
        department: d.department,
        timeframeVolume: d.totalVol,
      }));
  }, [devices]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 1. TOP BAR: TÌM KIẾM NHANH & GHIM ĐỐI CHIẾU */}
      <AnalyticsBannerSearchPins
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        pinnedPrinterIds={pinnedPrinterIds}
        onRemovePinnedPrinter={onRemovePinnedPrinter}
        onAddPinnedPrinter={onAddPinnedPrinter}
        onOpenComparisonModal={onOpenComparisonModal}
        availablePrinters={devices}
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

export default AnalyticsHeaderBanner;

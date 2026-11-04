/**
 * Frontend/src/pages/AnalyticsPage.tsx
 *
 * Phân hệ Phân tích & Báo cáo Sản lượng máy in (Fleet Analytics):
 * - Clean architecture, bám sát Rule 7.1.
 * - Tích hợp Redux Comparison Slice & LocalStorage persistence.
 * - Tích hợp AnalyticsHeaderBanner, PrintVolumePeakLineChart, ProductionDistributionSection,
 *   SuppliesForecastingSection, SLACostSection từ features/analytics.
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../app/store';
import {
  togglePinPrinter,
  addPinnedPrinter,
  removePinnedPrinter,
  clearAllPinned,
  setComparisonModalOpen,
} from '../app/slices/comparisonSlice';
import { NavTabId } from '../components/layout/Sidebar';
import { AnalyticsTimeframe, AnalyticsSubTab } from '../types/analyticsUI';
import { MOCK_PRINTER_DEFINITIONS, getMockFloorSummaries } from '../mocks/mockAnalyticsUIData';
import {
  AnalyticsHeaderBanner,
  PrintVolumePeakLineChart,
  ProductionDistributionSection,
  FloatingComparisonDock,
  DeviceComparisonModal,
  SuppliesForecastingSection,
  SLACostSection,
} from '../features/analytics';

export interface AnalyticsPageProps {
  onNavigateModule?: (tab: NavTabId) => void;
  activeSubTab?: AnalyticsSubTab;
  onSubTabChange?: (tab: AnalyticsSubTab) => void;
  onCreateTaskForPrinter?: (printer: any) => void;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({
  onNavigateModule,
  activeSubTab,
  onSubTabChange,
  onCreateTaskForPrinter,
}) => {
  const dispatch = useDispatch();
  const pinnedPrinterIds = useSelector((state: RootState) => state.comparison.pinnedPrinterIds);
  const isComparisonModalOpen = useSelector(
    (state: RootState) => state.comparison.isComparisonModalOpen
  );

  const [internalSubTab, setInternalSubTab] = useState<AnalyticsSubTab>(
    activeSubTab || 'overview'
  );

  useEffect(() => {
    if (activeSubTab) setInternalSubTab(activeSubTab);
  }, [activeSubTab]);

  const currentTab = activeSubTab || internalSubTab;

  const [timeframe, setTimeframe] = useState<AnalyticsTimeframe>('30days');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const totalFleetVolume = useMemo(() => {
    return MOCK_PRINTER_DEFINITIONS.reduce((acc, d) => {
      const vol =
        timeframe === 'hourly'
          ? d.baseHourly.reduce((a, b) => a + b, 0)
          : timeframe === '7days'
          ? d.base7Days.reduce((a, b) => a + b, 0)
          : d.base30Days.reduce((a, b) => a + b, 0);
      return acc + vol;
    }, 0);
  }, [timeframe]);

  const floorSummaries = useMemo(() => getMockFloorSummaries(timeframe), [timeframe]);

  const handleTogglePinPrinter = useCallback(
    (printerId: string) => {
      dispatch(togglePinPrinter(printerId));
    },
    [dispatch]
  );

  const handleAddPinnedPrinter = useCallback(
    (printerId: string) => {
      dispatch(addPinnedPrinter(printerId));
    },
    [dispatch]
  );

  const handleRemovePinnedPrinter = useCallback(
    (printerId: string) => {
      dispatch(removePinnedPrinter(printerId));
    },
    [dispatch]
  );

  const handleClearAllPinned = useCallback(() => {
    dispatch(clearAllPinned());
  }, [dispatch]);

  const handleOpenComparisonModal = useCallback(() => {
    dispatch(setComparisonModalOpen(true));
  }, [dispatch]);

  const handleCloseComparisonModal = useCallback(() => {
    dispatch(setComparisonModalOpen(false));
  }, [dispatch]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '48px', width: '100%', minHeight: '100%' }}>
      {/* Sub-Tab Content */}
      {currentTab === 'overview' && (
        <>
          {/* Header Banner: Tổng sản lượng & Phân bổ 5 tầng */}
          <AnalyticsHeaderBanner
            timeframe={timeframe}
            onTimeframeChange={setTimeframe}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            pinnedPrinterIds={pinnedPrinterIds}
            onAddPinnedPrinter={handleAddPinnedPrinter}
            onRemovePinnedPrinter={handleRemovePinnedPrinter}
            onOpenComparisonModal={handleOpenComparisonModal}
            floorSummaries={floorSummaries}
            totalFleetVolume={totalFleetVolume}
          />

          {/* Line Chart */}
          <PrintVolumePeakLineChart
            timeframe={timeframe}
            onTimeframeChange={setTimeframe}
            onPinForComparison={handleAddPinnedPrinter}
          />

          {/* Phân bổ sản lượng */}
          <ProductionDistributionSection
            timeframe={timeframe}
            pinnedPrinterIds={pinnedPrinterIds}
            onTogglePinPrinter={handleTogglePinPrinter}
            onAddMultiplePinnedPrinters={(ids) => {
              ids.forEach((id) => dispatch(addPinnedPrinter(id)));
            }}
            onOpenComparisonModal={handleOpenComparisonModal}
            onClearAllPinned={handleClearAllPinned}
          />

          {/* Bottom Floating Comparison Dock */}
          <FloatingComparisonDock
            pinnedPrinterIds={pinnedPrinterIds}
            onRemovePinnedPrinter={handleRemovePinnedPrinter}
            onClearAllPinned={handleClearAllPinned}
            onOpenComparisonModal={handleOpenComparisonModal}
          />

          {/* Modal So Sánh Chi Tiết */}
          <DeviceComparisonModal
            isOpen={isComparisonModalOpen}
            onClose={handleCloseComparisonModal}
            selectedPrinterIds={pinnedPrinterIds}
            onAddPrinter={handleAddPinnedPrinter}
            onRemovePrinter={handleRemovePinnedPrinter}
          />
        </>
      )}

      {currentTab === 'supplies' && (
        <SuppliesForecastingSection onCreateTaskForPrinter={onCreateTaskForPrinter} />
      )}

      {currentTab === 'sla-cost' && <SLACostSection />}
    </div>
  );
};

export default AnalyticsPage;

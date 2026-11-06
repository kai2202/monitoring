/**
 * Frontend/src/pages/AnalyticsPage.tsx
 *
 * Phân hệ Phân tích & Báo cáo Sản lượng máy in (Fleet Analytics):
 * - Tích hợp AnalyticsPageHeader chuẩn 2 hàng: Điều hướng Sub-tab trên góc phải.
 * - Single Source of Truth qua hook useAnalyticsData & Redux UI state.
 * - Loại bỏ hoàn toàn mock data và giá trị fix cứng (No mock imports).
 * - Đồng bộ tuyệt đối giữa Bộ lọc Chi nhánh, Khoảng thời gian, Banner, Biểu đồ và Thiết bị.
 * - Tuân thủ AGENTS.md Rule 5 (Data Integrity) & Rule 7.1 (< 300 LOC).
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../app/store';
import {
  togglePinPrinter,
  addPinnedPrinter,
  removePinnedPrinter,
  clearAllPinned,
  setComparisonModalOpen,
} from '../app/slices/comparisonSlice';
import { setSelectedBranch, setSelectedTimeframe } from '../app/slices/uiSlice';
import { NavTabId } from '../components/layout/Sidebar';
import { AnalyticsTimeframe, AnalyticsSubTab } from '../types/analyticsUI';
import { locationService } from '../services';
import { getDynamicFloorSummaries } from '../features/analytics/utils/analyticsFloorHelper';
import { useAnalyticsData } from '../features/analytics/hooks/useAnalyticsData';
import {
  AnalyticsPageHeader,
  AnalyticsHeaderBanner,
} from '../features/analytics/components/banner';
import { PrintVolumePeakLineChart } from '../features/analytics/components/linechart';
import { ProductionDistributionSection } from '../features/analytics/components/distribution';
import { DeviceComparisonModal } from '../features/analytics/components/comparison';
import { SuppliesForecastingSection } from '../features/analytics/components/supplies';
import { SLACostSection } from '../features/analytics/components/sla';
import { exportCostAllocationToCsv } from '../features/analytics/utils/costCsvExport';

export interface AnalyticsPageProps {
  onNavigateModule?: (tab: NavTabId) => void;
  activeSubTab?: AnalyticsSubTab;
  onSubTabChange?: (tab: AnalyticsSubTab) => void;
  onCreateTaskForPrinter?: (printer: any) => void;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({
  activeSubTab,
  onSubTabChange,
  onCreateTaskForPrinter,
}) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const pinnedPrinterIds = useSelector((state: RootState) => state.comparison.pinnedPrinterIds);
  const isComparisonModalOpen = useSelector(
    (state: RootState) => state.comparison.isComparisonModalOpen
  );

  const urlDerivedTab = useMemo<AnalyticsSubTab | undefined>(() => {
    if (location.pathname.includes('/analytics/supplies')) return 'supplies';
    if (location.pathname.includes('/analytics/sla-cost')) return 'sla-cost';
    if (location.pathname.includes('/analytics')) return 'overview';
    return undefined;
  }, [location.pathname]);

  const [internalSubTab, setInternalSubTab] = useState<AnalyticsSubTab>(
    urlDerivedTab || activeSubTab || 'overview'
  );

  useEffect(() => {
    if (urlDerivedTab) {
      setInternalSubTab(urlDerivedTab);
    } else if (activeSubTab) {
      setInternalSubTab(activeSubTab);
    }
  }, [urlDerivedTab, activeSubTab]);

  const currentTab = urlDerivedTab || activeSubTab || internalSubTab;

  const timeframe = useSelector(
    (state: RootState) => state.ui.selectedTimeframe || '30days'
  );
  const [locationVer, setLocationVer] = useState(0);
  useEffect(() => locationService.subscribe(() => setLocationVer((v) => v + 1)), []);
  const branches = useMemo(() => locationService.getBranchNames(), [locationVer]);
  const globalBranch = useSelector((state: RootState) => state.ui.selectedBranch);
  const selectedBranch = globalBranch || (branches.length > 0 ? branches[0] : '');

  const [searchQuery, setSearchQuery] = useState<string>('');

  // Hook nạp dữ liệu thống nhất từ Single Source of Truth
  const { summary, trend, distribution, supplies, slaCost } = useAnalyticsData();

  const handleBranchChange = useCallback(
    (b: string) => {
      dispatch(setSelectedBranch(b));
    },
    [dispatch]
  );

  const handleTimeframeChange = useCallback(
    (tf: AnalyticsTimeframe) => {
      dispatch(setSelectedTimeframe(tf));
    },
    [dispatch]
  );

  const totalFleetVolume = useMemo(() => {
    if (summary?.totalFleetVolume !== undefined && summary.totalFleetVolume !== null) {
      return summary.totalFleetVolume;
    }
    return distribution?.totalFleetVolume ?? 0;
  }, [summary, distribution]);

  const floorSummaries = useMemo(() => {
    if (!selectedBranch) return [];
    return getDynamicFloorSummaries(selectedBranch, distribution?.devices || []);
  }, [selectedBranch, distribution]);

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

  const handleTabSwitch = useCallback(
    (tab: AnalyticsSubTab) => {
      setInternalSubTab(tab);
      const targetPath =
        tab === 'overview' || (tab as string) === 'analytics'
          ? '/analytics/overview'
          : `/analytics/${tab}`;
      navigate(targetPath);
      if (onSubTabChange) onSubTabChange(tab);
    },
    [navigate, onSubTabChange]
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '48px', width: '100%', minHeight: '100%' }}>
      {/* 1. Header Card Chuẩn 2 Hàng */}
      <AnalyticsPageHeader
        currentTab={currentTab}
        onSubTabChange={handleTabSwitch}
        branches={branches}
        selectedBranch={selectedBranch}
        onBranchChange={handleBranchChange}
        timeframe={timeframe}
        onTimeframeChange={handleTimeframeChange}
        suppliesBadgeCount={supplies?.summary?.criticalCount ?? 0}
        onExportCostCsv={() => exportCostAllocationToCsv(slaCost?.departmentCosts || [])}
      />

      {/* 2. Nội dung chi tiết theo từng Sub-tab */}
      {currentTab === 'overview' && (
        <>
          {/* Header Banner: Tổng sản lượng & Phân bổ tầng */}
          <AnalyticsHeaderBanner
            timeframe={timeframe}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            pinnedPrinterIds={pinnedPrinterIds}
            onAddPinnedPrinter={handleAddPinnedPrinter}
            onRemovePinnedPrinter={handleRemovePinnedPrinter}
            onOpenComparisonModal={handleOpenComparisonModal}
            floorSummaries={floorSummaries}
            totalFleetVolume={totalFleetVolume}
            devices={distribution?.devices || []}
          />

          {/* Biểu đồ xu hướng sản lượng */}
          <PrintVolumePeakLineChart
            timeframe={timeframe}
            onTimeframeChange={handleTimeframeChange}
            onPinForComparison={handleAddPinnedPrinter}
            trendData={trend}
            availablePrinters={distribution?.devices}
          />

          {/* Phân bổ sản lượng & Sàn đối chiếu song song (Collapsible Split-View) */}
          <ProductionDistributionSection
            timeframe={timeframe}
            pinnedPrinterIds={pinnedPrinterIds}
            onTogglePinPrinter={handleTogglePinPrinter}
            onAddMultiplePinnedPrinters={(ids) => {
              ids.forEach((id) => dispatch(addPinnedPrinter(id)));
            }}
            onOpenComparisonModal={handleOpenComparisonModal}
            onClearAllPinned={handleClearAllPinned}
            searchQuery={searchQuery}
            devices={distribution?.devices}
          />

          {/* Modal So Sánh Chi Tiết 1:1 */}
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
        <SuppliesForecastingSection
          selectedBranch={selectedBranch}
          onCreateTaskForPrinter={onCreateTaskForPrinter}
          suppliesData={supplies}
        />
      )}

      {currentTab === 'sla-cost' && (
        <SLACostSection
          hideHeader={true}
          slaCostData={slaCost}
        />
      )}
    </div>
  );
};

export default AnalyticsPage;

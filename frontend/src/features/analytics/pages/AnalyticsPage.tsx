/**
 * Frontend/src/features/analytics/pages/AnalyticsPage.tsx
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
import { RootState } from '@/app/store';
import {
  togglePinPrinter,
  addPinnedPrinter,
  removePinnedPrinter,
  clearAllPinned,
  setComparisonModalOpen,
} from '@/app/slices/comparisonSlice';
import { setSelectedBranch, setSelectedTimeframe } from '@/app/slices/uiSlice';
import { NavTabId } from '@/components/layout/Sidebar';
import { FontAwesomeIcon, faRotate, faTriangleExclamation } from '@/shared/icons';
import { AnalyticsTimeframe, AnalyticsSubTab, FloorTabId } from '@/types/analyticsUI';
import { locationService } from '@/services';
import { getDynamicFloorSummaries } from '../utils/analyticsFloorHelper';
import { useAnalyticsData } from '../hooks/useAnalyticsData';
import {
  AnalyticsPageHeader,
  OverviewKpiCards,
  FloorVolumeBreakdownCard,
} from '../components/banner';
import { PrintVolumePeakLineChart } from '../components/linechart';
import { ProductionDistributionSection } from '../components/distribution';
import { DeviceComparisonModal } from '../components/comparison';
import { SLACostSection } from '../components/sla';

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
  const location = useLocation();
  const navigate = useNavigate();
  const pinnedPrinterIds = useSelector((state: RootState) => state.comparison.pinnedPrinterIds);
  const isComparisonModalOpen = useSelector(
    (state: RootState) => state.comparison.isComparisonModalOpen
  );

  const urlDerivedTab = useMemo<AnalyticsSubTab | undefined>(() => {
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
  const [activeFloorTab, setActiveFloorTab] = useState<FloorTabId>('all');
  useEffect(() => locationService.subscribe(() => setLocationVer((v) => v + 1)), []);
  const branches = useMemo(() => locationService.getBranchNames(), [locationVer]);
  const globalBranch = useSelector((state: RootState) => state.ui.selectedBranch);
  const selectedBranch = globalBranch || (branches.length > 0 ? branches[0] : '');

  // Hook nạp dữ liệu thống nhất từ Single Source of Truth
  const { isLoading, error, summary, trend, distribution, supplies, slaCost, refetch } =
    useAnalyticsData();

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

  const suppliesCriticalBadge = useMemo(() => {
    if (!supplies) return 0;
    if (Array.isArray(supplies.alerts)) {
      return supplies.alerts.filter(
        (a) =>
          ['black', 'cyan', 'magenta', 'yellow'].includes(a.itemType) &&
          a.currentPercent < 15
      ).length;
    }
    return supplies.summary?.criticalCount ?? 0;
  }, [supplies]);

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
        suppliesBadgeCount={suppliesCriticalBadge}
      />

      {/* 1.5. Trạng thái Error / Loading */}
      {error && (
        <div className="rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/90 dark:bg-red-950/30 px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5 text-xs text-red-700 dark:text-red-300 font-medium">
            <FontAwesomeIcon icon={faTriangleExclamation} className="text-sm shrink-0" />
            <span>Không thể tải dữ liệu phân tích: {error}</span>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold cursor-pointer hover:bg-red-100/60 transition-colors"
          >
            <FontAwesomeIcon icon={faRotate} className="text-[11px]" />
            <span>Thử lại</span>
          </button>
        </div>
      )}

      {isLoading && !summary && !distribution && !supplies && !slaCost && (
        <div className="flex flex-col gap-4 animate-pulse">
          <div className="h-32 rounded-xl bg-slate-200/70 dark:bg-slate-800/60 w-full" />
          <div className="h-72 rounded-xl bg-slate-200/60 dark:bg-slate-800/50 w-full" />
        </div>
      )}

      {/* 2. Nội dung chi tiết theo từng Sub-tab */}
      <div key={currentTab} className="page-transition flex flex-col gap-5">
        {currentTab === 'overview' && (
          <>
            {/* Tầng 1: 3 Thẻ KPI Tổng quan Sản lượng (100% dữ liệu thực) */}
            <div className="animate-card-in">
              <OverviewKpiCards
                timeframe={timeframe}
                summary={summary}
                trend={trend}
                devices={distribution?.devices}
              />
            </div>

            {/* Tầng 2: Biểu đồ Xu hướng (8 cột) + Cơ cấu Mono/Color & Phân bổ Tầng (4 cột) */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch animate-card-in animate-card-delay-1">
              <div className="xl:col-span-8 min-w-0">
                <PrintVolumePeakLineChart
                  timeframe={timeframe}
                  onTimeframeChange={handleTimeframeChange}
                  onPinForComparison={handleAddPinnedPrinter}
                  trendData={trend}
                  availablePrinters={distribution?.devices}
                  activeFloorTab={activeFloorTab}
                  onSelectFloorTab={setActiveFloorTab}
                />
              </div>
              <div className="xl:col-span-4 min-w-0">
                <FloorVolumeBreakdownCard
                  summary={summary}
                  floorSummaries={floorSummaries}
                  devices={distribution?.devices || []}
                  activeFloorTab={activeFloorTab}
                  onSelectFloorTab={setActiveFloorTab}
                />
              </div>
            </div>

            {/* Tầng 3: Bảng Sản lượng theo thiết bị (100% width) + Thanh ghim so sánh */}
            <div className="animate-card-in animate-card-delay-2">
              <ProductionDistributionSection
                timeframe={timeframe}
                activeFloorTab={activeFloorTab}
                onSelectFloorTab={setActiveFloorTab}
                pinnedPrinterIds={pinnedPrinterIds}
                onTogglePinPrinter={handleTogglePinPrinter}
                onOpenComparisonModal={handleOpenComparisonModal}
                onClearAllPinned={handleClearAllPinned}
                devices={distribution?.devices}
              />
            </div>

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

        {currentTab === 'sla-cost' && (
          <SLACostSection
            hideHeader={true}
            slaCostData={slaCost}
            onOpenTask={(taskId) => {
              navigate(
                taskId ? `/printers/history?taskId=${encodeURIComponent(taskId)}` : '/printers/history'
              );
            }}
          />
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;


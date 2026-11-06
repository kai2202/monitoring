/**
 * Frontend/src/features/analytics/hooks/useAnalyticsData.ts
 *
 * Custom Hook Trung Tâm Quản Lý Dữ Liệu Phân Hệ Analytics (Single Source of Truth):
 * - Tự động đồng bộ theo Redux State (selectedBranch, selectedTimeframe, selectedFloor).
 * - Kết nối qua analyticsService, sẵn sàng nhận dữ liệu REST API từ Backend.
 * - Tuân thủ AGENTS.md Rule 4 & Rule 7.1 (< 300 LOC).
 */

import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../app/store';
import {
  AnalyticsSummaryData,
  ProductionTrendResponse,
  FleetProductionDistributionResponse,
  SuppliesAnalyticsResponse,
  SLACostAnalyticsResponse,
} from '../../../types/api';
import { analyticsService, locationService } from '../../../services';

export interface UseAnalyticsDataResult {
  isLoading: boolean;
  error: string | null;
  summary: AnalyticsSummaryData | null;
  trend: ProductionTrendResponse | null;
  distribution: FleetProductionDistributionResponse | null;
  supplies: SuppliesAnalyticsResponse | null;
  slaCost: SLACostAnalyticsResponse | null;
  refetch: () => Promise<void>;
}

export function useAnalyticsData(): UseAnalyticsDataResult {
  const [locationVer, setLocationVer] = useState(0);
  useEffect(() => locationService.subscribe(() => setLocationVer((v) => v + 1)), []);

  const branches = locationService.getBranchNames();
  const globalBranch = useSelector((state: RootState) => state.ui.selectedBranch);
  const selectedBranch = globalBranch || (branches.length > 0 ? branches[0] : '');
  const selectedTimeframe = useSelector((state: RootState) => state.ui.selectedTimeframe || '30days');
  const selectedFloor = useSelector((state: RootState) => state.ui.selectedFloor || 'all');

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [summary, setSummary] = useState<AnalyticsSummaryData | null>(null);
  const [trend, setTrend] = useState<ProductionTrendResponse | null>(null);
  const [distribution, setDistribution] = useState<FleetProductionDistributionResponse | null>(null);
  const [supplies, setSupplies] = useState<SuppliesAnalyticsResponse | null>(null);
  const [slaCost, setSlaCost] = useState<SLACostAnalyticsResponse | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const filterParams = {
        branch: selectedBranch,
        timeframe: selectedTimeframe,
        floorId: selectedFloor,
      };

      const [summaryData, trendData, distData, suppliesData, slaData] = await Promise.all([
        analyticsService.getAnalyticsSummary(filterParams),
        analyticsService.getProductionTrend(filterParams),
        analyticsService.getFleetDistribution(filterParams),
        analyticsService.getSuppliesForecasting(selectedBranch),
        analyticsService.getSLACostAnalytics(selectedBranch),
      ]);

      setSummary(summaryData);
      setTrend(trendData);
      setDistribution(distData);
      setSupplies(suppliesData);
      setSlaCost(slaData);
    } catch (err: any) {
      console.error('[useAnalyticsData] Lỗi khi nạp dữ liệu phân tích:', err);
      setError(err?.message || 'Không thể nạp dữ liệu phân tích');
    } finally {
      setIsLoading(false);
    }
  }, [selectedBranch, selectedTimeframe, selectedFloor]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    isLoading,
    error,
    summary,
    trend,
    distribution,
    supplies,
    slaCost,
    refetch: fetchData,
  };
}


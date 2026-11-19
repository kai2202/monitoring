/**
 * Frontend/src/services/providers/api/ApiAnalyticsProvider.ts
 *
 * Triển khai Service Layer kết nối REST API Backend thực tế cho Phân hệ Analytics:
 * - Chuẩn hóa truyền tham số branch, timeframe, floorId.
 * - Tuân thủ AGENTS.md Rule 4 & Rule 7.1 (< 300 LOC).
 */

import { IAnalyticsService } from '../../interfaces/IAnalyticsService';
import {
  AnalyticsFilterParams,
  AnalyticsSummaryData,
  ProductionTrendResponse,
  FleetProductionDistributionResponse,
  SuppliesAnalyticsResponse,
  SLACostAnalyticsResponse,
  ComparisonKPIsResponse,
} from '../../../types/api';
import { requestApi } from './apiClient';

export class ApiAnalyticsProvider implements IAnalyticsService {
  async getAnalyticsSummary(params: AnalyticsFilterParams): Promise<AnalyticsSummaryData> {
    const query = new URLSearchParams({
      timeframe: params.timeframe,
      ...(params.branch && params.branch !== 'all' ? { branch: params.branch } : {}),
      ...(params.floorId && params.floorId !== 'all' ? { floorId: params.floorId } : {}),
    });
    return requestApi<AnalyticsSummaryData>(`/analytics/summary?${query.toString()}`);
  }

  async getProductionTrend(params: AnalyticsFilterParams): Promise<ProductionTrendResponse> {
    const query = new URLSearchParams({
      timeframe: params.timeframe,
      ...(params.branch && params.branch !== 'all' ? { branch: params.branch } : {}),
      ...(params.floorId && params.floorId !== 'all' ? { floorId: params.floorId } : {}),
    });
    return requestApi<ProductionTrendResponse>(`/analytics/trend?${query.toString()}`);
  }

  async getFleetDistribution(params: AnalyticsFilterParams): Promise<FleetProductionDistributionResponse> {
    const query = new URLSearchParams({
      timeframe: params.timeframe,
      ...(params.branch && params.branch !== 'all' ? { branch: params.branch } : {}),
      ...(params.floorId && params.floorId !== 'all' ? { floorId: params.floorId } : {}),
    });
    return requestApi<FleetProductionDistributionResponse>(`/analytics/distribution?${query.toString()}`);
  }

  async getSuppliesForecasting(branch?: string): Promise<SuppliesAnalyticsResponse> {
    const query = new URLSearchParams({
      ...(branch && branch !== 'all' ? { branch } : {}),
    });
    return requestApi<SuppliesAnalyticsResponse>(`/analytics/supplies?${query.toString()}`);
  }

  async getSLACostAnalytics(branch?: string): Promise<SLACostAnalyticsResponse> {
    const query = new URLSearchParams({
      ...(branch && branch !== 'all' ? { branch } : {}),
    });
    return requestApi<SLACostAnalyticsResponse>(`/analytics/sla-cost?${query.toString()}`);
  }

  async getComparisonKPIs(printerIds: string[]): Promise<ComparisonKPIsResponse> {
    return requestApi<ComparisonKPIsResponse>('/analytics/comparison', {
      method: 'POST',
      body: JSON.stringify({ printerIds }),
    });
  }
}


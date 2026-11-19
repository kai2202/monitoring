/**
 * Frontend/src/services/providers/api/ApiTelemetryProvider.ts
 *
 * Triển khai ITelemetryService thông qua REST API Backend kết nối Zabbix và PostgreSQL.
 */

import {
  ITelemetryService,
  ReliabilityStats,
  HeatmapFilterParams,
  RankingFilterParams,
  InventoryFilterParams,
  TrendFilterParams,
} from '../../interfaces/ITelemetryService';

import {
  MockLemonDevice,
  MockVolumeTrendPoint,
  MockTopPrinterVolume,
} from '../../../mocks/mockTelemetry';
import { AvailabilityTimelinePoint } from '../../../types/dashboardTelemetry';

import {
  FleetHeatmapResponse,
  PrinterRankingItem,
  InventoryTableResponse,
  PrinterComparisonDetail,
  ProductionTrendResponse,
  Printer3DScatterPoint,
} from '../../../types/analytics';

import { requestApi } from './apiClient';

export class ApiTelemetryProvider implements ITelemetryService {
  async getVolumeTrend(days = 30): Promise<MockVolumeTrendPoint[]> {
    return requestApi<MockVolumeTrendPoint[]>(`/telemetry/volume-trend?days=${days}`);
  }

  async getAvailabilityTimeline(hours = 24): Promise<AvailabilityTimelinePoint[]> {
    return requestApi<AvailabilityTimelinePoint[]>(`/telemetry/availability?hours=${hours}`);
  }

  async getLemonDevices(): Promise<MockLemonDevice[]> {
    return requestApi<MockLemonDevice[]>('/telemetry/lemon-devices');
  }

  async getReliabilityStats(): Promise<ReliabilityStats> {
    return requestApi<ReliabilityStats>('/telemetry/reliability-stats');
  }

  async getTopPrintersVolume(): Promise<MockTopPrinterVolume[]> {
    return requestApi<MockTopPrinterVolume[]>('/telemetry/top-printers-volume');
  }

  // =========================================================================
  // 5 PHÂN HỆ QUY MÔ LỚN 100 - 1.000 MÁY
  // =========================================================================

  async getFleetOverviewHeatmap(params: HeatmapFilterParams): Promise<FleetHeatmapResponse> {
    const q = new URLSearchParams({
      granularity: params.granularity,
      ...(params.brand && params.brand !== 'all' ? { brand: params.brand } : {}),
      ...(params.department && params.department !== 'all' ? { department: params.department } : {}),
      ...(params.search ? { search: params.search } : {}),
      ...(params.limit ? { limit: String(params.limit) } : {}),
    });
    return requestApi<FleetHeatmapResponse>(`/telemetry/heatmap?${q.toString()}`);
  }

  async getPrinterRankings(params: RankingFilterParams): Promise<PrinterRankingItem[]> {
    const q = new URLSearchParams({
      scope: params.scope,
      periodDays: String(params.periodDays),
      ...(params.brand && params.brand !== 'all' ? { brand: params.brand } : {}),
      ...(params.search ? { search: params.search } : {}),
    });
    return requestApi<PrinterRankingItem[]>(`/telemetry/rankings?${q.toString()}`);
  }

  async getPrinterInventoryAnalytics(params: InventoryFilterParams): Promise<InventoryTableResponse> {
    const q = new URLSearchParams({
      page: String(params.page),
      pageSize: String(params.pageSize),
      ...(params.search ? { search: params.search } : {}),
      ...(params.brand && params.brand !== 'all' ? { brand: params.brand } : {}),
      ...(params.department && params.department !== 'all' ? { department: params.department } : {}),
      ...(params.sortBy ? { sortBy: params.sortBy } : {}),
      ...(params.sortOrder ? { sortOrder: params.sortOrder } : {}),
    });
    return requestApi<InventoryTableResponse>(`/telemetry/inventory?${q.toString()}`);
  }

  async getPrinterComparison(printerIds: string[], periodDays = 30): Promise<PrinterComparisonDetail[]> {
    const q = new URLSearchParams({
      printerIds: printerIds.join(','),
      periodDays: String(periodDays),
    });
    return requestApi<PrinterComparisonDetail[]>(`/telemetry/compare?${q.toString()}`);
  }

  async getProductionTrendAdvanced(params: TrendFilterParams): Promise<ProductionTrendResponse> {
    const q = new URLSearchParams({
      granularity: params.granularity,
      ...(params.days ? { days: String(params.days) } : {}),
      ...(params.selectedPrinterIds?.length ? { selectedPrinterIds: params.selectedPrinterIds.join(',') } : {}),
    });
    return requestApi<ProductionTrendResponse>(`/telemetry/production-trend?${q.toString()}`);
  }

  async get3DScatterData(params?: { brand?: string; department?: string }): Promise<Printer3DScatterPoint[]> {
    const q = new URLSearchParams({
      ...(params?.brand && params.brand !== 'all' ? { brand: params.brand } : {}),
      ...(params?.department && params.department !== 'all' ? { department: params.department } : {}),
    });
    return requestApi<Printer3DScatterPoint[]>(`/telemetry/scatter-3d?${q.toString()}`);
  }
}

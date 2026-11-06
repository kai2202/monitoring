/**
 * Frontend/src/services/providers/mock/MockTelemetryProvider.ts
 *
 * Triển khai ITelemetryService cung cấp dữ liệu đo lường từ xa, sản lượng in và Lemon Devices.
 * Mở rộng hỗ trợ 5 phân hệ trực quan hóa sản lượng quy mô 100 - 1.000 máy.
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
  MockAvailabilityPoint,
  MockTopPrinterVolume,
  mockVolumeTrend,
  mockAvailabilityTimeline,
  mockLemonDevices,
  mockReliabilityStats,
  mockTopPrintersVolume,
} from '../../../mocks';
import { AvailabilityTimelinePoint } from '../../../types/dashboardTelemetry';

import {
  FleetHeatmapResponse,
  PrinterRankingItem,
  InventoryTableResponse,
  PrinterComparisonDetail,
  ProductionTrendResponse,
  Printer3DScatterPoint,
} from '../../../types/analytics';

import {
  generateFleetHeatmap,
  generatePrinterRankings,
  generateInventoryTable,
  generatePrinterComparison,
  generateProductionTrendAdvanced,
  generate3DScatterData,
} from '../../../mocks/mockFleetScaleData';

export class MockTelemetryProvider implements ITelemetryService {
  private volumeTrend: MockVolumeTrendPoint[] = [...mockVolumeTrend];
  private availabilityTimeline: MockAvailabilityPoint[] = [...mockAvailabilityTimeline];
  private lemonDevices: MockLemonDevice[] = [...mockLemonDevices];
  private reliabilityStats: ReliabilityStats = { ...mockReliabilityStats };
  private topPrintersVolume: MockTopPrinterVolume[] = [...mockTopPrintersVolume];

  async getVolumeTrend(days = 30): Promise<MockVolumeTrendPoint[]> {
    await new Promise(r => setTimeout(r, 30));
    return this.volumeTrend.slice(-days);
  }

  async getAvailabilityTimeline(_hours = 24): Promise<AvailabilityTimelinePoint[]> {
    await new Promise(r => setTimeout(r, 20));
    return this.availabilityTimeline.map((pt) => ({
      timestamp: pt.timestamp || pt.timeLabel,
      timeLabel: pt.timeLabel,
      onlineRate: pt.onlineRate,
      onlineCount: pt.onlineCount,
      offlineCount: pt.offlineCount,
    }));
  }

  async getLemonDevices(): Promise<MockLemonDevice[]> {
    await new Promise(r => setTimeout(r, 20));
    return [...this.lemonDevices];
  }

  async getReliabilityStats(): Promise<ReliabilityStats> {
    await new Promise(r => setTimeout(r, 20));
    return { ...this.reliabilityStats };
  }

  async getTopPrintersVolume(): Promise<MockTopPrinterVolume[]> {
    await new Promise(r => setTimeout(r, 20));
    return [...this.topPrintersVolume];
  }

  // =========================================================================
  // 5 PHÂN HỆ QUY MÔ LỚN 100 - 1.000 MÁY
  // =========================================================================

  async getFleetOverviewHeatmap(params: HeatmapFilterParams): Promise<FleetHeatmapResponse> {
    await new Promise(r => setTimeout(r, 40));
    return generateFleetHeatmap(
      params.granularity,
      params.brand,
      params.department,
      params.search,
      params.limit
    );
  }

  async getPrinterRankings(params: RankingFilterParams): Promise<PrinterRankingItem[]> {
    await new Promise(r => setTimeout(r, 30));
    return generatePrinterRankings(
      params.scope,
      params.periodDays,
      params.search,
      params.brand
    );
  }

  async getPrinterInventoryAnalytics(params: InventoryFilterParams): Promise<InventoryTableResponse> {
    await new Promise(r => setTimeout(r, 30));
    return generateInventoryTable(
      params.page,
      params.pageSize,
      params.search,
      params.brand,
      params.department,
      params.sortBy,
      params.sortOrder
    );
  }

  async getPrinterComparison(printerIds: string[], periodDays = 30): Promise<PrinterComparisonDetail[]> {
    await new Promise(r => setTimeout(r, 30));
    return generatePrinterComparison(printerIds, periodDays);
  }

  async getProductionTrendAdvanced(params: TrendFilterParams): Promise<ProductionTrendResponse> {
    await new Promise(r => setTimeout(r, 30));
    return generateProductionTrendAdvanced(
      params.granularity,
      params.days,
      params.selectedPrinterIds
    );
  }

  async get3DScatterData(params?: { brand?: string; department?: string }): Promise<Printer3DScatterPoint[]> {
    await new Promise(r => setTimeout(r, 30));
    return generate3DScatterData(params?.brand, params?.department);
  }
}

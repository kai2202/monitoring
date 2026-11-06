/**
 * Frontend/src/services/interfaces/ITelemetryService.ts
 *
 * Hợp đồng Service Layer cho Phân tích đo lường từ xa, sản lượng in 30 ngày và Lemon Devices.
 * Mở rộng hỗ trợ 5 phân hệ trực quan hóa sản lượng quy mô 100 - 1.000 thiết bị.
 */

import {
  MockLemonDevice,
  MockVolumeTrendPoint,
  MockTopPrinterVolume,
} from '../../mocks/mockTelemetry';
import { AvailabilityTimelinePoint } from '../../types/dashboardTelemetry';

import {
  TimeGranularity,
  FleetHeatmapResponse,
  RankingScope,
  PrinterRankingItem,
  InventoryTableResponse,
  PrinterComparisonDetail,
  ProductionTrendResponse,
  Printer3DScatterPoint,
} from '../../types/analytics';

export interface ReliabilityStats {
  totalFleetVolume30Days: number;
  averageFleetAvailability: number;
  fleetMtbfHours: number;
  healthyPrintersCount: number;
  warningPrintersCount: number;
  criticalPrintersCount: number;
}

export interface HeatmapFilterParams {
  granularity: TimeGranularity;
  brand?: string;
  department?: string;
  search?: string;
  limit?: number;
}

export interface RankingFilterParams {
  scope: RankingScope;
  periodDays: number;
  search?: string;
  brand?: string;
}

export interface InventoryFilterParams {
  page: number;
  pageSize: number;
  search?: string;
  brand?: string;
  department?: string;
  sortBy?: 'rank' | 'currentPeriodPages' | 'growthRatePercent' | 'printerName';
  sortOrder?: 'asc' | 'desc';
}

export interface TrendFilterParams {
  granularity: TimeGranularity;
  days?: number;
  selectedPrinterIds?: string[];
}

export interface ITelemetryService {
  // Legacy / Basic Telemetry endpoints (Bảo toàn tương thích ngược)
  getVolumeTrend(days?: number): Promise<MockVolumeTrendPoint[]>;
  getAvailabilityTimeline(hours?: number): Promise<AvailabilityTimelinePoint[]>;
  getLemonDevices(): Promise<MockLemonDevice[]>;
  getReliabilityStats(): Promise<ReliabilityStats>;
  getTopPrintersVolume(): Promise<MockTopPrinterVolume[]>;

  // 5 Phân hệ trực quan hóa sản lượng quy mô lớn 100 - 1.000 máy
  getFleetOverviewHeatmap(params: HeatmapFilterParams): Promise<FleetHeatmapResponse>;
  getPrinterRankings(params: RankingFilterParams): Promise<PrinterRankingItem[]>;
  getPrinterInventoryAnalytics(params: InventoryFilterParams): Promise<InventoryTableResponse>;
  getPrinterComparison(printerIds: string[], periodDays?: number): Promise<PrinterComparisonDetail[]>;
  getProductionTrendAdvanced(params: TrendFilterParams): Promise<ProductionTrendResponse>;
  get3DScatterData(params?: { brand?: string; department?: string }): Promise<Printer3DScatterPoint[]>;
}

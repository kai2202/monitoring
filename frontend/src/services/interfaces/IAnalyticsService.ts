/**
 * Frontend/src/services/interfaces/IAnalyticsService.ts
 *
 * Hợp đồng Service Layer cho Phân hệ Phân tích Sản lượng, Vật tư & SLA Chi Phí:
 * - Chuẩn hóa Single Source of Truth cho toàn bộ biểu đồ và thẻ KPI.
 * - Tuân thủ AGENTS.md Rule 4 & Rule 7.1 (< 300 LOC).
 */

import {
  AnalyticsFilterParams,
  AnalyticsSummaryData,
  ProductionTrendResponse,
  FleetProductionDistributionResponse,
  SuppliesAnalyticsResponse,
  SLACostAnalyticsResponse,
  ComparisonKPIsResponse,
} from '../../types/api';

export interface IAnalyticsService {
  /** Lấy tóm tắt chỉ số KPI sản lượng theo chi nhánh và khoảng thời gian */
  getAnalyticsSummary(params: AnalyticsFilterParams): Promise<AnalyticsSummaryData>;

  /** Lấy dữ liệu chuỗi thời gian cho Biểu đồ đường cong xu hướng sản lượng */
  getProductionTrend(params: AnalyticsFilterParams): Promise<ProductionTrendResponse>;

  /** Lấy danh sách sản lượng chi tiết từng thiết bị và phân bổ theo tầng */
  getFleetDistribution(params: AnalyticsFilterParams): Promise<FleetProductionDistributionResponse>;

  /** Lấy dữ liệu phân tích và dự báo cạn kiệt vật tư theo chi nhánh */
  getSuppliesForecasting(branch?: string): Promise<SuppliesAnalyticsResponse>;

  /** Lấy dữ liệu phân tích chi phí phòng ban, SLA và ma trận nhiệt sự cố */
  getSLACostAnalytics(branch?: string): Promise<SLACostAnalyticsResponse>;

  /** Lấy dữ liệu chi tiết đa chỉ số phục vụ sàn đối chiếu thiết bị */
  getComparisonKPIs(printerIds: string[]): Promise<ComparisonKPIsResponse>;
}


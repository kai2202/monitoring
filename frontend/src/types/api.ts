/**
 * Frontend/src/types/api.ts
 *
 * Chuẩn Hóa Cấu Trúc Dữ Liệu & Hợp Đồng TypeScript API (API Contracts):
 * - Phong bì phản hồi chuẩn (ApiResponse, ApiPaginatedResponse, ApiErrorResponse).
 * - Mô hình dữ liệu chuẩn hóa cho Sản lượng, Thiết bị, Vật tư, SLA và Từ điển lỗi.
 * - Tuân thủ AGENTS.md Rule 5 (Data Integrity) & Rule 7.1 (< 300 LOC).
 */

import { MetricValue } from './dashboardTelemetry';
import {
  AnalyticsTimeframe,
  FloorTabId,
  ConsumableAlertItem,
  PrinterConsumablesOverview,
  DepartmentCostAllocationItem,
  SLAOverviewKPIs,
  ComparisonDeviceKPIs,
} from './analyticsUI';

// ==========================================
// 1. STANDARD API RESPONSE ENVELOPES
// ==========================================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface ApiPaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
}

// ==========================================
// 2. ERROR DICTIONARY API CONTRACTS
// ==========================================

export interface PrinterErrorCode {
  id: string;
  vendor: 'Ricoh' | 'Canon' | 'HP' | 'Epson' | 'General';
  errorCode: string;
  errorName: string;
  affectedSubsystem: 'Fuser' | 'Scanner_ADF' | 'Paper_Feed' | 'Laser_Optics' | 'Controller_Board' | 'General';
  severity: 'Critical' | 'Warning' | 'Info';
  description: string;
}

/** Alias cho tính tương thích ngược */
export type MockErrorCode = PrinterErrorCode;

// ==========================================
// 3. ANALYTICS API CONTRACTS
// ==========================================

export interface AnalyticsFilterParams {
  branch?: string;
  timeframe: AnalyticsTimeframe;
  floorId?: FloorTabId;
  startDate?: string;
  endDate?: string;
}

export interface ProductionTrendPoint {
  timestamp: string;
  label: string;
  currentVolume: number;
  previousVolume: number;
}

export interface ProductionTrendResponse {
  timeframe: AnalyticsTimeframe;
  dataPoints: ProductionTrendPoint[];
  currentTotalVolume: number;
  previousTotalVolume: number;
  growthPercent: number;
  peakLabel: string;
  peakVolume: number;
}

export interface DeviceProductionItem {
  id: string;
  name: string;
  model: string;
  mfr: string;
  ip: string;
  serial: string;
  branch: string;
  floorId: FloorTabId;
  floorName: string;
  department: string;
  status: 'Online' | 'Offline';
  health: 'Healthy' | 'Warning' | 'Critical';
  totalVol: number;
  monoVol: number;
  colorVol: number;
  monoPercent: number;
  colorPercent: number;
  ppmNominal?: number;
  ppmActual?: number;
  isColorCapable: boolean;
}

export interface FloorVolumeSummary {
  floorId: string;
  floorName: string;
  deviceCount: number;
  totalVolume: number;
  sharePercentage: number;
  color: string;
}

export interface FleetProductionDistributionResponse {
  devices: DeviceProductionItem[];
  floors: FloorVolumeSummary[];
  totalFleetVolume: number;
}

export interface SuppliesAnalyticsResponse {
  summary: {
    criticalCount: number;
    warningCount: number;
    normalCount: number;
    wasteWarningCount: number;
  };
  alerts: ConsumableAlertItem[];
  devicesOverview: PrinterConsumablesOverview[];
}

export interface HeatmapMatrixCellDetail {
  device: string;
  location: string;
  desc: string;
  time: string;
  mttrMinutes: number;
  severity: 'critical' | 'warning' | 'normal';
}

export interface HeatmapFloorItem {
  id: string;
  name: string;
  shortName: string;
  room: string;
}

export interface SLACostAnalyticsResponse {
  kpis: SLAOverviewKPIs;
  departmentCosts: DepartmentCostAllocationItem[];
  incidentHeatmap: {
    floors: HeatmapFloorItem[];
    weeks: string[];
    matrix: number[][];
    details: Record<string, HeatmapMatrixCellDetail[]>;
  };
}

export interface AnalyticsSummaryData {
  totalFleetVolume: MetricValue;
  monoVolume: MetricValue;
  colorVolume: MetricValue;
  avgDailyVolume: MetricValue;
  activePrintersCount: number;
  totalPrintersCount: number;
  growthRatePercent: number | null;
  lastUpdated: string;
}

export type ComparisonKPIsResponse = ComparisonDeviceKPIs[];


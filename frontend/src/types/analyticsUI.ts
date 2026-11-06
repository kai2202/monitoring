/**
 * Frontend/src/types/analyticsUI.ts
 *
 * Định nghĩa Type cho giao diện Phân tích Hiện đại (Fleet Analytics UI):
 * - Print Volume & Peak Load (Multi-series Line Chart)
 * - Department & Device Contribution (Horizontal Bar Chart)
 * - Device Performance & Comparison (Slide-over Modal 70%)
 *
 * Tuân thủ AGENTS.md: MetricValue = number | null, không tùy tiện biến null thành 0.
 */

export type AnalyticsTimeframe = 'hourly' | '7days' | '30days';

export type FloorTabId = 'all' | 'floor-1' | 'floor-2' | 'floor-3' | 'floor-4' | 'floor-5' | 'floor-compare';

export interface TimeSeriesDataPoint {
  timestamp: string;      // "08:00", "Thứ 2", "01/10"
  label: string;          // Nhãn hiển thị trục hoành
  values: Record<string, number | null>; // printerId -> volume
}

export interface LineChartSeriesMeta {
  printerId: string;
  printerName: string;
  model: string;
  floor: string;
  color: string;
  visible: boolean;
  totalVolume: number;
}

export interface DeviceFloorContributionItem {
  printerId: string;
  printerName: string;
  model: string;
  brand: string;
  floor: string;
  department: string;
  totalVolume: number;
  colorVolume: number;
  monoVolume: number;
  percentageInFloor: number;
  percentageInFleet: number;
  sharePercentage?: number;
  isPinned: boolean;
  ip?: string;
  serial?: string;
  status?: 'Online' | 'Offline';
  health?: 'Healthy' | 'Warning' | 'Critical';
  tonerK?: number;
  tonerC?: number;
  tonerM?: number;
  tonerY?: number;
  drumLife?: number;
  ppm?: number;
}

export interface FloorSummaryItem {
  floorId: string;
  floorName: string;
  deviceCount: number;
  totalVolume: number;
  sharePercentage: number;
  color: string;
}

export interface ComparisonDeviceKPIs {
  printerId: string;
  printerName: string;
  model: string;
  brand: string;
  floor: string;
  department: string;
  color: string;
  // KPI Core
  totalPages: number | null;
  ppmActual: number | null;
  ppmNominal: number | null;
  uptimePercent: number | null;
  mtbfHours: number | null;
  failureCount: number | null;
  downtimeHours: number | null;
  // Detail groups
  production: {
    monoPages: number | null;
    colorPages: number | null;
    colorRatioPercent: number | null;
    avgDailyPages: number | null;
  };
  speed: {
    firstPageOutSeconds: number | null;
    warmupTimeSeconds: number | null;
  };
  reliability: {
    mttrHours: number | null;
    paperJamCount: number | null;
    hardwareFaultCount: number | null;
    lastIncidentTime: string | null;
  };
  availability: {
    maintenanceCount: number | null;
    scheduledDowntimeHours: number | null;
    unscheduledDowntimeHours: number | null;
  };
  consumables: {
    tonerBlackPercent: number | null;
    tonerCyanPercent: number | null;
    tonerMagentaPercent: number | null;
    tonerYellowPercent: number | null;
    drumLifePercent: number | null;
    wasteTonerBoxStatus: 'OK' | 'Sắp đầy' | 'Đầy' | '—';
  };
}

export type ComparisonMetricKey =
  | 'totalPages'
  | 'ppmActual'
  | 'uptimePercent'
  | 'mtbfHours'
  | 'downtimeHours'
  | 'failureCount';

export interface ComparisonMetricTab {
  key: ComparisonMetricKey;
  label: string;
  unit: string;
  description: string;
}

// 4. PRODUCTION DISTRIBUTION & DRILL-DOWN TYPES
export type FleetScaleMode = '1000' | '30';

export interface DistributionThresholdDef {
  id: string;
  rangeLabel: string;
  min: number;
  max: number;
}

export interface ProductionDistributionBucket {
  id: string;
  rangeLabel: string;
  minVolume: number;
  maxVolume: number;
  deviceCount: number;
  percentageShare: number;
  totalVolume: number;
  avgVolume: number;
  devices: DeviceFloorContributionItem[];
}

// 5. SUB-NAVIGATION & TABS CHO PHÂN HỆ ANALYTICS
export type AnalyticsSubTab = 'overview' | 'supplies' | 'sla-cost';

// 6. DỰ BÁO VẬT TƯ & LINH KIỆN (TAB 2)
export type ConsumableItemType = 'black' | 'cyan' | 'magenta' | 'yellow' | 'drum' | 'fuser';

export interface ConsumableAlertItem {
  id: string;
  printerId: string;
  printerName: string;
  model: string;
  floor: string;
  department: string;
  itemType: ConsumableItemType;
  itemName: string;
  currentPercent: number;
  dailyBurnRate: number;      // Tỷ lệ tiêu hao ước tính mỗi ngày (%)
  daysRemaining: number;       // Số ngày còn lại (Days to empty)
  estimatedEmptyDate: string;  // Ngày dự kiến cạn kiệt
  status: 'critical' | 'warning' | 'normal';
}

export interface PrinterConsumablesOverview {
  printerId: string;
  printerName: string;
  model: string;
  floor: string;
  floorId: FloorTabId;
  department: string;
  totalMonthlyVolume: number;
  tonerK: number;
  tonerC: number;
  tonerM: number;
  tonerY: number;
  drumLife: number;
  fuserLife: number;
  wasteToner: 'OK' | 'Sắp đầy' | 'Đầy';
}

// 7. HIỆU SUẤT SLA & CHI PHÍ (TAB 3)
export interface SLAComboDataPoint {
  timeLabel: string;
  mtbfHours: number;
  mttrMinutes: number;
  jamRatePercent: number;
  totalIncidents: number;
}

export interface DepartmentCostAllocationItem {
  departmentId: string;
  departmentName: string;
  monoPages: number;
  colorPages: number;
  monoCost: number;
  colorCost: number;
  totalCost: number;
  percentageShare: number;
  deviceCount: number;
  color: string;
}

export interface SLAOverviewKPIs {
  fleetUptime: number;
  targetUptime: number;
  avgMtbfHours: number;
  avgMttrMinutes: number;
  jamRatePercent: number;
  totalPrintCost: number;
  avgCostPerPage: number;
}

export interface ActiveLineChartPrinter {
  id: string;
  name: string;
  baseHourly?: number[];
  base7Days?: number[];
  base30Days?: number[];
}



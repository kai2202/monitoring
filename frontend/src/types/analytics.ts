/**
 * Frontend/src/types/analytics.ts
 *
 * Kiểu dữ liệu TypeScript chuẩn hóa cho Phân hệ Phân tích Sản lượng Đội Máy In (Fleet Analytics)
 * Tối ưu cho quy mô lớn từ 100 đến 1.000 thiết bị:
 * 1. Heatmap: Toàn cảnh mật độ in theo thời gian và máy in.
 * 2. Ranked Bar: Xếp hạng sản lượng Top/Bottom.
 * 3. Inventory Table: Bảng danh mục sản lượng kèm tỷ lệ tăng trưởng.
 * 4. Comparison: Đối chiếu chi tiết 2 hoặc nhiều máy in bất kỳ.
 * 5. Production Trend: Biểu đồ xu hướng sản lượng toàn đội & máy được chọn.
 *
 * Tuân thủ nghiêm ngặt AGENTS.md: MetricValue = number | null, không bịa đặt số liệu.
 */

export type TimeGranularity = 'daily' | 'weekly' | 'monthly';

export interface HeatmapCell {
  periodKey: string;     // YYYY-MM-DD hoặc Tuần/Tháng
  periodLabel: string;   // Nhãn hiển thị: '01/11', 'Tuần 44', 'Tháng 10'
  pages: number | null;
  colorPages: number | null;
  monoPages: number | null;
  intensity: number;     // 0 đến 1 (tỷ lệ so với mức trần của máy in)
  isAbnormal: boolean;   // Đột biến tải hoặc giảm tải bất thường
}

export interface HeatmapPrinterRow {
  printerId: string;
  printerName: string;
  model: string;
  brand: string;
  department: string;
  totalPeriodPages: number | null;
  cells: HeatmapCell[];
}

export interface FleetHeatmapResponse {
  granularity: TimeGranularity;
  timeColumns: { key: string; label: string }[];
  maxVolumeInCell: number;
  totalPrinters: number;
  rows: HeatmapPrinterRow[];
}

export type RankingScope = 'top10' | 'top20' | 'top50' | 'top100' | 'bottom10';

export interface PrinterRankingItem {
  rank: number;
  printerId: string;
  printerName: string;
  model: string;
  brand: string;
  department: string;
  totalPages: number | null;
  colorPages: number | null;
  monoPages: number | null;
  sharePercent: number; // Tỷ trọng % so với toàn hệ thống
}

export interface PrinterInventoryItem {
  rank: number;
  printerId: string;
  printerName: string;
  model: string;
  brand: string;
  department: string;
  currentPeriodPages: number | null;
  previousPeriodPages: number | null;
  growthRatePercent: number | null; // % tăng trưởng so với kỳ trước (dương hoặc âm)
  colorRatioPercent: number | null; // Tỷ lệ trang màu / tổng trang
  uptimePercent: number | null;
  incidentCount: number;
}

export interface InventoryTableResponse {
  items: PrinterInventoryItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PrinterComparisonDetail {
  printerId: string;
  printerName: string;
  model: string;
  brand: string;
  department: string;
  connectionStatus: 'Online' | 'Offline';
  currentVolume: number | null;
  previousVolume: number | null;
  growthRatePercent: number | null;
  colorVolume: number | null;
  monoVolume: number | null;
  colorRatioPercent: number | null;
  uptimePercent: number | null;
  incidentCount: number;
  averageDailyPages: number | null;
  dailyTrend: {
    date: string;
    totalPages: number | null;
    colorPages: number | null;
    monoPages: number | null;
  }[];
}

export interface ProductionTrendPoint {
  dateKey: string;
  label: string;
  totalFleetPages: number | null;
  totalFleetColorPages: number | null;
  totalFleetMonoPages: number | null;
  selectedPrinters?: Record<string, number | null>; // printerId -> pages
}

export interface ProductionTrendResponse {
  granularity: TimeGranularity;
  trendPoints: ProductionTrendPoint[];
  selectedPrintersMetadata?: {
    printerId: string;
    name: string;
    color: string;
  }[];
}

export interface Printer3DScatterPoint {
  printerId: string;
  printerName: string;
  model: string;
  brand: string;
  department: string;
  monthlyVolume: number;           // Trục X: Sản lượng in hàng tháng (trang)
  maintenanceCost: number | null; // Chi phí bảo trì (Triệu VNĐ), null nếu chưa có dữ liệu
  errorFrequency: number;          // Trục Y: Tần suất sự cố (số lần/tháng)
  health: 'Healthy' | 'Warning' | 'Critical';
  connectionStatus: 'Online' | 'Offline';
  colorRatioPercent: number;
}

export type FleetQuadrantPoint = Printer3DScatterPoint;

// =========================================================================
// KIỂU DỮ LIỆU CHO 6 BIỂU ĐỒ SAAS MỚI (THEO 2 ẢNH THAM KHẢO)
// =========================================================================

export interface RadarBenchmarkMetric {
  key: string;
  label: string;
  fullMark: number;
  deviceAValue: number;
  deviceBValue?: number;
  unit: string;
}

export interface HourlyHeatmapCell {
  dayOfWeek: number; // 0..6 (T2..CN)
  dayLabel: string;
  hourSlot: string; // '8 am', '10 am', '12 pm', '2 pm', '4 pm', '6 pm', '8 pm'
  pages: number | null;
  colorPages: number | null;
  monoPages: number | null;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface PairedBarDataPoint {
  label: string;
  primaryValue: number | null;
  secondaryValue: number | null;
}

export interface RankedContributionItem {
  id: string;
  title: string;
  subtitle: string;
  pages: number | null;
  percentage: number;
  growthRatePercent?: number | null;
  brand?: string;
  department?: string;
}




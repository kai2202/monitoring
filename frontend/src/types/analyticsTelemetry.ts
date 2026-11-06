/**
 * Frontend/src/types/analyticsTelemetry.ts
 *
 * Data Contracts DTO chuẩn cho Phân hệ Phân Tích & Báo Cáo (Analytics):
 * - MetricValue = number | null: tuân thủ nghiêm ngặt AGENTS.md Rule 5 (không số giả).
 * - Sẵn sàng kết nối với Backend Rollup Aggregator Engine (TASK-BE-04) & Zabbix Slow Polling (1h).
 */

export type MetricValue = number | null;

/** Điểm đo sản lượng in ấn theo mốc thời gian (giờ / ngày) */
export interface ProductionVolumePoint {
  timestamp: string;          // ISO 8601 (vd: "2026-11-05T08:00:00Z")
  timeLabel: string;          // Nhãn hiển thị trục X (vd: "08:00" hoặc "05/11")
  monoPages: MetricValue;     // Số trang in đen trắng
  colorPages: MetricValue;    // Số trang in màu
  totalPages: MetricValue;    // Tổng sản lượng
}

/** Tóm tắt sản lượng theo tầng và chi nhánh */
export interface FloorProductionSummary {
  floor: string;              // vd: "Tầng 1", "Tầng 2"...
  branch: string;             // vd: "Trụ sở chính (HQ)"
  totalVolume: MetricValue;   // Tổng trang in trong kỳ
  printerCount: number;       // Số lượng máy in tại tầng
  percentage: MetricValue;    // Tỷ lệ % sản lượng
}

/** Dữ liệu dự báo hao mòn vật tư & đếm ngược D-Day */
export interface SuppliesBurnRateDTO {
  printerId: string;
  printerName: string;
  location: string;
  blackPercent: MetricValue;
  colorPercent: MetricValue;
  wasteTonerStatus: 'Normal' | 'Warning' | 'Full';
  dDayRemaining: number | null; // null nếu chưa đủ dữ liệu tính tốc độ tiêu thụ
  burnRateDailyPercent: MetricValue; // % tiêu thụ trung bình mỗi ngày
}

/** Chi phí vận hành & vật tư theo phòng ban */
export interface DepartmentCostDTO {
  department: string;
  consumableCostVnd: MetricValue; // Chi phí mực & linh kiện (VNĐ)
  laborCostVnd: MetricValue;      // Chi phí nhân công kỹ thuật (VNĐ)
  totalCostVnd: MetricValue;      // Tổng chi phí
  incidentCount: number;          // Số lượng sự cố phát sinh
}

/** Điểm nóng sự cố phục vụ Heatmap ma trận tầng × tuần */
export interface IncidentHotspotItem {
  floor: string;
  weekLabel: string;
  incidentCount: number;
  severity: 'Critical' | 'Warning' | 'Clear';
}

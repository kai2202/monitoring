/**
 * Frontend/src/types/dashboardTelemetry.ts
 *
 * Data Contracts chuẩn mực cho Telemetry & Trạng thái Hạm đội:
 * - MetricValue = number | null: tuân thủ nghiêm ngặt AGENTS.md Rule 5.
 * - Sẵn sàng nối API Backend Zabbix Poller & Telemetry Rollup Engine.
 */

export type MetricValue = number | null;

/** Điểm đo khả dụng trong chuỗi thời gian Zabbix ICMP Ping */
export interface AvailabilityTimelinePoint {
  timestamp: string;          // ISO 8601 (vd: "2026-11-05T14:00:00Z")
  timeLabel: string;          // Nhãn hiển thị trục X (vd: "14:00")
  onlineRate: MetricValue;    // Tỷ lệ % máy trực tuyến (vd: 97.1 hoặc null)
  onlineCount: number | null;
  offlineCount: number | null;
  warningCount?: number | null;
  criticalCount?: number | null;
}

/** Phân bổ trạng thái sức khỏe hạm đội máy in */
export interface FleetHealthDistribution {
  totalCount: number;
  healthyCount: number;
  warningCount: number;
  criticalCount: number;
  offlineCount: number;
  storageCount: number;
  isStale?: boolean;
  lastScrapedAt?: string | null;
}

/** Tổng hợp chỉ số KPI hạm đội */
export interface FleetKpiSummary {
  totalPrinters: number;
  onlineCount: MetricValue;
  offlineCount: MetricValue;
  unknownCount: MetricValue;
  onlineRate: MetricValue;
  activeAlertsCount: MetricValue;
  criticalAlertsCount: MetricValue;
  warningAlertsCount: MetricValue;
  lowSuppliesCount: MetricValue;
}


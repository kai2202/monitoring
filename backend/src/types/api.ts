/**
 * src/types/api.ts
 *
 * REST API response types returned by the Backend to the React frontend.
 * These must match the Printer and Incident interfaces in frontend/src/types/printer.ts.
 *
 * Keep these types in sync manually until a shared types package is introduced.
 */

export type MetricValue = number | null;

export type ConnectionStatus = 'Online' | 'Offline' | 'Unknown';
export type AlertSeverity = 'critical' | 'warning' | 'clear' | 'unknown';
export type DeviceHealth = 'Healthy' | 'Warning' | 'Critical' | 'Offline' | 'Stale' | 'Unknown' | 'Unsupported' | 'Data Unavailable';
export type DeviceType = 'Color MFP' | 'Mono MFP' | 'Mono Laser' | 'Industrial Thermal' | 'Large Format Plotter';
export type IncidentSeverity = 'Critical' | 'Warning' | 'Info';
export type IncidentStatus = 'Active' | 'Resolved';

export interface Supplies {
  black: MetricValue;
  cyan: MetricValue;
  magenta: MetricValue;
  yellow: MetricValue;
  waste: MetricValue;
}

export interface Counters {
  total: MetricValue;
  copier: MetricValue;
  fax: MetricValue;
  scanner: MetricValue;
}

export interface DiagnosticDetail {
  rawCode: string;
  errorName: string;
  description: string;
  subsystem: string;
  actionGuidance?: string;
  severity: IncidentSeverity;
  isIdentified: boolean;
  vendor: string;
}

/** Printer response object — matches frontend Printer interface */
export interface PrinterResponse {
  id: string;
  name: string;
  ip: string;
  mfr: string;
  model: string;
  deviceType: DeviceType;
  colorCapability?: 'Color' | 'Monochrome';
  serial: string;
  firmware: string;
  connectionStatus: ConnectionStatus;
  monitoringStatus: string;
  status: 'Online' | 'Offline';
  alertSeverity: AlertSeverity;
  alertText: string;
  location: string;
  snmpStatus: string;
  lastScrape: string;
  lastSuccessfulScrape: string;
  downtimeDuration?: string;
  isStale?: boolean;
  suppliesUpdated?: string;
  health: DeviceHealth;
  scannerErr: string;
  adfErr: string;
  copierErr: string;
  mfpErr: string;
  supplies: Supplies;
  counters: Counters;
  thirtyDayVolume: MetricValue;
  anomalyNote?: string;
  diagnostic?: DiagnosticDetail;
  incidents: IncidentResponse[];
}

/** Incident response object — matches frontend Incident interface */
export interface IncidentResponse {
  id: string;
  printer: string;
  type: string;
  desc: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  start: string;
  endTime?: string;
  duration: string;
  notificationStatus: 'Sent' | 'Failed' | 'Pending' | 'N/A';
  lifecycle: string;
  diagnostic?: DiagnosticDetail;
  statusHistory?: Array<{ time: string; status: string; note: string }>;
}

/** Availability time-series data point */
export interface AvailabilityDataPoint {
  timeLabel: string;
  onlineRate: number;
  onlineCount: number;
  offlineCount: number;
}

/** Generic API error response */
export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}

/** Print volume telemetry bucket (hourly or daily) */
export interface TelemetryBucket {
  timestamp: string; // ISO 8601 string of bucket start
  timeLabel: string; // e.g. "13:00" or "26/10"
  pagesPrinted: number | null;
  status: 'complete' | 'no_data' | 'incomplete';
}

export type TelemetryRange = '24h' | '7d' | '30d';

/** Printer telemetry response for historical chart */
export interface PrinterTelemetryResponse {
  printerId: string;
  printerName: string;
  range: TelemetryRange;
  totalPrintedInRange: number;
  dataQuality: 'complete' | 'partial' | 'no_data';
  lastScraped: string;
  buckets: TelemetryBucket[];
}

/** Response from manual or routine sync trigger */
export interface SyncResponse {
  success: boolean;
  message: string;
  syncedAt: string;
  durationMs: number;
  printerCount: number;
  incidentCount: number;
}

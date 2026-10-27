/**
 * types/printer.ts
 *
 * Shared TypeScript interfaces for the Printer Monitoring System.
 *
 * Data source conventions:
 *   - number  : A real numeric value retrieved from Zabbix / SNMP.
 *   - null    : Value could not be retrieved (Data Unavailable) or metric is not supported.
 *   - string  : A human-readable status sentinel ("Unknown", "Unsupported", "Stale").
 *
 * Do NOT use `number | string` unions for numeric supply/counter fields.
 * Use `number | null` and handle null explicitly in UI components.
 */

// ---------------------------------------------------------------------------
// Supply and counter value type
// A retrieved numeric reading, or null when the value is unavailable.
// ---------------------------------------------------------------------------
export type MetricValue = number | null;

// ---------------------------------------------------------------------------
// Supplies
// Current level as a percentage (0–100) or null when unavailable.
// For waste toner: 100 = Full (project-level convention, not yet independently verified).
// ---------------------------------------------------------------------------
export interface Supplies {
  black: MetricValue;
  cyan: MetricValue;
  magenta: MetricValue;
  yellow: MetricValue;
  /** Waste toner level. Convention: 100 = Full (unverified against physical state). */
  waste: MetricValue;
}

// ---------------------------------------------------------------------------
// Usage counters (cumulative sheet counts from Zabbix/SNMP)
// ---------------------------------------------------------------------------
export interface Counters {
  /** prtMarkerLifeCount — total lifetime engine counter */
  total: MetricValue;
  /** ricohCopierModeCopies — copy-mode counter (Ricoh-specific) */
  copier: MetricValue;
  /** ricohFaxModeCopies — fax-mode counter (Ricoh-specific) */
  fax: MetricValue;
  /** ricohPrinterModeCopies — print-mode counter (Ricoh-specific) */
  scanner: MetricValue;
}

// ---------------------------------------------------------------------------
// Incident history timeline entry (for the detail modal)
// ---------------------------------------------------------------------------
export interface IncidentHistoryItem {
  time: string;
  status: string;
  note: string;
}

import { DiagnosticDetail } from '../diagnostics/types';
export type { DiagnosticDetail };

// ---------------------------------------------------------------------------
// Incident — an error event with lifecycle tracking
// ---------------------------------------------------------------------------
export interface Incident {
  id: string;
  /** Printer name (display label) */
  printer: string;
  /** Error category (e.g. "Hardware Error", "Supply Alert", "Connectivity") */
  type: string;
  /** Error description text (from prtAlertDescription or Zabbix trigger name) */
  desc: string;
  severity: 'Critical' | 'Warning' | 'Info';
  status: 'Active' | 'Resolved';
  /** ISO 8601 timestamp of when the incident was first detected */
  start: string;
  /** ISO 8601 timestamp of resolution (absent while active) */
  endTime?: string;
  /** Human-readable duration string (e.g. "2h 15m") */
  duration: string;
  notificationStatus: 'Sent' | 'Failed' | 'Pending' | 'N/A';
  lifecycle: string;
  statusHistory?: IncidentHistoryItem[];
  diagnostic?: DiagnosticDetail;
}

// ---------------------------------------------------------------------------
// Device type classification (used for distribution analytics)
// ---------------------------------------------------------------------------
export type DeviceType =
  | 'Color MFP'
  | 'Mono MFP'
  | 'Mono Laser'
  | 'Industrial Thermal'
  | 'Large Format Plotter';

// ---------------------------------------------------------------------------
// Alert severity levels — maps to Zabbix trigger priority
// ---------------------------------------------------------------------------
export type AlertSeverity = 'critical' | 'warning' | 'clear' | 'unknown';

// ---------------------------------------------------------------------------
// Connection / monitoring status
// ---------------------------------------------------------------------------
export type ConnectionStatus = 'Online' | 'Offline' | 'Unknown';

// ---------------------------------------------------------------------------
// Overall device health (application-level aggregate)
// Rules must be explicitly defined and tested before use.
// ---------------------------------------------------------------------------
export type DeviceHealth =
  | 'Healthy'
  | 'Warning'
  | 'Critical'
  | 'Offline'
  | 'Stale'
  | 'Unknown'
  | 'Unsupported'
  | 'Data Unavailable';

// ---------------------------------------------------------------------------
// Printer — the core data entity
// All nullable fields use MetricValue (number | null) not (number | string).
// ---------------------------------------------------------------------------
export interface Printer {
  id: string;
  name: string;
  ip: string;
  mfr: string;
  model: string;
  deviceType: DeviceType;
  colorCapability?: 'Color' | 'Monochrome';

  /** Read from Zabbix host inventory or prtGeneralSerialNumber */
  serial: string;
  /** ricohFirmwareVersion OID — Ricoh-specific */
  firmware: string;

  /** Current network connectivity as determined by ICMP ping */
  connectionStatus: ConnectionStatus;
  /** Human-readable monitoring status description */
  monitoringStatus: string;
  /** @deprecated Use connectionStatus instead */
  status: 'Online' | 'Offline';

  /** Highest active alert severity for this printer */
  alertSeverity: AlertSeverity;
  /** Human-readable description of the current alert (from prtAlertDescription or Zabbix) */
  alertText: string;

  /** Physical location or department (admin-assigned metadata) */
  location: string;
  /** Raw SNMP agent status string */
  snmpStatus: string;
  /** ISO 8601 timestamp of the last Zabbix poll attempt */
  lastScrape: string;
  /** ISO 8601 timestamp of the last successful Zabbix poll */
  lastSuccessfulScrape: string;
  /** Human-readable duration the printer has been in its current state */
  downtimeDuration?: string;
  /** True when lastSuccessfulScrape is older than the configured staleness threshold */
  isStale?: boolean;
  /** ISO 8601 timestamp of the last successful supply read */
  suppliesUpdated?: string;

  /** Aggregate device health — application-level status, not a raw SNMP value */
  health: DeviceHealth;

  // Hardware error subsystem fields (Ricoh-specific OIDs — see DATA_SOURCES.md)
  // Empty string = no error. Descriptive string = error text. "Unsupported" = OID not available.
  scannerErr: string;
  adfErr: string;
  copierErr: string;
  mfpErr: string;

  supplies: Supplies;
  counters: Counters;

  /** Estimated 30-day print volume; null when no historical data is available */
  thirtyDayVolume: MetricValue;
  /** Anomaly note for analytics (e.g. unusual usage detected) */
  anomalyNote?: string;

  /** Chi tiết chẩn đoán sự cố phần cứng & SNMP Trap hiện tại */
  diagnostic?: DiagnosticDetail;

  incidents: Incident[];
}

// ---------------------------------------------------------------------------
// Navigation and UI state types
// ---------------------------------------------------------------------------
export type TabType = 'dashboard' | 'printers' | 'supplies' | 'incidents' | 'analytics';
export type TimeframeType = '1h' | '6h' | '24h' | '7d';
export type ThemeMode = 'light' | 'dark';

// ---------------------------------------------------------------------------
// Telemetry & Print Volume Historical Analytics
// ---------------------------------------------------------------------------
export interface TelemetryBucket {
  timestamp: string;
  timeLabel: string;
  pagesPrinted: number | null;
  status: 'complete' | 'no_data' | 'incomplete';
}

export interface PrinterTelemetryResponse {
  printerId: string;
  printerName: string;
  range: '24h' | '7d' | '30d';
  totalPrintedInRange: number;
  dataQuality: 'complete' | 'partial' | 'no_data';
  lastScraped: string;
  buckets: TelemetryBucket[];
}

export interface SyncResponse {
  success: boolean;
  message: string;
  syncedAt: string;
  durationMs: number;
  printerCount: number;
  incidentCount: number;
}

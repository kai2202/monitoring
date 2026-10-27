/**
 * mocks/index.ts
 *
 * Monorepo Unified Mock Data Provider (24 Enterprise Printers)
 *
 * Scenarios represented:
 * - 10 Healthy / Fully Online printers (Ricoh MP C6004, MP 3054, Aficio MP 5002, Canon C5535i, Toshiba 5018A)
 * - 4 Supplies Warning / Critical (Low toner < 15%, Waste toner >= 85% full)
 * - 4 Real Hardware Errors (Ricoh SC542 Fuser, Ricoh SC202 Polygon, Canon E000 Fuser, Toshiba C400 Thermistor)
 * - 6 Unknown / Missing Data (Canon LBP 223 Cartridge 057 -2 unknown, Windows Print Server, Offline, Stale)
 */

import rawPrinters from './printers.json' with { type: 'json' };
import rawIncidents from './incidents.json' with { type: 'json' };
import rawTelemetry from './telemetry.json' with { type: 'json' };

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
  severity: IncidentSeverity;
  isIdentified: boolean;
  vendor: string;
}

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
  sevenDayVolume: MetricValue;
  thirtyDayVolume: MetricValue;
  anomalyNote?: string;
  diagnostic?: DiagnosticDetail;
  incidents: IncidentResponse[];
}

export interface TelemetryBucket {
  timestamp: string;
  timeLabel: string;
  pagesPrinted: number | null;
  status: 'complete' | 'no_data' | 'incomplete';
}

export interface PrinterTelemetryResponse {
  printerId: string;
  printerName: string;
  range: string;
  totalPrintedInRange: number;
  dataQuality: 'complete' | 'partial' | 'no_data';
  lastScraped: string;
  buckets: TelemetryBucket[];
}

export const mockPrinters: PrinterResponse[] = rawPrinters as unknown as PrinterResponse[];
export const mockIncidents: IncidentResponse[] = rawIncidents as unknown as IncidentResponse[];
export const mockTelemetry: PrinterTelemetryResponse[] = (rawTelemetry as { telemetryList: unknown[] }).telemetryList as unknown as PrinterTelemetryResponse[];

/**
 * Tính toán thống kê toàn hệ thống từ bộ dữ liệu mock
 */
export function getMockFleetStats(printers: PrinterResponse[] = mockPrinters) {
  const total = printers.length;
  const online = printers.filter(p => p.connectionStatus === 'Online').length;
  const offline = printers.filter(p => p.connectionStatus === 'Offline').length;
  const critical = printers.filter(p => p.health === 'Critical').length;
  const warning = printers.filter(p => p.health === 'Warning').length;
  const healthy = printers.filter(p => p.health === 'Healthy').length;
  const unknownOrStale = printers.filter(p => p.health === 'Unknown' || p.health === 'Stale').length;

  const lowSuppliesCount = printers.filter(p => {
    const s = p.supplies;
    const isWasteFull = typeof s.waste === 'number' && (100 - s.waste) >= 85;
    return (
      (typeof s.black === 'number' && s.black < 15) ||
      (typeof s.cyan === 'number' && s.cyan < 15) ||
      (typeof s.magenta === 'number' && s.magenta < 15) ||
      (typeof s.yellow === 'number' && s.yellow < 15) ||
      isWasteFull
    );
  }).length;

  return {
    total,
    online,
    offline,
    healthy,
    warning,
    critical,
    unknownOrStale,
    lowSuppliesCount,
  };
}

export default {
  printers: mockPrinters,
  incidents: mockIncidents,
  telemetry: mockTelemetry,
  getFleetStats: getMockFleetStats,
};

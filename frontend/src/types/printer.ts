/**
 * Frontend/src/types/printer.ts
 *
 * Kiểu dữ liệu TypeScript chuẩn mực cho Máy in, Vật tư và Sự cố của FleetMonitor.
 * - MetricValue = number | null (giá trị không xác định dùng null, không dùng 0).
 * - Tuyệt đối không chứa trường actionGuidance.
 */

export type MetricValue = number | null;

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

export interface IncidentHistoryItem {
  time: string;
  status: string;
  note: string;
}

export interface DiagnosticDetail {
  subsystem: string;
  errorCode: string;
  vendor: string;
  model: string;
  componentName: string;
  recommendedActionSummary?: string;
  evidenceTriggerId?: string;
}

export interface PrinterHistoryLog {
  id: string;
  printerId: string;
  actionType: 'RELOCATION' | 'CUSTODIAN_TRANSFER' | 'INVENTORY_AUDIT' | 'STATUS_CHANGE' | 'TASK_DOSSIER_ARCHIVED' | string;
  previousData?: any;
  newData?: any;
  storageKey?: string | null;
  attachedFileName?: string | null;
  fileSize?: number | null;
  mimeType?: string | null;
  sha256Hash?: string | null;
  performedBy?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface Incident {
  id: string;
  printer: string;
  type: string;
  desc: string;
  severity: 'Critical' | 'Warning' | 'Info';
  status: 'Active' | 'Resolved';
  start: string;
  endTime?: string;
  duration: string;
  notificationStatus: 'Sent' | 'Failed' | 'Pending' | 'N/A';
  lifecycle: string;
  statusHistory?: IncidentHistoryItem[];
  diagnostic?: DiagnosticDetail;
}

export type DeviceType =
  | 'Color MFP'
  | 'Mono MFP'
  | 'Mono Laser'
  | 'Industrial Thermal'
  | 'Large Format Plotter';

export type AlertSeverity = 'critical' | 'warning' | 'clear' | 'unknown';
export type ConnectionStatus = 'Online' | 'Offline' | 'Unknown';

export type DeviceHealth =
  | 'Healthy'
  | 'Warning'
  | 'Critical'
  | 'Offline'
  | 'Stale'
  | 'Unknown'
  | 'Unsupported'
  | 'Data Unavailable';

export interface Printer {
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
  branch?: string;
  building?: string;
  floor?: string;
  room?: string | null;
  department?: string;
  location: string;
  gridX?: number | null;
  gridY?: number | null;
  managingTeam?: string | null;
  custodianName?: string | null;
  custodianContact?: string | null;
  lastInventoriedAt?: string | null;
  icmpStatus?: 'UP' | 'DOWN' | 'UNKNOWN' | string;
  snmpStatus: string;
  currentFaultType?: 'NONE' | 'PAPER_JAM' | 'HARDWARE_ERROR' | string;
  currentFaultText?: string | null;
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
  incidents: Incident[];
  historyLogs?: PrinterHistoryLog[];
}

export type TabType = 'dashboard' | 'operations' | 'printers' | 'supplies' | 'analytics' | 'settings';
export type ThemeMode = 'light' | 'dark';

export type FloorObstacleType = 'desk' | 'pillar' | 'walkway' | 'wall' | 'door';

export interface FloorObstacle {
  id: string;
  floor: string;
  gridX: number;
  gridY: number;
  type: FloorObstacleType;
  label?: string;
  team?: string;
  wallEdges?: ('top' | 'bottom' | 'left' | 'right')[];
}


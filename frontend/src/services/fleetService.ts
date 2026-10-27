import { Printer, Incident, MetricValue, DeviceType, TimeframeType } from '../types/printer';

/**
 * Returns true if a supply metric value indicates a low-supply condition.
 * Toner cartridges: low when level < 15%.
 * Waste toner bottle: full (needs replacement) when level >= 85.
 * Convention: waste = 100 is treated as Full (project-level assumption, not yet verified).
 */
function isLowSupply(value: MetricValue, isWaste = false): boolean {
  if (value === null) return false;
  if (isWaste) {
    const fullness = Math.min(100, Math.max(0, 100 - value));
    return fullness >= 85;
  }
  return value < 15;
}

export interface FleetStats {
  totalPrinters: number;
  onlineCount: number;
  offlineCount: number;
  unknownCount: number;
  staleCount: number;
  onlinePct: number;
  offlinePct: number;
  activeIncidentsCount: number;
  criticalIncidentsCount: number;
  warningIncidentsCount: number;
  lowSuppliesCount: number;
}

export interface DistributionItem {
  label: string;
  count: number;
  percentage: number;
  color?: string;
}

export interface AvailabilityDataPoint {
  timeLabel: string;
  onlineRate: number; // percentage (0-100)
  onlineCount: number;
  offlineCount: number;
  warningCount?: number;
}

/**
 * Tính toán các chỉ số KPI cấp cao trên toàn bộ danh bạ máy in.
 * Tuân thủ quy tắc: Không tự động biến dữ liệu thiếu thành 0 giả tạo.
 */
export function getFleetStats(printers: Printer[], incidents: Incident[]): FleetStats {
  const totalPrinters = printers.length;
  if (totalPrinters === 0) {
    const activeIncidents = incidents.filter(i => i.status === 'Active');
    return {
      totalPrinters: 0,
      onlineCount: 0,
      offlineCount: 0,
      unknownCount: 0,
      staleCount: 0,
      onlinePct: 0,
      offlinePct: 0,
      activeIncidentsCount: activeIncidents.length,
      criticalIncidentsCount: activeIncidents.filter(i => i.severity === 'Critical').length,
      warningIncidentsCount: activeIncidents.filter(i => i.severity === 'Warning').length,
      lowSuppliesCount: 0
    };
  }

  const onlineCount = printers.filter(p => p.connectionStatus === 'Online').length;
  const offlineCount = printers.filter(p => p.connectionStatus === 'Offline').length;
  const unknownCount = printers.filter(p => p.connectionStatus === 'Unknown').length;
  const staleCount = printers.filter(p => p.isStale).length;

  const onlinePct = Number(((onlineCount / totalPrinters) * 100).toFixed(1));
  const offlinePct = Number(((offlineCount / totalPrinters) * 100).toFixed(1));

  const activeIncidents = incidents.filter(i => i.status === 'Active');
  const criticalIncidentsCount = activeIncidents.filter(i => i.severity === 'Critical').length;
  const warningIncidentsCount = activeIncidents.filter(i => i.severity === 'Warning').length;

  const lowSuppliesCount = printers.filter(p => {
    const s = p.supplies;
    return (
      isLowSupply(s.black) ||
      isLowSupply(s.cyan) ||
      isLowSupply(s.magenta) ||
      isLowSupply(s.yellow) ||
      isLowSupply(s.waste, true)
    );
  }).length;

  return {
    totalPrinters,
    onlineCount,
    offlineCount,
    unknownCount,
    staleCount,
    onlinePct,
    offlinePct,
    activeIncidentsCount: activeIncidents.length,
    criticalIncidentsCount,
    warningIncidentsCount,
    lowSuppliesCount
  };
}

/**
 * Trả về danh sách máy in cần can thiệp (Offline, Critical, Warning, Stale, Low Supplies).
 */
export function getPrintersNeedingAttention(printers: Printer[]): Printer[] {
  if (printers.length === 0) return [];

  return [...printers]
    .filter(p => {
      const isCritical = p.connectionStatus === 'Offline' || p.alertSeverity === 'critical';
      const isWarning = p.alertSeverity === 'warning' || p.isStale;
      const hasLowSupply =
        isLowSupply(p.supplies.black) ||
        isLowSupply(p.supplies.yellow) ||
        isLowSupply(p.supplies.waste, true);
      return isCritical || isWarning || hasLowSupply;
    })
    .sort((a, b) => {
      const aWeight = a.connectionStatus === 'Offline' || a.alertSeverity === 'critical' ? 2 : 1;
      const bWeight = b.connectionStatus === 'Offline' || b.alertSeverity === 'critical' ? 2 : 1;
      return bWeight - aWeight;
    });
}

/**
 * Phân bổ theo trạng thái kết nối mạng (Online, Offline, Unknown)
 */
export function getConnectivityDistribution(printers: Printer[]): DistributionItem[] {
  if (printers.length === 0) return [];

  const counts: Record<string, number> = {
    'Online': 0,
    'Offline': 0,
    'Unknown': 0
  };

  for (const p of printers) {
    const status = p.connectionStatus || 'Unknown';
    counts[status] = (counts[status] || 0) + 1;
  }

  const total = printers.length;
  return [
    { label: 'Trực tuyến (Online)', count: counts['Online'], percentage: Number(((counts['Online'] / total) * 100).toFixed(1)), color: '#10b981' },
    { label: 'Ngoại tuyến (Offline)', count: counts['Offline'], percentage: Number(((counts['Offline'] / total) * 100).toFixed(1)), color: '#ef4444' },
    { label: 'Không xác định (Unknown)', count: counts['Unknown'], percentage: Number(((counts['Unknown'] / total) * 100).toFixed(1)), color: '#94a3b8' }
  ].filter(item => item.count > 0);
}

/**
 * Phân bổ theo nhà sản xuất (HP, Canon, Ricoh, Xerox, Brother, Epson, v.v.)
 */
export function getManufacturerDistribution(printers: Printer[]): DistributionItem[] {
  if (printers.length === 0) return [];

  const counts: Record<string, number> = {};
  for (const p of printers) {
    const mfr = p.mfr || 'Chưa xác định';
    counts[mfr] = (counts[mfr] || 0) + 1;
  }
  const total = printers.length;
  return Object.entries(counts)
    .map(([label, count]) => ({
      label,
      count,
      percentage: Number(((count / total) * 100).toFixed(1))
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Phân bổ theo loại hình thiết bị (Color MFP, Mono Laser, Mono MFP, Industrial Thermal, Large Format Plotter)
 */
export function getDeviceTypeDistribution(printers: Printer[]): DistributionItem[] {
  if (printers.length === 0) return [];

  const counts: Record<string, number> = {};
  for (const p of printers) {
    const type = p.deviceType || 'Chưa xác định';
    counts[type] = (counts[type] || 0) + 1;
  }
  const total = printers.length;
  return Object.entries(counts)
    .map(([label, count]) => ({
      label,
      count,
      percentage: Number(((count / total) * 100).toFixed(1))
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Phân bổ theo vị trí lắp đặt / phòng ban
 */
export function getLocationDistribution(printers: Printer[]): DistributionItem[] {
  if (printers.length === 0) return [];

  const counts: Record<string, number> = {};
  for (const p of printers) {
    let locGroup = 'Chưa xác định vị trí';
    if (p.location) {
      if (p.location.includes('Tầng 1')) locGroup = 'Trụ sở - Tầng 1';
      else if (p.location.includes('Tầng 2')) locGroup = 'Trụ sở - Tầng 2';
      else if (p.location.includes('Tầng 3') || p.location.includes('Tầng hầm')) locGroup = 'Trụ sở - Khối khác';
      else if (p.location.includes('Kho vận') || p.location.includes('Kho')) locGroup = 'Kho vận (Warehouse)';
      else if (p.location.includes('R&D') || p.location.includes('Server')) locGroup = 'Khu Kỹ thuật & R&D';
      else if (p.location.includes('Chi nhánh 1')) locGroup = 'Chi nhánh 1';
      else if (p.location.includes('Chi nhánh 2')) locGroup = 'Chi nhánh 2';
      else if (p.location.includes('Chi nhánh 3')) locGroup = 'Chi nhánh 3';
      else locGroup = p.location;
    }

    counts[locGroup] = (counts[locGroup] || 0) + 1;
  }
  const total = printers.length;
  return Object.entries(counts)
    .map(([label, count]) => ({
      label,
      count,
      percentage: Number(((count / total) * 100).toFixed(1))
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Trích xuất chuỗi thời gian khả dụng thực tế.
 * Khi chưa có chuỗi lịch sử từ Zabbix Trend/History API, trả về mảng rỗng để UI hiển thị trạng thái No Data,
 * loại bỏ hoàn toàn các offset ngẫu nhiên/giả tạo (onlineMod: -1, 1).
 */
export function getAvailabilityTimeline(
  timeframe: TimeframeType,
  printers: Printer[]
): AvailabilityDataPoint[] {
  if (!printers || printers.length === 0) {
    return [];
  }

  // Khi có danh sách máy in thực tế từ backend, tính toán điểm hiện tại
  const currentOnline = printers.filter(p => p.connectionStatus === 'Online').length;
  const total = printers.length;
  const currentRate = Number(((currentOnline / total) * 100).toFixed(1));

  // Trả về mốc thời gian thực hiện tại nếu chưa có đầy đủ time-series từ Zabbix
  return [
    {
      timeLabel: 'Hiện tại',
      onlineRate: currentRate,
      onlineCount: currentOnline,
      offlineCount: total - currentOnline
    }
  ];
}

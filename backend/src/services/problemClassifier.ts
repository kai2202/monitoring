/**
 * src/services/problemClassifier.ts
 *
 * Domain logic for classifying Zabbix problems, mapping severities,
 * and interpreting error messages (Ricoh SC codes, cleaning web, fuser, paper/tray, multilingual).
 */

import {
  AlertSeverity,
  IncidentSeverity,
  DeviceHealth,
  ConnectionStatus,
} from '../types/api.js';

export interface ProblemClassification {
  alertSeverity: AlertSeverity;        // 'critical' | 'warning' | 'clear' | 'unknown'
  incidentSeverity: IncidentSeverity;  // 'Critical' | 'Warning' | 'Info'
  category: string;                    // 'Paper / Tray' | 'Supply Alert' | 'Paper Jam' | 'Hardware Error' | 'Connectivity' | 'System'
  cleanName: string;
}

/**
 * Detects whether an alert/problem name is a routine out-of-paper / tray-empty notification.
 * Physical paper jams (kẹt giấy) are hardware stoppages and are NEVER considered paper missing.
 */
export function isPaperMissingAlert(rawName?: string | null): boolean {
  if (!rawName || typeof rawName !== 'string' || rawName.trim() === '') {
    return false;
  }
  const clean = rawName
    .replace(/^Printer Hardware Error:\s*/i, '')
    .replace(/^Printer Warning:\s*/i, '')
    .trim();
  const lower = clean.toLowerCase();

  // Jam / kẹt giấy is physical hardware stoppage, never filter it
  if (lower.includes('jam') || lower.includes('kẹt giấy')) {
    return false;
  }

  return (
    lower.includes('no paper') ||
    lower.includes('out of paper') ||
    lower.includes('paper empty') ||
    lower.includes('add paper') ||
    lower.includes('load paper') ||
    lower.includes('paper missing') ||
    lower.includes('thiếu giấy') ||
    lower.includes('hết giấy') ||
    lower.includes('nạp giấy') ||
    /tray.*empty/i.test(lower) ||
    /empty.*tray/i.test(lower) ||
    /khay.*(rỗng|hết)/i.test(lower)
  );
}

export function classifyProblem(rawName: string, zabbixSeverity: string): ProblemClassification {
  if (!rawName || typeof rawName !== 'string' || rawName.trim() === '') {
    return {
      alertSeverity: 'unknown',
      incidentSeverity: 'Info',
      category: 'System',
      cleanName: 'Lỗi không xác định',
    };
  }

  const s = Number(zabbixSeverity);
  const cleanName = rawName
    .replace(/^Printer Hardware Error:\s*/i, '')
    .replace(/^Printer Warning:\s*/i, '')
    .trim();
  const lower = cleanName.toLowerCase();

  // 1. Connectivity (ICMP ping failed / unreachable)
  if (lower.includes('icmp') || lower.includes('unreachable') || lower.includes('ngoại tuyến')) {
    return {
      alertSeverity: 'critical',
      incidentSeverity: 'Critical',
      category: 'Connectivity',
      cleanName,
    };
  }

  // 2. Paper Jam (Kẹt giấy — hardware stoppage) -> Critical
  if (lower.includes('jam') || lower.includes('kẹt giấy')) {
    return {
      alertSeverity: 'critical',
      incidentSeverity: 'Critical',
      category: 'Paper Jam',
      cleanName,
    };
  }

  // 3. Paper Missing / Out of Paper / Tray Empty ("thiếu giấy", "hết giấy" -> Cảnh báo / Warning)
  const isPaperMissing = isPaperMissingAlert(cleanName);

  if (isPaperMissing) {
    return {
      alertSeverity: 'warning',
      incidentSeverity: 'Warning',
      category: 'Paper / Tray',
      cleanName,
    };
  }

  // 4. Toner / Consumables / Supplies ("hộp mực", "mực thải", "cuộn lau" -> Cảnh báo / Warning)
  const isSupplyAlert =
    lower.includes('toner') ||
    lower.includes('cartridge') ||
    lower.includes('waste') ||
    lower.includes('supply') ||
    lower.includes('supplies') ||
    lower.includes('hộp mực') ||
    lower.includes('mực') ||
    lower.includes('ink') ||
    lower.includes('cleaning web') ||
    lower.includes('cuộn lau') ||
    lower.includes('30402');

  if (isSupplyAlert) {
    return {
      alertSeverity: 'warning',
      incidentSeverity: 'Warning',
      category: 'Supply Alert',
      cleanName,
    };
  }

  // 5. Door / Cover Open ("mở cửa / mở nắp" -> Critical)
  if (
    lower.includes('cover open') ||
    lower.includes('door open') ||
    lower.includes('interlock open') ||
    lower.includes('mở cửa') ||
    lower.includes('mở nắp')
  ) {
    return {
      alertSeverity: 'critical',
      incidentSeverity: 'Critical',
      category: 'Hardware Error',
      cleanName,
    };
  }

  // 6. Explicit SC service codes (e.g. SC542, SC-554, SC 670, Fusing Unit, Motor, Laser)
  if (/sc[\s-]?\d{3}/i.test(lower) || lower.includes('fusing') || lower.includes('cụm sấy') || lower.includes('30405')) {
    return {
      alertSeverity: 'critical',
      incidentSeverity: 'Critical',
      category: 'Hardware Error',
      cleanName,
    };
  }

  // 7. Other hardware components / service codes (SC codes, fuser, laser, motor, board, scanner, adf, hdd...)
  // Any error from Zabbix with severity >= 2 that is not supplies or paper-missing is Critical
  if (s >= 2) {
    return {
      alertSeverity: 'critical',
      incidentSeverity: 'Critical',
      category: 'Hardware Error',
      cleanName,
    };
  }

  // 8. Low severity / Informational (severity 0 or 1, reboot, info)
  return {
    alertSeverity: 'clear',
    incidentSeverity: 'Info',
    category: 'System',
    cleanName,
  };
}

export function computeHealth(
  connectionStatus: ConnectionStatus,
  alertSeverity: AlertSeverity,
  isStale: boolean
): DeviceHealth {
  if (connectionStatus === 'Offline') return 'Offline';
  if (isStale) return 'Stale';
  if (connectionStatus === 'Unknown') return 'Unknown';
  if (alertSeverity === 'critical') return 'Critical';
  if (alertSeverity === 'warning') return 'Warning';
  return 'Healthy';
}

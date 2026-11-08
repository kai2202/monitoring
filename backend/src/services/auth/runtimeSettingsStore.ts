/**
 * Backend/src/services/auth/runtimeSettingsStore.ts
 *
 * Kho cấu hình vận hành thời gian thực (Ngưỡng mực động, Safe Window 10m, Cache TTL):
 * - Đồng bộ hai chiều với PostgreSQL `AuditLog` (`targetId: 'SYSTEM_RUNTIME_SETTINGS'`).
 * - Phục vụ cả `SettingsController` và các `ZabbixWorker` mà không tạo phụ thuộc vòng.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import { prisma } from '../../lib/prisma';

export interface RuntimeThresholdsState {
  tonerWarningPercent: number;
  tonerCriticalPercent: number;
  daysUntilEmptyWarning: number;
  maxFuserTempCelsius: number;
  maxJamRatePercent: number;
}

let runtimeThresholds: RuntimeThresholdsState = {
  tonerWarningPercent: 15,
  tonerCriticalPercent: 5,
  daysUntilEmptyWarning: 7,
  maxFuserTempCelsius: 215,
  maxJamRatePercent: 1.5,
};

let runtimeSettings: any = {
  zabbix: {
    apiUrl: process.env.ZABBIX_URL || process.env.ZABBIX_API_URL || 'http://localhost:8080/api_jsonrpc.php',
    apiTokenMasked: process.env.ZABBIX_API_TOKEN ? '••••••••••••••••' : 'Chưa cấu hình token',
    hostGroup: process.env.ZABBIX_PRINTER_GROUP || 'Printers',
    pollIntervalSeconds: 30,
    fastPollIntervalSeconds: 30,
    slowPollIntervalHours: 1,
    connectionTimeoutSeconds: 10,
    zabbixVersion: null as string | null,
  },
  autoClosure: {
    enabled: true,
    verificationWaitMinutes: 10,
    safeWindowMinutes: 10,
    protectCriticalIncidents: true,
    protectUserReportedIncidents: true,
    protectionLevel: 'CRITICAL_CONFIRMATION_REQUIRED',
    autoCloseRecoveredIncidents: true,
  },
  cache: {
    inMemoryTtlSeconds: 60,
    telemetryTtlSeconds: 60,
    maxMemoryMb: 50,
  },
};

export async function loadActiveRuntimeRules() {
  try {
    const persisted = await prisma.auditLog.findFirst({
      where: { targetId: 'SYSTEM_RUNTIME_SETTINGS' },
      orderBy: { createdAt: 'desc' },
      select: { diffJson: true },
    });
    const saved: any = persisted?.diffJson && typeof persisted.diffJson === 'object' ? persisted.diffJson : null;
    if (saved?.thresholds && typeof saved.thresholds === 'object') {
      runtimeThresholds = { ...runtimeThresholds, ...saved.thresholds };
    }
    if (saved?.autoClosure && typeof saved.autoClosure === 'object') {
      runtimeSettings.autoClosure = { ...runtimeSettings.autoClosure, ...saved.autoClosure };
    }
    if (saved?.cache && typeof saved.cache === 'object') {
      runtimeSettings.cache = { ...runtimeSettings.cache, ...saved.cache };
    }
  } catch {
    // Giữ trạng thái hiện hành nếu kết nối tạm gián đoạn
  }
  return {
    thresholds: runtimeThresholds,
    autoClosure: runtimeSettings.autoClosure,
    cache: runtimeSettings.cache,
    zabbix: runtimeSettings.zabbix,
  };
}

export function applyRuntimeRulesPatch(patch: {
  thresholds?: Partial<RuntimeThresholdsState>;
  autoClosure?: Record<string, any>;
  cache?: Record<string, any>;
  zabbixVersion?: string | null;
}) {
  if (patch.thresholds) {
    runtimeThresholds = { ...runtimeThresholds, ...patch.thresholds };
  }
  if (patch.autoClosure) {
    runtimeSettings.autoClosure = { ...runtimeSettings.autoClosure, ...patch.autoClosure };
  }
  if (patch.cache) {
    runtimeSettings.cache = { ...runtimeSettings.cache, ...patch.cache };
  }
  if (patch.zabbixVersion !== undefined) {
    runtimeSettings.zabbix.zabbixVersion = patch.zabbixVersion;
  }
  return {
    thresholds: runtimeThresholds,
    autoClosure: runtimeSettings.autoClosure,
    cache: runtimeSettings.cache,
    zabbix: runtimeSettings.zabbix,
  };
}


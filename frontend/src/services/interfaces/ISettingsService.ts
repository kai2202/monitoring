/**
 * Frontend/src/services/interfaces/ISettingsService.ts
 *
 * Hợp đồng Service Layer cho Quản trị cấu hình hệ thống, Zabbix và Từ điển mã lỗi.
 */

import { MockErrorCode } from '../../mocks/mockSettings';

export interface SystemSettings {
  zabbix: {
    apiUrl: string;
    apiTokenMasked: string;
    hostGroup: string;
    pollIntervalSeconds: number;
    connectionStatus: string;
    zabbixVersion: string;
    lastSyncTime: string;
  };
  autoClosure: {
    enabled: boolean;
    verificationWaitMinutes: number;
    protectCriticalIncidents: boolean;
    protectUserReportedIncidents: boolean;
  };
  cache: {
    inMemoryTtlSeconds: number;
    telemetryTtlSeconds: number;
  };
}

export interface ZabbixTestResult {
  success: boolean;
  message: string;
  zabbixVersion?: string;
  latencyMs?: number;
}

export interface ISettingsService {
  getSettings(): Promise<SystemSettings>;
  updateSettings(settings: Partial<SystemSettings>): Promise<SystemSettings>;
  testZabbixConnection(): Promise<ZabbixTestResult>;
  getErrorDictionary(): Promise<MockErrorCode[]>;
  lookupErrorCode(code: string, vendor?: string): Promise<MockErrorCode | null>;
}


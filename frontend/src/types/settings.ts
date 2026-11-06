/**
 * Frontend/src/types/settings.ts
 *
 * Kiểu dữ liệu trung tâm cho Cấu hình hệ thống, Quy tắc vận hành & Ngưỡng cảnh báo:
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

export type SettingsSubTab = 'gateway' | 'rbac' | 'rules' | 'dictionary';

export interface DynamicThresholds {
  tonerWarningPercent: number; // Mặc định 15%
  tonerCriticalPercent: number; // Mặc định 5%
  daysUntilEmptyWarning: number; // Mặc định 7 ngày
  maxFuserTempCelsius: number; // Mặc định 215°C
  maxJamRatePercent: number; // Mặc định 1.5%
}

export interface ZabbixLiveStatus {
  isConnected: boolean;
  latencyMs: number;
  zabbixVersion: string;
  lastSyncTime: string;
  discoveredHostsCount: number;
  httpStatus: number;
}

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'FIELD_TECH' | 'ASSET_HR';
  roleNameVi: string;
  branchScope: string[];
  floorsScope: string[];
  status: 'ACTIVE' | 'INACTIVE';
}

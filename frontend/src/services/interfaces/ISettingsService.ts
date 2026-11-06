/**
 * Frontend/src/services/interfaces/ISettingsService.ts
 *
 * Hợp đồng Service Layer cho Quản trị cấu hình hệ thống, Zabbix, RBAC Users và Từ điển mã lỗi.
 * Hoàn toàn độc lập với mocks/ (Zero Coupling).
 * Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import { PrinterErrorCode } from '../../types/api';
import { DynamicThresholds, ManagedUser } from '../../types/settings';

export interface SystemSettings {
  zabbix: {
    apiUrl: string;
    apiTokenMasked: string;
    hostGroup: string;
    pollIntervalSeconds: number;
    fastPollIntervalSeconds?: number;
    slowPollIntervalHours?: number;
    connectionStatus: string;
    zabbixVersion: string | null;
    lastSyncTime: string | null;
    discoveredHostsCount?: number | null;
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
  thresholds?: DynamicThresholds;
}

export interface ZabbixTestResult {
  success: boolean;
  message: string;
  zabbixVersion?: string | null;
  latencyMs?: number | null;
  discoveredHostsCount?: number | null;
}

export interface CreateManagedUserDto {
  name: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'FIELD_TECH' | 'ASSET_HR';
  branchScope?: string[];
  floorsScope?: string[];
}

export interface UpdateManagedUserDto {
  name?: string;
  role?: 'ADMIN' | 'FIELD_TECH' | 'ASSET_HR';
  status?: 'ACTIVE' | 'INACTIVE';
  branchScope?: string[];
  floorsScope?: string[];
}

export interface CsvImportApiResult {
  jobId?: string;
  totalRows: number;
  validRows: number;
  errorRows: number;
  status: string;
}

export interface TechnicianOption {
  id: string;
  name: string;
  role: string;
  branchScope: string[];
  floorsScope: string[];
}

export interface ISettingsService {
  getSettings(): Promise<SystemSettings>;
  updateSettings(settings: Partial<SystemSettings>): Promise<SystemSettings>;
  testZabbixConnection(): Promise<ZabbixTestResult>;
  getErrorDictionary(): Promise<PrinterErrorCode[]>;
  lookupErrorCode(code: string, vendor?: string): Promise<PrinterErrorCode | null>;
  importErrorDictionaryCsv(fileName: string, csvContent: string): Promise<CsvImportApiResult>;
  getTechnicians(): Promise<TechnicianOption[]>;
  getUsers(): Promise<ManagedUser[]>;
  createUser(dto: CreateManagedUserDto): Promise<ManagedUser>;
  updateUser(id: string, dto: UpdateManagedUserDto): Promise<ManagedUser>;
  changeUserPassword(id: string, newPassword: string): Promise<boolean>;
}

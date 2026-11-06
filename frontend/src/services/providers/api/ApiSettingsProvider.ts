/**
 * Frontend/src/services/providers/api/ApiSettingsProvider.ts
 *
 * Triển khai ISettingsService thông qua REST API Backend (PostgreSQL & Zabbix):
 * - Đấu nối 100% CRUD Người dùng RBAC, Đổi mật khẩu bcrypt, Vòng đời CSV Từ điển mã lỗi
 *   (Nạp, xem thời gian nạp, gỡ toàn bộ khỏi DB, đối chiếu mã chưa tích hợp).
 * - Tuân thủ AGENTS.md Rule 4 & Rule 7.1 (< 300 LOC).
 */

import {
  CreateManagedUserDto,
  CsvImportApiResult,
  ErrorDictionaryLifecycleStatus,
  ISettingsService,
  SystemSettings,
  TechnicianOption,
  UnloadCsvDictionaryResult,
  UpdateManagedUserDto,
  ZabbixTestResult,
} from '../../interfaces/ISettingsService';
import { PrinterErrorCode } from '../../../types/api';
import { ManagedUser } from '../../../types/settings';
import { requestApi } from './apiClient';

export class ApiSettingsProvider implements ISettingsService {
  async getSettings(): Promise<SystemSettings> {
    return requestApi<SystemSettings>('/settings');
  }

  async updateSettings(settings: Partial<SystemSettings>): Promise<SystemSettings> {
    return requestApi<SystemSettings>('/settings', {
      method: 'PATCH',
      body: JSON.stringify(settings),
    });
  }

  async testZabbixConnection(): Promise<ZabbixTestResult> {
    return requestApi<ZabbixTestResult>('/settings/test-zabbix', {
      method: 'POST',
    });
  }

  async getErrorDictionary(): Promise<PrinterErrorCode[]> {
    return requestApi<PrinterErrorCode[]>('/settings/errors');
  }

  async getErrorDictionaryStatus(): Promise<ErrorDictionaryLifecycleStatus> {
    return requestApi<ErrorDictionaryLifecycleStatus>('/settings/csv/dictionary-status');
  }

  async unloadErrorDictionaryCsv(): Promise<UnloadCsvDictionaryResult> {
    return requestApi<UnloadCsvDictionaryResult>('/settings/csv/dictionary', {
      method: 'DELETE',
    });
  }

  async lookupErrorCode(code: string, vendor?: string): Promise<PrinterErrorCode | null> {
    try {
      const query = vendor ? `?vendor=${encodeURIComponent(vendor)}` : '';
      return await requestApi<PrinterErrorCode>(`/settings/errors/lookup/${encodeURIComponent(code)}${query}`);
    } catch (err: unknown) {
      if ((err as any)?.status === 404 || (err instanceof Error && err.message.includes('404'))) {
        return null;
      }
      throw err;
    }
  }

  async importErrorDictionaryCsv(fileName: string, csvContent: string): Promise<CsvImportApiResult> {
    return requestApi<CsvImportApiResult>('/settings/csv/import', {
      method: 'POST',
      body: JSON.stringify({ fileName, csvContent }),
    });
  }

  async getTechnicians(): Promise<TechnicianOption[]> {
    return requestApi<TechnicianOption[]>('/settings/technicians');
  }

  async getUsers(): Promise<ManagedUser[]> {
    return requestApi<ManagedUser[]>('/settings/users');
  }

  async createUser(dto: CreateManagedUserDto): Promise<ManagedUser> {
    return requestApi<ManagedUser>('/settings/users', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  async updateUser(id: string, dto: UpdateManagedUserDto): Promise<ManagedUser> {
    const res = await requestApi<any>(`/settings/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    });
    return (res?.user ?? res) as ManagedUser;
  }

  async changeUserPassword(id: string, newPassword: string): Promise<boolean> {
    await requestApi<{ success: boolean }>(`/settings/users/${id}/password`, {
      method: 'PATCH',
      body: JSON.stringify({ newPassword }),
    });
    return true;
  }
}

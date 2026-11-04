/**
 * Frontend/src/services/providers/api/ApiSettingsProvider.ts
 *
 * Triển khai ISettingsService thông qua REST API Backend.
 */

import {
  ISettingsService,
  SystemSettings,
  ZabbixTestResult,
} from '../../interfaces/ISettingsService';
import { MockErrorCode } from '../../../mocks/mockSettings';
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

  async getErrorDictionary(): Promise<MockErrorCode[]> {
    return requestApi<MockErrorCode[]>('/settings/errors');
  }

  async lookupErrorCode(code: string, vendor?: string): Promise<MockErrorCode | null> {
    try {
      const query = vendor ? `?vendor=${encodeURIComponent(vendor)}` : '';
      return await requestApi<MockErrorCode>(`/settings/errors/lookup/${encodeURIComponent(code)}${query}`);
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('404')) {
        return null;
      }
      throw err;
    }
  }
}


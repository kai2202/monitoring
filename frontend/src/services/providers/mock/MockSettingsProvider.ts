/**
 * Frontend/src/services/providers/mock/MockSettingsProvider.ts
 *
 * Triển khai ISettingsService quản trị cấu hình hệ thống và từ điển mã lỗi trong bộ nhớ.
 */

import {
  ISettingsService,
  SystemSettings,
  ZabbixTestResult,
} from '../../interfaces/ISettingsService';
import {
  MockErrorCode,
  mockSystemSettings,
  mockErrorDictionary,
} from '../../../mocks/mockSettings';

export class MockSettingsProvider implements ISettingsService {
  private settings: SystemSettings = { ...mockSystemSettings };
  private errorDictionary: MockErrorCode[] = [...mockErrorDictionary];

  async getSettings(): Promise<SystemSettings> {
    await new Promise(r => setTimeout(r, 20));
    return { ...this.settings };
  }

  async updateSettings(newSettings: Partial<SystemSettings>): Promise<SystemSettings> {
    await new Promise(r => setTimeout(r, 60));
    this.settings = {
      ...this.settings,
      ...newSettings,
      zabbix: {
        ...this.settings.zabbix,
        ...(newSettings.zabbix || {}),
      },
      autoClosure: {
        ...this.settings.autoClosure,
        ...(newSettings.autoClosure || {}),
      },
      cache: {
        ...this.settings.cache,
        ...(newSettings.cache || {}),
      },
    };
    return { ...this.settings };
  }

  async testZabbixConnection(): Promise<ZabbixTestResult> {
    await new Promise(r => setTimeout(r, 150));
    // Mô phỏng kiểm tra kết nối Zabbix API
    return {
      success: true,
      message: 'Kết nối Zabbix API JSON-RPC thành công. Đã xác thực token quyền giám sát máy in.',
      zabbixVersion: this.settings.zabbix.zabbixVersion || '7.0.3 LTS',
      latencyMs: 42,
    };
  }

  async getErrorDictionary(): Promise<MockErrorCode[]> {
    await new Promise(r => setTimeout(r, 30));
    return [...this.errorDictionary];
  }

  async lookupErrorCode(code: string, vendor?: string): Promise<MockErrorCode | null> {
    await new Promise(r => setTimeout(r, 20));
    const upperCode = code.toUpperCase().trim();
    const found = this.errorDictionary.find(item => {
      const matchCode = item.errorCode.toUpperCase() === upperCode;
      if (!matchCode) return false;
      if (vendor && item.vendor.toLowerCase() !== vendor.toLowerCase() && item.vendor !== 'General') {
        return false;
      }
      return true;
    });

    return found ? { ...found } : null;
  }
}


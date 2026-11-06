/**
 * Frontend/src/services/providers/mock/MockSettingsProvider.ts
 *
 * Triển khai ISettingsService trong bộ nhớ phục vụ kiểm thử đơn vị (Vitest).
 * Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import {
  CreateManagedUserDto,
  CsvImportApiResult,
  ISettingsService,
  SystemSettings,
  TechnicianOption,
  UpdateManagedUserDto,
  ZabbixTestResult,
} from '../../interfaces/ISettingsService';
import { PrinterErrorCode } from '../../../types/api';
import { ManagedUser } from '../../../types/settings';
import { MockDataProvider } from '../../../mocks/MockDataProvider';

export class MockSettingsProvider implements ISettingsService {
  private settings: SystemSettings = MockDataProvider.getSystemSettings();
  private errorDictionary: PrinterErrorCode[] = MockDataProvider.getErrorDictionary() as unknown as PrinterErrorCode[];
  private users: ManagedUser[] = MockDataProvider.getUsers() as ManagedUser[];

  async getSettings(): Promise<SystemSettings> {
    return { ...this.settings };
  }

  async updateSettings(newSettings: Partial<SystemSettings>): Promise<SystemSettings> {
    this.settings = {
      ...this.settings,
      ...newSettings,
      zabbix: { ...this.settings.zabbix, ...(newSettings.zabbix || {}) },
      autoClosure: { ...this.settings.autoClosure, ...(newSettings.autoClosure || {}) },
      cache: { ...this.settings.cache, ...(newSettings.cache || {}) },
      thresholds: newSettings.thresholds
        ? { ...(this.settings.thresholds as any), ...newSettings.thresholds }
        : this.settings.thresholds,
    };
    return { ...this.settings };
  }

  async testZabbixConnection(): Promise<ZabbixTestResult> {
    return {
      success: true,
      message: 'Kết nối Zabbix API JSON-RPC thành công (Chế độ kiểm thử).',
      zabbixVersion: this.settings.zabbix.zabbixVersion || '7.0.3 LTS',
      latencyMs: 38,
      discoveredHostsCount: 35,
    };
  }

  async getErrorDictionary(): Promise<PrinterErrorCode[]> {
    return [...this.errorDictionary];
  }

  async lookupErrorCode(code: string, vendor?: string): Promise<PrinterErrorCode | null> {
    const upperCode = code.toUpperCase().trim();
    const found = this.errorDictionary.find((item) => {
      const matchCode = item.errorCode.toUpperCase() === upperCode;
      if (!matchCode) return false;
      if (vendor && item.vendor.toLowerCase() !== vendor.toLowerCase() && item.vendor !== 'General') {
        return false;
      }
      return true;
    });
    return found ? { ...found } : null;
  }

  async importErrorDictionaryCsv(_fileName: string, csvContent: string): Promise<CsvImportApiResult> {
    const lines = csvContent.trim().split(/\r?\n/);
    const count = Math.max(0, lines.length - 1);
    return { totalRows: count, validRows: count, errorRows: 0, status: 'COMPLETED' };
  }

  async getTechnicians(): Promise<TechnicianOption[]> {
    return this.users
      .filter((u) => u.status === 'ACTIVE' && (u.role === 'FIELD_TECH' || u.role === 'ADMIN'))
      .map((u) => ({
        id: u.id,
        name: u.name,
        role: u.role,
        branchScope: u.branchScope,
        floorsScope: u.floorsScope,
      }));
  }

  async getUsers(): Promise<ManagedUser[]> {
    return [...this.users];
  }

  async createUser(dto: CreateManagedUserDto): Promise<ManagedUser> {
    const roleNameVi =
      dto.role === 'ADMIN'
        ? 'Quản trị viên Hệ thống (Admin)'
        : dto.role === 'FIELD_TECH'
        ? 'Kỹ thuật viên NOC & Hiện trường'
        : 'Chuyên viên Tài sản & Kế toán HR';

    const created: ManagedUser = {
      id: `u-${Date.now()}`,
      name: dto.name,
      email: dto.email.toLowerCase(),
      role: dto.role,
      roleNameVi,
      branchScope: dto.branchScope || ['Trụ sở chính (HQ)'],
      floorsScope: dto.floorsScope || ['Tất cả 7 tầng'],
      status: 'ACTIVE',
    };
    this.users = [created, ...this.users];
    return created;
  }

  async updateUser(id: string, dto: UpdateManagedUserDto): Promise<ManagedUser> {
    let updatedUser: ManagedUser | null = null;
    this.users = this.users.map((u) => {
      if (u.id !== id) return u;
      updatedUser = {
        ...u,
        ...(dto.name ? { name: dto.name } : {}),
        ...(dto.role ? { role: dto.role } : {}),
        ...(dto.status ? { status: dto.status } : {}),
        ...(dto.branchScope ? { branchScope: dto.branchScope } : {}),
        ...(dto.floorsScope ? { floorsScope: dto.floorsScope } : {}),
      };
      return updatedUser;
    });
    if (!updatedUser) throw new Error('Không tìm thấy tài khoản');
    return updatedUser;
  }

  async changeUserPassword(_id: string, _newPassword: string): Promise<boolean> {
    return true;
  }
}

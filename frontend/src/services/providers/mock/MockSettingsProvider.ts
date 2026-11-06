/**
 * Frontend/src/services/providers/mock/MockSettingsProvider.ts
 *
 * Triển khai ISettingsService trong bộ nhớ phục vụ kiểm thử đơn vị (Vitest).
 * Mô phỏng chính xác vòng đời nạp/gỡ CSV và đối chiếu tự động mã lỗi chưa tích hợp.
 * Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import {
  CreateManagedUserDto,
  CsvImportApiResult,
  ErrorDictionaryLifecycleStatus,
  ISettingsService,
  SystemSettings,
  TechnicianOption,
  UnloadCsvDictionaryResult,
  UnmappedHardwareErrorItem,
  UpdateManagedUserDto,
  ZabbixTestResult,
} from '../../interfaces/ISettingsService';
import { PrinterErrorCode } from '../../../types/api';
import { ManagedUser } from '../../../types/settings';
import { MockDataProvider } from '../../../mocks/MockDataProvider';

export class MockSettingsProvider implements ISettingsService {
  private settings: SystemSettings = MockDataProvider.getSystemSettings();
  private errorDictionary: PrinterErrorCode[] =
    MockDataProvider.getErrorDictionary() as unknown as PrinterErrorCode[];
  private users: ManagedUser[] = MockDataProvider.getUsers() as ManagedUser[];
  private activeFileName: string | null = 'error_dictionary_initial.csv';
  private importedAt: string | null = new Date().toISOString();
  private lastUnloadedAt: string | null = null;

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

  async getErrorDictionaryStatus(): Promise<ErrorDictionaryLifecycleStatus> {
    const mappedKeys = new Set(
      this.errorDictionary.map(
        (d) => `${d.vendor.trim().toLowerCase()}::${d.errorCode.trim().toUpperCase()}`
      )
    );
    const incidents = MockDataProvider.getIncidents();
    const printers = MockDataProvider.getPrinters();
    const printerMap = new Map(printers.map((p) => [p.id, p]));
    const unmappedMap = new Map<string, UnmappedHardwareErrorItem>();

    for (const inc of incidents) {
      const code = (inc.errorCode || '').trim();
      if (!code || code === 'UNKNOWN') continue;
      const p = printerMap.get(inc.printerId);
      const vendor = (p?.mfr || 'General').trim();
      const vKey = vendor.toLowerCase();
      const cKey = code.toUpperCase();

      if (mappedKeys.has(`${vKey}::${cKey}`) || mappedKeys.has(`general::${cKey}`)) {
        continue;
      }

      const key = `${vKey}::${cKey}`;
      const cur = unmappedMap.get(key);
      if (!cur) {
        unmappedMap.set(key, {
          vendor,
          errorCode: code,
          occurrencesCount: 1,
          openIncidentsCount: inc.status === 'Active' ? 1 : 0,
          affectedPrinters: [inc.printerName || inc.printerId],
          sampleTitle: inc.errorDescription || `Sự cố mã ${code}`,
          suggestedSubsystem: inc.subsystem || 'General',
          severity: inc.severity === 'Critical' ? 'Critical' : 'Warning',
          lastDetectedAt: inc.detectedAt,
        });
      } else {
        cur.occurrencesCount += 1;
      }
    }

    return {
      activeDataset: {
        isLoaded: this.errorDictionary.length > 0,
        activeCodesCount: this.errorDictionary.length,
        fileName: this.errorDictionary.length > 0 ? this.activeFileName : null,
        importedAt: this.errorDictionary.length > 0 ? this.importedAt : null,
        importedBy: this.errorDictionary.length > 0 ? 'Nguyễn Văn An (Admin)' : null,
        lastUnloadedAt: this.lastUnloadedAt,
        lastUnloadedBy: this.lastUnloadedAt ? 'Nguyễn Văn An (Admin)' : null,
      },
      unmappedCodes: Array.from(unmappedMap.values()),
    };
  }

  async unloadErrorDictionaryCsv(): Promise<UnloadCsvDictionaryResult> {
    const removedCount = this.errorDictionary.length;
    this.errorDictionary = [];
    this.activeFileName = null;
    this.importedAt = null;
    this.lastUnloadedAt = new Date().toISOString();
    const lifecycle = await this.getErrorDictionaryStatus();
    return {
      success: true,
      removedCount,
      unloadedAt: this.lastUnloadedAt,
      lifecycle,
    };
  }

  async lookupErrorCode(code: string, vendor?: string): Promise<PrinterErrorCode | null> {
    const upperCode = code.toUpperCase().trim();
    const found = this.errorDictionary.find((item) => {
      if (item.errorCode.toUpperCase() !== upperCode) return false;
      if (vendor && item.vendor.toLowerCase() !== vendor.toLowerCase() && item.vendor !== 'General') {
        return false;
      }
      return true;
    });
    return found ? { ...found } : null;
  }

  async importErrorDictionaryCsv(fileName: string, csvContent: string): Promise<CsvImportApiResult> {
    const beforeStatus = await this.getErrorDictionaryStatus();
    const lines = csvContent.replace(/^\uFEFF/, '').trim().split(/\r?\n/);
    const imported: PrinterErrorCode[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
      if (cols.length < 2 || !cols[1]) continue;
      imported.push({
        id: `csv-${Date.now()}-${i}`,
        vendor: cols[0] || 'General',
        errorCode: cols[1],
        errorName: cols[2] || `FM-SYS-${i}`,
        affectedSubsystem: cols[3] || 'General',
        severity: cols[4] === 'Critical' ? 'Critical' : cols[4] === 'Info' ? 'Info' : 'Warning',
        description: cols[5] || cols[2] || `Mã lỗi ${cols[1]}`,
      });
    }

    const mergedMap = new Map<string, PrinterErrorCode>();
    for (const item of [...this.errorDictionary, ...imported]) {
      mergedMap.set(`${item.vendor.toLowerCase()}::${item.errorCode.toUpperCase()}`, item);
    }
    this.errorDictionary = Array.from(mergedMap.values());
    this.activeFileName = fileName;
    this.importedAt = new Date().toISOString();

    const afterStatus = await this.getErrorDictionaryStatus();
    const resolvedUnmappedCount = Math.max(
      0,
      beforeStatus.unmappedCodes.length - afterStatus.unmappedCodes.length
    );

    return {
      fileName,
      totalRows: Math.max(0, lines.length - 1),
      validRows: imported.length,
      errorRows: 0,
      status: 'COMPLETED',
      importedAt: this.importedAt,
      resolvedUnmappedCount,
      lifecycle: afterStatus,
    };
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

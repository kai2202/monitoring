/**
 * Frontend/src/services/providers/mock/MockPrinterProvider.ts
 *
 * Triển khai IPrinterService đọc/ghi dữ liệu mô phỏng trong bộ nhớ.
 * Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import {
  IPrinterService,
  UpdateLocationDto,
  CreatePrinterDto,
  UpdatePrinterDto,
} from '../../interfaces/IPrinterService';
import { Printer } from '../../../types/printer';
import { mockPrinters } from '../../../mocks/mockPrinters';

export class MockPrinterProvider implements IPrinterService {
  private printers: Printer[] = Array.isArray(mockPrinters) ? [...mockPrinters] : [];

  async getPrinters(): Promise<Printer[]> {
    await new Promise((r) => setTimeout(r, 40));
    return [...this.printers];
  }

  async getPrinterById(id: string): Promise<Printer | null> {
    await new Promise((r) => setTimeout(r, 20));
    const found = this.printers.find((p) => p.id === id);
    return found ? { ...found } : null;
  }

  async createPrinter(dto: CreatePrinterDto): Promise<Printer> {
    await new Promise((r) => setTimeout(r, 60));
    const newId = `PRN-${String(this.printers.length + 1).padStart(3, '0')}`;
    const now = new Date().toISOString();
    const loc = dto.location || `${dto.branch} • ${dto.floor} - ${dto.department}`;

    const newPrinter: Printer = {
      id: newId,
      name: dto.name,
      ip: dto.ip,
      mfr: dto.mfr,
      model: dto.model,
      deviceType: dto.deviceType || 'Color MFP',
      colorCapability: dto.colorCapability || 'Color',
      serial: dto.serial || `SN-${Math.floor(100000 + Math.random() * 900000)}`,
      firmware: 'v2.4.1',
      connectionStatus: 'Online',
      monitoringStatus: 'Active',
      status: 'Online',
      alertSeverity: 'clear',
      alertText: 'Hệ thống hoạt động bình thường',
      branch: dto.branch,
      floor: dto.floor,
      department: dto.department,
      location: loc,
      snmpStatus: 'v2c Active',
      lastScrape: now,
      lastSuccessfulScrape: now,
      health: 'Healthy',
      scannerErr: 'Normal',
      adfErr: 'Normal',
      copierErr: 'Normal',
      mfpErr: 'Normal',
      supplies: {
        black: 95,
        cyan: dto.colorCapability === 'Monochrome' ? null : 88,
        magenta: dto.colorCapability === 'Monochrome' ? null : 85,
        yellow: dto.colorCapability === 'Monochrome' ? null : 90,
        waste: 15,
      },
      counters: {
        total: 1250,
        copier: 400,
        fax: 50,
        scanner: 800,
      },
      thirtyDayVolume: 1250,
      incidents: [],
    };

    this.printers.unshift(newPrinter);
    return { ...newPrinter };
  }

  async updatePrinter(id: string, dto: UpdatePrinterDto): Promise<Printer> {
    await new Promise((r) => setTimeout(r, 60));
    const idx = this.printers.findIndex((p) => p.id === id);
    if (idx === -1) {
      throw new Error(`Không tìm thấy máy in có mã ${id}`);
    }

    const cur = this.printers[idx];
    const updatedLoc =
      dto.location ||
      (dto.branch || dto.floor || dto.department
        ? `${dto.branch || cur.branch} • ${dto.floor || cur.floor} - ${dto.department || cur.department}`
        : cur.location);

    const historyLogs = [...(cur.historyLogs || [])];
    if (dto.handoverFile || dto.floor !== undefined || dto.custodianName !== undefined) {
      const isRelocation = dto.floor !== undefined && dto.floor !== cur.floor;
      const isCustodian = dto.custodianName !== undefined && dto.custodianName !== cur.custodianName;
      historyLogs.unshift({
        id: `hist-${Date.now()}`,
        printerId: cur.id,
        actionType: isRelocation ? 'RELOCATION' : isCustodian ? 'CUSTODIAN_TRANSFER' : 'CONFIG_CHANGE',
        previousData: {
          floor: cur.floor,
          department: cur.department,
          custodianName: cur.custodianName,
          managingTeam: cur.managingTeam,
        },
        newData: {
          floor: dto.floor ?? cur.floor,
          department: dto.department ?? cur.department,
          custodianName: dto.custodianName ?? cur.custodianName,
          managingTeam: dto.managingTeam ?? cur.managingTeam,
        },
        storageKey: dto.handoverFile ? `handover/${new Date().getFullYear()}/${dto.handoverFile.name}` : undefined,
        attachedFileName: dto.handoverFile?.name,
        fileSize: dto.handoverFile?.size,
        mimeType: dto.handoverFile?.type || 'application/pdf',
        sha256Hash: dto.handoverFile ? 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' : undefined,
        performedBy: 'Quản trị viên (Admin)',
        notes: dto.handoverReason || 'Cập nhật thông tin cấu hình và điều chuyển tài sản',
        createdAt: new Date().toISOString(),
      });
    }

    const updated: Printer = {
      ...cur,
      name: dto.name ?? cur.name,
      ip: dto.ip ?? cur.ip,
      mfr: dto.mfr ?? cur.mfr,
      model: dto.model ?? cur.model,
      serial: dto.serial ?? cur.serial,
      deviceType: dto.deviceType ?? cur.deviceType,
      colorCapability: dto.colorCapability ?? cur.colorCapability,
      branch: dto.branch ?? cur.branch,
      floor: dto.floor ?? cur.floor,
      department: dto.department ?? cur.department,
      location: updatedLoc,
      monitoringStatus: dto.monitoringStatus ?? cur.monitoringStatus,
      gridX: dto.gridX !== undefined ? dto.gridX : cur.gridX,
      gridY: dto.gridY !== undefined ? dto.gridY : cur.gridY,
      managingTeam: dto.managingTeam !== undefined ? dto.managingTeam : cur.managingTeam,
      custodianName: dto.custodianName !== undefined ? dto.custodianName : cur.custodianName,
      custodianContact: dto.custodianContact !== undefined ? dto.custodianContact : cur.custodianContact,
      lastInventoriedAt: dto.lastInventoriedAt !== undefined ? dto.lastInventoriedAt : cur.lastInventoriedAt,
      historyLogs,
    };

    this.printers[idx] = updated;
    return { ...updated };
  }

  async deletePrinter(id: string): Promise<boolean> {
    await new Promise((r) => setTimeout(r, 60));
    const idx = this.printers.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    this.printers.splice(idx, 1);
    return true;
  }

  async updatePrinterLocation(id: string, dto: UpdateLocationDto): Promise<{ success: boolean; printer: Printer }> {
    await new Promise((r) => setTimeout(r, 60));
    const idx = this.printers.findIndex((p) => p.id === id);
    if (idx === -1) {
      throw new Error(`Không tìm thấy máy in có mã ${id}`);
    }

    const updated: Printer = {
      ...this.printers[idx],
      location: dto.location,
    };
    this.printers[idx] = updated;

    return {
      success: true,
      printer: { ...updated },
    };
  }

  async syncPrinters(): Promise<{ success: boolean; syncedCount: number; timestamp: string }> {
    await new Promise((r) => setTimeout(r, 120));
    const now = new Date().toISOString();
    this.printers = this.printers.map((p) => ({
      ...p,
      lastScrape: now,
      lastSuccessfulScrape: p.connectionStatus === 'Online' ? now : p.lastSuccessfulScrape,
    }));

    return {
      success: true,
      syncedCount: this.printers.length,
      timestamp: now,
    };
  }
}

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
import { mockPrinters } from '../../../mocks';

export class MockPrinterProvider implements IPrinterService {
  private printers: Printer[] = [...mockPrinters];

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

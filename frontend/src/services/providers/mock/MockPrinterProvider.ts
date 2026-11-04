/**
 * Frontend/src/services/providers/mock/MockPrinterProvider.ts
 *
 * Triển khai IPrinterService đọc/ghi dữ liệu mô phỏng trong bộ nhớ.
 */

import { IPrinterService, UpdateLocationDto } from '../../interfaces/IPrinterService';
import { Printer } from '../../../types/printer';
import { mockPrinters } from '../../../mocks/mockPrinters';

export class MockPrinterProvider implements IPrinterService {
  private printers: Printer[] = [...mockPrinters];

  async getPrinters(): Promise<Printer[]> {
    // Giả lập độ trễ mạng nhẹ nhàng 40ms
    await new Promise(r => setTimeout(r, 40));
    return [...this.printers];
  }

  async getPrinterById(id: string): Promise<Printer | null> {
    await new Promise(r => setTimeout(r, 20));
    const found = this.printers.find(p => p.id === id);
    return found ? { ...found } : null;
  }

  async updatePrinterLocation(id: string, dto: UpdateLocationDto): Promise<{ success: boolean; printer: Printer }> {
    await new Promise(r => setTimeout(r, 60));
    const idx = this.printers.findIndex(p => p.id === id);
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
    await new Promise(r => setTimeout(r, 120));
    const now = new Date().toISOString();
    this.printers = this.printers.map(p => ({
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

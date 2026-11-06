/**
 * Frontend/src/services/providers/api/ApiPrinterProvider.ts
 *
 * Triển khai IPrinterService thông qua REST API Backend.
 * Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import {
  IPrinterService,
  UpdateLocationDto,
  CreatePrinterDto,
  UpdatePrinterDto,
} from '../../interfaces/IPrinterService';
import { Printer } from '../../../types/printer';
import { requestApi } from './apiClient';

export class ApiPrinterProvider implements IPrinterService {
  async getPrinters(): Promise<Printer[]> {
    return requestApi<Printer[]>('/printers');
  }

  async getPrinterById(id: string): Promise<Printer | null> {
    try {
      return await requestApi<Printer>(`/printers/${id}`);
    } catch (err: unknown) {
      if ((err as any)?.status === 404 || (err instanceof Error && err.message.includes('404'))) {
        return null;
      }
      throw err;
    }
  }

  async createPrinter(dto: CreatePrinterDto): Promise<Printer> {
    const res = await requestApi<any>('/printers', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
    return (res?.printer ?? res) as Printer;
  }

  async updatePrinter(id: string, dto: UpdatePrinterDto): Promise<Printer> {
    const res = await requestApi<any>(`/printers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    });
    return (res?.printer ?? res) as Printer;
  }

  async deletePrinter(id: string): Promise<boolean> {
    await requestApi<void>(`/printers/${id}`, {
      method: 'DELETE',
    });
    return true;
  }

  async updatePrinterLocation(id: string, dto: UpdateLocationDto): Promise<{ success: boolean; printer: Printer }> {
    return requestApi<{ success: boolean; printer: Printer }>(`/printers/${id}/location`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    });
  }

  async syncPrinters(): Promise<{ success: boolean; syncedCount: number; timestamp: string }> {
    return requestApi<{ success: boolean; syncedCount: number; timestamp: string }>('/printers/sync', {
      method: 'POST',
    });
  }
}

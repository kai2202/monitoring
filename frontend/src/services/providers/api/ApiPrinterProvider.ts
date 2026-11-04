/**
 * Frontend/src/services/providers/api/ApiPrinterProvider.ts
 *
 * Triển khai IPrinterService thông qua REST API Backend.
 */

import { IPrinterService, UpdateLocationDto } from '../../interfaces/IPrinterService';
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
      if (err instanceof Error && err.message.includes('404')) {
        return null;
      }
      throw err;
    }
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


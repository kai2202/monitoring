/**
 * Frontend/src/services/providers/api/ApiSuppliesProvider.ts
 *
 * Triển khai ISuppliesService thông qua REST API Backend.
 */

import { ISuppliesService, PrinterSupplyItem } from '../../interfaces/ISuppliesService';
import { SuppliesSummary } from '../../../mocks/mockSupplies';
import { Supplies } from '../../../types/printer';
import { requestApi } from './apiClient';

export class ApiSuppliesProvider implements ISuppliesService {
  async getSuppliesSummary(): Promise<SuppliesSummary> {
    return requestApi<SuppliesSummary>('/supplies/summary');
  }

  async getSuppliesList(): Promise<PrinterSupplyItem[]> {
    return requestApi<PrinterSupplyItem[]>('/supplies');
  }

  async getPrinterSupplies(printerId: string): Promise<Supplies | null> {
    try {
      return await requestApi<Supplies>(`/supplies/printer/${printerId}`);
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('404')) {
        return null;
      }
      throw err;
    }
  }
}


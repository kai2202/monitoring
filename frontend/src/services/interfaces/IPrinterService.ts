/**
 * Frontend/src/services/interfaces/IPrinterService.ts
 *
 * Hợp đồng Service Layer cho quản lý danh mục và chẩn đoán máy in.
 */

import { Printer } from '../../types/printer';

export interface UpdateLocationDto {
  location: string;
  notes?: string;
}

export interface IPrinterService {
  getPrinters(): Promise<Printer[]>;
  getPrinterById(id: string): Promise<Printer | null>;
  updatePrinterLocation(id: string, dto: UpdateLocationDto): Promise<{ success: boolean; printer: Printer }>;
  syncPrinters(): Promise<{ success: boolean; syncedCount: number; timestamp: string }>;
}


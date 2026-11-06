/**
 * Frontend/src/services/interfaces/IPrinterService.ts
 *
 * Hợp đồng Service Layer cho quản lý danh mục và chẩn đoán máy in.
 * Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import { Printer, DeviceType } from '../../types/printer';

export interface UpdateLocationDto {
  location: string;
  notes?: string;
}

export interface CreatePrinterDto {
  name: string;
  ip: string;
  mfr: string;
  model: string;
  serial?: string;
  deviceType?: DeviceType;
  colorCapability?: 'Color' | 'Monochrome';
  branch: string;
  floor: string;
  department: string;
  location?: string;
}

export interface UpdatePrinterDto {
  name?: string;
  ip?: string;
  mfr?: string;
  model?: string;
  serial?: string;
  deviceType?: DeviceType;
  colorCapability?: 'Color' | 'Monochrome';
  branch?: string;
  floor?: string;
  department?: string;
  location?: string;
  monitoringStatus?: string;
}

export interface IPrinterService {
  getPrinters(): Promise<Printer[]>;
  getPrinterById(id: string): Promise<Printer | null>;
  createPrinter(dto: CreatePrinterDto): Promise<Printer>;
  updatePrinter(id: string, dto: UpdatePrinterDto): Promise<Printer>;
  deletePrinter(id: string): Promise<boolean>;
  updatePrinterLocation(id: string, dto: UpdateLocationDto): Promise<{ success: boolean; printer: Printer }>;
  syncPrinters(): Promise<{ success: boolean; syncedCount: number; timestamp: string }>;
}

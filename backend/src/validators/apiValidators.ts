/**
 * Backend/src/validators/apiValidators.ts
 *
 * Bộ Schema Zod kiểm tra và làm sạch dữ liệu đầu vào (Input Validation & Sanitization)
 * cho phân hệ Quản lý Máy In (Printers).
 * Tuân thủ AGENTS.md Rule 4 & Rule 7.1 (< 300 LOC).
 */

import { z } from 'zod';

export const createPrinterSchema = z.object({
  id: z.string().trim().min(1).max(64).optional(),
  name: z.string({ required_error: 'Tên máy in là bắt buộc' }).trim().min(2).max(120),
  ip: z.string({ required_error: 'Địa chỉ IP là bắt buộc' }).trim().min(7).max(45),
  model: z.string().trim().min(1).max(100).optional(),
  mfr: z.string().trim().min(1).max(60).optional(),
  deviceType: z.string().trim().max(60).optional(),
  serialNumber: z.string().trim().max(80).nullable().optional(),
  building: z.string().trim().max(100).optional(),
  location: z.string().trim().max(200).optional(),
  floor: z.string().trim().max(50).optional(),
  department: z.string().trim().max(120).optional(),
  isColor: z.boolean().optional(),
  connectionStatus: z.enum(['Online', 'Offline', 'Unknown']).optional(),
  health: z.string().trim().max(40).optional(),
  zabbixHostId: z.string().trim().max(64).nullable().optional(),
  snmpCommunity: z.string().trim().max(64).optional(),
});

export const updatePrinterSchema = createPrinterSchema.partial();

export const relocatePrinterSchema = z.object({
  building: z.string().trim().min(1).max(100).optional(),
  floor: z.string().trim().min(1).max(50).optional(),
  department: z.string().trim().min(1).max(120).optional(),
  location: z.string().trim().min(1).max(200).optional(),
});

/**
 * Backend/src/validators/apiValidators.ts
 *
 * Bộ Schema Zod kiểm tra và làm sạch dữ liệu đầu vào (Input Validation & Sanitization)
 * cho các phân hệ: Printers, Incidents, Tasks & WorkLogs.
 * Tuân thủ AGENTS.md Rule 4 & Rule 7.1 (< 300 LOC).
 */

import { z } from 'zod';

/**
 * 1. Printers Module Schemas
 */
export const createPrinterSchema = z.object({
  id: z.string().trim().min(1).max(64).optional(),
  name: z.string({ required_error: 'Tên máy in là bắt buộc' }).trim().min(2).max(120),
  ip: z.string({ required_error: 'Địa chỉ IP là bắt buộc' }).trim().min(7).max(45),
  model: z.string().trim().min(1).max(100).optional(),
  mfr: z.string().trim().min(1).max(60).optional(),
  deviceType: z.string().trim().max(60).optional(),
  serialNumber: z.string().trim().max(80).nullable().optional(),
  branch: z.string().trim().max(100).optional(),
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
  branch: z.string().trim().min(1).max(100).optional(),
  floor: z.string().trim().min(1).max(50).optional(),
  department: z.string().trim().min(1).max(120).optional(),
  location: z.string().trim().min(1).max(200).optional(),
});

/**
 * 2. Incidents Module Schemas
 */
export const resolveIncidentSchema = z.object({
  resolutionNote: z
    .string({ required_error: 'Lý do / ghi chú xử lý sự cố là bắt buộc' })
    .trim()
    .min(3, 'Ghi chú xử lý phải có ít nhất 3 ký tự')
    .max(1000)
    .optional(),
  evidenceUrl: z.string().trim().max(500).optional(),
});

export const triageIncidentSchema = z.object({
  triageStatus: z.enum(['Pending', 'Triaged', 'Escalated', 'Resolved']).optional(),
  assignedTo: z.string().trim().max(100).optional(),
  notes: z.string().trim().max(1000).optional(),
});

/**
 * 3. Tasks & Work Orders Module Schemas
 */
export const createTaskSchema = z.object({
  id: z.string().trim().max(64).optional(),
  printerId: z.string({ required_error: 'Mã máy in (printerId) là bắt buộc' }).trim().min(1),
  incidentId: z.string().trim().nullable().optional(),
  title: z.string({ required_error: 'Tiêu đề công việc là bắt buộc' }).trim().min(2).max(200),
  taskType: z.string().trim().max(100).optional(),
  priority: z.enum(['P1_Urgent', 'P2_High', 'P3_Medium', 'P4_Low']).optional(),
  status: z.enum(['Planned', 'In_Progress', 'Waiting', 'Completed', 'Cancelled']).optional(),
  assigneeId: z.string().trim().nullable().optional(),
  assignee: z.string().trim().max(100).optional(),
  assigneeName: z.string().trim().max(100).optional(),
  dueDate: z.string().trim().optional(),
  dynamicSteps: z.array(z.any()).optional(),
  timeAndCost: z.record(z.any()).optional(),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  progressPercent: z.number().min(0).max(100).optional(),
});

export const createWorkLogSchema = z.object({
  hoursSpent: z.number().min(0.1).max(240).optional(),
  note: z.string().trim().min(2, 'Nội dung nhật ký sửa chữa là bắt buộc').max(2000).optional(),
  workPerformed: z.string().trim().max(2000).optional(),
  partsCostVnd: z.number().min(0).optional(),
  laborCostVnd: z.number().min(0).optional(),
  authorName: z.string().trim().max(100).optional(),
  technicianName: z.string().trim().max(100).optional(),
});


/**
 * Backend/src/controllers/printerController.ts
 *
 * Controller xử lý REST API cho danh mục máy in (Printers API):
 * - Tích hợp 100% Prisma ORM kết nối PostgreSQL và đồng bộ Zabbix.
 * - Tuân thủ AGENTS.md Rule 5 (MetricValue = number | null) & Rule 7.1 (< 300 LOC).
 */

import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { zabbixSyncWorker } from '../services/zabbix/zabbixSyncWorker';
import { createPrinterSchema, updatePrinterSchema, relocatePrinterSchema } from '../validators/apiValidators';

export class PrinterController {
  // GET /api/v1/printers
  async getPrinters(req: Request, res: Response) {
    try {
      const { building, floor, department, status, health, search } = req.query;
      const whereClause: any = {};

      if (building && building !== 'all') {
        whereClause.building = { contains: String(building), mode: 'insensitive' };
      }
      if (floor && floor !== 'all') {
        whereClause.floor = { contains: String(floor), mode: 'insensitive' };
      }
      if (department && department !== 'all') {
        whereClause.department = { contains: String(department), mode: 'insensitive' };
      }
      if (status && status !== 'all') {
        whereClause.connectionStatus = { equals: String(status), mode: 'insensitive' };
      }
      if (health && health !== 'all') {
        whereClause.health = { equals: String(health), mode: 'insensitive' };
      }
      if (search) {
        const q = String(search).trim();
        whereClause.OR = [
          { name: { contains: q, mode: 'insensitive' } },
          { ip: { contains: q, mode: 'insensitive' } },
          { model: { contains: q, mode: 'insensitive' } },
          { department: { contains: q, mode: 'insensitive' } },
          { serialNumber: { contains: q, mode: 'insensitive' } },
        ];
      }

      const dbPrinters = await prisma.printer.findMany({
        where: whereClause,
        include: { consumable: true },
        orderBy: { name: 'asc' },
      });

      const formatted = dbPrinters.map((p) => ({
        id: p.id,
        name: p.name,
        ip: p.ip,
        model: p.model,
        mfr: p.mfr,
        deviceType: p.deviceType,
        serialNumber: p.serialNumber,
        building: p.building,
        location: p.location,
        floor: p.floor,
        department: p.department,
        colorCapability: p.isColor ? 'Color' : 'Monochrome',
        connectionStatus: p.connectionStatus,
        health: p.health,
        alertSeverity: p.alertSeverity,
        supplies: p.consumable
          ? {
              cyan: p.consumable.tonerCyan,
              magenta: p.consumable.tonerMagenta,
              yellow: p.consumable.tonerYellow,
              black: p.consumable.tonerBlack,
              drumLifePercent: p.consumable.drumLifePercent,
              fuserLifePercent: p.consumable.fuserLifePercent,
              wasteTonerStatus: p.consumable.wasteTonerStatus,
            }
          : null,
        monitoringStatus: p.syncStatus === 'SUCCESS' ? 'Active' : 'Warning',
        lastSeenAt: p.lastSeenAt,
        lastSyncTime: p.lastSyncTime,
      }));

      return res.status(200).json(formatted);
    } catch (err: any) {
      console.error('[PrinterController.getPrinters] Lỗi truy vấn:', err);
      return res.status(500).json({ error: 'Không thể lấy danh sách máy in', message: err.message });
    }
  }

  // GET /api/v1/printers/:id
  async getPrinterById(req: Request, res: Response) {
    try {
      const p = await prisma.printer.findUnique({
        where: { id: req.params.id },
        include: {
          consumable: true,
          incidents: { take: 10, orderBy: { detectedAt: 'desc' } },
          counterRollups: { take: 30, orderBy: { recordedDate: 'desc' } },
          tasks: { take: 5, orderBy: { createdAt: 'desc' } },
        },
      });

      if (!p) {
        return res.status(404).json({ error: 'Không tìm thấy máy in với mã chỉ định' });
      }

      return res.status(200).json({
        id: p.id,
        name: p.name,
        ip: p.ip,
        model: p.model,
        mfr: p.mfr,
        deviceType: p.deviceType,
        serialNumber: p.serialNumber,
        building: p.building,
        location: p.location,
        floor: p.floor,
        department: p.department,
        colorCapability: p.isColor ? 'Color' : 'Monochrome',
        connectionStatus: p.connectionStatus,
        health: p.health,
        alertSeverity: p.alertSeverity,
        zabbixHostId: p.zabbixHostId,
        supplies: p.consumable
          ? {
              cyan: p.consumable.tonerCyan,
              magenta: p.consumable.tonerMagenta,
              yellow: p.consumable.tonerYellow,
              black: p.consumable.tonerBlack,
              drumLifePercent: p.consumable.drumLifePercent,
              fuserLifePercent: p.consumable.fuserLifePercent,
              wasteTonerStatus: p.consumable.wasteTonerStatus,
              forecastExhaustionDate: p.consumable.forecastExhaustionDate,
            }
          : null,
        incidents: p.incidents,
        counterRollups: p.counterRollups,
        tasks: p.tasks,
        lastSeenAt: p.lastSeenAt,
        lastSyncTime: p.lastSyncTime,
        syncStatus: p.syncStatus,
      });
    } catch (err: any) {
      console.error('[PrinterController.getPrinterById] Lỗi truy vấn:', err);
      return res.status(500).json({ error: 'Không thể lấy chi tiết máy in', message: err.message });
    }
  }

  // POST /api/v1/printers
  async createPrinter(req: Request, res: Response) {
    try {
      const parsed = createPrinterSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0]?.message || 'Dữ liệu máy in không hợp lệ' });
      }
      const data = parsed.data;
      const created = await prisma.printer.create({
        data: {
          id: data.id || undefined,
          name: data.name,
          ip: data.ip,
          model: data.model || 'Unknown Model',
          mfr: data.mfr || 'Generic',
          deviceType: data.deviceType || 'A4 Laser',
          serialNumber: data.serialNumber || null,
          building: data.building || 'Trụ sở chính',
          location: data.location || 'Chưa định vị',
          floor: data.floor || 'T1',
          department: data.department || 'Văn phòng',
          isColor: data.isColor ?? true,
          connectionStatus: data.connectionStatus || 'Online',
          health: data.health || 'Healthy',
          zabbixHostId: data.zabbixHostId || null,
          snmpCommunity: data.snmpCommunity || 'public',
          consumable: {
            create: {
              tonerBlack: 100,
              tonerCyan: data.isColor ? 100 : null,
              tonerMagenta: data.isColor ? 100 : null,
              tonerYellow: data.isColor ? 100 : null,
              drumLifePercent: 100,
              fuserLifePercent: 100,
            },
          },
        },
        include: { consumable: true },
      });

      return res.status(201).json({ success: true, printer: created });
    } catch (err: any) {
      console.error('[PrinterController.createPrinter] Lỗi thêm máy in:', err);
      return res.status(500).json({ error: 'Không thể thêm mới máy in', message: err.message });
    }
  }

  // PATCH / PUT /api/v1/printers/:id
  async updatePrinter(req: Request, res: Response) {
    try {
      const parsed = updatePrinterSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0]?.message || 'Dữ liệu cập nhật không hợp lệ' });
      }
      const updated = await prisma.printer.update({
        where: { id: req.params.id },
        data: parsed.data,
        include: { consumable: true },
      });
      return res.status(200).json({ success: true, printer: updated });
    } catch (err: any) {
      console.error('[PrinterController.updatePrinter] Lỗi cập nhật:', err);
      return res.status(500).json({ error: 'Không thể cập nhật máy in', message: err.message });
    }
  }

  // DELETE /api/v1/printers/:id
  async deletePrinter(req: Request, res: Response) {
    try {
      await prisma.printer.delete({ where: { id: req.params.id } });
      return res.status(200).json({ success: true, message: 'Đã xóa máy in thành công' });
    } catch (err: any) {
      console.error('[PrinterController.deletePrinter] Lỗi xóa:', err);
      return res.status(500).json({ error: 'Không thể xóa máy in', message: err.message });
    }
  }

  // PATCH /api/v1/printers/:id/location
  async updatePrinterLocation(req: Request, res: Response) {
    try {
      const parsed = relocatePrinterSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0]?.message || 'Dữ liệu điều chuyển không hợp lệ' });
      }
      const { building, floor, department, location } = parsed.data;
      const printer = await prisma.printer.findUnique({ where: { id: req.params.id } });
      if (!printer) {
        return res.status(404).json({ error: 'Không tìm thấy máy in' });
      }

      const updated = await prisma.printer.update({
        where: { id: req.params.id },
        data: {
          building: building || undefined,
          floor: floor || undefined,
          department: department || undefined,
          location: location || (floor ? `${floor} - ${department || 'Phòng ban'}` : undefined),
        },
      });

      // Ghi nhận nhật ký kiểm toán điều chuyển thiết bị
      await prisma.auditLog.create({
        data: {
          userId: req.user?.userId || null,
          action: 'PRINTER_RELOCATE',
          targetId: printer.id,
          ipAddress: req.ip,
          diffJson: {
            from: { building: printer.building, floor: printer.floor, department: printer.department },
            to: { building: updated.building, floor: updated.floor, department: updated.department },
          },
        },
      });

      return res.status(200).json({ success: true, printer: updated });
    } catch (err: any) {
      console.error('[PrinterController.updatePrinterLocation] Lỗi điều chuyển:', err);
      return res.status(500).json({ error: 'Không thể điều chuyển máy in', message: err.message });
    }
  }

  // POST /api/v1/printers/sync
  async syncPrinters(_req: Request, res: Response) {
    try {
      const result = await zabbixSyncWorker.syncNow();
      return res.status(200).json({
        success: result.success,
        syncedCount: result.syncedCount,
        zabbixConnected: result.zabbixConnected,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error('[PrinterController.syncPrinters] Lỗi đồng bộ Zabbix:', err);
      return res.status(500).json({ error: 'Lỗi khi đồng bộ dữ liệu từ Zabbix', message: err.message });
    }
  }
}

export const printerController = new PrinterController();

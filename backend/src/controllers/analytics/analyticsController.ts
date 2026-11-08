/**
 * Backend/src/controllers/analytics/analyticsController.ts
 *
 * Controller xử lý REST API cho Phân Hệ Phân Tích & Báo Cáo Sản Lượng (Analytics API):
 * - Tích hợp 100% Prisma ORM kết nối PostgreSQL, hoàn toàn không tự bịa hệ số giả định.
 * - Tính toán tăng trưởng kỳ trước từ bảng `CounterRollup` và MTTR thực tế từ `Task`/`Incident`.
 * - Tuân thủ AGENTS.md Rule 5 (MetricValue = number | null) & Rule 8 (< 300 LOC).
 */

import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { slaCostAnalyticsService } from '../../services/analytics/slaCostAnalyticsService';
import { computeDeviceComparison } from '../../services/analytics/compareAnalyticsService';

export class AnalyticsController {
  private buildWherePrinter(building?: string, floorId?: string, department?: string) {
    const where: any = {};
    if (building && building !== 'all') {
      where.building = { contains: building, mode: 'insensitive' };
    }
    if (floorId && floorId !== 'all') {
      const floorNum = floorId.replace('floor-', '');
      where.floor = { contains: floorNum, mode: 'insensitive' };
    }
    if (department && department !== 'all') {
      where.department = { contains: department, mode: 'insensitive' };
    }
    return where;
  }

  // GET /api/v1/analytics/summary
  async getSummary(req: Request, res: Response) {
    try {
      const building = (req.query.building || req.query.branch) as string | undefined;
      const floorId = req.query.floorId as string | undefined;
      const department = req.query.department as string | undefined;
      const timeframe = (req.query.timeframe as string) || '30days';
      const days = timeframe === 'hourly' ? 1 : timeframe === '7days' ? 7 : 30;

      const printers = await prisma.printer.findMany({
        where: this.buildWherePrinter(building, floorId, department),
        include: { counterRollups: { take: days * 2, orderBy: { recordedDate: 'desc' } } },
      });

      let totalVol = 0;
      let monoVol = 0;
      let colorVol = 0;
      let prevTotalVol = 0;

      printers.forEach((p) => {
        const currentWindow = p.counterRollups.slice(0, days);
        const previousWindow = p.counterRollups.slice(days, days * 2);
        currentWindow.forEach((r) => {
          monoVol += r.deltaMono;
          colorVol += r.deltaColor;
          totalVol += r.deltaMono + r.deltaColor;
        });
        previousWindow.forEach((r) => {
          prevTotalVol += r.deltaMono + r.deltaColor;
        });
      });

      const activeCount = printers.filter((p) => p.connectionStatus === 'Online').length;
      const growthRatePercent =
        printers.length > 0 && prevTotalVol > 0
          ? Number((((totalVol - prevTotalVol) / prevTotalVol) * 100).toFixed(1))
          : null;

      return res.status(200).json({
        totalFleetVolume: printers.length > 0 ? totalVol : null,
        monoVolume: printers.length > 0 ? monoVol : null,
        colorVolume: printers.length > 0 ? colorVol : null,
        avgDailyVolume: printers.length > 0 ? Math.round(totalVol / days) : null,
        activePrintersCount: activeCount,
        totalPrintersCount: printers.length,
        growthRatePercent,
        lastUpdated: new Date().toLocaleTimeString('vi-VN'),
      });
    } catch (err: any) {
      console.error('[AnalyticsController.getSummary] Lỗi truy vấn:', err);
      return res.status(500).json({ error: 'Không thể lấy tổng hợp sản lượng', message: err.message });
    }
  }

  // GET /api/v1/analytics/trend
  async getTrend(req: Request, res: Response) {
    try {
      const building = (req.query.building || req.query.branch) as string | undefined;
      const floorId = req.query.floorId as string | undefined;
      const department = req.query.department as string | undefined;
      const timeframe = (req.query.timeframe as string) || '30days';
      const count = timeframe === 'hourly' ? 24 : timeframe === '7days' ? 7 : 30;

      const printers = await prisma.printer.findMany({
        where: this.buildWherePrinter(building, floorId, department),
        include: { counterRollups: { take: count * 2, orderBy: { recordedDate: 'asc' } } },
      });

      const dateMap = new Map<string, number>();
      printers.forEach((p) => {
        p.counterRollups.forEach((r) => {
          const key = r.recordedDate.toISOString().slice(5, 10);
          dateMap.set(key, (dateMap.get(key) || 0) + r.deltaMono + r.deltaColor);
        });
      });

      const allEntries = Array.from(dateMap.entries());
      const curEntries = allEntries.slice(-count);
      const prevEntries = allEntries.slice(
        Math.max(0, allEntries.length - count * 2),
        Math.max(0, allEntries.length - count)
      );

      const dataPoints = [];
      let peakLabel = '';
      let peakVolume = 0;

      for (let idx = 0; idx < curEntries.length; idx++) {
        const [label, curVal] = curEntries[idx];
        const prevVal = prevEntries[idx] ? prevEntries[idx][1] : 0;
        if (curVal > peakVolume) {
          peakVolume = curVal;
          peakLabel = label;
        }
        dataPoints.push({
          timestamp: label,
          label,
          currentVolume: curVal,
          previousVolume: prevVal,
        });
      }

      const curTotal = dataPoints.reduce((s, p) => s + p.currentVolume, 0);
      const prevTotal = dataPoints.reduce((s, p) => s + p.previousVolume, 0);
      const growthPercent =
        prevTotal > 0 ? Number((((curTotal - prevTotal) / prevTotal) * 100).toFixed(1)) : null;

      return res.status(200).json({
        timeframe,
        dataPoints,
        currentTotalVolume: curTotal,
        previousTotalVolume: prevTotal > 0 ? prevTotal : null,
        growthPercent,
        peakLabel: peakLabel || '—',
        peakVolume,
      });
    } catch (err: any) {
      console.error('[AnalyticsController.getTrend] Lỗi truy vấn:', err);
      return res.status(500).json({ error: 'Không thể lấy xu hướng sản lượng', message: err.message });
    }
  }

  // GET /api/v1/analytics/distribution
  async getDistribution(req: Request, res: Response) {
    try {
      const building = (req.query.building || req.query.branch) as string | undefined;
      const floorId = req.query.floorId as string | undefined;
      const department = req.query.department as string | undefined;
      const timeframe = (req.query.timeframe as string) || '30days';
      const days = timeframe === 'hourly' ? 1 : timeframe === '7days' ? 7 : 30;

      const printers = await prisma.printer.findMany({
        where: this.buildWherePrinter(building, floorId, department),
        include: { counterRollups: { take: days, orderBy: { recordedDate: 'desc' } } },
      });

      let totalFleetVolume = 0;
      const devices = printers.map((p) => {
        const mono = p.counterRollups.reduce((s, r) => s + r.deltaMono, 0);
        const color = p.counterRollups.reduce((s, r) => s + r.deltaColor, 0);
        const total = mono + color;
        totalFleetVolume += total;

        const floorNum = p.floor.replace(/\D/g, '') || '1';
        return {
          id: p.id,
          name: p.name,
          model: p.model,
          mfr: p.mfr,
          ip: p.ip,
          serial: p.serialNumber || '—',
          branch: p.building,
          building: p.building,
          floorId: `floor-${floorNum}`,
          floorName: `Tầng ${floorNum}`,
          department: p.department,
          status: p.connectionStatus === 'Online' ? 'Online' : 'Offline',
          health: p.health,
          totalVol: total,
          monoVol: mono,
          colorVol: color,
          monoPercent: total > 0 ? Math.round((mono / total) * 100) : 0,
          colorPercent: total > 0 ? Math.round((color / total) * 100) : 0,
          ppmNominal: null,
          ppmActual: null,
          isColorCapable: p.isColor,
        };
      });

      const floorMap = new Map<string, { count: number; volume: number }>();
      devices.forEach((d) => {
        const cur = floorMap.get(d.floorName) || { count: 0, volume: 0 };
        floorMap.set(d.floorName, { count: cur.count + 1, volume: cur.volume + d.totalVol });
      });

      const floorColors = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#a855f7', '#ec4899'];
      const floors = Array.from(floorMap.entries()).map(([name, data], idx) => ({
        floorId: `floor-${name.replace(/\D/g, '') || '1'}`,
        floorName: name,
        deviceCount: data.count,
        totalVolume: data.volume,
        sharePercentage: totalFleetVolume > 0 ? Math.round((data.volume / totalFleetVolume) * 100) : 0,
        color: floorColors[idx % floorColors.length],
      }));

      return res.status(200).json({ devices, floors, totalFleetVolume });
    } catch (err: any) {
      console.error('[AnalyticsController.getDistribution] Lỗi truy vấn:', err);
      return res.status(500).json({ error: 'Không thể lấy phân bố sản lượng', message: err.message });
    }
  }

  // GET /api/v1/analytics/supplies
  async getSupplies(req: Request, res: Response) {
    try {
      const building = (req.query.building || req.query.branch) as string | undefined;
      const result = await slaCostAnalyticsService.computeSuppliesForecast(building);
      return res.status(200).json(result);
    } catch (err: any) {
      return res.status(500).json({ error: 'Không thể lấy dự báo vật tư', message: err.message });
    }
  }

  // GET /api/v1/analytics/sla-cost
  async getSLACost(req: Request, res: Response) {
    try {
      const building = (req.query.building || req.query.branch) as string | undefined;
      const result = await slaCostAnalyticsService.computeSLACost(building);
      return res.status(200).json(result);
    } catch (err: any) {
      return res.status(500).json({ error: 'Không thể lấy dữ liệu SLA & Chi phí', message: err.message });
    }
  }

  // GET & POST /api/v1/analytics/compare
  async getCompare(req: Request, res: Response) {
    try {
      const bodyIds = Array.isArray(req.body?.printerIds) ? req.body.printerIds : [];
      const queryIds = typeof req.query.printerIds === 'string' ? req.query.printerIds.split(',') : [];
      const ids = bodyIds.length > 0 ? bodyIds : queryIds;

      const result = await computeDeviceComparison(ids);
      return res.status(200).json(result);
    } catch (err: any) {
      console.error('[AnalyticsController.getCompare] Lỗi so sánh thiết bị:', err);
      return res.status(500).json({ error: 'Không thể lấy dữ liệu so sánh máy in', message: err.message });
    }
  }
}

export const analyticsController = new AnalyticsController();


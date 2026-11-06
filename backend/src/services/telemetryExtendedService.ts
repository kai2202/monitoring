/**
 * Backend/src/services/telemetryExtendedService.ts
 *
 * Dịch vụ tổng hợp mở rộng cho các truy vấn Telemetry chuyên sâu từ PostgreSQL:
 * - Volume Trend, Top Printers Volume, Rankings, Inventory Analytics, Heatmap, Compare, Production Trend.
 * - Tuân thủ AGENTS.md Rule 5 (MetricValue = number | null) & Rule 7.1 (< 300 LOC).
 */

import { prisma } from '../lib/prisma';

export class TelemetryExtendedService {
  async getVolumeTrend(days = 30) {
    const safeDays = Math.min(Math.max(1, days), 365);
    const since = new Date(Date.now() - safeDays * 86_400_000);
    const rollups = await prisma.counterRollup.findMany({
      where: { recordedDate: { gte: since } },
      orderBy: { recordedDate: 'asc' },
    });

    const grouped = new Map<string, { monoPages: number; colorPages: number; scanPages: number }>();
    for (const r of rollups) {
      const dateKey = r.recordedDate.toISOString().slice(0, 10);
      const cur = grouped.get(dateKey) || { monoPages: 0, colorPages: 0, scanPages: 0 };
      cur.monoPages += r.deltaMono;
      cur.colorPages += r.deltaColor;
      cur.scanPages += r.scanPages;
      grouped.set(dateKey, cur);
    }

    return Array.from(grouped.entries()).map(([date, val]) => ({
      date,
      monoPages: val.monoPages,
      colorPages: val.colorPages,
      totalPages: val.monoPages + val.colorPages,
      scanPages: val.scanPages,
    }));
  }

  async getTopPrintersVolume(limit = 10, days = 30) {
    const since = new Date(Date.now() - days * 86_400_000);
    const printers = await prisma.printer.findMany({
      include: { counterRollups: { where: { recordedDate: { gte: since } } } },
    });

    return printers
      .map((p) => {
        const monoPages = p.counterRollups.reduce((s, r) => s + r.deltaMono, 0);
        const colorPages = p.counterRollups.reduce((s, r) => s + r.deltaColor, 0);
        return {
          printerId: p.id,
          printerName: p.name,
          model: p.model,
          department: p.department,
          location: p.location,
          monoPages,
          colorPages,
          totalPages: monoPages + colorPages,
        };
      })
      .sort((a, b) => b.totalPages - a.totalPages)
      .slice(0, limit);
  }

  async getRankings(params: { scope?: string; periodDays?: number; brand?: string; search?: string }) {
    const days = params.periodDays || 30;
    const since = new Date(Date.now() - days * 86_400_000);
    const where: any = {};
    if (params.brand && params.brand !== 'all') {
      where.mfr = { equals: params.brand, mode: 'insensitive' };
    }
    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { model: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const printers = await prisma.printer.findMany({
      where,
      include: { counterRollups: { where: { recordedDate: { gte: since } } } },
    });

    const ranked = printers.map((p) => {
      const monoPages = p.counterRollups.reduce((s, r) => s + r.deltaMono, 0);
      const colorPages = p.counterRollups.reduce((s, r) => s + r.deltaColor, 0);
      return {
        printerId: p.id,
        printerName: p.name,
        model: p.model,
        brand: p.mfr,
        department: p.department,
        location: p.location,
        monoPages,
        colorPages,
        totalPages: monoPages + colorPages,
      };
    });

    ranked.sort((a, b) =>
      params.scope === 'bottom' ? a.totalPages - b.totalPages : b.totalPages - a.totalPages
    );
    return ranked.slice(0, 20);
  }

  async getInventory(params: { page?: number; pageSize?: number; search?: string; brand?: string; department?: string }) {
    const page = Math.max(1, params.page || 1);
    const pageSize = Math.min(200, Math.max(1, params.pageSize || 20));
    const where: any = {};
    if (params.brand && params.brand !== 'all') where.mfr = { equals: params.brand, mode: 'insensitive' };
    if (params.department && params.department !== 'all') {
      where.department = { contains: params.department, mode: 'insensitive' };
    }
    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { ip: { contains: params.search, mode: 'insensitive' } },
        { serialNumber: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [totalCount, printers] = await Promise.all([
      prisma.printer.count({ where }),
      prisma.printer.findMany({
        where,
        include: { consumable: true, counterRollups: { take: 30, orderBy: { recordedDate: 'desc' } } },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { name: 'asc' },
      }),
    ]);

    const items = printers.map((p) => {
      const mono = p.counterRollups.reduce((s, r) => s + r.deltaMono, 0);
      const color = p.counterRollups.reduce((s, r) => s + r.deltaColor, 0);
      return {
        printerId: p.id,
        printerName: p.name,
        ip: p.ip,
        brand: p.mfr,
        model: p.model,
        department: p.department,
        location: p.location,
        connectionStatus: p.connectionStatus,
        health: p.health,
        monoVolume30d: mono,
        colorVolume30d: color,
        totalVolume30d: mono + color,
        tonerBlack: p.consumable?.tonerBlack ?? null,
      };
    });

    return { items, totalCount, page, pageSize, totalPages: Math.max(1, Math.ceil(totalCount / pageSize)) };
  }

  async getHeatmap(days = 14, limit = 50) {
    const since = new Date(Date.now() - days * 86_400_000);
    const printers = await prisma.printer.findMany({
      take: limit,
      include: { counterRollups: { where: { recordedDate: { gte: since } }, orderBy: { recordedDate: 'asc' } } },
      orderBy: { name: 'asc' },
    });

    const dateSet = new Set<string>();
    const cells: Array<{ printerId: string; printerName: string; date: string; volume: number }> = [];
    for (const p of printers) {
      for (const r of p.counterRollups) {
        const d = r.recordedDate.toISOString().slice(0, 10);
        dateSet.add(d);
        cells.push({
          printerId: p.id,
          printerName: p.name,
          date: d,
          volume: r.deltaMono + r.deltaColor,
        });
      }
    }

    return {
      dates: Array.from(dateSet).sort(),
      printers: printers.map((p) => ({ id: p.id, name: p.name, department: p.department })),
      cells,
    };
  }
}

export const telemetryExtendedService = new TelemetryExtendedService();


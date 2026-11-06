/**
 * Backend/src/controllers/suppliesController.ts
 *
 * Controller xử lý REST API cho Vật Tư Tiêu Hao CMYK & Hộp Mực Thải (`/api/v1/supplies`):
 * - Đọc 100% từ PostgreSQL (`Printer`, `PrinterConsumable`) và ngưỡng động `loadActiveRuntimeRules`.
 * - Bảo toàn tuyệt đối chuẩn `MetricValue = number | null` (không bao giờ ép `null` thành `0`).
 * - Tuân thủ AGENTS.md Rule 5 & Rule 7.1 (< 300 LOC).
 */

import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { loadActiveRuntimeRules } from '../services/runtimeSettingsStore';

function mapWasteToPercent(wasteStatus?: string | null): number | null {
  if (!wasteStatus) return null;
  const upper = wasteStatus.toUpperCase();
  if (upper === 'FULL') return 100;
  if (upper === 'WARNING') return 85;
  if (upper === 'OK' || upper === 'EMPTY') return 20;
  return null;
}

export class SuppliesController {
  // GET /api/v1/supplies/summary
  async getSuppliesSummary(_req: Request, res: Response) {
    try {
      const [printers, activeRules] = await Promise.all([
        prisma.printer.findMany({ include: { consumable: true } }),
        loadActiveRuntimeRules(),
      ]);

      const critPct = Number(activeRules.thresholds?.tonerCriticalPercent ?? 10);
      const warnPct = Number(activeRules.thresholds?.tonerWarningPercent ?? 20);

      let lowTonerCriticalCount = 0;
      let lowTonerWarningCount = 0;
      let wasteTonerFullCount = 0;
      let monoPrintersCount = 0;
      let colorPrintersCount = 0;

      for (const p of printers) {
        if (p.isColor) colorPrintersCount++;
        else monoPrintersCount++;

        const c = p.consumable;
        if (!c) continue;

        const levels = (p.isColor
          ? [c.tonerBlack, c.tonerCyan, c.tonerMagenta, c.tonerYellow]
          : [c.tonerBlack]
        ).filter((v): v is number => typeof v === 'number');

        if (levels.length > 0) {
          const minLevel = Math.min(...levels);
          if (minLevel <= critPct) lowTonerCriticalCount++;
          else if (minLevel <= warnPct) lowTonerWarningCount++;
        }

        const wasteUpper = (c.wasteTonerStatus || '').toUpperCase();
        if (wasteUpper === 'FULL' || wasteUpper === 'WARNING') {
          wasteTonerFullCount++;
        }
      }

      return res.status(200).json({
        totalMonitoredPrinters: printers.length,
        lowTonerCriticalCount,
        lowTonerWarningCount,
        wasteTonerFullCount,
        monoPrintersCount,
        colorPrintersCount,
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Không thể tải tổng quan vật tư', message: err.message });
    }
  }

  // GET /api/v1/supplies
  async getSuppliesList(_req: Request, res: Response) {
    try {
      const [printers, activeRules] = await Promise.all([
        prisma.printer.findMany({
          include: { consumable: true },
          orderBy: { name: 'asc' },
        }),
        loadActiveRuntimeRules(),
      ]);

      const warnPct = Number(activeRules.thresholds?.tonerWarningPercent ?? 20);

      const list = printers.map((p) => {
        const c = p.consumable;
        const supplies = {
          black: c?.tonerBlack ?? null,
          cyan: p.isColor ? c?.tonerCyan ?? null : null,
          magenta: p.isColor ? c?.tonerMagenta ?? null : null,
          yellow: p.isColor ? c?.tonerYellow ?? null : null,
          waste: mapWasteToPercent(c?.wasteTonerStatus),
          drumLifePercent: c?.drumLifePercent ?? null,
          fuserLifePercent: c?.fuserLifePercent ?? null,
          wasteTonerStatus: c?.wasteTonerStatus ?? null,
        };

        const levels = [supplies.black, supplies.cyan, supplies.magenta, supplies.yellow].filter(
          (v): v is number => typeof v === 'number'
        );
        const wasteUpper = (c?.wasteTonerStatus || '').toUpperCase();
        const hasLowSupply =
          levels.some((v) => v <= warnPct) || wasteUpper === 'FULL' || wasteUpper === 'WARNING';

        return {
          printerId: p.id,
          printerName: p.name,
          model: p.model,
          location: p.location,
          colorCapability: p.isColor ? 'Color' : 'Monochrome',
          connectionStatus: p.connectionStatus,
          supplies,
          suppliesUpdated: (c?.lastUpdated ?? p.lastSyncTime ?? p.updatedAt).toISOString(),
          hasLowSupply,
        };
      });

      return res.status(200).json(list);
    } catch (err: any) {
      return res.status(500).json({ error: 'Không thể tải danh sách vật tư', message: err.message });
    }
  }

  // GET /api/v1/supplies/printer/:id
  async getPrinterSupplies(req: Request, res: Response) {
    try {
      const p = await prisma.printer.findUnique({
        where: { id: req.params.id },
        include: { consumable: true },
      });
      if (!p) {
        return res.status(404).json({ error: 'Không tìm thấy thiết bị' });
      }
      const c = p.consumable;
      return res.status(200).json({
        black: c?.tonerBlack ?? null,
        cyan: p.isColor ? c?.tonerCyan ?? null : null,
        magenta: p.isColor ? c?.tonerMagenta ?? null : null,
        yellow: p.isColor ? c?.tonerYellow ?? null : null,
        waste: mapWasteToPercent(c?.wasteTonerStatus),
        drumLifePercent: c?.drumLifePercent ?? null,
        fuserLifePercent: c?.fuserLifePercent ?? null,
        wasteTonerStatus: c?.wasteTonerStatus ?? null,
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Không thể tải vật tư máy in', message: err.message });
    }
  }
}

export const suppliesController = new SuppliesController();


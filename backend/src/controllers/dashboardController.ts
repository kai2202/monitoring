/**
 * Backend/src/controllers/dashboardController.ts
 *
 * Controller xử lý REST API cho Trang Tổng Quan Điều Hành (Dashboard API):
 * - Tổng hợp thời gian thực 4 Thẻ KPI chính (`kpis`) trực tiếp từ PostgreSQL qua Prisma ORM.
 * - Chuẩn hóa cấu trúc `supplies` và trạng thái cho `devicesNeedingAttention` khớp 100% Frontend.
 * - Tuân thủ AGENTS.md Rule 5 (MetricValue = number | null) & Rule 7.1 (< 300 LOC).
 */

import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

function mapWasteStatusToPercent(status?: string | null): number | null {
  if (!status) return null;
  const upper = status.toUpperCase();
  if (upper === 'FULL') return 100;
  if (upper === 'WARNING') return 85;
  if (upper === 'OK' || upper === 'EMPTY') return 15;
  return null;
}

export class DashboardController {
  // GET /api/v1/dashboard/summary
  async getSummary(_req: Request, res: Response) {
    try {
      const [printers, incidents] = await Promise.all([
        prisma.printer.findMany({ include: { consumable: true }, orderBy: { name: 'asc' } }),
        prisma.incident.findMany({ include: { printer: true }, orderBy: { detectedAt: 'desc' }, take: 25 }),
      ]);

      const totalPrinters = printers.length;
      const hasPrinters = totalPrinters > 0;
      const onlineCount = hasPrinters ? printers.filter((p) => p.connectionStatus === 'Online').length : null;
      const offlineCount = hasPrinters ? printers.filter((p) => p.connectionStatus === 'Offline').length : null;
      const unknownCount = hasPrinters ? printers.filter((p) => p.connectionStatus === 'Unknown').length : null;
      const onlineRate =
        hasPrinters && onlineCount !== null ? Number(((onlineCount / totalPrinters) * 100).toFixed(1)) : null;

      const activeIncidents = incidents.filter((i) => i.status !== 'RESOLVED');
      const criticalAlertsCount = hasPrinters
        ? activeIncidents.filter((i) => i.severity.toLowerCase() === 'critical').length
        : null;
      const warningAlertsCount = hasPrinters
        ? activeIncidents.filter((i) => i.severity.toLowerCase() === 'warning').length
        : null;
      const activeAlertsCount = hasPrinters ? activeIncidents.length : null;

      const lowSuppliesCount = hasPrinters
        ? printers.filter((p) => {
            const c = p.consumable;
            if (!c) return false;
            return (
              (c.tonerBlack !== null && c.tonerBlack <= 20) ||
              (c.tonerCyan !== null && c.tonerCyan <= 20) ||
              (c.tonerMagenta !== null && c.tonerMagenta <= 20) ||
              (c.tonerYellow !== null && c.tonerYellow <= 20) ||
              c.wasteTonerStatus === 'FULL' ||
              c.wasteTonerStatus === 'WARNING'
            );
          }).length
        : null;

      const devicesNeedingAttention = printers
        .filter((p) => {
          const isCriticalOrWarning =
            p.health === 'Critical' ||
            p.health === 'Warning' ||
            p.alertSeverity === 'critical' ||
            p.alertSeverity === 'warning';
          const isOffline = p.connectionStatus === 'Offline';
          const c = p.consumable;
          const isLowSupply =
            c &&
            ((c.tonerBlack !== null && c.tonerBlack <= 15) ||
              (c.tonerCyan !== null && c.tonerCyan <= 15) ||
              (c.tonerMagenta !== null && c.tonerMagenta <= 15) ||
              (c.tonerYellow !== null && c.tonerYellow <= 15) ||
              c.wasteTonerStatus === 'FULL');
          return isCriticalOrWarning || isOffline || Boolean(isLowSupply);
        })
        .map((p) => ({
          id: p.id,
          name: p.name,
          ip: p.ip,
          model: p.model,
          mfr: p.mfr,
          deviceType: p.deviceType,
          serial: p.serialNumber || undefined,
          serialNumber: p.serialNumber,
          branch: p.branch,
          location: p.location,
          floor: p.floor,
          department: p.department,
          colorCapability: p.isColor ? 'Color' : 'Monochrome',
          connectionStatus: p.connectionStatus,
          health: p.health,
          alertSeverity: p.alertSeverity,
          monitoringStatus: p.syncStatus === 'SUCCESS' ? 'Monitored' : 'Warning',
          supplies: p.consumable
            ? {
                cyan: p.consumable.tonerCyan,
                magenta: p.consumable.tonerMagenta,
                yellow: p.consumable.tonerYellow,
                black: p.consumable.tonerBlack,
                waste: mapWasteStatusToPercent(p.consumable.wasteTonerStatus),
                drumLifePercent: p.consumable.drumLifePercent,
                fuserLifePercent: p.consumable.fuserLifePercent,
                wasteTonerStatus: p.consumable.wasteTonerStatus,
              }
            : null,
          lastSeenAt: p.lastSeenAt,
          lastSyncTime: p.lastSyncTime,
        }));

      const kpis = {
        totalPrinters,
        onlineCount,
        offlineCount,
        unknownCount,
        onlineRate,
        activeAlertsCount,
        criticalAlertsCount,
        warningAlertsCount,
        lowSuppliesCount,
      };

      return res.status(200).json({
        kpis,
        ...kpis,
        recentIncidents: incidents.slice(0, 10),
        devicesNeedingAttention: devicesNeedingAttention.slice(0, 20),
      });
    } catch (err: any) {
      console.error('[DashboardController.getSummary] Lỗi truy vấn:', err);
      return res.status(500).json({ error: 'Không thể lấy dữ liệu tổng quan Dashboard', message: err.message });
    }
  }
}

export const dashboardController = new DashboardController();

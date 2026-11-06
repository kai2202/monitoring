/**
 * Backend/src/services/telemetryTimelineService.ts
 *
 * Tính toán chuỗi thời gian khả dụng (Availability Timeline 24h) thực tế từ PostgreSQL:
 * - Kết hợp lịch sử đồng bộ Zabbix (`AuditLog` targetId='ZABBIX_SYNC_WORKER') và trạng thái hiện tại của `Printer`.
 * - Không bao giờ tự bịa số liệu cho các khung giờ chưa có dữ liệu (`onlineRate: null` theo AGENTS.md Rule 5).
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import { prisma } from '../lib/prisma';

export async function buildAvailabilityTimeline(hours: number = 24) {
  const safeHours = Math.min(Math.max(1, hours), 168);
  const since = new Date(Date.now() - safeHours * 3600 * 1000);

  const [printers, syncAudits] = await Promise.all([
    prisma.printer.findMany({
      select: { connectionStatus: true, health: true, lastSyncTime: true },
    }),
    prisma.auditLog.findMany({
      where: { targetId: 'ZABBIX_SYNC_WORKER', createdAt: { gte: since } },
      orderBy: { createdAt: 'asc' },
    }),
  ]);

  if (printers.length === 0) {
    return [];
  }

  const total = printers.length;
  const currentOnline = printers.filter((p) => p.connectionStatus === 'Online').length;
  const currentOffline = printers.filter((p) => p.connectionStatus === 'Offline').length;
  const currentWarning = printers.filter((p) => p.health === 'Warning').length;
  const currentCritical = printers.filter((p) => p.health === 'Critical').length;

  const hourBuckets = new Map<string, { onlineCount: number; totalPrinters: number }>();
  for (const log of syncAudits) {
    const diff: any = log.diffJson || {};
    if (typeof diff.onlineCount === 'number') {
      const bucketIso = new Date(log.createdAt);
      bucketIso.setMinutes(0, 0, 0);
      hourBuckets.set(bucketIso.toISOString(), {
        onlineCount: diff.onlineCount,
        totalPrinters: typeof diff.totalPrinters === 'number' && diff.totalPrinters > 0 ? diff.totalPrinters : total,
      });
    }
  }

  const nowHour = new Date();
  nowHour.setMinutes(0, 0, 0);
  const points = [];

  for (let i = safeHours - 1; i >= 0; i--) {
    const slot = new Date(nowHour.getTime() - i * 3600 * 1000);
    const iso = slot.toISOString();
    const timeLabel = slot.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const recorded = hourBuckets.get(iso);

    if (recorded) {
      const rate = Number(((recorded.onlineCount / recorded.totalPrinters) * 100).toFixed(1));
      points.push({
        timestamp: iso,
        timeLabel,
        onlineRate: rate,
        onlineCount: recorded.onlineCount,
        offlineCount: Math.max(0, recorded.totalPrinters - recorded.onlineCount),
        warningCount: null,
        criticalCount: null,
      });
    } else if (i === 0) {
      points.push({
        timestamp: iso,
        timeLabel,
        onlineRate: Number(((currentOnline / total) * 100).toFixed(1)),
        onlineCount: currentOnline,
        offlineCount: currentOffline,
        warningCount: currentWarning,
        criticalCount: currentCritical,
      });
    } else {
      points.push({
        timestamp: iso,
        timeLabel,
        onlineRate: null,
        onlineCount: null,
        offlineCount: null,
        warningCount: null,
        criticalCount: null,
      });
    }
  }

  return points;
}


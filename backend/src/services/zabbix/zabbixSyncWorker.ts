/**
 * Backend/src/services/zabbix/zabbixSyncWorker.ts
 *
 * Tiến Trình Nền Đồng Bộ Tự Động Zabbix SNMP (Zabbix Background Sync Worker):
 * - Lập lịch định kỳ mỗi 60 giây qua node-cron.
 * - Kết nối Zabbix JSON-RPC API, đọc các SNMP v2c/v3 items (ICMP Ping, Counters, Mực CMYK, Mã lỗi).
 * - Upsert dữ liệu thực tế vào bảng Printer, PrinterConsumable và CounterRollup.
 * - Tự động khởi tạo Incident mới khi phát hiện Trigger lỗi phần cứng (SC542, kẹt giấy...).
 * - Tuân thủ AGENTS.md Rule 5, Rule 6 & Rule 7.1 (< 300 LOC).
 */

import cron, { ScheduledTask } from 'node-cron';
import { prisma } from '../../lib/prisma';
import { zabbixApiClient } from './zabbixApiClient';
import { classifyHardwareError } from '../diagnostics/errorCodeClassifier';
import { fleetMemoryCache } from '../cache/fleetMemoryCache';
import { upsertDailyCounterRollup, resolveProblemPrinter } from './zabbixCounterRollupHelper';

export class ZabbixSyncWorker {
  private cronTask: ScheduledTask | null = null;
  private isSyncing = false;

  /**
   * Khởi động Worker đồng bộ định kỳ mỗi 60 giây
   */
  public start(): void {
    if (this.cronTask) return;
    console.log('[ZabbixSyncWorker] Khởi động Cronjob đồng bộ SNMP Zabbix chu kỳ 60 giây...');

    this.cronTask = cron.schedule('*/1 * * * *', async () => {
      await this.syncNow();
    });
  }

  /**
   * Dừng tiến trình đồng bộ an toàn
   */
  public stop(): void {
    if (this.cronTask) {
      this.cronTask.stop();
      this.cronTask = null;
    }
  }

  /**
   * Thực thi chu kỳ đồng bộ ngay lập tức (Manual hoặc Scheduled)
   */
  public async syncNow(): Promise<{ success: boolean; syncedCount: number; zabbixConnected: boolean }> {
    if (this.isSyncing) {
      return { success: true, syncedCount: 0, zabbixConnected: zabbixApiClient.isConnected() };
    }

    this.isSyncing = true;
    try {
      const [hosts, problems] = await Promise.all([
        zabbixApiClient.getHosts(),
        zabbixApiClient.getActiveProblems(),
      ]);

      const dbPrinters = await prisma.printer.findMany({ include: { consumable: true } });
      if (!hosts || hosts.length === 0) {
        return {
          success: true,
          syncedCount: dbPrinters.length,
          zabbixConnected: zabbixApiClient.isConnected(),
        };
      }

      const hostIds = hosts.map((h) => h.hostid);
      const items = await zabbixApiClient.getItemsByHostIds(hostIds);
      const now = new Date();
      let syncedCount = 0;

      for (const printer of dbPrinters) {
        const matchedHost = hosts.find(
          (h) =>
            h.hostid === printer.zabbixHostId ||
            h.name === printer.name ||
            h.host === printer.id ||
            (h.interfaces && h.interfaces.some((iface) => iface.ip === printer.ip))
        );

        if (!matchedHost) continue;

        const isOnline = matchedHost.status === '0';
        const hostItems = items.filter((it) => it.hostid === matchedHost.hostid);

        const parseVal = (keyPattern: string): number | null => {
          const item = hostItems.find((it) => it.key_.toLowerCase().includes(keyPattern));
          if (!item || !item.lastvalue) return null;
          const v = parseFloat(item.lastvalue);
          return isNaN(v) ? null : v;
        };

        const tonerBlack = parseVal('toner_black') ?? parseVal('toner_k') ?? printer.consumable?.tonerBlack ?? null;
        const tonerCyan = parseVal('toner_cyan') ?? parseVal('toner_c') ?? printer.consumable?.tonerCyan ?? null;
        const tonerMagenta = parseVal('toner_magenta') ?? parseVal('toner_m') ?? printer.consumable?.tonerMagenta ?? null;
        const tonerYellow = parseVal('toner_yellow') ?? parseVal('toner_y') ?? printer.consumable?.tonerYellow ?? null;
        const drumLife = parseVal('drum') ?? printer.consumable?.drumLifePercent ?? null;
        const fuserLife = parseVal('fuser') ?? printer.consumable?.fuserLifePercent ?? null;

        await prisma.printer.update({
          where: { id: printer.id },
          data: {
            zabbixHostId: matchedHost.hostid,
            connectionStatus: isOnline ? 'Online' : 'Offline',
            lastSeenAt: isOnline ? now : printer.lastSeenAt,
            lastSyncTime: now,
            syncStatus: 'SUCCESS',
            consumable: {
              upsert: {
                create: {
                  tonerBlack,
                  tonerCyan,
                  tonerMagenta,
                  tonerYellow,
                  drumLifePercent: drumLife !== null ? Math.round(drumLife) : null,
                  fuserLifePercent: fuserLife !== null ? Math.round(fuserLife) : null,
                  lastUpdated: now,
                },
                update: {
                  tonerBlack,
                  tonerCyan,
                  tonerMagenta,
                  tonerYellow,
                  drumLifePercent: drumLife !== null ? Math.round(drumLife) : null,
                  fuserLifePercent: fuserLife !== null ? Math.round(fuserLife) : null,
                  lastUpdated: now,
                },
              },
            },
          },
        });

        await upsertDailyCounterRollup(printer, hostItems, now);
        syncedCount++;
      }

      // Tự động tạo Incident mới từ Zabbix Active Triggers ánh xạ đúng máy in phát sinh trigger
      const triggerIds = Array.from(new Set(problems.map((p) => p.objectid).filter(Boolean)));
      const triggers = triggerIds.length > 0 ? await zabbixApiClient.getTriggersByIds(triggerIds) : [];
      const triggerMap = new Map(triggers.map((t) => [t.triggerid, t]));
      const refreshedPrinters = await prisma.printer.findMany({ include: { consumable: true } });

      for (const prob of problems) {
        const targetPrinter = resolveProblemPrinter(prob, triggerMap, refreshedPrinters);
        if (!targetPrinter) continue;

        const classified = classifyHardwareError(
          prob.objectid,
          targetPrinter.mfr || 'GENERAL',
          prob.name,
          parseInt(prob.severity, 10) || 1
        );

        const existingOpen = await prisma.incident.findFirst({
          where: {
            printerId: targetPrinter.id,
            errorCode: classified.errorCode,
            status: { not: 'RESOLVED' },
          },
        });

        if (!existingOpen) {
          await prisma.incident.create({
            data: {
              printerId: targetPrinter.id,
              errorCode: classified.errorCode,
              canonicalCode: `FM-${classified.subsystem.slice(0, 3).toUpperCase()}-001`,
              subsystem: classified.subsystem,
              severity: classified.severity.toLowerCase() === 'critical' ? 'critical' : 'warning',
              status: 'OPEN',
              title: prob.name,
              description: classified.descriptionVi,
            },
          });
        }
      }

      const onlineCount = refreshedPrinters.filter((p) => p.connectionStatus === 'Online').length;
      fleetMemoryCache.set({
        totalPrinters: refreshedPrinters.length,
        onlineCount,
        printers: refreshedPrinters,
        activeAlerts: problems,
      });

      await prisma.auditLog.create({
        data: {
          action: 'TASK_UPDATE',
          targetId: 'ZABBIX_SYNC_WORKER',
          diffJson: {
            syncedCount,
            onlineCount,
            totalPrinters: dbPrinters.length,
            activeProblemsCount: problems.length,
            timestamp: now.toISOString(),
          },
        },
      });

      return {
        success: true,
        syncedCount,
        zabbixConnected: zabbixApiClient.isConnected(),
      };
    } catch (err: any) {
      fleetMemoryCache.markStale();
      return {
        success: false,
        syncedCount: 0,
        zabbixConnected: false,
      };
    } finally {
      this.isSyncing = false;
    }
  }
}

export const zabbixSyncWorker = new ZabbixSyncWorker();
export default zabbixSyncWorker;


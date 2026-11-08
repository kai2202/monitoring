/**
 * Backend/src/services/zabbix/zabbixSyncWorker.ts
 *
 * Tiến Trình Nền Đồng Bộ Tự Động Zabbix SNMP (Zabbix Background Sync Worker):
 * - Lập lịch định kỳ mỗi 60 giây qua node-cron.
 * - Áp dụng Safe Window động (`safeWindowMinutes`) và ngưỡng mực động (`thresholds`) từ CSDL.
 * - Đối chiếu mã lỗi phần cứng trực tiếp với bảng `ErrorDictionary` trong PostgreSQL (`classifyWithDbDictionary`).
 * - Cộng dồn sản lượng hằng ngày `CounterRollup` an toàn với tràn bộ đếm 32-bit `Counter32`.
 * - Tuân thủ AGENTS.md Rule 5, Rule 6 & Rule 7.1 (< 300 LOC).
 */

import cron, { ScheduledTask } from 'node-cron';
import { prisma } from '../../lib/prisma';
import { zabbixApiClient } from './zabbixApiClient';
import { classifyWithDbDictionary } from '../diagnostics/errorCodeClassifier';
import { fleetMemoryCache } from '../cache/fleetMemoryCache';
import { upsertDailyCounterRollup, resolveProblemPrinter } from './zabbixCounterRollupHelper';
import { loadActiveRuntimeRules } from '../runtimeSettingsStore';

function computeSupplyHealth(
  levels: Array<number | null>,
  warnPct: number,
  critPct: number
): { health: 'Healthy' | 'Warning' | 'Critical'; severity: 'info' | 'warning' | 'critical' } {
  const validLevels = levels.filter((v): v is number => typeof v === 'number' && !Number.isNaN(v));
  if (validLevels.length === 0) {
    return { health: 'Healthy', severity: 'info' };
  }
  const minLevel = Math.min(...validLevels);
  if (minLevel <= critPct) return { health: 'Critical', severity: 'critical' };
  if (minLevel <= warnPct) return { health: 'Warning', severity: 'warning' };
  return { health: 'Healthy', severity: 'info' };
}

export class ZabbixSyncWorker {
  private cronTask: ScheduledTask | null = null;
  private isSyncing = false;
  private offlineSinceMap = new Map<string, number>();

  public start(): void {
    if (this.cronTask) return;
    console.log('[ZabbixSyncWorker] Khởi động Cronjob đồng bộ SNMP Zabbix chu kỳ 60 giây...');
    this.cronTask = cron.schedule('*/1 * * * *', async () => {
      await this.syncNow();
    });
  }

  public stop(): void {
    if (this.cronTask) {
      this.cronTask.stop();
      this.cronTask = null;
    }
  }

  public async syncNow(): Promise<{ success: boolean; syncedCount: number; zabbixConnected: boolean }> {
    if (this.isSyncing) {
      return { success: true, syncedCount: 0, zabbixConnected: zabbixApiClient.isConnected() };
    }

    this.isSyncing = true;
    try {
      const [hosts, problems, activeRules, dbDictionary] = await Promise.all([
        zabbixApiClient.getHosts(),
        zabbixApiClient.getActiveProblems(),
        loadActiveRuntimeRules(),
        prisma.errorDictionary.findMany(),
      ]);

      const safeWindowMs = Math.max(0, Number(activeRules.autoClosure?.safeWindowMinutes ?? 10) * 60_000);
      const warnPct = Number(activeRules.thresholds?.tonerWarningPercent ?? 15);
      const critPct = Number(activeRules.thresholds?.tonerCriticalPercent ?? 5);

      const dbPrinters = await prisma.printer.findMany({
        include: {
          consumable: true,
          incidents: { where: { status: { not: 'RESOLVED' } } },
        },
      });

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
      const nowMs = now.getTime();
      let syncedCount = 0;

      for (const printer of dbPrinters) {
        const matchedHost = hosts.find(
          (h) =>
            h.hostid === printer.zabbixHostId ||
            h.name === printer.name ||
            h.host === printer.id ||
            Boolean(printer.serialNumber && (h.host?.includes(printer.serialNumber) || h.name?.includes(printer.serialNumber))) ||
            (h.interfaces && h.interfaces.some((iface) => iface.ip === printer.ip))
        );

        if (!matchedHost) continue;

        const isHostAlive = matchedHost.status === '0';
        let nextConnStatus = printer.connectionStatus;
        if (isHostAlive) {
          this.offlineSinceMap.delete(printer.id);
          nextConnStatus = 'Online';
        } else if (printer.connectionStatus === 'Offline' || safeWindowMs === 0) {
          nextConnStatus = 'Offline';
        } else {
          const firstDown = this.offlineSinceMap.get(printer.id) ?? nowMs;
          this.offlineSinceMap.set(printer.id, firstDown);
          if (nowMs - firstDown >= safeWindowMs) {
            nextConnStatus = 'Offline';
          }
        }

        const hostItems = items.filter((it) => it.hostid === matchedHost.hostid);
        const parseVal = (keyPattern: string): number | null => {
          const item = hostItems.find((it) => it.key_.toLowerCase().includes(keyPattern));
          if (!item || !item.lastvalue) return null;
          const v = parseFloat(item.lastvalue);
          return Number.isNaN(v) ? null : v;
        };

        const tonerBlack = parseVal('toner_black') ?? parseVal('toner_k') ?? printer.consumable?.tonerBlack ?? null;
        const tonerCyan = printer.isColor
          ? parseVal('toner_cyan') ?? parseVal('toner_c') ?? printer.consumable?.tonerCyan ?? null
          : null;
        const tonerMagenta = printer.isColor
          ? parseVal('toner_magenta') ?? parseVal('toner_m') ?? printer.consumable?.tonerMagenta ?? null
          : null;
        const tonerYellow = printer.isColor
          ? parseVal('toner_yellow') ?? parseVal('toner_y') ?? printer.consumable?.tonerYellow ?? null
          : null;
        const drumLife = parseVal('drum') ?? printer.consumable?.drumLifePercent ?? null;
        const fuserLife = parseVal('fuser') ?? printer.consumable?.fuserLifePercent ?? null;

        const supplyState = computeSupplyHealth(
          printer.isColor ? [tonerBlack, tonerCyan, tonerMagenta, tonerYellow] : [tonerBlack],
          warnPct,
          critPct
        );
        const hasCritIncident = printer.incidents.some((inc) => inc.severity.toLowerCase() === 'critical');
        const hasWarnIncident = printer.incidents.length > 0;

        const nextHealth = hasCritIncident || supplyState.health === 'Critical'
          ? 'Critical'
          : hasWarnIncident || supplyState.health === 'Warning'
          ? 'Warning'
          : 'Healthy';
        const nextSeverity = nextHealth === 'Critical' ? 'critical' : nextHealth === 'Warning' ? 'warning' : 'info';

        await prisma.printer.update({
          where: { id: printer.id },
          data: {
            zabbixHostId: matchedHost.hostid,
            connectionStatus: nextConnStatus,
            health: nextHealth,
            alertSeverity: nextSeverity,
            lastSeenAt: isHostAlive ? now : printer.lastSeenAt,
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

      const triggerIds = Array.from(new Set(problems.map((p) => p.objectid).filter(Boolean)));
      const triggers = triggerIds.length > 0 ? await zabbixApiClient.getTriggersByIds(triggerIds) : [];
      const triggerMap = new Map(triggers.map((t) => [t.triggerid, t]));
      const refreshedPrinters = await prisma.printer.findMany({ include: { consumable: true } });

      for (const prob of problems) {
        const targetPrinter = resolveProblemPrinter(prob, triggerMap, refreshedPrinters);
        if (!targetPrinter) continue;

        const classified = classifyWithDbDictionary(
          prob.objectid,
          targetPrinter.mfr || 'General',
          prob.name,
          parseInt(prob.severity, 10) || 1,
          dbDictionary
        );

        const existingOpen = await prisma.incident.findFirst({
          where: {
            printerId: targetPrinter.id,
            errorCode: classified.errorCode,
            status: { not: 'RESOLVED' },
          },
        });

        const sevDb = classified.severity.toLowerCase() === 'critical' ? 'critical' : 'warning';
        if (!existingOpen) {
          await prisma.incident.create({
            data: {
              printerId: targetPrinter.id,
              errorCode: classified.errorCode,
              canonicalCode: classified.canonicalCode,
              subsystem: classified.subsystem,
              severity: sevDb,
              status: 'OPEN',
              title: prob.name,
              description: classified.descriptionVi,
            },
          });

          await prisma.printer.update({
            where: { id: targetPrinter.id },
            data: {
              health: sevDb === 'critical' ? 'Critical' : 'Warning',
              alertSeverity: sevDb,
            },
          });
        }
      }

      const finalPrinters = await prisma.printer.findMany({ include: { consumable: true } });
      const onlineCount = finalPrinters.filter((p) => p.connectionStatus === 'Online').length;
      fleetMemoryCache.set({
        totalPrinters: finalPrinters.length,
        onlineCount,
        printers: finalPrinters,
        activeAlerts: problems,
      });

      return {
        success: true,
        syncedCount,
        zabbixConnected: zabbixApiClient.isConnected(),
      };
    } catch {
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

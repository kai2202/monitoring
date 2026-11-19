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
import { classifyWithDbDictionary } from '../incidents/errorCodeClassifier';
import { fleetMemoryCache } from '../cache/fleetMemoryCache';
import {
  upsertDailyCounterRollup,
  resolveProblemPrinter,
  computeSupplyHealth,
  detectHostPrinterMeta,
  shouldIgnoreLocalProblem,
  parseWasteTonerStatus,
  parseSupplyPercentOrBinary,
  pickPrimaryHostIp,
  resolveHostConnectivity,
  classifyCurrentPrinterFault,
  resolveSupplyPercentFromItems,
  extractHostSerialAndModel,
} from './zabbixCounterRollupHelper';
import { resolveSiteForPrinter, SiteSubnetRule } from './siteSubnetResolver';
import { loadActiveRuntimeRules } from '../auth/runtimeSettingsStore';

export class ZabbixSyncWorker {
  private cronTask: ScheduledTask | null = null;
  private isSyncing = false;
  private offlineSinceMap = new Map<string, number>();

  public start(): void {
    if (this.cronTask) return;
    console.log('[ZabbixSyncWorker] Khởi động Cronjob đồng bộ SNMP Zabbix chu kỳ 60 giây...');
    this.syncNow().catch((e) => console.error('[ZabbixSyncWorker] Lỗi đồng bộ lần đầu:', e));
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

      const floorSites = await prisma.floor.findMany({
        select: { building: true, subnetCidr: true },
      });
      const siteRules: SiteSubnetRule[] = floorSites.map((f) => ({
        siteName: f.building,
        subnetCidr: f.subnetCidr,
      }));

      // 1. Tự động thêm (Auto-Discover / Auto-Register) các Host mới từ Zabbix vào CSDL (lấy tên hiển thị trực tiếp từ API)
      for (const host of hosts) {
        const hostIp = pickPrimaryHostIp(host.interfaces);
        const existing = dbPrinters.find(
          (p) =>
            p.zabbixHostId === host.hostid ||
            p.name === host.name ||
            p.id === host.host ||
            (hostIp && p.ip === hostIp)
        );

        if (hostIp) {
          const meta = detectHostPrinterMeta(host);
          const printerId = existing?.id || host.host || `PRN-${host.hostid}`;
          const hostItemsForInit = items.filter((it) => it.hostid === host.hostid);
          const initConn = resolveHostConnectivity(host, hostItemsForInit);
          const resolvedSite = resolveSiteForPrinter(hostIp, siteRules, host.groups) || 'Trụ sở chính';
          const upsertedPrinter = await prisma.printer.upsert({
            where: { id: printerId },
            create: {
              id: printerId,
              name: host.name || host.host,
              ip: hostIp,
              model: meta.model,
              mfr: meta.mfr,
              deviceType: meta.deviceType,
              serialNumber: meta.serialNumber,
              building: resolvedSite,
              floor: meta.floor,
              location: host.name,
              department: 'Văn phòng',
              isColor: meta.isColor,
              connectionStatus: initConn.alive ? 'Online' : 'Offline',
              icmpStatus: initConn.icmpStatus,
              snmpStatus: initConn.snmpStatus,
              health: 'Healthy',
              alertSeverity: 'info',
              zabbixHostId: host.hostid,
              syncStatus: 'SUCCESS',
              lastSyncTime: now,
              lastSeenAt: initConn.alive ? now : null,
            },
            update: {
              name: host.name || host.host,
              ip: hostIp,
              zabbixHostId: host.hostid,
              connectionStatus: initConn.alive ? 'Online' : 'Offline',
              icmpStatus: initConn.icmpStatus,
              snmpStatus: initConn.snmpStatus,
              lastSyncTime: now,
              ...(initConn.alive ? { lastSeenAt: now } : {}),
            },
            include: { consumable: true, incidents: true },
          });

          if (!existing) {
            dbPrinters.push(upsertedPrinter as any);
          } else {
            const idx = dbPrinters.findIndex((p) => p.id === existing.id);
            if (idx >= 0) dbPrinters[idx] = upsertedPrinter as any;
          }
        }
      }

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

        const hostItems = items.filter((it) => it.hostid === matchedHost.hostid);
        const connState = resolveHostConnectivity(matchedHost, hostItems);
        const isHostAlive = connState.alive;
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

        // Chặn các giá trị SNMP đặc biệt (-1, -2, -3) hoặc vượt [0..100]% theo Rule 5.1; hỗ trợ level/maxCapacity & Zabbix LLD
        const tonerBlack = resolveSupplyPercentFromItems(hostItems, ['toner_black', 'toner_k', 'toner.black'], ['black', 'đen']) ?? printer.consumable?.tonerBlack ?? null;
        const tonerCyan = printer.isColor ? resolveSupplyPercentFromItems(hostItems, ['toner_cyan', 'toner_c', 'toner.cyan'], ['cyan', 'xanh']) ?? printer.consumable?.tonerCyan ?? null : null;
        const tonerMagenta = printer.isColor ? resolveSupplyPercentFromItems(hostItems, ['toner_magenta', 'toner_m', 'toner.magenta'], ['magenta', 'đỏ', 'hồng']) ?? printer.consumable?.tonerMagenta ?? null : null;
        const tonerYellow = printer.isColor ? resolveSupplyPercentFromItems(hostItems, ['toner_yellow', 'toner_y', 'toner.yellow'], ['yellow', 'vàng']) ?? printer.consumable?.tonerYellow ?? null : null;
        const drumLife = resolveSupplyPercentFromItems(hostItems, ['drum'], ['drum', 'trống']) ?? printer.consumable?.drumLifePercent ?? null;
        const fuserLife = resolveSupplyPercentFromItems(hostItems, ['fuser'], ['fuser', 'sấy']) ?? printer.consumable?.fuserLifePercent ?? null;
        const extractedMeta = extractHostSerialAndModel(hostItems);
        const wasteVal = hostItems.find((it) => it.key_.toLowerCase().includes('waste'))?.lastvalue;
        const wasteTonerStatus = parseWasteTonerStatus(wasteVal) || printer.consumable?.wasteTonerStatus || 'OK';

        const supplyState = computeSupplyHealth(
          printer.isColor ? [tonerBlack, tonerCyan, tonerMagenta, tonerYellow] : [tonerBlack],
          warnPct,
          critPct
        );
        const hasCrit = printer.incidents.some((inc) => inc.severity.toLowerCase() === 'critical');
        const hasWarn = printer.incidents.length > 0;
        const nextHealth = hasCrit || supplyState.health === 'Critical' ? 'Critical' : hasWarn || supplyState.health === 'Warning' ? 'Warning' : 'Healthy';
        const nextSeverity = nextHealth === 'Critical' ? 'critical' : nextHealth === 'Warning' ? 'warning' : 'info';

        const activeProblemTitles = printer.incidents.map((inc) => inc.title);
        const faultInfo = classifyCurrentPrinterFault(activeProblemTitles);

        const consumableData = {
          tonerBlack,
          tonerCyan,
          tonerMagenta,
          tonerYellow,
          drumLifePercent: drumLife !== null ? Math.round(drumLife) : null,
          fuserLifePercent: fuserLife !== null ? Math.round(fuserLife) : null,
          wasteTonerStatus,
          lastUpdated: now,
        };

        await prisma.printer.update({
          where: { id: printer.id },
          data: {
            zabbixHostId: matchedHost.hostid,
            ...(!printer.serialNumber && extractedMeta.serialNumber ? { serialNumber: extractedMeta.serialNumber } : {}),
            ...(printer.model === 'Network Printer' && extractedMeta.model ? { model: extractedMeta.model } : {}),
            connectionStatus: nextConnStatus,
            icmpStatus: connState.icmpStatus,
            snmpStatus: connState.snmpStatus,
            health: nextHealth,
            alertSeverity: nextSeverity,
            currentFaultType: faultInfo.faultType,
            currentFaultText: faultInfo.faultText,
            lastSeenAt: isHostAlive ? now : printer.lastSeenAt,
            lastSyncTime: now,
            syncStatus: 'SUCCESS',
            consumable: { upsert: { create: consumableData, update: consumableData } },
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
        if (shouldIgnoreLocalProblem(prob.name)) continue;
        const targetPrinter = resolveProblemPrinter(prob, triggerMap, refreshedPrinters);
        if (!targetPrinter) continue;

        const classified = classifyWithDbDictionary(
          prob.objectid,
          targetPrinter.mfr || 'General',
          prob.name,
          parseInt(prob.severity, 10) || 1,
          dbDictionary
        );
        if (shouldIgnoreLocalProblem(prob.name, classified.subsystem)) continue;

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
            data: { health: sevDb === 'critical' ? 'Critical' : 'Warning', alertSeverity: sevDb },
          });
        }
      }

      const finalPrinters = await prisma.printer.findMany({ include: { consumable: true } });
      const activeIds = new Set(finalPrinters.map((p) => p.id));
      for (const key of this.offlineSinceMap.keys()) {
        if (!activeIds.has(key)) this.offlineSinceMap.delete(key);
      }
      fleetMemoryCache.set({
        totalPrinters: finalPrinters.length,
        onlineCount: finalPrinters.filter((p) => p.connectionStatus === 'Online').length,
        printers: finalPrinters,
        activeAlerts: problems,
      });

      return { success: true, syncedCount, zabbixConnected: zabbixApiClient.isConnected() };
    } catch (err: any) {
      console.error('[ZabbixSyncWorker] Lỗi đồng bộ Zabbix:', err?.message || err);
      fleetMemoryCache.markStale();
      return { success: false, syncedCount: 0, zabbixConnected: false };
    } finally {
      this.isSyncing = false;
    }
  }
}

export const zabbixSyncWorker = new ZabbixSyncWorker();
export default zabbixSyncWorker;

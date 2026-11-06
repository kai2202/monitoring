/**
 * Backend/src/services/zabbix/fastPollingWorker.ts
 *
 * Worker quét nhanh chu kỳ 30s thu thập ICMP Ping & Sự cố Zabbix (TASK-BE-01):
 * - Cơ chế Safe Window động chống giật trạng thái (Flapping).
 * - Đối chiếu trực tiếp với bảng `ErrorDictionary` từ PostgreSQL (`classifyWithDbDictionary`)
 *   và ánh xạ đúng máy in theo `zabbixHostId` (không fix cứng hãng 'RICOH').
 * - Tuân thủ AGENTS.md Rule 5, Rule 6 & Rule 7.1 (< 300 LOC).
 */

import { zabbixConfig } from '../../config/zabbixConfig';
import { zabbixApiClient } from './zabbixApiClient';
import { fleetMemoryCache } from '../cache/fleetMemoryCache';
import { classifyWithDbDictionary } from '../diagnostics/errorCodeClassifier';
import { resolveProblemPrinter } from './zabbixCounterRollupHelper';
import { loadActiveRuntimeRules } from '../runtimeSettingsStore';
import { prisma } from '../../lib/prisma';

export class FastPollingWorker {
  private timer: NodeJS.Timeout | null = null;
  private isRunning = false;
  private offlineSinceMap = new Map<string, number>();

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.poll();
    this.timer = setInterval(() => this.poll(), zabbixConfig.fastPollIntervalMs);
  }

  public stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isRunning = false;
  }

  public async poll(): Promise<void> {
    try {
      const [hosts, problems, currentPrinters, dbDictionary, activeRules] = await Promise.all([
        zabbixApiClient.getHosts(),
        zabbixApiClient.getActiveProblems(),
        prisma.printer.findMany({ include: { consumable: true } }),
        prisma.errorDictionary.findMany(),
        loadActiveRuntimeRules(),
      ]);

      const safeWindowMs = Math.max(
        0,
        Number(activeRules.autoClosure?.safeWindowMinutes ?? zabbixConfig.safeWindowMs / 60_000) * 60_000
      );
      const now = Date.now();

      const updatedPrinters = currentPrinters.map((p) => {
        const matchingHost = hosts.find(
          (h) =>
            h.hostid === p.zabbixHostId ||
            h.name === p.name ||
            h.host === p.id ||
            (h.interfaces && h.interfaces.some((i) => i.ip === p.ip))
        );
        const isHostAlive = matchingHost ? matchingHost.status === '0' : p.connectionStatus === 'Online';

        let connectionStatus = p.connectionStatus;
        if (!isHostAlive) {
          const firstOffline = this.offlineSinceMap.get(p.id) || now;
          this.offlineSinceMap.set(p.id, firstOffline);
          if (now - firstOffline >= safeWindowMs) {
            connectionStatus = 'Offline';
          }
        } else {
          this.offlineSinceMap.delete(p.id);
          connectionStatus = 'Online';
        }

        return { ...p, connectionStatus };
      });

      const triggerIds = Array.from(new Set(problems.map((p) => p.objectid).filter(Boolean)));
      const triggers = triggerIds.length > 0 ? await zabbixApiClient.getTriggersByIds(triggerIds) : [];
      const triggerMap = new Map(triggers.map((t) => [t.triggerid, t]));

      const activeAlerts = problems.map((prob) => {
        const targetPrinter = resolveProblemPrinter(prob, triggerMap, updatedPrinters);
        const classified = classifyWithDbDictionary(
          prob.objectid,
          targetPrinter?.mfr || 'General',
          prob.name,
          parseInt(prob.severity, 10) || 1,
          dbDictionary
        );
        return {
          id: prob.eventid,
          triggerId: prob.objectid,
          printerId: targetPrinter?.id ?? null,
          name: prob.name,
          clock: prob.clock,
          ...classified,
        };
      });

      const onlineCount = updatedPrinters.filter((p) => p.connectionStatus === 'Online').length;
      fleetMemoryCache.set({
        totalPrinters: updatedPrinters.length,
        onlineCount,
        printers: updatedPrinters,
        activeAlerts,
      });
    } catch {
      fleetMemoryCache.markStale();
    }
  }
}

export const fastPollingWorker = new FastPollingWorker();

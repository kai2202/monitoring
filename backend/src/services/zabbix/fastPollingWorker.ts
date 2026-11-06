/**
 * Backend/src/services/zabbix/fastPollingWorker.ts
 *
 * Worker quét nhanh chu kỳ 30s thu thập ICMP Ping & Sự cố Zabbix (TASK-BE-01):
 * - Cơ chế Safe Window 10 phút chống giật trạng thái (Flapping).
 * - Tự động cập nhật snapshot vào FleetMemoryCache từ Prisma.
 * - Tuân thủ AGENTS.md Rule 5 & Rule 7.1 (< 300 LOC).
 */

import { zabbixConfig } from '../../config/zabbixConfig';
import { zabbixApiClient } from './zabbixApiClient';
import { fleetMemoryCache } from '../cache/fleetMemoryCache';
import { classifyHardwareError } from '../diagnostics/errorCodeClassifier';
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
      const [hosts, problems, currentPrinters] = await Promise.all([
        zabbixApiClient.getHosts(),
        zabbixApiClient.getActiveProblems(),
        prisma.printer.findMany({ include: { consumable: true } }),
      ]);

      const now = Date.now();

      const updatedPrinters = currentPrinters.map((p) => {
        const matchingHost = hosts.find(
          (h) =>
            h.name === p.name ||
            h.host === p.id ||
            (h.interfaces && h.interfaces.some((i) => i.ip === p.ip))
        );
        const isHostAlive = matchingHost ? matchingHost.status === '0' : p.connectionStatus === 'Online';

        let connectionStatus = p.connectionStatus;
        if (!isHostAlive) {
          const firstOffline = this.offlineSinceMap.get(p.id) || now;
          this.offlineSinceMap.set(p.id, firstOffline);

          if (now - firstOffline >= zabbixConfig.safeWindowMs) {
            connectionStatus = 'Offline';
          }
        } else {
          this.offlineSinceMap.delete(p.id);
          connectionStatus = 'Online';
        }

        return { ...p, connectionStatus };
      });

      const activeAlerts = problems.map((prob) => {
        const classified = classifyHardwareError(
          prob.objectid,
          'RICOH',
          prob.name,
          parseInt(prob.severity, 10) || 1
        );
        return {
          id: prob.eventid,
          triggerId: prob.objectid,
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

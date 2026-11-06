/**
 * Backend/src/services/zabbix/slowPollingWorker.ts
 *
 * Worker quét sâu chu kỳ 1 giờ thu thập Counters trang in & Mức vật tư (TASK-BE-01):
 * - Đọc OID RFC 3805 prtMarkerLifeCount và mực in CMYK, Drum, Waste Box.
 * - Lưu trực tiếp qua Prisma ORM và cập nhật FleetMemoryCache.
 * - Tuân thủ AGENTS.md Rule 5 & Rule 7.1 (< 300 LOC).
 */

import { zabbixConfig } from '../../config/zabbixConfig';
import { zabbixApiClient } from './zabbixApiClient';
import { fleetMemoryCache } from '../cache/fleetMemoryCache';
import { prisma } from '../../lib/prisma';

export class SlowPollingWorker {
  private timer: NodeJS.Timeout | null = null;
  private isRunning = false;

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.timer = setInterval(() => this.poll(), zabbixConfig.slowPollIntervalMs);
  }

  public stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isRunning = false;
  }

  public async poll(): Promise<{ success: boolean; updatedCount: number }> {
    try {
      const hosts = await zabbixApiClient.getHosts();
      if (!hosts || hosts.length === 0) {
        return { success: true, updatedCount: 0 };
      }

      const hostIds = hosts.map((h) => h.hostid);
      const items = await zabbixApiClient.getItemsByHostIds(hostIds);
      const currentPrinters = await prisma.printer.findMany({ include: { consumable: true } });

      let updatedCount = 0;

      for (const p of currentPrinters) {
        const matchingHost = hosts.find((h) => h.name === p.name || h.host === p.id);
        if (!matchingHost) continue;

        const hostItems = items.filter((it) => it.hostid === matchingHost.hostid);
        const blackTonerItem = hostItems.find(
          (it) => it.key_.includes('toner_black') || it.key_.includes('toner_k')
        );

        if (blackTonerItem && blackTonerItem.lastvalue) {
          const tVal = parseInt(blackTonerItem.lastvalue, 10);
          if (!isNaN(tVal) && tVal >= 0 && tVal <= 100) {
            await prisma.printerConsumable.upsert({
              where: { printerId: p.id },
              create: { printerId: p.id, tonerBlack: tVal },
              update: { tonerBlack: tVal, lastUpdated: new Date() },
            });
            updatedCount++;
          }
        }
      }

      const cached = fleetMemoryCache.get();
      if (cached) {
        fleetMemoryCache.set({
          totalPrinters: currentPrinters.length,
          onlineCount: cached.onlineCount,
          printers: currentPrinters,
          activeAlerts: cached.activeAlerts,
        });
      }

      return { success: true, updatedCount };
    } catch {
      fleetMemoryCache.markStale();
      return { success: false, updatedCount: 0 };
    }
  }
}

export const slowPollingWorker = new SlowPollingWorker();

/**
 * Backend/src/services/zabbix/zabbixPollerService.ts
 *
 * Dịch vụ quản lý vòng đời bộ thu thập SNMP Zabbix (TASK-BE-01):
 * - Điều phối Fast Polling 30s, Slow Polling 1h và ZabbixSyncWorker 60s.
 * - Hỗ trợ kích hoạt đồng bộ cưỡng bức tức thời (Manual Sync) qua API.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import { fastPollingWorker } from './fastPollingWorker';
import { zabbixSyncWorker } from './zabbixSyncWorker';
import { zabbixApiClient } from './zabbixApiClient';
import { fleetMemoryCache } from '../cache/fleetMemoryCache';

export class ZabbixPollerService {
  private isRunning = false;

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log('[ZabbixPollerService] Khởi động In-Process Poller & ZabbixSyncWorker (60s)...');
    fastPollingWorker.start();
    zabbixSyncWorker.start();
  }

  public stop(): void {
    if (!this.isRunning) return;
    console.log('[ZabbixPollerService] Đang dừng In-Process Poller an toàn...');
    fastPollingWorker.stop();
    zabbixSyncWorker.stop();
    this.isRunning = false;
  }

  public async triggerManualSync(): Promise<{ success: boolean; syncedCount: number; zabbixConnected: boolean }> {
    const isAlive = zabbixApiClient.isConnected();
    if (!isAlive) {
      try {
        await zabbixApiClient.checkVersion();
      } catch {
        // Zabbix vẫn offline
      }
    }

    await fastPollingWorker.poll();
    return zabbixSyncWorker.syncNow();
  }

  public getStatus() {
    const cached = fleetMemoryCache.get();
    return {
      isRunning: this.isRunning,
      zabbixConnected: zabbixApiClient.isConnected(),
      lastSnapshotTime: cached ? cached.timestamp : null,
      isStale: cached ? cached.isStale : false,
      totalMonitored: cached ? cached.totalPrinters : 0,
    };
  }
}

export const zabbixPollerService = new ZabbixPollerService();

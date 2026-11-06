/**
 * Backend/src/services/zabbix/slowPollingWorker.ts
 *
 * Worker quét sâu chu kỳ 1 giờ thu thập Counters trang in & Mức vật tư CMYK (TASK-BE-01):
 * - Ủy quyền đồng bộ đầy đủ CMYK + Drum + Fuser + CounterRollup 32-bit qua `zabbixSyncWorker.syncNow()`
 *   để đảm bảo tính nhất quán dữ liệu tuyệt đối và không ghi đè cache bằng bản chụp cũ.
 * - Tuân thủ AGENTS.md Rule 5 & Rule 7.1 (< 300 LOC).
 */

import { zabbixConfig } from '../../config/zabbixConfig';
import { zabbixSyncWorker } from './zabbixSyncWorker';

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
    const res = await zabbixSyncWorker.syncNow();
    return { success: res.success, updatedCount: res.syncedCount };
  }
}

export const slowPollingWorker = new SlowPollingWorker();

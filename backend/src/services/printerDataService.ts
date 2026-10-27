/**
 * src/services/printerDataService.ts
 *
 * Application orchestrator service layer:
 * - Coordinates Zabbix client, background sync cycles, and in-memory caching.
 * - Delegates domain logic to specialized modules (problemClassifier, printerMapper, telemetryAggregator).
 */

import { ZabbixClient } from '../zabbix/client.js';
import { ZabbixHost, ZabbixProblem, ZabbixItem, ZabbixHistoryPoint } from '../types/zabbix.js';
import {
  PrinterResponse,
  IncidentResponse,
  AvailabilityDataPoint,
  PrinterTelemetryResponse,
  TelemetryRange,
  SyncResponse,
  MetricValue,
} from '../types/api.js';
import { classifyProblem, computeHealth, ProblemClassification } from './problemClassifier.js';
import { mapHostToPrinter, mapProblemToIncident } from './printerMapper.js';
import {
  calculateDeltaFromHistory,
  generateEmptyBuckets,
  aggregateHistoryToBuckets,
} from './telemetryAggregator.js';

// Re-export for backward-compatibility with tests and external consumers
export { classifyProblem, computeHealth, ProblemClassification };

const CACHE_TTL_MS = Number(process.env['ZABBIX_POLL_INTERVAL_MS'] ?? 300_000);

interface CacheEntry<T> {
  data: T;
  cachedAt: number; // Date.now()
}

export class PrinterDataService {
  private printersCache: CacheEntry<PrinterResponse[]> | null = null;
  private incidentsCache: CacheEntry<IncidentResponse[]> | null = null;
  private manualStatusOverrides = new Map<string, { status: 'Active' | 'Resolved'; resolvedAt?: string }>();
  private manualLocationOverrides = new Map<string, string>();
  private telemetryCache = new Map<string, CacheEntry<PrinterTelemetryResponse[]>>();

  private isSyncing = false;
  private syncTimer: NodeJS.Timeout | null = null;
  private syncIntervalMs = CACHE_TTL_MS; // 5 minutes (300,000 ms)
  private lastSuccessfulSyncAt: string | null = null;
  private lastSyncAttemptAt: string | null = null;

  constructor(private readonly zabbix: ZabbixClient) {}

  public async setPrinterLocation(printerId: string, location: string): Promise<void> {
    this.manualLocationOverrides.set(printerId, location);
    this.printersCache = null;

    try {
      await this.zabbix.updateHostInventory(printerId, { location });
    } catch {
      // In-memory override will be served safely
    }
  }

  public setIncidentStatus(incidentId: string, status: 'Active' | 'Resolved'): void {
    this.manualStatusOverrides.set(incidentId, {
      status,
      resolvedAt: status === 'Resolved' ? new Date().toISOString() : undefined,
    });
    // Invalidate caches so next fetch immediately reflects the updated status
    this.incidentsCache = null;
    this.printersCache = null;
  }

  private isCacheValid(entry: CacheEntry<unknown> | null): boolean {
    if (!entry) return false;
    return Date.now() - entry.cachedAt < CACHE_TTL_MS;
  }

  // -------------------------------------------------------------------------
  // Domain mapper delegates to support testing and internal mapping
  // -------------------------------------------------------------------------
  public mapHostToPrinter(
    host: ZabbixHost,
    hostProblems: ZabbixProblem[],
    items: ZabbixItem[] = [],
    thirtyDayVolume: MetricValue = null
  ): PrinterResponse {
    return mapHostToPrinter(host, hostProblems, items, thirtyDayVolume, {
      manualStatusOverrides: this.manualStatusOverrides,
      manualLocationOverrides: this.manualLocationOverrides,
      lastSyncAttemptAt: this.lastSyncAttemptAt,
      lastSuccessfulSyncAt: this.lastSuccessfulSyncAt,
    });
  }

  public mapProblemToIncident(
    problem: ZabbixProblem,
    printerIdentifier: string
  ): IncidentResponse {
    return mapProblemToIncident(problem, printerIdentifier, this.manualStatusOverrides);
  }

  public calculateDeltaFromHistory(points: ZabbixHistoryPoint[]): MetricValue {
    return calculateDeltaFromHistory(points);
  }

  public testMapHost(
    host: ZabbixHost,
    hostProblems: ZabbixProblem[],
    items: ZabbixItem[] = [],
    thirtyDayVolume: MetricValue = null
  ): PrinterResponse {
    return this.mapHostToPrinter(host, hostProblems, items, thirtyDayVolume);
  }

  public testMapIncident(
    problem: ZabbixProblem,
    printerIdentifier: string
  ): IncidentResponse {
    return this.mapProblemToIncident(problem, printerIdentifier);
  }

  // -------------------------------------------------------------------------
  // Background Synchronization Lifecycle
  // -------------------------------------------------------------------------

  public async startBackgroundSync(): Promise<void> {
    if (this.syncTimer !== null) {
      return; // Already initialized once
    }

    console.info(`[Sync] Khởi chạy tiến trình đồng bộ ngầm Zabbix (chu kỳ: ${this.syncIntervalMs / 1000}s)...`);

    // Initial sync
    try {
      await this.syncNow();
    } catch {
      console.warn('[Sync] Đồng bộ ban đầu không thành công (Zabbix có thể chưa sẵn sàng), sẽ thử lại định kỳ.');
    }

    // Recurring timer
    this.syncTimer = setInterval(async () => {
      try {
        await this.syncNow();
      } catch {
        // Logged inside syncNow
      }
    }, this.syncIntervalMs);

    if (typeof this.syncTimer.unref === 'function') {
      this.syncTimer.unref();
    }
  }

  public stopBackgroundSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
      console.info('[Sync] Đã dừng tiến trình đồng bộ ngầm Zabbix.');
    }
  }

  public async syncNow(): Promise<SyncResponse> {
    if (this.isSyncing) {
      return {
        success: true,
        message: 'Chu kỳ đồng bộ đang chạy ngầm...',
        syncedAt: this.lastSuccessfulSyncAt || new Date().toISOString(),
        durationMs: 0,
        printerCount: this.printersCache ? this.printersCache.data.length : 0,
        incidentCount: this.incidentsCache ? this.incidentsCache.data.length : 0,
      };
    }

    this.isSyncing = true;
    const startTime = Date.now();
    this.lastSyncAttemptAt = new Date().toISOString();
    console.info(`[Sync] Bắt đầu đồng bộ Zabbix lúc ${this.lastSyncAttemptAt}...`);

    try {
      const hosts = await this.zabbix.getHosts();
      const printerHosts = hosts.filter(h => h.name !== 'Zabbix server');

      const nowSec = Math.floor(Date.now() / 1000);
      const thirtyDaysAgoSec = nowSec - 30 * 24 * 3600;

      const hostIds = printerHosts.map(h => h.hostid);

      // Batch fetch latest items and active problems across all printer hosts in 2 calls instead of 2 * N
      const [allLatestItems, allActiveProblems] = await Promise.all([
        this.zabbix.getLatestItems(hostIds).catch(() => []),
        this.zabbix.getActiveProblems(hostIds).catch(() => []),
      ]);

      const itemsByHost = new Map<string, ZabbixItem[]>();
      for (const item of allLatestItems) {
        let list = itemsByHost.get(item.hostid);
        if (!list) {
          list = [];
          itemsByHost.set(item.hostid, list);
        }
        list.push(item);
      }

      const problemsByHost = new Map<string, ZabbixProblem[]>();
      for (const p of allActiveProblems) {
        const hid = p.hosts?.[0]?.hostid;
        if (hid) {
          let list = problemsByHost.get(hid);
          if (!list) {
            list = [];
            problemsByHost.set(hid, list);
          }
          list.push(p);
        }
      }

      // Collect total counter item IDs for batch thirtyDayVolume calculation in 1 call instead of N calls
      const counterItemIds: string[] = [];
      const hostToCounterItemId = new Map<string, string>();
      for (const h of printerHosts) {
        const hItems = itemsByHost.get(h.hostid) || [];
        const cItem = hItems.find(i => i.key_ === 'printer.counter.total');
        if (cItem) {
          counterItemIds.push(cItem.itemid);
          hostToCounterItemId.set(h.hostid, cItem.itemid);
        }
      }

      const historyByItem = new Map<string, ZabbixHistoryPoint[]>();
      if (counterItemIds.length > 0) {
        try {
          const allPoints = await this.zabbix.getHistory(counterItemIds, thirtyDaysAgoSec, nowSec, 3);
          for (const pt of allPoints) {
            let list = historyByItem.get(pt.itemid);
            if (!list) {
              list = [];
              historyByItem.set(pt.itemid, list);
            }
            list.push(pt);
          }
        } catch {
          // ignore history failure
        }
      }

      const mapperContext = {
        manualStatusOverrides: this.manualStatusOverrides,
        manualLocationOverrides: this.manualLocationOverrides,
        lastSyncAttemptAt: this.lastSyncAttemptAt,
        lastSuccessfulSyncAt: this.lastSuccessfulSyncAt,
      };

      const printers = printerHosts.map(h => {
        const items = itemsByHost.get(h.hostid) || [];
        const hostProblems = problemsByHost.get(h.hostid) || [];

        let thirtyDayVolume: MetricValue = null;
        const itemId = hostToCounterItemId.get(h.hostid);
        if (itemId) {
          const points = historyByItem.get(itemId);
          if (points && points.length > 0) {
            thirtyDayVolume = calculateDeltaFromHistory(points);
          }
        }

        return mapHostToPrinter(h, hostProblems, items, thirtyDayVolume, mapperContext);
      });

      // Fetch incidents for the last 30 days in a single batch call across all printer hosts
      const hostIdToIp = new Map<string, string>();
      for (const h of printerHosts) {
        const defaultInterface = h.interfaces.find(i => i.main === '1') ?? h.interfaces[0];
        hostIdToIp.set(h.hostid, defaultInterface?.ip || h.name);
      }

      let rawProblems: ZabbixProblem[] = [];
      try {
        const hostIds = printerHosts.map(h => h.hostid);
        rawProblems = await this.zabbix.getProblemsInRange(thirtyDaysAgoSec, nowSec, hostIds);
      } catch (err) {
        console.warn('[Sync] Không thể lấy lịch sử sự cố theo lô:', err);
        rawProblems = [];
      }

      const allIncidents = rawProblems.map(p => {
        const matchedHostId = p.hosts?.[0]?.hostid;
        const printerIp = (matchedHostId && hostIdToIp.get(matchedHostId)) || p.hosts?.[0]?.name || 'Unknown Printer';
        return mapProblemToIncident(p, printerIp, this.manualStatusOverrides);
      });

      // Split Active and Resolved incidents:
      // - Retain ALL Active incidents (never drop unresolved hardware/connectivity issues)
      // - Cap resolved historical incidents to 150 most recent to prevent alert fatigue & memory bloat
      const activeList = allIncidents.filter(i => i.status === 'Active');
      const resolvedList = allIncidents
        .filter(i => i.status === 'Resolved')
        .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime())
        .slice(0, 150);

      const incidents = [...activeList, ...resolvedList].sort(
        (a, b) => new Date(b.start).getTime() - new Date(a.start).getTime()
      );

      // Update in-memory cache
      this.printersCache = { data: printers, cachedAt: Date.now() };
      this.incidentsCache = { data: incidents, cachedAt: Date.now() };
      this.lastSuccessfulSyncAt = new Date().toISOString();

      // Clear historical telemetry cache so charts receive refreshed data
      this.telemetryCache.clear();

      const durationMs = Date.now() - startTime;
      console.info(
        `[Sync] Hoàn tất đồng bộ Zabbix thành công trong ${durationMs}ms: ${printers.length} máy in, ${incidents.length} sự cố.`
      );

      return {
        success: true,
        message: 'Đồng bộ Zabbix thành công',
        syncedAt: this.lastSuccessfulSyncAt,
        durationMs,
        printerCount: printers.length,
        incidentCount: incidents.length,
      };
    } catch (err) {
      const durationMs = Date.now() - startTime;
      const message = err instanceof Error ? err.message : 'Unknown Zabbix sync error';
      console.error(`[Sync] Lỗi đồng bộ Zabbix sau ${durationMs}ms:`, message);
      throw err;
    } finally {
      this.isSyncing = false;
    }
  }

  // -------------------------------------------------------------------------
  // Public Data Retrieval Methods
  // -------------------------------------------------------------------------

  async getPrinters(): Promise<PrinterResponse[]> {
    if (!this.isCacheValid(this.printersCache)) {
      const syncResult = await this.syncNow();
      if (syncResult.success && this.printersCache) {
        return this.printersCache.data;
      }
      if (this.printersCache) {
        return this.printersCache.data;
      }
      throw new Error('Không thể lấy dữ liệu máy in từ Zabbix API.');
    }
    return this.printersCache ? this.printersCache.data : [];
  }

  async getPrinterById(printerId: string): Promise<PrinterResponse | null> {
    const printers = await this.getPrinters();
    return printers.find(p => p.id === printerId || p.ip === printerId) ?? null;
  }

  async getIncidents(): Promise<IncidentResponse[]> {
    if (!this.isCacheValid(this.incidentsCache)) {
      const syncResult = await this.syncNow();
      if (syncResult.success && this.incidentsCache) {
        return this.incidentsCache.data;
      }
      if (this.incidentsCache) {
        return this.incidentsCache.data;
      }
      throw new Error('Không thể lấy danh sách sự cố từ Zabbix API.');
    }
    return this.incidentsCache ? this.incidentsCache.data : [];
  }

  async getPrintVolumeTelemetry(
    range: TelemetryRange = '24h',
    printerId?: string
  ): Promise<PrinterTelemetryResponse[]> {
    const cacheKey = `${range}:${printerId ?? 'all'}`;
    const cached = this.telemetryCache.get(cacheKey);
    if (this.isCacheValid(cached ?? null)) {
      return cached!.data;
    }

    const printers = await this.getPrinters();
    const targetPrinters = printerId
      ? printers.filter(p => p.id === printerId)
      : printers;

    if (targetPrinters.length === 0) {
      return [];
    }

    const nowSec = Math.floor(Date.now() / 1000);
    let timeFrom: number;
    let bucketCount: number;
    let bucketSeconds: number;
    let labelFormat: 'hour' | 'day';

    switch (range) {
      case '24h':
        timeFrom = nowSec - 24 * 3600;
        bucketCount = 24;
        bucketSeconds = 3600;
        labelFormat = 'hour';
        break;
      case '7d':
        timeFrom = nowSec - 7 * 24 * 3600;
        bucketCount = 7;
        bucketSeconds = 24 * 3600;
        labelFormat = 'day';
        break;
      case '30d':
      default:
        timeFrom = nowSec - 30 * 24 * 3600;
        bucketCount = 30;
        bucketSeconds = 24 * 3600;
        labelFormat = 'day';
        break;
    }

    const results: PrinterTelemetryResponse[] = await Promise.all(
      targetPrinters.map(async p => {
        try {
          const items = await this.zabbix.getLatestItems(p.id, ['printer.counter.total']);
          const totalItem = items.find(i => i.key_ === 'printer.counter.total');

          if (!totalItem) {
            return {
              printerId: p.id,
              printerName: p.name,
              range,
              totalPrintedInRange: 0,
              dataQuality: 'no_data',
              lastScraped: p.lastScrape,
              buckets: generateEmptyBuckets(timeFrom, bucketCount, bucketSeconds, labelFormat),
            };
          }

          const history = await this.zabbix.getHistory(
            [totalItem.itemid],
            timeFrom - bucketSeconds,
            nowSec,
            3
          );

          if (!history || history.length === 0) {
            return {
              printerId: p.id,
              printerName: p.name,
              range,
              totalPrintedInRange: 0,
              dataQuality: 'no_data',
              lastScraped: p.lastScrape,
              buckets: generateEmptyBuckets(timeFrom, bucketCount, bucketSeconds, labelFormat),
            };
          }

          const buckets = aggregateHistoryToBuckets(
            history,
            timeFrom,
            bucketCount,
            bucketSeconds,
            labelFormat
          );

          const totalPrinted = buckets.reduce((acc, b) => acc + (b.pagesPrinted ?? 0), 0);
          const hasNoData = buckets.some(b => b.status === 'no_data');
          const allNoData = buckets.every(b => b.status === 'no_data');
          const dataQuality: 'complete' | 'partial' | 'no_data' = allNoData
            ? 'no_data'
            : hasNoData
            ? 'partial'
            : 'complete';

          return {
            printerId: p.id,
            printerName: p.name,
            range,
            totalPrintedInRange: totalPrinted,
            dataQuality,
            lastScraped: p.lastScrape,
            buckets,
          };
        } catch {
          return {
            printerId: p.id,
            printerName: p.name,
            range,
            totalPrintedInRange: 0,
            dataQuality: 'no_data',
            lastScraped: p.lastScrape,
            buckets: generateEmptyBuckets(timeFrom, bucketCount, bucketSeconds, labelFormat),
          };
        }
      })
    );

    this.telemetryCache.set(cacheKey, { data: results, cachedAt: Date.now() });
    return results;
  }

  async getAvailabilityTimeline(
    _timeframe: string
  ): Promise<AvailabilityDataPoint[]> {
    try {
      const printers = await this.getPrinters();
      const total = printers.length;
      if (total === 0) return [];
      const onlineCount = printers.filter(p => p.connectionStatus === 'Online').length;
      return [{
        timeLabel: new Date().toISOString(),
        onlineRate: Number(((onlineCount / total) * 100).toFixed(1)),
        onlineCount,
        offlineCount: total - onlineCount,
      }];
    } catch {
      return [];
    }
  }
}

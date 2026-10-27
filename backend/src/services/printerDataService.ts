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
import { classifyProblem, computeHealth, ProblemClassification, isPaperMissingAlert } from './problemClassifier.js';
import { mapHostToPrinter, mapProblemToIncident } from './printerMapper.js';
import {
  calculateDeltaFromHistory,
  generateEmptyBuckets,
  aggregateHistoryToBuckets,
  formatBucketLabel,
} from './telemetryAggregator.js';

// Re-export for backward-compatibility with tests and external consumers
export { classifyProblem, computeHealth, ProblemClassification, isPaperMissingAlert };

const CACHE_TTL_MS = Number(process.env['ZABBIX_POLL_INTERVAL_MS'] ?? 180_000);

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
  private availabilityTimelineCache = new Map<string, CacheEntry<AvailabilityDataPoint[]>>();

  private isSyncing = false;
  private syncTimer: NodeJS.Timeout | null = null;
  private syncIntervalMs = CACHE_TTL_MS; // 5 minutes (300,000 ms)
  private lastSuccessfulSyncAt: string | null = null;
  private lastSyncAttemptAt: string | null = null;
  // Track consecutive failures to decide whether to serve stale data vs throw
  private consecutiveSyncFailures = 0;
  private static readonly MAX_STALE_FAILURES = 5; // after 5 consecutive failures (~25 min), surface error

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
    thirtyDayVolume: MetricValue = null,
    sevenDayVolume: MetricValue = null
  ): PrinterResponse {
    return mapHostToPrinter(host, hostProblems, items, thirtyDayVolume, {
      manualStatusOverrides: this.manualStatusOverrides,
      manualLocationOverrides: this.manualLocationOverrides,
      lastSyncAttemptAt: this.lastSyncAttemptAt,
      lastSuccessfulSyncAt: this.lastSuccessfulSyncAt,
      sevenDayVolume,
    }, sevenDayVolume);
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
    thirtyDayVolume: MetricValue = null,
    sevenDayVolume: MetricValue = null
  ): PrinterResponse {
    return this.mapHostToPrinter(host, hostProblems, items, thirtyDayVolume, sevenDayVolume);
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
      const sevenDaysAgoSec = nowSec - 7 * 24 * 3600;
      const thirtyDaysAgoSec = nowSec - 30 * 24 * 3600;

      const hostIds = printerHosts.map(h => h.hostid);

      // Batch fetch latest items and active problems across all printer hosts in 2 calls instead of 2 * N
      const [allLatestItems, rawActiveProblems] = await Promise.all([
        this.zabbix.getLatestItems(hostIds).catch(() => []),
        this.zabbix.getActiveProblems(hostIds).catch(() => []),
      ]);

      // Lọc bỏ toàn bộ thông báo hết khay giấy thông thường (người dùng yêu cầu bỏ hẳn)
      const allActiveProblems = rawActiveProblems.filter(p => !isPaperMissingAlert(p.name));

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

      // Collect total counter item IDs for batch volume calculation
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

      // Batch fetch oldest + newest boundary points for 7-day and 30-day windows
      const boundary7dMap = new Map<string, { first: ZabbixHistoryPoint; last: ZabbixHistoryPoint }>();
      const boundary30dMap = new Map<string, { first: ZabbixHistoryPoint; last: ZabbixHistoryPoint }>();
      if (counterItemIds.length > 0) {
        try {
          const [raw7d, raw30d] = await Promise.all([
            this.zabbix.getHistoryBoundary(counterItemIds, sevenDaysAgoSec, nowSec),
            this.zabbix.getHistoryBoundary(counterItemIds, thirtyDaysAgoSec, nowSec),
          ]);
          raw7d.forEach((v, k) => boundary7dMap.set(k, v));
          raw30d.forEach((v, k) => boundary30dMap.set(k, v));
        } catch {
          // ignore boundary failure — volumes will remain null
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

        let sevenDayVolume: MetricValue = null;
        let thirtyDayVolume: MetricValue = null;
        const itemId = hostToCounterItemId.get(h.hostid);
        if (itemId) {
          const b7d = boundary7dMap.get(itemId);
          if (b7d) {
            const first = parseInt(b7d.first.value, 10);
            const last = parseInt(b7d.last.value, 10);
            if (!isNaN(first) && !isNaN(last) && last >= first) {
              sevenDayVolume = last - first;
            }
          }
          const b30d = boundary30dMap.get(itemId);
          if (b30d) {
            const first = parseInt(b30d.first.value, 10);
            const last = parseInt(b30d.last.value, 10);
            if (!isNaN(first) && !isNaN(last) && last >= first) {
              thirtyDayVolume = last - first;
            }
          }
        }

        return mapHostToPrinter(h, hostProblems, items, thirtyDayVolume, mapperContext, sevenDayVolume);
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
        const fetchedProblems = await this.zabbix.getProblemsInRange(thirtyDaysAgoSec, nowSec, hostIds);
        // Lọc bỏ toàn bộ thông báo hết khay giấy trong lịch sử sự cố
        rawProblems = fetchedProblems.filter(p => !isPaperMissingAlert(p.name));
      } catch (err) {
        console.warn('[Sync] Không thể lấy lịch sử sự cố theo lô:', err);
        rawProblems = [];
      }

      // Hợp nhất allActiveProblems và rawProblems theo eventid để đảm bảo không bỏ sót sự cố đang diễn ra
      const problemMap = new Map<string, ZabbixProblem>();
      for (const p of allActiveProblems) {
        problemMap.set(p.eventid, p);
      }
      for (const p of rawProblems) {
        problemMap.set(p.eventid, p);
      }
      const combinedProblems = Array.from(problemMap.values());

      const allIncidents = combinedProblems.map(p => {
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
      this.availabilityTimelineCache.clear();

      this.consecutiveSyncFailures = 0;
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
      this.consecutiveSyncFailures++;
      console.error(
        `[Sync] Lỗi đồng bộ Zabbix sau ${durationMs}ms (lần thất bại #${this.consecutiveSyncFailures}):`,
        message
      );

      // --- Stale-While-Revalidate: serve the last known-good cache instead of wiping it ---
      // Only surface the error to callers (getPrinters/getIncidents) once we exceed the
      // stale-failure threshold, preventing a single Zabbix blip from marking all printers Offline.
      if (
        this.printersCache !== null &&
        this.consecutiveSyncFailures <= PrinterDataService.MAX_STALE_FAILURES
      ) {
        console.warn(
          `[Sync] Phục vụ dữ liệu cache cũ (stale) — đồng bộ tiếp theo sẽ thử lại tự động.`
        );
        return {
          success: false,
          message: `Đồng bộ thất bại, đang phục vụ dữ liệu cũ: ${message}`,
          syncedAt: this.lastSuccessfulSyncAt || new Date().toISOString(),
          durationMs,
          printerCount: this.printersCache.data.length,
          incidentCount: this.incidentsCache?.data.length ?? 0,
        };
      }

      // No cache exists or failures exceeded threshold — propagate error to let caller handle it
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
      case '1h':
        timeFrom = nowSec - 3600;
        bucketCount = 12;
        bucketSeconds = 300; // 5 mins
        labelFormat = 'hour';
        break;
      case '6h':
        timeFrom = nowSec - 6 * 3600;
        bucketCount = 12;
        bucketSeconds = 1800; // 30 mins
        labelFormat = 'hour';
        break;
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
    timeframe: string = '24h'
  ): Promise<AvailabilityDataPoint[]> {
    const cached = this.availabilityTimelineCache.get(timeframe);
    if (this.isCacheValid(cached ?? null)) {
      return cached!.data;
    }

    try {
      const hosts = await this.zabbix.getHosts();
      const printerHosts = hosts.filter(h => h.name !== 'Zabbix server');
      const total = printerHosts.length;
      if (total === 0) return [];

      let bucketCount = 24;
      let bucketSeconds = 3600;
      let labelFormat: 'hour' | 'day' = 'hour';

      if (timeframe === '1h') {
        bucketCount = 12;
        bucketSeconds = 300; // 5 mins
        labelFormat = 'hour';
      } else if (timeframe === '6h') {
        bucketCount = 12;
        bucketSeconds = 1800; // 30 mins
        labelFormat = 'hour';
      } else if (timeframe === '7d') {
        bucketCount = 7;
        bucketSeconds = 86400; // 1 day
        labelFormat = 'day';
      } else {
        // '24h' (default)
        bucketCount = 24;
        bucketSeconds = 3600; // 1 hour
        labelFormat = 'hour';
      }

      const totalRangeSec = bucketCount * bucketSeconds;
      const nowSec = Math.floor(Date.now() / 1000);
      const startTimeSec = nowSec - totalRangeSec;

      const hostIds = printerHosts.map(h => h.hostid);
      const pingItems = await this.zabbix.getLatestItems(hostIds, ['icmpping']).catch(() => []);
      const hostToItemId = new Map<string, string>();
      pingItems.forEach(i => hostToItemId.set(i.hostid, i.itemid));

      const pingItemIds = pingItems.map(i => i.itemid);
      let historyPoints: ZabbixHistoryPoint[] = [];

      if (pingItemIds.length > 0) {
        try {
          historyPoints = await this.zabbix.getHistory(
            pingItemIds,
            startTimeSec,
            nowSec,
            3 // numeric unsigned
          );
        } catch (err) {
          console.warn('[Timeline] Không thể lấy lịch sử ping từ Zabbix:', err);
        }
      }

      // Lấy các sự cố trong khoảng thời gian quan sát để tính toán cảnh báo theo từng mốc thời gian (loại trừ hết khay giấy)
      let problemsInRange: ZabbixProblem[] = [];
      try {
        const [activeList, rangeList] = await Promise.all([
          this.zabbix.getActiveProblems(hostIds).catch(() => []),
          this.zabbix.getProblemsInRange(startTimeSec, nowSec, hostIds).catch(() => []),
        ]);
        const pMap = new Map<string, ZabbixProblem>();
        activeList
          .filter(p => !isPaperMissingAlert(p.name))
          .forEach(p => pMap.set(p.eventid, p));
        rangeList
          .filter(p => !isPaperMissingAlert(p.name))
          .forEach(p => pMap.set(p.eventid, p));
        problemsInRange = Array.from(pMap.values());
      } catch (err) {
        console.warn('[Timeline] Không thể lấy sự cố theo khung giờ:', err);
        problemsInRange = [];
      }

      const historyByItem = new Map<string, ZabbixHistoryPoint[]>();
      for (const pt of historyPoints) {
        let list = historyByItem.get(pt.itemid);
        if (!list) {
          list = [];
          historyByItem.set(pt.itemid, list);
        }
        list.push(pt);
      }

      const buckets: AvailabilityDataPoint[] = [];
      for (let i = 0; i < bucketCount; i++) {
        const bStart = startTimeSec + i * bucketSeconds;
        const bEnd = bStart + bucketSeconds;
        const timeLabel = formatBucketLabel(bStart, labelFormat);

        // Lọc các sự cố còn hiệu lực trong mốc thời gian [bStart, bEnd)
        const activeProblemsInBucket = problemsInRange.filter(p => {
          const startTs = Number(p.clock);
          const endTs = p.r_clock && p.r_clock !== '0' ? Number(p.r_clock) : Infinity;
          return startTs < bEnd && endTs >= bStart;
        });

        const hostIdsWithProblem = new Set(
          activeProblemsInBucket
            .map(p => p.hosts?.[0]?.hostid)
            .filter(Boolean)
        );

        let onlineCount = 0;
        let warningCount = 0;

        for (const h of printerHosts) {
          let isHostOnline = false;
          const itemId = hostToItemId.get(h.hostid);
          if (itemId) {
            const itemHistory = historyByItem.get(itemId) || [];
            const samplesBeforeEnd = itemHistory.filter(s => Number(s.clock) < bEnd);
            if (samplesBeforeEnd.length > 0) {
              const lastSample = samplesBeforeEnd[samplesBeforeEnd.length - 1];
              isHostOnline = lastSample.value === '1';
            } else if (itemHistory.length > 0) {
              isHostOnline = itemHistory[0].value === '1';
            } else {
              isHostOnline = h.available === '1';
            }
          } else {
            isHostOnline = h.available === '1';
          }

          if (isHostOnline) {
            onlineCount++;
            if (hostIdsWithProblem.has(h.hostid)) {
              warningCount++;
            }
          }
        }

        const onlineRate = total > 0 ? Number(((onlineCount / total) * 100).toFixed(1)) : 100;
        buckets.push({
          timeLabel,
          onlineRate,
          onlineCount,
          offlineCount: total - onlineCount,
          warningCount,
        });
      }

      this.availabilityTimelineCache.set(timeframe, { data: buckets, cachedAt: Date.now() });
      return buckets;
    } catch {
      // Fallback khi Zabbix chưa phản hồi
      const printers = await this.getPrinters().catch(() => []);
      const total = printers.length;
      if (total === 0) return [];
      const onlineCount = printers.filter(p => p.connectionStatus === 'Online').length;
      return [{
        timeLabel: 'Hiện tại',
        onlineRate: Number(((onlineCount / total) * 100).toFixed(1)),
        onlineCount,
        offlineCount: total - onlineCount,
      }];
    }
  }
}

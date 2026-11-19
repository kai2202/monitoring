/**
 * Backend/src/services/cache/fleetMemoryCache.ts
 *
 * Bộ Đệm In-Memory Caching Singleton (TTL = 60s) cho FleetMonitor Backend:
 * - Đảm bảo độ trễ truy vấn danh sách máy in & KPI < 10ms theo AGENTS.md Rule 7.
 * - Dung lượng RAM < 10MB cho hạm đội ~100 máy in, không cần cụm Redis bên ngoài.
 * - Cơ chế Stale Data Policy: Trả dữ liệu hợp lệ gần nhất kèm cờ isStale = true khi Zabbix ngắt kết nối.
 * - Tuân thủ AGENTS.md Rule 5 & Rule 7.1 (< 300 LOC).
 */

export interface CachedFleetSnapshot {
  timestamp: number; // Unix epoch ms
  isStale: boolean;
  totalPrinters: number;
  onlineCount: number;
  printers: any[];
  activeAlerts: any[];
}

export class FleetMemoryCache {
  private static instance: FleetMemoryCache;
  private cache: CachedFleetSnapshot | null = null;
  private readonly TTL_MS = 60 * 1000; // 60 giây theo AGENTS.md

  private constructor() {}

  public static getInstance(): FleetMemoryCache {
    if (!FleetMemoryCache.instance) {
      FleetMemoryCache.instance = new FleetMemoryCache();
    }
    return FleetMemoryCache.instance;
  }

  public set(snapshot: Omit<CachedFleetSnapshot, 'timestamp' | 'isStale'>): void {
    this.cache = {
      ...snapshot,
      timestamp: Date.now(),
      isStale: false,
    };
  }

  public markStale(): void {
    if (this.cache) {
      this.cache.isStale = true;
    }
  }

  public get(): CachedFleetSnapshot | null {
    if (!this.cache) return null;
    const isExpired = Date.now() - this.cache.timestamp > this.TTL_MS;
    if (isExpired) {
      // Hết hạn TTL nhưng Zabbix mất mạng -> tiếp tục trả kèm cờ isStale = true
      return { ...this.cache, isStale: true };
    }
    return this.cache;
  }

  public clear(): void {
    this.cache = null;
  }

  public invalidate(_tag?: string): void {
    this.clear();
  }

  public isCacheValid(): boolean {
    if (!this.cache) return false;
    return Date.now() - this.cache.timestamp <= this.TTL_MS && !this.cache.isStale;
  }
}

export const fleetMemoryCache = FleetMemoryCache.getInstance();

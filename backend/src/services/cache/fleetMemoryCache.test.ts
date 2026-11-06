/**
 * Backend/src/services/cache/fleetMemoryCache.test.ts
 *
 * Kiểm thử đơn vị cho FleetMemoryCache (TASK-BE-02):
 * - Kiểm tra lưu trữ đệm Singleton TTL 60s cho danh mục máy in.
 * - Kiểm tra chính sách Stale Data Policy: gắn cờ isStale = true khi hết hạn hoặc mất kết nối.
 * - Kiểm tra phương thức clear và xác thực tính hợp lệ của cache.
 * - Tuân thủ AGENTS.md Rule 5 & Rule 7.1 (< 300 LOC).
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FleetMemoryCache } from './fleetMemoryCache';

describe('FleetMemoryCache', () => {
  let cache: FleetMemoryCache;

  beforeEach(() => {
    cache = FleetMemoryCache.getInstance();
    cache.clear();
    vi.restoreAllMocks();
  });

  it('phải lưu trữ snapshot và trả về dữ liệu còn tươi trong 60s (isStale = false)', () => {
    cache.set({
      totalPrinters: 35,
      onlineCount: 33,
      printers: [{ id: 'p1', name: 'Ricoh MP C6004' }],
      activeAlerts: [],
    });

    const cached = cache.get();
    expect(cached).not.toBeNull();
    expect(cached?.totalPrinters).toBe(35);
    expect(cached?.onlineCount).toBe(33);
    expect(cached?.isStale).toBe(false);
    expect(cache.isCacheValid()).toBe(true);
  });

  it('phải đánh dấu isStale = true khi gọi markStale()', () => {
    cache.set({
      totalPrinters: 10,
      onlineCount: 10,
      printers: [],
      activeAlerts: [],
    });

    cache.markStale();
    const cached = cache.get();
    expect(cached?.isStale).toBe(true);
    expect(cache.isCacheValid()).toBe(false);
  });

  it('phải tự động gán isStale = true sau khi vượt quá thời hạn TTL 60s', () => {
    const now = Date.now();
    vi.spyOn(Date, 'now').mockReturnValue(now);

    cache.set({
      totalPrinters: 20,
      onlineCount: 18,
      printers: [],
      activeAlerts: [],
    });

    // Tua thời gian 65 giây sau (vượt quá TTL 60s)
    vi.spyOn(Date, 'now').mockReturnValue(now + 65 * 1000);

    const cached = cache.get();
    expect(cached).not.toBeNull();
    expect(cached?.isStale).toBe(true);
    expect(cache.isCacheValid()).toBe(false);
  });

  it('phải xóa sạch cache khi gọi clear()', () => {
    cache.set({
      totalPrinters: 5,
      onlineCount: 5,
      printers: [],
      activeAlerts: [],
    });

    cache.clear();
    expect(cache.get()).toBeNull();
    expect(cache.isCacheValid()).toBe(false);
  });
});

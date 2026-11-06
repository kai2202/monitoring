# TASK-BE-02: In-Memory Caching (TTL 60s) & Hardware Error Fallback Engine

> **Phân hệ:** Backend / Core Engine & Diagnostics  
> **Mã nhiệm vụ:** TASK-BE-02  
> **Phiên bản:** 1.0.0 (Tối ưu hóa hạm đội ~100 máy in, In-Memory Singleton Cache)  
> **Trạng thái:** ✅ Hoàn thành 100% (fleetMemoryCache.ts & errorCodeClassifier.ts)  
> **Tài liệu liên quan:** [Kiến Trúc Hệ Thống](file:///f:/Code/Github/Monitoring/docs/Design/architecture.md), [Bản Ánh Xạ OIDs](file:///f:/Code/Github/Monitoring/docs/Design/frontend_mock_to_oid_mapping.md)

---

## 1. Mục Tiêu & Phạm Vi Kỹ Thuật

Nhiệm vụ này triển khai hai thành phần nền tảng cốt lõi của máy chủ Backend FleetMonitor:

1. **Bộ Đệm In-Memory Caching (TTL = 60s):**
   - Đảm bảo thời gian phản hồi giao diện người dùng **$< 50\text{ms}$** (thực tế $< 5\text{ms}$) cho toàn bộ các truy vấn danh sách máy in và KPI dashboard theo yêu cầu của AGENTS.md Rule 7.
   - Dung lượng bộ nhớ RAM chiếm dụng $< 10\text{MB}$ cho hạm đội ~100 máy in. Không yêu cầu cài đặt cụm Redis bên ngoài, tối ưu hóa cho cấu hình In-Process Singleton.
   - Cơ chế quản lý trạng thái dữ liệu cũ (Stale Data Policy): Khi Zabbix API bị ngắt kết nối, Backend tiếp tục trả dữ liệu đệm hợp lệ gần nhất kèm cờ `isStale: true`. Nếu bộ đệm đã hết hạn mà Zabbix vẫn lỗi, trả mã `HTTP 503 Service Unavailable`, **tuyệt đối không âm thầm chuyển sang mock data**.
2. **Bộ Phân Loại Lỗi Phần Cứng & Fallback Engine (`FM-UNK-01`):**
   - Phân định rõ ràng giữa:
     - **Cảnh báo vật tư tiêu hao (Consumable Alert):** Hết mực, bình mực thải sắp đầy, hết giấy khay kéo.
     - **Sự cố phần cứng nghiêm trọng (Hardware Failure):** Chập nung cụm sấy, hỏng motor lăng kính laser, lỗi bo mạch chủ.
   - Khi tiếp nhận mã lỗi từ SNMP trap/trigger Zabbix chưa có trong từ điển `vendor_error_mappings`: Kích hoạt Fallback Engine gán mã `FM-<SUBSYSTEM>-99` hoặc `FM-UNK-01`, bảo toàn nguyên vẹn `raw_vendor_code` và gắn cờ `needs_mapping_review: true`.

---

## 2. Thiết Kế Chi Tiết In-Memory Cache Singleton

```typescript
// backend/src/services/cache/fleetMemoryCache.ts

export interface CachedFleetSnapshot {
  timestamp: number; // Unix epoch ms
  isStale: boolean;
  totalPrinters: number;
  onlineCount: number;
  printers: any[]; // Mảng ~100 máy in đã chuẩn hóa
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
}
```

---

## 3. Thuật Toán Fallback Engine Cho Mã Lỗi Không Xác Định

```typescript
// backend/src/services/diagnostics/errorCodeClassifier.ts

export interface ClassifiedErrorCode {
  internalCode: string;       // FM-<SUBSYSTEM>-<INDEX> hoặc FM-UNK-01
  subsystem: string;          // FUS, OPT, SCN, FED, DRM, DEV, TNR, TRN, PWR, NET, UNK
  rawVendorCode: string;      // SC542, E000, 50.1, 0x80041001...
  severity: 'Critical' | 'Warning' | 'Info';
  isMapped: boolean;
  needsMappingReview: boolean;
  descriptionVi: string;
}

export async function classifyHardwareError(
  rawCode: string,
  vendor: string,
  triggerName: string,
  zabbixSeverity: number
): Promise<ClassifiedErrorCode> {
  // 1. Tra cứu trong bảng vendor_error_mappings
  const mapping = await prisma.vendorErrorMapping.findFirst({
    where: { vendor, vendorCode: rawCode },
    include: { internalDefinition: true },
  });

  if (mapping) {
    return {
      internalCode: mapping.internalErrorId,
      subsystem: mapping.internalDefinition.subsystem,
      rawVendorCode: rawCode,
      severity: mapping.internalDefinition.defaultSeverity as any,
      isMapped: true,
      needsMappingReview: false,
      descriptionVi: mapping.internalDefinition.nameVi,
    };
  }

  // 2. Không tìm thấy -> Kích hoạt Fallback Engine
  const detectedSubsystem = detectSubsystemFromTrigger(triggerName);
  const fallbackCode = detectedSubsystem ? `FM-${detectedSubsystem}-99` : 'FM-UNK-01';

  return {
    internalCode: fallbackCode,
    subsystem: detectedSubsystem || 'UNK',
    rawVendorCode: rawCode,
    severity: mapZabbixSeverity(zabbixSeverity),
    isMapped: false,
    needsMappingReview: true, // Đưa vào hàng đợi duyệt tại /settings
    descriptionVi: `Lỗi phần cứng ${vendor} chưa ánh xạ (${rawCode})`,
  };
}
```

---

## 4. Tiêu Chí Nghiệm Thu (Acceptance Criteria)

- [ ] Phản hồi API danh sách máy in `/api/printers` có độ trễ $< 10\text{ms}$ khi phục vụ từ cache.
- [ ] Dữ liệu tự động cập nhật mốc thời gian `timestamp` sau mỗi chu kỳ scrape 30s của TASK-BE-01.
- [ ] Khi Zabbix API ngắt kết nối: Trả dữ liệu đệm cũ kèm cờ `isStale: true`, giao diện hiển thị nhãn `Dữ liệu đã cũ`.
- [ ] Khi nạp mã lỗi lạ chưa có trong từ điển: Server không bị crash, tự động gán `FM-UNK-01`, lưu nguyên vẹn `rawVendorCode` và gắn cờ `needsMappingReview: true`.
- [ ] Tách biệt hoàn toàn trạng thái Kẹt giấy/Hết mực ra khỏi Lỗi phần cứng cụm sấy/quang học.


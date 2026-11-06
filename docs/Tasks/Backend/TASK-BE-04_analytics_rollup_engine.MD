# TASK-BE-04: Printer Analytics & Rollup Aggregator Engine

> **Phân hệ:** Backend / Analytics & Telemetry Engine  
> **Mã nhiệm vụ:** TASK-BE-04  
> **Phiên bản:** 1.0.0 (Tối ưu hóa hạm đội ~100 máy in, Thuật toán 3 trạng thái Rollover 32-bit, D-Day trượt 7 ngày)  
> **Trạng thái:** ✅ Hoàn thành (Completed & Unit Tested)  
> **Tài liệu liên quan:** [Kiến Trúc Hệ Thống](file:///f:/Code/Github/Monitoring/docs/Design/architecture.md), [Bản Ánh Xạ OIDs](file:///f:/Code/Github/Monitoring/docs/Design/frontend_mock_to_oid_mapping.md)

---

## 1. Mục Tiêu & Phạm Vi Kỹ Thuật

Module chịu trách nhiệm xử lý số liệu đo lường từ xa (Telemetry), tính toán sản lượng trang in theo giờ/ngày/tháng và dự báo cạn kiệt vật tư cho toàn bộ hạm đội ~100 máy in:

1. **Kiến Trúc Rollup Hai Tầng (Hourly & Daily Rollup):**
   - Lưu trữ số liệu sản lượng trang in theo giờ (`printer_hourly_volume`) phục vụ Biểu đồ Soft Spline 24 Giờ.
   - Lưu trữ số liệu theo ngày (`printer_daily_volume`) phục vụ Biểu đồ 7 Ngày, 30 Ngày, Cột Ngang Mono/Color và Khung Đối Chiếu Sandbox.
   - Dung lượng lưu trữ cực kỳ tinh gọn: Hạm đội ~100 máy in chỉ phát sinh **~36.500 dòng/năm** ($\approx 5\text{MB/năm}$), đảm bảo tốc độ truy vấn tức thời ($< 15\text{ms}$).
2. **Thuật Toán Tính Delta Bộ Đếm 3 Trạng Thái (Counter Rollover & Reset):**
   - Xử lý triệt để hiện tượng tràn số nguyên không dấu 32-bit ($2^{32} - 1 = 4.294.967.295$) của OID `prtMarkerLifeCount` và các tình huống thay thế bo mạch chủ làm reset số counter về 0.
3. **Động Cơ Dự Báo Cạn Kiệt Vật Tư D-Day (7-Day Rolling Burn-Rate):**
   - Tính toán tốc độ tiêu hao thực tế trung bình mỗi ngày dựa trên lịch sử 7 ngày gần nhất, sinh huy hiệu đếm ngược hạn chót `[D-4]`, `[D-7]`, `[D-25]` kèm ngày dự kiến cạn kiệt.
4. **Hạch Toán Chi Phí & Chỉ Số SLA:**
   - Tính Uptime SLA toàn hạm đội, MTBF, MTTR, và Chi phí trên mỗi trang in (CPP).

---

## 2. Thiết Kế Cơ Sở Dữ Liệu Rollup Trong Prisma

```prisma
// backend/prisma/schema.prisma (Phần Rollup & Telemetry)

model PrinterHourlyVolume {
  id             BigInt   @id @default(autoincrement())
  printerId      String   @map("printer_id")
  hourTimestamp  DateTime @map("hour_timestamp") // Mốc đầu giờ: 2026-11-04 08:00:00+07
  totalPages     Int      @default(0) @map("total_pages")
  monoPages      Int      @default(0) @map("mono_pages")
  colorPages     Int      @default(0) @map("color_pages")

  printer        Printer  @relation(fields: [printerId], references: [id], onDelete: Cascade)

  @@unique([printerId, hourTimestamp])
  @@index([hourTimestamp])
  @@map("printer_hourly_volume")
}

model PrinterDailyVolume {
  id             BigInt   @id @default(autoincrement())
  printerId      String   @map("printer_id")
  date           DateTime @db.Date // 2026-11-04
  totalPages     Int      @default(0) @map("total_pages")
  monoPages      Int      @default(0) @map("mono_pages")
  colorPages     Int      @default(0) @map("color_pages")
  createdAt      DateTime @default(now()) @map("created_at")

  printer        Printer  @relation(fields: [printerId], references: [id], onDelete: Cascade)

  @@unique([printerId, date])
  @@index([date])
  @@map("printer_daily_volume")
}

model PrinterSuppliesSnapshot {
  id             String   @id @default(uuid())
  printerId      String   @unique @map("printer_id")
  black          Int?     // % Mực đen K (0 - 100 hoặc null)
  cyan           Int?     // % Mực xanh C (null nếu là máy Mono)
  magenta        Int?     // % Mực hồng M (null nếu là máy Mono)
  yellow         Int?     // % Mực vàng Y (null nếu là máy Mono)
  drum           Int?     // % Tuổi thọ trống quang học
  fuser          Int?     // % Tuổi thọ cụm sấy
  waste          Int?     // % Mức bình mực thải (hoặc 1: OK, 2: Sắp đầy, 3: Đầy)
  updatedAt      DateTime @default(now()) @map("updated_at")

  printer        Printer  @relation(fields: [printerId], references: [id], onDelete: Cascade)

  @@map("printer_supplies_snapshot")
}
```

---

## 3. Đặc Tả Thuật Toán Cốt Lõi

### 3.1. Thuật Toán Tính Delta Counter 3 Trạng Thái
```typescript
export function computeDeltaPages(currentCount: number, previousCount: number): number | null {
  // Trạng thái 1: Số đếm tăng bình thường
  if (currentCount >= previousCount) {
    return currentCount - previousCount;
  }

  // Trạng thái 2: Tràn số 32-bit (chỉ áp dụng khi previousCount chạm sát ngưỡng 4 tỷ)
  const THIRTY_TWO_BIT_MAX = 4294967296; // 2^32
  if (previousCount > 4000000000) {
    return (THIRTY_TWO_BIT_MAX - previousCount) + currentCount;
  }

  // Trạng thái 3: Bo mạch chủ bị Reset hoặc thay Mainboard mới
  console.warn(`[Counter Reset Detected] Previous: ${previousCount}, Current: ${currentCount}`);
  // Trả về null để tránh đột biến sản lượng ảo, worker đặt lại baseline = currentCount
  return null;
}
```

### 3.2. Thuật Toán Dự Báo Cạn Kiệt D-Day (7-Day Rolling Burn-Rate)
$$\text{daily\_burn\_rate} = \frac{\text{Supply\_Level}(t-7) - \text{Supply\_Level}(t)}{7} \quad (\%/ngày)$$
$$\text{daysRemaining} = \text{round}\left(\frac{\text{CurrentPercent}}{\text{daily\_burn\_rate}}\right)$$

*Điều kiện biên Null-Safety:*
- Nếu $\text{daily\_burn\_rate} \le 0$ (máy ít dùng hoặc vừa thay hộp mực mới): `daysRemaining = null`, không đưa vào danh sách cảnh báo cạn kiệt.
- Nếu `CurrentPercent = null` (máy không hỗ trợ cảm biến OID): Loại trừ khỏi cảnh báo D-Day.

---

## 4. Danh Sách REST API Endpoints Cung Cấp Cho Frontend

| Endpoint | Method | Dữ liệu trả về phục vụ Frontend |
| :--- | :--- | :--- |
| `/api/telemetry/volume-trend` | `GET` | Mảng dữ liệu chuỗi thời gian (`hourly`, `7days`, `30days`), viên nang đỉnh tải `peakPill`, % tăng trưởng |
| `/api/telemetry/distribution` | `GET` | Danh sách ~100 máy in kèm tỷ trọng Mono vs Color phục vụ Biểu đồ cột ngang và Sandbox |
| `/api/supplies/alerts` | `GET` | Danh sách vật tư khẩn cấp kèm viên nang D-Day `[D-4]`, `[D-7]`, `[D-25]` |
| `/api/supplies/overview` | `GET` | Mức vật tư chi tiết K, C, M, Y, Drum, Fuser, Waste Toner toàn hạm đội |
| `/api/telemetry/sla-kpis` | `GET` | 4 Thẻ KPI SLA: Uptime %, MTBF (giờ), MTTR (phút), CPP (VNĐ/trang) |
| `/api/telemetry/cost-allocation` | `GET` | Tỷ trọng chi phí 5 phòng ban phục vụ Vòng cung chi phí 180° |
| `/api/telemetry/incident-matrix` | `GET` | Ma trận nhiệt điểm nóng sự cố 5 tầng x 7 tuần |

---

## 5. Tiêu Chí Nghiệm Thu (Acceptance Criteria)

- [x] Worker Hourly Rollup chạy định kỳ đầu mỗi giờ, tính đúng delta và không bị trùng lặp dữ liệu (`unique([printerId, hourTimestamp])`).
- [x] Xử lý chính xác kịch bản tràn số 32-bit và kịch bản reset bo mạch chủ trong unit test (`telemetryEngine.test.ts`).
- [x] API `/api/telemetry/volume-trend` (và `/api/analytics/trend`) phản hồi dưới $25\text{ms}$ cho cả 3 chế độ xem (24 Giờ, 7 Ngày, 30 Ngày).
- [x] Thuật toán D-Day tính toán chính xác số ngày cạn kiệt và tự động loại trừ máy in đơn sắc/không hỗ trợ OID (`computeDDayBurnRate`).


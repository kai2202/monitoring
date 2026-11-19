/**
 * Backend/src/services/telemetry/telemetryEngine.ts
 *
 * Động Cơ Đo Lường Từ Xa & Xử Lý Bộ Đếm Sản Lượng In (Telemetry & Rollup Engine):
 * - Thuật toán 3 trạng thái tính Delta Counter (Normal Increment, 32-bit Rollover, Mainboard Reset).
 * - Thuật toán dự báo cạn kiệt vật tư D-Day (7-day Rolling Burn-Rate) kèm Null-Safety.
 * - Tuân thủ AGENTS.md Rule 5 (Data Integrity) & Rule 7.1 (< 300 LOC).
 */

export interface BurnRateResult {
  dailyBurnRatePercent: number | null;
  daysRemaining: number | null;
  estimatedEmptyDate: string | null;
}

/**
 * Thuật toán tính Delta số trang in 3 trạng thái:
 * 1. Số đếm tăng bình thường: current >= previous.
 * 2. Tràn số nguyên không dấu 32-bit (2^32 - 1 = 4.294.967.295).
 * 3. Bo mạch chủ bị Reset hoặc thay Mainboard mới: trả về null để tránh số liệu ảo.
 */
export function computeDeltaPages(currentCount: number, previousCount: number): number | null {
  if (currentCount < 0 || previousCount < 0) {
    return null;
  }

  // Trạng thái 1: Tăng bình thường
  if (currentCount >= previousCount) {
    return currentCount - previousCount;
  }

  // Trạng thái 2: Tràn số 32-bit (khi previousCount chạm sát ngưỡng 4 tỷ)
  const THIRTY_TWO_BIT_MAX = 4294967296; // 2^32
  if (previousCount > 4000000000) {
    return (THIRTY_TWO_BIT_MAX - previousCount) + currentCount;
  }

  // Trạng thái 3: Bo mạch chủ bị reset về 0 hoặc thay bo mới
  return null;
}

/**
 * Thuật toán dự báo cạn kiệt vật tư D-Day trượt 7 ngày:
 * - daily_burn_rate = (Supply(t - 7) - Supply(t)) / 7 (%/ngày)
 * - daysRemaining = round(currentPercent / daily_burn_rate)
 * - Tự động loại trừ và trả về null nếu không có cảm biến hoặc mới thay mực mới (burn rate <= 0)
 */
export function computeDDayBurnRate(
  currentPercent: number | null | undefined,
  sevenDaysAgoPercent: number | null | undefined,
  daysInterval: number = 7
): BurnRateResult {
  if (
    currentPercent === null ||
    currentPercent === undefined ||
    sevenDaysAgoPercent === null ||
    sevenDaysAgoPercent === undefined ||
    daysInterval <= 0
  ) {
    return {
      dailyBurnRatePercent: null,
      daysRemaining: null,
      estimatedEmptyDate: null,
    };
  }

  const consumedPercent = sevenDaysAgoPercent - currentPercent;

  // Nếu không tiêu thụ hoặc vừa nạp hộp mực mới (consumed <= 0)
  if (consumedPercent <= 0) {
    return {
      dailyBurnRatePercent: 0,
      daysRemaining: null,
      estimatedEmptyDate: null,
    };
  }

  const dailyBurnRate = Number((consumedPercent / daysInterval).toFixed(2));
  const days = Math.max(1, Math.round(currentPercent / dailyBurnRate));

  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + days);

  const formattedDate = `${String(targetDate.getDate()).padStart(2, '0')}/${String(
    targetDate.getMonth() + 1
  ).padStart(2, '0')}/${targetDate.getFullYear()}`;

  return {
    dailyBurnRatePercent: dailyBurnRate,
    daysRemaining: days,
    estimatedEmptyDate: formattedDate,
  };
}

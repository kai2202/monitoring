/**
 * Backend/src/services/analytics/counterCalculator.ts
 *
 * Thuật toán tính toán Delta trang in 3 trạng thái (TASK-BE-04):
 * - Trạng thái 1: Số đếm tăng bình thường (current >= previous).
 * - Trạng thái 2: Tràn số 32-bit (2^32 = 4.294.967.296) khi previous chạm sát 4 tỷ.
 * - Trạng thái 3: Bo mạch chủ bị Reset / Thay Mainboard mới (trả về null để tránh đột biến sản lượng ảo).
 * - Tuân thủ AGENTS.md Rule 5 & Rule 7.1 (< 300 LOC).
 */

export const THIRTY_TWO_BIT_MAX = 4294967296; // 2^32
export const ROLLOVER_THRESHOLD = 4000000000; // 4 tỷ

export function computeDeltaPages(currentCount: number, previousCount: number): number | null {
  if (currentCount < 0 || previousCount < 0) {
    return null;
  }

  // Trạng thái 1: Số đếm tăng tiến bình thường
  if (currentCount >= previousCount) {
    return currentCount - previousCount;
  }

  // Trạng thái 2: Tràn số nguyên 32-bit (chỉ áp dụng khi previousCount chạm sát ngưỡng 4 tỷ)
  if (previousCount > ROLLOVER_THRESHOLD) {
    const delta = (THIRTY_TWO_BIT_MAX - previousCount) + currentCount;
    return delta >= 0 ? delta : null;
  }

  // Trạng thái 3: Bo mạch chủ bị Reset hoặc thay Mainboard mới
  console.warn(`[CounterCalculator Warning] Phát hiện Reset bộ đếm bo mạch: Previous=${previousCount}, Current=${currentCount}`);
  // Trả về null để tránh đột biến sản lượng ảo, worker sẽ đặt lại baseline = currentCount
  return null;
}

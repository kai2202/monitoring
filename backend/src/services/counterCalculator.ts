/**
 * Backend/src/services/counterCalculator.ts
 *
 * Xử lý tính toán sản lượng in từ chênh lệch bộ đếm SNMP OID (Page Counter Delta).
 * - Xử lý hiện tượng Counter Reset (thay mainboard, thay cụm máy hoặc xóa bộ đếm NVRAM).
 * - Xử lý hiện tượng 32-bit Integer Rollover (bộ đếm quay vòng về 0 sau 2^32 - 1).
 * - Xử lý dữ liệu thiếu mẫu hoặc thiết bị ngoại tuyến (MetricValue = null).
 * - Tuân thủ nghiêm ngặt AGENTS.md: Không biến null thành 0, không bịa đặt số liệu.
 */

export interface CounterDeltaResult {
  deltaPages: number | null;
  isResetDetected: boolean;
  isRollover: boolean;
  notes?: string;
}

const MAX_32_BIT_COUNTER = 4294967295;

/**
 * Tính toán chênh lệch sản lượng trang in giữa 2 mốc thời gian
 * @param startCounter Giá trị bộ đếm đầu kỳ
 * @param endCounter Giá trị bộ đếm cuối kỳ
 */
export function calculateCounterDelta(
  startCounter: number | null | undefined,
  endCounter: number | null | undefined
): CounterDeltaResult {
  // 1. Trường hợp thiếu dữ liệu đầu kỳ hoặc cuối kỳ
  if (startCounter === null || startCounter === undefined || endCounter === null || endCounter === undefined) {
    return {
      deltaPages: null,
      isResetDetected: false,
      isRollover: false,
      notes: 'Thiếu dữ liệu mẫu ở đầu hoặc cuối kỳ kiểm toán',
    };
  }

  // 2. Trường hợp bình thường: endCounter >= startCounter
  if (endCounter >= startCounter) {
    return {
      deltaPages: endCounter - startCounter,
      isResetDetected: false,
      isRollover: false,
    };
  }

  // 3. Trường hợp bất thường: endCounter < startCounter (Giảm bộ đếm)
  // 3.1. Kiểm tra 32-bit Rollover
  if (startCounter > MAX_32_BIT_COUNTER - 1000000 && endCounter < 1000000) {
    const rolledOverDelta = (MAX_32_BIT_COUNTER - startCounter) + endCounter;
    return {
      deltaPages: rolledOverDelta,
      isResetDetected: false,
      isRollover: true,
      notes: 'Phát hiện bộ đếm 32-bit quay vòng (Integer Rollover)',
    };
  }

  // 3.2. Counter Reset / Thay thế động cơ in (Engine Replacement)
  // Khi bộ đếm reset về giá trị nhỏ (vd: sau thay bo nguồn hoặc NVRAM clear),
  // sản lượng phát sinh trong kỳ mới chính là endCounter (tính từ lúc reset)
  return {
    deltaPages: endCounter,
    isResetDetected: true,
    isRollover: false,
    notes: `Phát hiện bộ đếm bị reset (Đầu kỳ: ${startCounter} -> Cuối kỳ: ${endCounter})`,
  };
}


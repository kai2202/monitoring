/**
 * Backend/src/services/analytics/ddayForecaster.ts
 *
 * Động Cơ Dự Báo Cạn Kiệt Vật Tư D-Day 7-Day Rolling Burn-Rate (TASK-BE-04):
 * - Tính toán tốc độ tiêu hao thực tế trung bình mỗi ngày dựa trên lịch sử 7 ngày.
 * - Sinh huy hiệu đếm ngược D-Day: [D-4], [D-7], [D-25].
 * - Tuân thủ AGENTS.md Rule 5 & Rule 7.1 (< 300 LOC).
 */

export interface DDayForecastResult {
  currentPercent: number | null;
  dailyBurnRate: number | null;
  daysRemaining: number | null;
  ddayBadge: string | null;
  estimatedEmptyDate: string | null;
  status: 'critical' | 'warning' | 'normal' | 'unsupported';
}

export function calculateDDay(
  currentPercent: number | null,
  past7DayPercent: number | null,
  now: Date = new Date()
): DDayForecastResult {
  // Biên 1: Thiết bị không hỗ trợ cảm biến OID mức vật tư
  if (currentPercent === null || currentPercent === undefined || isNaN(currentPercent)) {
    return {
      currentPercent: null,
      dailyBurnRate: null,
      daysRemaining: null,
      ddayBadge: null,
      estimatedEmptyDate: null,
      status: 'unsupported',
    };
  }

  // Biên 2: Không có lịch sử 7 ngày trước -> dùng mức tiêu hao mặc định an toàn 1.5%/ngày
  let dailyBurnRate = 1.5;
  if (past7DayPercent !== null && past7DayPercent !== undefined && !isNaN(past7DayPercent)) {
    const consumed = past7DayPercent - currentPercent;
    if (consumed > 0) {
      dailyBurnRate = Number((consumed / 7).toFixed(2));
    } else {
      // Hộp mực mới thay hoặc máy không in trong 7 ngày
      return {
        currentPercent,
        dailyBurnRate: 0,
        daysRemaining: null,
        ddayBadge: null,
        estimatedEmptyDate: null,
        status: 'normal',
      };
    }
  }

  const daysRemaining = Math.max(1, Math.round(currentPercent / dailyBurnRate));
  const estimatedDateObj = new Date(now.getTime() + daysRemaining * 24 * 60 * 60 * 1000);
  const estimatedEmptyDate = estimatedDateObj.toLocaleDateString('vi-VN');

  let status: 'critical' | 'warning' | 'normal' = 'normal';
  if (daysRemaining <= 7 || currentPercent <= 15) {
    status = 'critical';
  } else if (daysRemaining <= 14 || currentPercent <= 25) {
    status = 'warning';
  }

  return {
    currentPercent,
    dailyBurnRate,
    daysRemaining,
    ddayBadge: `[D-${daysRemaining}]`,
    estimatedEmptyDate,
    status,
  };
}

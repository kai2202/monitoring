/**
 * Backend/src/services/telemetry/telemetryEngine.test.ts
 *
 * Kiểm thử đơn vị cho Thuật toán Telemetry & Rollup Engine (TASK-BE-04):
 * - Kiểm tra 3 trạng thái tính Delta Counter (Tăng bình thường, Tràn 32-bit, Reset Mainboard).
 * - Kiểm tra thuật toán D-Day trượt 7 ngày và tính toán Null-Safety.
 * - Tuân thủ AGENTS.md Rule 4 & Rule 7.1 (< 300 LOC).
 */

import { describe, it, expect } from 'vitest';
import { computeDeltaPages, computeDDayBurnRate } from './telemetryEngine';

describe('computeDeltaPages (Delta Counter 3 Trạng Thái)', () => {
  it('phải tính đúng delta khi số đếm tăng bình thường', () => {
    const prev = 120500;
    const curr = 121350;
    const delta = computeDeltaPages(curr, prev);
    expect(delta).toBe(850);
  });

  it('phải trả về 0 khi số đếm không đổi', () => {
    const prev = 150000;
    const curr = 150000;
    const delta = computeDeltaPages(curr, prev);
    expect(delta).toBe(0);
  });

  it('phải xử lý chính xác hiện tượng tràn số nguyên 32-bit (2^32 Rollover)', () => {
    const THIRTY_TWO_BIT_MAX = 4294967296;
    const prev = 4294967000; // Sát ngưỡng 4.29 tỷ
    const curr = 500;        // Vòng lặp quay về đầu
    const expected = (THIRTY_TWO_BIT_MAX - prev) + curr; // (4294967296 - 4294967000) + 500 = 296 + 500 = 796

    const delta = computeDeltaPages(curr, prev);
    expect(delta).toBe(expected);
  });

  it('phải phát hiện Reset Bo Mạch Chủ (hoặc thay mainboard) và trả về null để tránh đột biến ảo', () => {
    const prev = 345000; // Số đếm thông thường
    const curr = 20;     // Bất ngờ tụt về 20 (do reset kỹ thuật)
    const delta = computeDeltaPages(curr, prev);
    expect(delta).toBeNull();
  });

  it('phải trả về null khi giá trị đầu vào âm', () => {
    expect(computeDeltaPages(-5, 100)).toBeNull();
    expect(computeDeltaPages(100, -10)).toBeNull();
  });
});

describe('computeDDayBurnRate (Dự Báo Cạn Kiệt D-Day Trượt 7 Ngày)', () => {
  it('phải tính toán chính xác tốc độ tiêu hao và số ngày cạn kiệt', () => {
    // 7 ngày trước: 35%, hiện tại: 14% -> tiêu thụ 21% trong 7 ngày = 3%/ngày
    const result = computeDDayBurnRate(14, 35, 7);
    expect(result.dailyBurnRatePercent).toBe(3);
    // 14% / 3%/ngày = 4.67 -> round = 5 ngày
    expect(result.daysRemaining).toBe(5);
    expect(result.estimatedEmptyDate).not.toBeNull();
  });

  it('phải trả về daysRemaining = null khi vừa thay hộp mực mới (tiêu thụ <= 0)', () => {
    // 7 ngày trước: 10%, hiện tại: 95% (vừa thay mới)
    const result = computeDDayBurnRate(95, 10, 7);
    expect(result.dailyBurnRatePercent).toBe(0);
    expect(result.daysRemaining).toBeNull();
    expect(result.estimatedEmptyDate).toBeNull();
  });

  it('phải trả về null-safety khi thiếu dữ liệu cảm biến (null hoặc undefined)', () => {
    const resultNull = computeDDayBurnRate(null, 50, 7);
    expect(resultNull.dailyBurnRatePercent).toBeNull();
    expect(resultNull.daysRemaining).toBeNull();
    expect(resultNull.estimatedEmptyDate).toBeNull();

    const resultUndefined = computeDDayBurnRate(20, undefined, 7);
    expect(resultUndefined.dailyBurnRatePercent).toBeNull();
    expect(resultUndefined.daysRemaining).toBeNull();
  });
});

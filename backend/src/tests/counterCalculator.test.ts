/**
 * Backend/src/tests/counterCalculator.test.ts
 *
 * Kiểm thử đơn vị Bộ tính toán chênh lệch sản lượng Counter (TASK-BE-04):
 * - Xử lý giá trị bình thường, thiếu mẫu (null/undefined).
 * - Xử lý 32-bit Integer Rollover và Counter Reset bo mạch.
 * - Tuân thủ AGENTS.md Rule 5 & Rule 7.1 (< 300 LOC).
 */

import { describe, it, expect } from 'vitest';
import { calculateCounterDelta } from '../services/counterCalculator';

describe('counterCalculator - calculateCounterDelta', () => {
  it('tính toán chính xác sản lượng trong trường hợp bình thường (end >= start)', () => {
    const result = calculateCounterDelta(10000, 10550);
    expect(result.deltaPages).toBe(550);
    expect(result.isResetDetected).toBe(false);
    expect(result.isRollover).toBe(false);
  });

  it('xử lý an toàn khi thiếu dữ liệu mẫu (null hoặc undefined)', () => {
    const resNullStart = calculateCounterDelta(null, 10550);
    expect(resNullStart.deltaPages).toBeNull();
    expect(resNullStart.notes).toContain('Thiếu dữ liệu');

    const resNullEnd = calculateCounterDelta(10000, null);
    expect(resNullEnd.deltaPages).toBeNull();

    const resUndef = calculateCounterDelta(undefined, undefined);
    expect(resUndef.deltaPages).toBeNull();
  });

  it('phát hiện và tính toán chính xác hiện tượng 32-bit Integer Rollover', () => {
    // startCounter gần ngưỡng 2^32 - 1 (4294967295), endCounter quay vòng về giá trị nhỏ
    const max32 = 4294967295;
    const startCounter = max32 - 50; // còn 50 trang là chạm trần
    const endCounter = 150; // đã quay vòng và in thêm 150 trang

    const result = calculateCounterDelta(startCounter, endCounter);
    expect(result.isRollover).toBe(true);
    expect(result.isResetDetected).toBe(false);
    expect(result.deltaPages).toBe(50 + 150); // Tổng số trang in thực tế: 200
  });

  it('phát hiện Counter Reset khi thay thế động cơ hoặc NVRAM Clear', () => {
    // startCounter là 148,000, endCounter là 30 (sau khi thay mainboard hoặc xóa bộ đếm)
    const result = calculateCounterDelta(148000, 30);
    expect(result.isResetDetected).toBe(true);
    expect(result.isRollover).toBe(false);
    expect(result.deltaPages).toBe(30);
    expect(result.notes).toContain('Phát hiện bộ đếm bị reset');
  });
});

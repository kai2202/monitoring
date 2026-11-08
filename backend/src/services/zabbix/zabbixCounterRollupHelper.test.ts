/**
 * Backend/src/services/zabbix/zabbixCounterRollupHelper.test.ts
 *
 * Kiểm thử tính toán delta counter an toàn & chống tràn bộ đếm 32-bit (TASK-BE-05):
 * - Đảm bảo tính toán chính xác delta thông thường.
 * - Đảm bảo chống tràn Counter32 (4_294_967_295 -> 0).
 * - Đảm bảo xử lý đúng khi thay bo mạch formatter (giá trị mới nhỏ hơn không bị delta âm).
 * - Tuân thủ AGENTS.md Rule 5 & Rule 7.1 (< 300 LOC).
 */

import { describe, it, expect } from 'vitest';
import { computeSafeCounterDelta } from './zabbixCounterRollupHelper';

describe('computeSafeCounterDelta', () => {
  it('trả về 0 khi prevVal là null hoặc số âm', () => {
    expect(computeSafeCounterDelta(1500, null)).toBe(0);
    expect(computeSafeCounterDelta(1500, -1)).toBe(0);
  });

  it('tính toán chính xác delta tăng thông thường trong ngày', () => {
    expect(computeSafeCounterDelta(1500, 1000)).toBe(500);
    expect(computeSafeCounterDelta(25000, 25000)).toBe(0);
  });

  it('xử lý chính xác hiện tượng tràn bộ đếm SNMP Counter32 (Rollover)', () => {
    // prevVal gần ngưỡng tối đa 4.29 tỷ, currentVal đã tràn vòng về 1500
    const prevVal = 4_294_960_000;
    const currentVal = 1_000;
    const expected = (4_294_967_296 - prevVal) + currentVal; // 7,296 + 1,000 = 8,296
    expect(computeSafeCounterDelta(currentVal, prevVal)).toBe(expected);
  });

  it('xử lý khi thay bo mạch formatter hoặc reset counter (không tràn, không để delta âm)', () => {
    // prevVal = 50,000, nhưng thay board mới thành 500 (không nằm trong vùng rollover)
    expect(computeSafeCounterDelta(500, 50000)).toBe(0);
  });
});


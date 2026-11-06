/**
 * Frontend/src/tests/formatters.test.ts
 *
 * Kiểm thử đơn vị cho Bộ hàm định dạng hiển thị formatters:
 * - Kiểm tra nghiêm ngặt AGENTS.md Rule 5: MetricValue = number | null,
 *   khi null/undefined bắt buộc trả về '—', không tự tiện đổi thành '0'.
 * - Kiểm tra định dạng số lượng trang in, tiền tệ VNĐ và ngày tháng tiếng Việt.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import { describe, it, expect } from 'vitest';
import {
  formatPageVolume,
  formatNumberLocale,
  formatCurrencyVND,
  formatPercentage,
  formatShortDate,
} from '../shared/utils/formatters';

describe('formatters (AGENTS.md Rule 5 Data Integrity)', () => {
  describe('formatPageVolume', () => {
    it("phải trả về '—' khi giá trị là null hoặc undefined", () => {
      expect(formatPageVolume(null)).toBe('—');
      expect(formatPageVolume(undefined)).toBe('—');
    });

    it('phải định dạng số trang in kèm đơn vị theo locale tiếng Việt', () => {
      const result = formatPageVolume(15420);
      expect(result).toContain('15');
      expect(result).toContain('trang');
    });

    it("phải phân biệt giá trị 0 thực tế và trả về '0 trang' (không nhầm với null)", () => {
      expect(formatPageVolume(0)).toContain('0 trang');
    });
  });

  describe('formatNumberLocale', () => {
    it("phải trả về '—' khi giá trị là null hoặc undefined", () => {
      expect(formatNumberLocale(null)).toBe('—');
      expect(formatNumberLocale(undefined)).toBe('—');
    });

    it('phải định dạng số nguyên có dấu phân cách hàng nghìn', () => {
      const formatted = formatNumberLocale(1234567);
      expect(formatted).not.toBe('—');
      expect(formatted.length).toBeGreaterThan(7); // Có dấu chấm hoặc phẩy phân cách
    });
  });

  describe('formatCurrencyVND', () => {
    it("phải trả về '—' khi giá trị tiền tệ là null hoặc undefined", () => {
      expect(formatCurrencyVND(null)).toBe('—');
      expect(formatCurrencyVND(undefined)).toBe('—');
    });

    it('phải định dạng tiền tệ VNĐ có ký hiệu đ hoặc VND', () => {
      const res = formatCurrencyVND(500000);
      expect(res).not.toBe('—');
      expect(res).toMatch(/₫|VND|đ/);
    });
  });

  describe('formatPercentage', () => {
    it("phải trả về '—' khi tỷ lệ là null hoặc undefined", () => {
      expect(formatPercentage(null)).toBe('—');
      expect(formatPercentage(undefined)).toBe('—');
    });

    it('phải định dạng tỷ lệ % với số chữ số thập phân chỉ định', () => {
      expect(formatPercentage(98.456, 1)).toBe('98.5%');
      expect(formatPercentage(100, 0)).toBe('100%');
      expect(formatPercentage(0, 1)).toBe('0.0%');
    });
  });

  describe('formatShortDate', () => {
    it("phải trả về '—' khi chuỗi ngày rỗng hoặc null/undefined", () => {
      expect(formatShortDate(null)).toBe('—');
      expect(formatShortDate(undefined)).toBe('—');
      expect(formatShortDate('')).toBe('—');
    });

    it('phải chuyển đổi chuỗi ngày ISO sang định dạng ngày Việt Nam (dd/mm/yyyy)', () => {
      const formatted = formatShortDate('2026-11-06T10:00:00.000Z');
      expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });
  });
});

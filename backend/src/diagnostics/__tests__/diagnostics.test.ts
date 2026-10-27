/**
 * backend/src/diagnostics/__tests__/diagnostics.test.ts
 *
 * Unit tests for Multi-Vendor Diagnostic Error Catalog and SNMP Trap Interpreter.
 */

import { describe, it, expect } from 'vitest';
import { resolveDiagnostic, extractRawCode } from '../index.js';

describe('Multi-Vendor Diagnostic Resolver & SNMP Trap Interpreter', () => {
  describe('extractRawCode', () => {
    it('extracts Ricoh SC codes from diverse formats', () => {
      expect(extractRawCode('Printer Hardware Error: SC542')).toBe('SC542');
      expect(extractRawCode('Service Call: SC-672')).toBe('SC672');
      expect(extractRawCode('SC 860 HDD Startup Error')).toBe('SC860');
    });

    it('extracts bracketed numeric alert locations', () => {
      expect(extractRawCode('Replace Cleaning Web {30402}')).toBe('30402');
      expect(extractRawCode('No Paper: Tray 3 {13400}')).toBe('13400');
    });

    it('extracts Canon E-codes', () => {
      expect(extractRawCode('Alarm: E001 Fixing Assembly')).toBe('E001');
      expect(extractRawCode('E730 PDL Communication Fault')).toBe('E730');
    });
  });

  describe('Ricoh Verified Diagnostic Rules', () => {
    it('resolves SC542 to Fusing Warm-up Error with step-by-step guidance', () => {
      const diag = resolveDiagnostic('Printer Hardware Error: SC542', 'Ricoh', 'MP C6004');

      expect(diag.isIdentified).toBe(true);
      expect(diag.rawCode).toBe('SC542');
      expect(diag.errorName).toContain('Cụm sấy không đạt nhiệt độ khởi động');
      expect(diag.subsystem).toContain('Cụm sấy (Fusing Unit)');
      expect(diag.actionGuidance).toContain('SP Mode 5-810');
      expect(diag.severity).toBe('Critical');
      expect(diag.vendor).toBe('Ricoh');
    });

    it('resolves {30402} to Cleaning Web exhaustion with part number & SP Mode reset', () => {
      const diag = resolveDiagnostic('Replace Cleaning Web {30402}', 'Ricoh', 'Aficio MP 4002');

      expect(diag.isIdentified).toBe(true);
      expect(diag.rawCode).toBe('30402');
      expect(diag.errorName).toContain('Hết cuộn giấy lau dầu cụm sấy');
      expect(diag.subsystem).toContain('Cuộn lau sấy');
      expect(diag.actionGuidance).toContain('AE04-5046');
      expect(diag.actionGuidance).toContain('SP Mode 1-902-001');
      expect(diag.severity).toBe('Warning');
      expect(diag.vendor).toBe('Ricoh');
    });

    it('resolves {30405} to Fusing PM Cycle maintenance warning', () => {
      const diag = resolveDiagnostic('Replace Fusing Unit {30405}', 'Ricoh');

      expect(diag.isIdentified).toBe(true);
      expect(diag.rawCode).toBe('30405');
      expect(diag.errorName).toContain('Cụm sấy đạt giới hạn chu kỳ bảo dưỡng');
      expect(diag.severity).toBe('Warning');
    });

    it('resolves SC672 to Operation Panel communication fault', () => {
      const diag = resolveDiagnostic('SC 672', 'Ricoh');

      expect(diag.isIdentified).toBe(true);
      expect(diag.rawCode).toBe('SC672');
      expect(diag.errorName).toContain('Mất giao tiếp giữa Bo điều khiển và Màn hình');
      expect(diag.severity).toBe('Critical');
    });

    it('resolves SC860 to HDD startup error with SP Mode format guidance', () => {
      const diag = resolveDiagnostic('SC860', 'Ricoh');

      expect(diag.isIdentified).toBe(true);
      expect(diag.rawCode).toBe('SC860');
      expect(diag.errorName).toContain('Lỗi khởi động ổ cứng HDD');
      expect(diag.actionGuidance).toContain('SP Mode 5-832');
    });
  });

  describe('Canon imageRUNNER Diagnostic Rules', () => {
    it('resolves Canon E001 Fixing Assembly with Service Mode clear guidance', () => {
      const diag = resolveDiagnostic('E001 Fixing Temperature Error', 'Canon');

      expect(diag.isIdentified).toBe(true);
      expect(diag.rawCode).toBe('E001');
      expect(diag.errorName).toContain('Lỗi nhiệt độ cụm sấy máy in Canon');
      expect(diag.actionGuidance).toContain('COPIER > FUNCTION > CLEAR > ERR');
      expect(diag.vendor).toBe('Canon');
      expect(diag.severity).toBe('Critical');
    });

    it('resolves Canon E730 PDL network error', () => {
      const diag = resolveDiagnostic('Alarm: E730 PDL Comm Error', 'Canon');

      expect(diag.isIdentified).toBe(true);
      expect(diag.rawCode).toBe('E730');
      expect(diag.errorName).toContain('Lỗi giao tiếp bo mạng PDL');
      expect(diag.vendor).toBe('Canon');
      expect(diag.severity).toBe('Critical');
    });
  });

  describe('Standard RFC 3805 Rules', () => {
    it('resolves Paper Jam when no vendor match is found', () => {
      const diag = resolveDiagnostic('Paper Jam in Duplex Unit');

      expect(diag.isIdentified).toBe(true);
      expect(diag.errorName).toContain('Kẹt giấy trong máy in');
      expect(diag.severity).toBe('Critical');
      expect(diag.vendor).toBe('Standard RFC');
    });

    it('resolves Cover Open', () => {
      const diag = resolveDiagnostic('Cover Open: Front Door');

      expect(diag.isIdentified).toBe(true);
      expect(diag.errorName).toContain('Cửa hoặc nắp máy in đang mở');
      expect(diag.severity).toBe('Critical');
    });

    it('resolves Waste Toner Full', () => {
      const diag = resolveDiagnostic('Waste Toner Full');

      expect(diag.isIdentified).toBe(true);
      expect(diag.errorName).toContain('Hộp mực thải đã đầy');
      expect(diag.severity).toBe('Warning');
    });
  });

  describe('Unknown / Unmapped Codes (Never Speculate or Fabricate)', () => {
    it('returns "Chưa xác định" with original code preserved when rule is unverified', () => {
      const raw = 'VendorSensorError: 99881 SomethingUnusual';
      const diag = resolveDiagnostic(raw, 'SomeUnknownVendor');

      expect(diag.isIdentified).toBe(false);
      expect(diag.errorName).toBe('Chưa xác định');
      expect(diag.rawCode).toBe('99881');
      expect(diag.description).toContain('Hệ thống chưa có quy tắc ánh xạ được xác minh');
      expect(diag.description).toContain(raw);
      expect(diag.actionGuidance).toContain('kiểm tra mã lỗi và thông báo chi tiết hiển thị trực tiếp trên màn hình');
    });

    it('handles *UNKNOWN* gracefully without hallucinating', () => {
      const diag = resolveDiagnostic('*UNKNOWN*');

      expect(diag.isIdentified).toBe(false);
      expect(diag.errorName).toBe('Chưa xác định');
      expect(diag.rawCode).toBe('*UNKNOWN*');
    });
  });
});

import { describe, it, expect } from 'vitest';
import { resolveDiagnostic, extractRawCode } from '../diagnostics';

describe('Frontend Diagnostics Module (Canon & Ricoh Only)', () => {
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
    it('resolves SC542 to Fusing Warm-up Error', () => {
      const diag = resolveDiagnostic('Printer Hardware Error: SC542', 'Ricoh', 'MP C6004');

      expect(diag.isIdentified).toBe(true);
      expect(diag.rawCode).toBe('SC542');
      expect(diag.errorName).toContain('Cụm sấy không đạt nhiệt độ khởi động');
      expect(diag.subsystem).toContain('Cụm sấy (Fusing Unit)');
      expect(diag.severity).toBe('Critical');
      expect(diag.vendor).toBe('Ricoh');
    });

    it('resolves {30402} to Cleaning Web exhaustion', () => {
      const diag = resolveDiagnostic('Replace Cleaning Web {30402}', 'Ricoh', 'Aficio MP 4002');

      expect(diag.isIdentified).toBe(true);
      expect(diag.rawCode).toBe('30402');
      expect(diag.errorName).toContain('Hết cuộn giấy lau dầu cụm sấy');
      expect(diag.subsystem).toContain('Cuộn lau sấy');
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

    it('resolves SC860 to HDD startup error', () => {
      const diag = resolveDiagnostic('SC860', 'Ricoh');

      expect(diag.isIdentified).toBe(true);
      expect(diag.rawCode).toBe('SC860');
      expect(diag.errorName).toContain('Lỗi khởi động ổ cứng HDD');
    });
  });

  describe('Canon imageRUNNER Diagnostic Rules', () => {
    it('resolves Canon E001 Fixing Assembly', () => {
      const diag = resolveDiagnostic('E001 Fixing Temperature Error', 'Canon');

      expect(diag.isIdentified).toBe(true);
      expect(diag.rawCode).toBe('E001');
      expect(diag.errorName).toContain('Lỗi nhiệt độ cụm sấy máy in Canon');
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
    });

    it('handles *UNKNOWN* gracefully without hallucinating', () => {
      const diag = resolveDiagnostic('*UNKNOWN*');

      expect(diag.isIdentified).toBe(false);
      expect(diag.errorName).toBe('Chưa xác định');
      expect(diag.rawCode).toBe('*UNKNOWN*');
    });

    it('returns Normal when no error is present', () => {
      const diag = resolveDiagnostic('');
      expect(diag.rawCode).toBe('NORMAL');
      expect(diag.errorName).toBe('Bình thường');
      expect(diag.isIdentified).toBe(true);
    });
  });
});

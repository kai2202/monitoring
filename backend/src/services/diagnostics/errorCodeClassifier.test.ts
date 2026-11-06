/**
 * Backend/src/services/diagnostics/errorCodeClassifier.test.ts
 *
 * Kiểm thử đơn vị cho Bộ Phân Loại Lỗi Phần Cứng (TASK-BE-02 & TASK-BE-05):
 * - Kiểm tra chuẩn hóa tên hãng máy in (Ricoh, Canon, HP, Epson, Brother, Xerox).
 * - Kiểm tra trích xuất mã lỗi phần cứng từ thông báo Zabbix Trigger (SC, E-code, 50.x...).
 * - Kiểm tra fallback mã lỗi chưa đối chiếu sang FM-UNK-01 (isMapped = false).
 * - Tuân thủ AGENTS.md Rule 6 & Rule 7.1 (< 300 LOC).
 */

import { describe, it, expect } from 'vitest';
import {
  normalizeVendorKey,
  normalizeRawCodeKey,
  extractRawErrorCodeFromTrigger,
  classifyWithDbDictionary,
} from './errorCodeClassifier';

describe('errorCodeClassifier (TASK-BE-02 & TASK-BE-05)', () => {
  describe('normalizeVendorKey', () => {
    it('phải chuẩn hóa tên hãng về các key đồng nhất', () => {
      expect(normalizeVendorKey('Ricoh Japan')).toBe('ricoh');
      expect(normalizeVendorKey('Canon Inc.')).toBe('canon');
      expect(normalizeVendorKey('Hewlett-Packard')).toBe('hp');
      expect(normalizeVendorKey('HP Enterprise')).toBe('hp');
      expect(normalizeVendorKey('Epson Pro')).toBe('epson');
      expect(normalizeVendorKey('Brother')).toBe('brother');
      expect(normalizeVendorKey(null)).toBe('general');
    });
  });

  describe('normalizeRawCodeKey', () => {
    it('phải viết hoa và xóa khoảng trắng thừa của mã lỗi', () => {
      expect(normalizeRawCodeKey(' sc542 ')).toBe('SC542');
      expect(normalizeRawCodeKey('e000-0001')).toBe('E000-0001');
    });
  });

  describe('extractRawErrorCodeFromTrigger', () => {
    it('phải trích xuất chính xác mã lỗi Ricoh SC', () => {
      const trigger = 'Lỗi khối sấy nghiêm trọng: SC542-00 Fuser Warm-up Error';
      expect(extractRawErrorCodeFromTrigger(trigger)).toBe('SC542-00');
    });

    it('phải trích xuất chính xác mã lỗi Canon E-code', () => {
      const trigger = 'Canon iR-ADV: Báo lỗi E000-0001 quá nhiệt cụm sấy';
      expect(extractRawErrorCodeFromTrigger(trigger)).toBe('E000-0001');
    });

    it('phải trích xuất chính xác mã lỗi HP dạng số (50.1, 13.00.00)', () => {
      expect(extractRawErrorCodeFromTrigger('HP LaserJet: Error 50.1 Fuser Error')).toBe('50.1');
      expect(extractRawErrorCodeFromTrigger('Paper jam detected: 13.00.00 Jam in tray 2')).toBe('13.00.00');
    });

    it('phải dùng fallbackCode khi trong tên trigger không có mẫu regex', () => {
      const trigger = 'Thiết bị phát sinh sự cố không xác định';
      expect(extractRawErrorCodeFromTrigger(trigger, 'SC396')).toBe('SC396');
    });
  });

  describe('classifyWithDbDictionary', () => {
    it('phải đối chiếu mã lỗi có trong từ điển CSDL và trả về canonicalCode', () => {
      const dbEntries = [
        {
          vendor: 'Ricoh',
          rawCode: 'SC542',
          canonicalCode: 'FM-FUS-01',
          subsystem: 'Fuser',
          severity: 'critical',
          descriptionVi: 'Lỗi nhiệt độ sấy warm-up không đạt',
        },
      ];

      const result = classifyWithDbDictionary('Lỗi cụm sấy SC542', 'Ricoh', dbEntries);
      expect(result.canonicalCode).toBe('FM-FUS-01');
      expect(result.subsystem).toBe('Fuser');
      expect(result.isMapped).toBe(true);
      expect(result.needsMappingReview).toBe(false);
    });

    it('phải fallback về FM-UNK-01 khi mã lỗi chưa có trong từ điển CSV', () => {
      const dbEntries: any[] = [];
      const result = classifyWithDbDictionary('Lỗi lạ chưa từng thấy SC9999', 'Ricoh', dbEntries);

      expect(result.canonicalCode).toBe('FM-UNK-01');
      expect(result.isMapped).toBe(false);
      expect(result.needsMappingReview).toBe(true);
    });
  });
});

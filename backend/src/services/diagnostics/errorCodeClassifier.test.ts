/**
 * Backend/src/services/diagnostics/errorCodeClassifier.test.ts
 *
 * Kiểm thử Bộ phân loại mã lỗi đa hãng và cơ chế fallback FM-UNK-01 (TASK-BE-07):
 * - Đối chiếu chính xác mã lỗi đã có trong ErrorDictionary.
 * - Tự động trích xuất mã lỗi từ chuỗi tên Trigger Zabbix.
 * - Khi không có trong từ điển: gắn nhãn FM-UNK-01, needsMappingReview = true.
 * - Không tự ý bịa mã lỗi hoặc thêm trường cấm actionGuidance (Rule 6).
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import { describe, it, expect } from 'vitest';
import {
  classifyWithDbDictionary,
  extractRawErrorCodeFromTrigger,
  detectSubsystemFromTrigger,
  DbErrorDictEntry,
} from './errorCodeClassifier';

describe('ErrorCodeClassifier (TASK-BE-07)', () => {
  const mockDbDictionary: DbErrorDictEntry[] = [
    {
      vendor: 'Ricoh',
      rawCode: 'SC542',
      canonicalCode: 'FM-FUS-01',
      subsystem: 'Fuser',
      severity: 'critical',
      descriptionVi: 'Lỗi nhiệt độ sấy warm-up không đạt ngưỡng cài đặt',
    },
    {
      vendor: 'Canon',
      rawCode: 'E000-0001',
      canonicalCode: 'FM-FUS-02',
      subsystem: 'Fuser',
      severity: 'critical',
      descriptionVi: 'Quá nhiệt hoặc hở mạch điện trở sấy nhiệt',
    },
    {
      vendor: 'HP',
      rawCode: '13.00.00',
      canonicalCode: 'FM-FED-01',
      subsystem: 'Paper_Feed',
      severity: 'warning',
      descriptionVi: 'Kẹt giấy liên tục khay nạp 2 (Tray 2 Pick Roller)',
    },
  ];

  it('phải trích xuất chính xác mã lỗi từ chuỗi Zabbix Trigger', () => {
    expect(extractRawErrorCodeFromTrigger('Printer Error: SC542 Fuser warm-up failed', '')).toBe('SC542');
    expect(extractRawErrorCodeFromTrigger('Canon iR-ADV error E000-0001 detected', '')).toBe('E000-0001');
    expect(extractRawErrorCodeFromTrigger('Paper Jam error 13.00.00 in Tray 2', '')).toBe('13.00.00');
  });

  it('phải nhận diện đúng phân hệ (Subsystem) từ ngữ cảnh trigger', () => {
    expect(detectSubsystemFromTrigger('Fuser temperature error')).toBe('FUS');
    expect(detectSubsystemFromTrigger('Drum unit replace required')).toBe('DRM');
    expect(detectSubsystemFromTrigger('Paper feed roller jam')).toBe('FED');
    expect(detectSubsystemFromTrigger('Toner empty cartridge')).toBe('TNR');
    expect(detectSubsystemFromTrigger('Unknown device fault')).toBe('UNK');
  });

  it('phải ánh xạ chính xác mã chuẩn khi có trong ErrorDictionary', () => {
    const res = classifyWithDbDictionary(
      'SC542',
      'Ricoh',
      'Printer Ricoh Error SC542',
      4,
      mockDbDictionary
    );

    expect(res.isMapped).toBe(true);
    expect(res.needsMappingReview).toBe(false);
    expect(res.canonicalCode).toBe('FM-FUS-01');
    expect(res.severity).toBe('Critical');
    expect((res as any).actionGuidance).toBeUndefined(); // Tuân thủ tuyệt đối Rule 6
  });

  it('phải fallback về FM-UNK-01 khi mã lỗi chưa tích hợp CSV từ điển', () => {
    const res = classifyWithDbDictionary(
      'SC899',
      'Ricoh',
      'Printer Ricoh Error SC899 firmware crash',
      4,
      mockDbDictionary
    );

    expect(res.isMapped).toBe(false);
    expect(res.needsMappingReview).toBe(true);
    expect(res.canonicalCode).toBe('FM-UNK-01');
    expect(res.errorCode).toBe('SC899');
    expect((res as any).actionGuidance).toBeUndefined(); // Tuân thủ tuyệt đối Rule 6
  });
});

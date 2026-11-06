/**
 * Backend/src/services/diagnostics/__tests__/errorCodeClassifierDb.test.ts
 *
 * Unit tests kiểm chứng cơ chế trích xuất mã lỗi phần cứng từ Zabbix Trigger
 * và đối chiếu động với bảng `ErrorDictionary` từ CSV (bao gồm trạng thái sau khi gỡ CSV).
 */

import { describe, expect, it } from 'vitest';
import {
  classifyWithDbDictionary,
  extractRawErrorCodeFromTrigger,
  DbErrorDictEntry,
} from '../errorCodeClassifier';

describe('errorCodeClassifier — DB CSV Lifecycle & Auto-Compatibility', () => {
  it('trích xuất đúng mã lỗi phần cứng nguyên gốc từ tiêu đề Zabbix Trigger', () => {
    expect(extractRawErrorCodeFromTrigger('Ricoh Fuser Warm-up Error SC542', '5001')).toBe('SC542');
    expect(extractRawErrorCodeFromTrigger('Canon Fixing Error E000-0001', '5002')).toBe('E000-0001');
    expect(extractRawErrorCodeFromTrigger('HP Slow Fuser Error 50.2', '5003')).toBe('50.2');
    expect(extractRawErrorCodeFromTrigger('Controller Watchdog [SC899]', '5004')).toBe('SC899');
  });

  it('ánh xạ thành công khi mã lỗi tồn tại tương thích trong bộ CSV hiện hành', () => {
    const csvDict: DbErrorDictEntry[] = [
      {
        vendor: 'Ricoh',
        rawCode: 'SC899',
        canonicalCode: 'FM-CTL-01',
        subsystem: 'Controller',
        severity: 'critical',
        descriptionVi: 'Lỗi treo vi xử lý ASIC Controller Ricoh',
      },
    ];

    const res = classifyWithDbDictionary(
      '5004',
      'RICOH',
      'Controller Watchdog [SC899]',
      4,
      csvDict
    );
    expect(res.isMapped).toBe(true);
    expect(res.needsMappingReview).toBe(false);
    expect(res.errorCode).toBe('SC899');
    expect(res.canonicalCode).toBe('FM-CTL-01');
  });

  it('chuyển sang trạng thái chưa tích hợp (FM-UNK-01, needsMappingReview: true) khi bộ CSV đã gỡ khỏi CSDL', () => {
    const emptyDictAfterUnload: DbErrorDictEntry[] = [];

    const res = classifyWithDbDictionary(
      '5001',
      'Ricoh',
      'Ricoh Fuser Warm-up Error SC542',
      4,
      emptyDictAfterUnload
    );
    expect(res.isMapped).toBe(false);
    expect(res.needsMappingReview).toBe(true);
    expect(res.errorCode).toBe('SC542');
    expect(res.canonicalCode).toBe('FM-UNK-01');
  });
});


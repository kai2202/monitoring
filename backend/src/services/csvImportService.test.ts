/**
 * Backend/src/services/csvImportService.test.ts
 *
 * Kiểm thử đơn vị cho CsvImportService (TASK-BE-05):
 * - Kiểm tra phân tích cú pháp RFC 4180 (dấu phẩy, chấm phẩy, quotes, UTF-8 BOM \uFEFF).
 * - Kiểm tra bắt lỗi tệp CSV rỗng hoặc chỉ có dòng tiêu đề.
 * - Tuân thủ AGENTS.md Rule 4 & Rule 7.1 (< 300 LOC).
 */

import { describe, it, expect } from 'vitest';
import { CsvImportService } from './csvImportService';

describe('CsvImportService (RFC 4180 & CSV Parsing)', () => {
  const service = new CsvImportService();

  it('phải phân tích cú pháp CSV phân cách bằng dấu phẩy và xử lý UTF-8 BOM', () => {
    const rawCsv = '\uFEFFvendor,errorCode,subsystem,severity,description\nRicoh,SC542,Fuser,Critical,Lỗi nhiệt độ sấy warm-up\nCanon,E000,Fuser,Critical,Lỗi quá nhiệt';
    const rows = service.parseCsv(rawCsv);

    expect(rows).toHaveLength(3);
    expect(rows[0]).toEqual(['vendor', 'errorCode', 'subsystem', 'severity', 'description']);
    expect(rows[1]).toEqual(['Ricoh', 'SC542', 'Fuser', 'Critical', 'Lỗi nhiệt độ sấy warm-up']);
    expect(rows[2]).toEqual(['Canon', 'E000', 'Fuser', 'Critical', 'Lỗi quá nhiệt']);
  });

  it('phải phân tích cú pháp CSV phân cách bằng dấu chấm phẩy (;)', () => {
    const rawCsv = 'vendor;errorCode;subsystem;severity\nHP;50.1;Fuser;Critical\nEpson;000021;Carriage;Warning';
    const rows = service.parseCsv(rawCsv);

    expect(rows).toHaveLength(3);
    expect(rows[1]).toEqual(['HP', '50.1', 'Fuser', 'Critical']);
    expect(rows[2]).toEqual(['Epson', '000021', 'Carriage', 'Warning']);
  });

  it('phải xử lý chính xác giá trị nằm trong ngoặc kép chứa dấu phẩy hoặc escaped quotes', () => {
    const rawCsv = 'vendor,errorCode,description\nRicoh,SC542,"Lỗi khối sấy, nhiệt độ không đạt"\nCanon,E001,"Lỗi cảm biến ""Thermistor"" sấy"';
    const rows = service.parseCsv(rawCsv);

    expect(rows).toHaveLength(3);
    expect(rows[1][2]).toBe('Lỗi khối sấy, nhiệt độ không đạt');
    expect(rows[2][2]).toBe('Lỗi cảm biến "Thermistor" sấy');
  });

  it('phải trả về mảng rỗng [] khi chuỗi đầu vào rỗng hoặc chỉ chứa khoảng trắng', () => {
    expect(service.parseCsv('')).toEqual([]);
    expect(service.parseCsv('   \n  \n  ')).toEqual([]);
  });

  it('phải trả về kết quả FAILED khi file CSV chỉ có header hoặc rỗng', async () => {
    const result = await service.importErrorDictionary('test.csv', 'vendor,errorCode,subsystem');
    expect(result.status).toBe('FAILED');
    expect(result.totalRows).toBe(0);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0].message).toContain('File CSV không có dòng dữ liệu hợp lệ');
  });
});

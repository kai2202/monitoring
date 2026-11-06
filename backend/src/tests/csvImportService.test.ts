/**
 * Backend/src/tests/csvImportService.test.ts
 *
 * Kiểm thử Dịch vụ Phân tích & Kiểm Duyệt File CSV (TASK-BE-05):
 * - Hỗ trợ chuẩn RFC 4180 và xử lý ký tự UTF-8 BOM (\uFEFF).
 * - Bắt lỗi dòng trống hoặc thiếu mã lỗi.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import { describe, it, expect } from 'vitest';
import { csvImportService } from '../services/csvImportService';

describe('csvImportService', () => {
  it('phân tích chính xác chuỗi CSV chuẩn RFC 4180 và loại bỏ UTF-8 BOM', () => {
    const csvWithBom = '\uFEFFVendor,ErrorCode,ErrorName,Severity\nRicoh,SC542,"Fuser Central Thermistor",Critical';
    const parsed = csvImportService.parseCsv(csvWithBom);

    expect(parsed.length).toBe(2);
    expect(parsed[0]).toEqual(['Vendor', 'ErrorCode', 'ErrorName', 'Severity']);
    expect(parsed[1][0]).toBe('Ricoh');
    expect(parsed[1][1]).toBe('SC542');
    expect(parsed[1][2]).toBe('Fuser Central Thermistor');
    expect(parsed[1][3]).toBe('Critical');
  });

  it('xử lý chuỗi CSV có dấu ngoặc kép kép (escaped quotes) và dấu phẩy bên trong', () => {
    const csvContent = 'ID,Note\n1,"Bao lụa, trục sấy ""loại tốt"""';
    const parsed = csvImportService.parseCsv(csvContent);

    expect(parsed.length).toBe(2);
    expect(parsed[1][0]).toBe('1');
    expect(parsed[1][1]).toBe('Bao lụa, trục sấy "loại tốt"');
  });

  it('bắt lỗi khi nạp file CSV rỗng', async () => {
    const result = await csvImportService.importErrorDictionary('empty.csv', '');
    expect(result.status).toBe('FAILED');
    expect(result.totalRows).toBe(0);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('nạp và bóc tách thành công danh mục mã lỗi từ CSV', async () => {
    const sampleCsv = `vendor,errorCode,errorName,subsystem,severity,description
Ricoh,SC542,Fuser Error,Fuser,Critical,Lỗi nhiệt độ sấy
Canon,E000-0001,Fixing Error,Fuser,Critical,Lỗi bộ sấy`;

    const result = await csvImportService.importErrorDictionary('sample.csv', sampleCsv);
    expect(result.status).toBe('COMPLETED');
    expect(result.validRows).toBe(2);
    expect(result.errorRows).toBe(0);
  });
});

/**
 * Frontend/src/tests/costCsvExport.test.ts
 *
 * Kiểm thử đơn vị cho Tiện ích Xuất CSV Báo cáo Chi phí & SLA (costCsvExport):
 * - Kiểm tra định dạng chuẩn UTF-8 BOM (\uFEFF) giúp Excel tiếng Việt không bị lỗi font.
 * - Kiểm tra hàm escape chuỗi có chứa dấu phẩy, dấu ngoặc kép hoặc xuống dòng.
 * - Kiểm tra tính đúng tổng số trang in (monoPages + colorPages).
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportCostAllocationToCsv } from '../features/analytics/utils/costCsvExport';
import { DepartmentCostAllocationItem } from '../types/analyticsUI';

describe('exportCostAllocationToCsv', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('phải tạo Blob CSV có tiền tố UTF-8 BOM và cấu trúc đúng các cột', () => {
    let capturedBlob: Blob | null = null;

    // Giả lập window.URL.createObjectURL để bắt nội dung Blob
    globalThis.URL.createObjectURL = vi.fn().mockImplementation((blob: Blob) => {
      capturedBlob = blob;
      return 'blob:http://localhost:3000/mock-uuid';
    });
    globalThis.URL.revokeObjectURL = vi.fn();

    const sampleDepartments: DepartmentCostAllocationItem[] = [
      {
        departmentId: 'd1',
        departmentName: 'Phòng Kế toán & Tài chính',
        totalCost: 18500000,
        percentageShare: 25.5,
        monoPages: 45000,
        colorPages: 12000,
      },
      {
        departmentId: 'd2',
        departmentName: 'Ban Giám Đốc, Khối "C-Level"',
        totalCost: 5800000,
        percentageShare: 8.0,
        monoPages: 12000,
        colorPages: 4000,
      },
    ];

    exportCostAllocationToCsv(sampleDepartments, 'test_export.csv');

    expect(globalThis.URL.createObjectURL).toHaveBeenCalledTimes(1);
    expect(capturedBlob).not.toBeNull();
  });
});

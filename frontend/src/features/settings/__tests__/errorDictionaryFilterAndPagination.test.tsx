/**
 * Frontend/src/features/settings/__tests__/errorDictionaryFilterAndPagination.test.tsx
 *
 * Kiểm thử đơn vị & tích hợp cho tính năng tìm kiếm Debounce,
 * bộ lọc đa tiêu chí (AND/OR), phân trang động và Bento Empty State.
 * Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { MockErrorCode } from '@/mocks/mockSettings';
import {
  filterErrorDictionary,
  countActiveFilters,
  extractAvailableSubsystems,
} from '../utils/errorDictionaryFilterHelper';
import { ErrorDictionaryTable } from '../components/ErrorDictionaryTable';
import { ErrorDictionaryCard } from '../components/ErrorDictionaryCard';

const SAMPLE_ERRORS: MockErrorCode[] = [
  {
    id: 'err-1',
    vendor: 'Ricoh',
    errorCode: 'SC541',
    errorName: 'Lỗi cụm sấy: Đứt mạch cảm biến',
    affectedSubsystem: 'Fuser',
    severity: 'Critical',
    description: 'Nhiệt độ cụm sấy không tăng sau khi bật nung.',
  },
  {
    id: 'err-2',
    vendor: 'Ricoh',
    errorCode: 'SC101',
    errorName: 'Lỗi quang học: Đèn quét CCD',
    affectedSubsystem: 'Scanner_ADF',
    severity: 'Warning',
    description: 'Mức ánh sáng trắng chuẩn đọc không đạt yêu cầu.',
  },
  {
    id: 'err-3',
    vendor: 'Canon',
    errorCode: 'E000',
    errorName: 'Lỗi bộ nung cụm sấy Canon',
    affectedSubsystem: 'Fuser',
    severity: 'Critical',
    description: 'Thanh nhiệt gốm không đạt nhiệt độ khởi động.',
  },
  {
    id: 'err-4',
    vendor: 'HP',
    errorCode: '13.00',
    errorName: 'Kẹt giấy khay nạp giấy',
    affectedSubsystem: 'Paper_Feed',
    severity: 'Warning',
    description: 'Giấy không rời khỏi khay nạp đúng chu kỳ.',
  },
  {
    id: 'err-5',
    vendor: 'General',
    errorCode: 'GEN01',
    errorName: 'Cảnh báo nắp cửa mở',
    affectedSubsystem: 'General',
    severity: 'Info',
    description: 'Cửa bên hông chưa được đóng khớp hoàn toàn.',
  },
];

describe('errorDictionaryFilterHelper Unit Tests', () => {
  it('trả về toàn bộ bản ghi khi không có từ khóa và bộ lọc ở mức all', () => {
    const result = filterErrorDictionary(SAMPLE_ERRORS, '', 'all', 'all', 'all');
    expect(result).toHaveLength(SAMPLE_ERRORS.length);
  });

  it('xử lý chính xác logic tìm kiếm đa từ khóa tokenized AND giữa các từ', () => {
    // "Ricoh sấy" phải khớp SC541 nhưng loại bỏ SC101 (quang học) và E000 (Canon)
    const result = filterErrorDictionary(SAMPLE_ERRORS, 'Ricoh sấy', 'all', 'all', 'all');
    expect(result).toHaveLength(1);
    expect(result[0].errorCode).toBe('SC541');
  });

  it('tìm kiếm không phân biệt chữ hoa/thường trên các trường mã lỗi, tên, khối và mô tả', () => {
    const result = filterErrorDictionary(SAMPLE_ERRORS, 'sc541', 'all', 'all', 'all');
    expect(result).toHaveLength(1);
    expect(result[0].errorCode).toBe('SC541');
  });

  it('lọc kết hợp chặt chẽ theo Hãng (vendor) và Mức độ (severity)', () => {
    const ricohOnly = filterErrorDictionary(SAMPLE_ERRORS, '', 'Ricoh', 'all', 'all');
    expect(ricohOnly).toHaveLength(2);

    const ricohCritical = filterErrorDictionary(SAMPLE_ERRORS, '', 'Ricoh', 'Critical', 'all');
    expect(ricohCritical).toHaveLength(1);
    expect(ricohCritical[0].errorCode).toBe('SC541');
  });

  it('lọc theo khối linh kiện phần cứng (subsystem)', () => {
    const fuserList = filterErrorDictionary(SAMPLE_ERRORS, '', 'all', 'all', 'Fuser');
    expect(fuserList).toHaveLength(2); // SC541 (Ricoh) và E000 (Canon)
  });

  it('trả về danh sách rỗng khi không có bản ghi nào thỏa mãn điều kiện', () => {
    const none = filterErrorDictionary(SAMPLE_ERRORS, 'MaLoiKhongTonTai999', 'all', 'all', 'all');
    expect(none).toHaveLength(0);
  });

  it('đếm chính xác số lượng bộ lọc đang hoạt động', () => {
    expect(countActiveFilters('', 'all', 'all', 'all')).toBe(0);
    expect(countActiveFilters('SC541', 'all', 'all', 'all')).toBe(1);
    expect(countActiveFilters('SC541', 'Ricoh', 'Critical', 'Fuser')).toBe(4);
  });

  it('trích xuất danh sách duy nhất các khối linh kiện phần cứng', () => {
    const subs = extractAvailableSubsystems(SAMPLE_ERRORS);
    expect(subs).toContain('Fuser');
    expect(subs).toContain('Scanner_ADF');
    expect(subs).toContain('Paper_Feed');
    expect(subs).toContain('General');
    expect(subs.length).toBe(4);
  });
});

describe('ErrorDictionaryTable Component Tests', () => {
  it('hiển thị Bento Empty State khi không có kết quả khớp bộ lọc', () => {
    const handleReset = vi.fn();
    render(
      <ErrorDictionaryTable
        isLoading={false}
        paginatedErrors={[]}
        currentPage={1}
        totalPages={1}
        totalCount={0}
        pageSize={10}
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
        onResetFilters={handleReset}
        hasActiveFilters={true}
        searchQuery="SC999"
      />
    );

    expect(screen.getByText('Không tìm thấy mã lỗi phù hợp')).toBeDefined();
    expect(screen.getByText(/SC999/)).toBeDefined();

    const resetBtn = screen.getByText('Xóa bộ lọc và xem tất cả');
    expect(resetBtn).toBeDefined();
    fireEvent.click(resetBtn);
    expect(handleReset).toHaveBeenCalledTimes(1);
  });

  it('hiển thị đúng các bản ghi dữ liệu mã lỗi khi có kết quả', () => {
    render(
      <ErrorDictionaryTable
        isLoading={false}
        paginatedErrors={SAMPLE_ERRORS.slice(0, 2)}
        currentPage={1}
        totalPages={1}
        totalCount={2}
        pageSize={10}
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
        onResetFilters={vi.fn()}
        hasActiveFilters={false}
        searchQuery=""
      />
    );

    expect(screen.getByText('SC541')).toBeDefined();
    expect(screen.getByText('SC101')).toBeDefined();
    expect(screen.getByText(/Hiển thị/)).toBeDefined();
  });
});

describe('ErrorDictionaryCard Integration Tests', () => {
  it('tích hợp debounced search và nút đặt lại bộ lọc', async () => {
    render(<ErrorDictionaryCard errorDict={SAMPLE_ERRORS} isLoading={false} />);

    // Ô tìm kiếm có mặt trên DOM
    const searchInput = screen.getByPlaceholderText('Tìm theo mã lỗi, tên lỗi, khối linh kiện...');
    expect(searchInput).toBeDefined();

    // Nhập từ khóa tìm kiếm
    fireEvent.change(searchInput, { target: { value: 'Canon' } });

    // Sau thời gian debounce (250ms), kiểm tra kết quả lọc
    await waitFor(
      () => {
        expect(screen.getByText('E000')).toBeDefined();
        expect(screen.queryByText('SC541')).toBeNull();
      },
      { timeout: 1000 }
    );

    // Nút đặt lại hiển thị số lượng bộ lọc đang kích hoạt
    const resetFilterBtn = screen.getByTitle('Đặt lại toàn bộ tiêu chí tìm kiếm & lọc');
    expect(resetFilterBtn).toBeDefined();
    fireEvent.click(resetFilterBtn);

    // Sau khi đặt lại, các bản ghi Ricoh hiển thị trở lại
    await waitFor(() => {
      expect(screen.getByText('SC541')).toBeDefined();
    });
  });
});


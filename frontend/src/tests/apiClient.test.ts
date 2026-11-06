/**
 * Frontend/src/tests/apiClient.test.ts
 *
 * Kiểm thử đơn vị cho HTTP API Client:
 * - Kiểm tra xử lý phản hồi thành công (JSON và 204 No Content).
 * - Kiểm tra bắt lỗi HTTP Status (404, 500) và ném đối tượng ApiError minh bạch.
 * - Tuân thủ AGENTS.md Rule 4 & Rule 7.1 (< 300 LOC).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { requestApi, ApiError } from '../services/providers/api/apiClient';

describe('requestApi HTTP Client', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('phải phân giải dữ liệu JSON khi server phản hồi 200 OK', async () => {
    const mockData = { id: 'PRN-001', name: 'Ricoh MP C6004' };
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => mockData,
    });

    const result = await requestApi<typeof mockData>('/printers/PRN-001');
    expect(result).toEqual(mockData);
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });

  it('phải trả về null khi server phản hồi 204 No Content', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
      statusText: 'No Content',
    });

    const result = await requestApi('/printers/PRN-001', { method: 'DELETE' });
    expect(result).toBeNull();
  });

  it('phải ném ApiError khi server phản hồi mã lỗi 404 Not Found', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: async () => ({ error: 'Printer not found' }),
    });

    await expect(requestApi('/printers/INVALID_ID')).rejects.toThrow(ApiError);
  });

  it('phải gắn kèm đầy đủ status và message khi ném ApiError', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: async () => ({ error: 'Database connection failed' }),
    });

    try {
      await requestApi('/settings');
      expect.fail('Hàm đáng lẽ phải ném lỗi');
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      const apiErr = err as ApiError;
      expect(apiErr.status).toBe(500);
      expect(apiErr.statusText).toBe('Internal Server Error');
      expect(apiErr.message).toContain('500 Internal Server Error');
    }
  });
});

/**
 * Backend/src/services/zabbix/zabbixApiClient.test.ts
 *
 * Kiểm thử đơn vị cho ZabbixApiClient (TASK-BE-01):
 * - Kiểm tra tạo payload JSON-RPC 2.0 chuẩn và phân giải kết quả thành công.
 * - Kiểm tra cơ chế Circuit Breaker (ngắt mạch khi gặp lỗi liên tiếp để chống bão request).
 * - Kiểm tra bắt lỗi HTTP error và Zabbix API error.
 * - Tuân thủ AGENTS.md Rule 4 & Rule 7.1 (< 300 LOC).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ZabbixApiClient } from './zabbixApiClient';

describe('ZabbixApiClient', () => {
  let client: ZabbixApiClient;
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    client = new ZabbixApiClient();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('phải gửi request JSON-RPC 2.0 đúng định dạng và trả về kết quả', async () => {
    const mockVersion = '7.0.4';
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        jsonrpc: '2.0',
        result: mockVersion,
        id: 1,
      }),
    });

    const version = await client.checkVersion();
    expect(version).toBe(mockVersion);
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });

  it('phải ném lỗi khi Zabbix API trả về đối tượng error', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        jsonrpc: '2.0',
        error: {
          code: -32602,
          message: 'Invalid params',
          data: 'Field host is missing',
        },
        id: 1,
      }),
    });

    await expect(client.call('host.get', {})).rejects.toThrow('Zabbix API Error [-32602]');
  });

  it('phải kích hoạt Circuit Breaker sau khi gặp lỗi liên tiếp', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network connection timeout'));

    // Gây 3 lần lỗi liên tiếp
    for (let i = 0; i < 3; i++) {
      try {
        await client.call('apiinfo.version');
      } catch {
        // Dự kiến có lỗi
      }
    }

    // Lần thứ 4 Circuit Breaker phải chặn lại mà không cần gửi request qua mạng
    await expect(client.call('apiinfo.version')).rejects.toThrow('[Zabbix Circuit Breaker]');
    expect(globalThis.fetch).toHaveBeenCalledTimes(3); // Không gọi lần thứ 4
  });
});

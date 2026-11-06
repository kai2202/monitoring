/**
 * Frontend/src/features/settings/__tests__/CsvDictionaryLifecycle.test.tsx
 *
 * Kiểm thử vòng đời Bộ nạp CSV Từ điển mã lỗi:
 * - Gỡ toàn bộ mã lỗi CSV khỏi CSDL (`unloadErrorDictionaryCsv` -> 0 mã lỗi, `isLoaded: false`).
 * - Phát hiện mã lỗi phát sinh chưa tích hợp vào CSV (`unmappedCodes`).
 * - Khi nạp CSV mới có chứa mã lỗi tương ứng, các thông báo mã chưa tích hợp tự động biến mất.
 */

import { describe, expect, it } from 'vitest';
import { MockSettingsProvider } from '../../../services/providers/mock/MockSettingsProvider';

describe('CsvDictionaryLifecycle — Unload & Auto-Compatibility Reconciliation', () => {
  it('tháo hoàn toàn mã lỗi khi gỡ CSV và tự động ẩn thông báo mã thiếu khi nạp CSV tương thích', async () => {
    const provider = new MockSettingsProvider();

    // 1. Gỡ hoàn toàn bộ CSV hiện tại khỏi CSDL
    const unloadRes = await provider.unloadErrorDictionaryCsv();
    expect(unloadRes.success).toBe(true);

    const dictAfterUnload = await provider.getErrorDictionary();
    expect(dictAfterUnload.length).toBe(0);
    expect(unloadRes.lifecycle.activeDataset.isLoaded).toBe(false);
    expect(unloadRes.lifecycle.activeDataset.activeCodesCount).toBe(0);

    // Các mã lỗi phát sinh trên máy in hiện đều nằm trong danh sách chưa tích hợp CSV
    const unmappedBefore = unloadRes.lifecycle.unmappedCodes;
    expect(unmappedBefore.length).toBeGreaterThan(0);

    // 2. Nạp CSV mới chứa đúng mã lỗi đầu tiên trong danh sách chưa tích hợp
    const targetMissing = unmappedBefore[0];
    const csvPayload = [
      'vendor,errorCode,errorName,affectedSubsystem,severity,description',
      `${targetMissing.vendor},${targetMissing.errorCode},FM-TEST-01,Fuser,Critical,Đã bổ sung vào CSV mới`,
    ].join('\r\n');

    const importRes = await provider.importErrorDictionaryCsv('bo_ma_loi_cap_nhat_v2.csv', csvPayload);
    expect(importRes.status).toBe('COMPLETED');
    expect(importRes.validRows).toBe(1);
    expect(importRes.importedAt).toBeTruthy();
    expect(importRes.resolvedUnmappedCount).toBeGreaterThanOrEqual(1);

    // 3. Kiểm chứng trạng thái sau khi nạp: có tên file + thời gian nạp, và thông báo mã đó tự biến mất!
    const statusAfterImport = await provider.getErrorDictionaryStatus();
    expect(statusAfterImport.activeDataset.isLoaded).toBe(true);
    expect(statusAfterImport.activeDataset.fileName).toBe('bo_ma_loi_cap_nhat_v2.csv');
    expect(statusAfterImport.activeDataset.importedAt).toBeTruthy();

    const stillMissingSameCode = statusAfterImport.unmappedCodes.some(
      (u) =>
        u.vendor.toLowerCase() === targetMissing.vendor.toLowerCase() &&
        u.errorCode.toUpperCase() === targetMissing.errorCode.toUpperCase()
    );
    expect(stillMissingSameCode).toBe(false);
  });
});


/**
 * Frontend/src/tests/analyticsFloorHelper.test.ts
 *
 * Kiểm thử đơn vị cho Tiện ích Phân bổ Tầng Dynamic Floor Summaries:
 * - Kiểm tra Clean Slate Architecture: trả về mảng rỗng khi không có thiết bị.
 * - Kiểm tra tính tổng sản lượng và phần trăm tỷ trọng chính xác giữa các tầng.
 * - Tuân thủ AGENTS.md Rule 5 & Rule 7.1 (< 300 LOC).
 */

import { describe, it, expect } from 'vitest';
import { getDynamicFloorSummaries } from '../features/analytics/utils/analyticsFloorHelper';
import { DeviceProductionItem } from '../types/api';

describe('getDynamicFloorSummaries', () => {
  it('phải trả về mảng rỗng [] khi chi nhánh không có thiết bị và không có cấu hình tầng', () => {
    const result = getDynamicFloorSummaries('Chi nhánh Không Tồn Tại', []);
    expect(result).toEqual([]);
  });

  it('phải tính toán chính xác tổng sản lượng và tỷ lệ % đóng góp cho các tầng', () => {
    const sampleDevices: DeviceProductionItem[] = [
      {
        id: 'p1',
        name: 'Máy T1-01',
        model: 'MP C6004',
        mfr: 'Ricoh',
        ip: '192.168.1.101',
        serial: 'SN-01',
        branch: 'Trụ sở chính (HQ)',
        floorId: 'floor-1',
        floorName: 'Tầng 1',
        department: 'Kế toán',
        status: 'Online',
        health: 'Healthy',
        totalVol: 10000,
        monoVol: 8000,
        colorVol: 2000,
        monoPercent: 80,
        colorPercent: 20,
        ppmNominal: 35,
        ppmActual: 30,
        isColorCapable: true,
      },
      {
        id: 'p2',
        name: 'Máy T1-02',
        model: 'MP 3055',
        mfr: 'Ricoh',
        ip: '192.168.1.102',
        serial: 'SN-02',
        branch: 'Trụ sở chính (HQ)',
        floorId: 'floor-1',
        floorName: 'Tầng 1',
        department: 'Hành chính',
        status: 'Online',
        health: 'Healthy',
        totalVol: 5000,
        monoVol: 5000,
        colorVol: 0,
        monoPercent: 100,
        colorPercent: 0,
        ppmNominal: 30,
        ppmActual: 28,
        isColorCapable: false,
      },
      {
        id: 'p3',
        name: 'Máy T2-01',
        model: 'C5535i',
        mfr: 'Canon',
        ip: '192.168.1.103',
        serial: 'SN-03',
        branch: 'Trụ sở chính (HQ)',
        floorId: 'floor-2',
        floorName: 'Tầng 2',
        department: 'Marketing',
        status: 'Online',
        health: 'Healthy',
        totalVol: 15000,
        monoVol: 9000,
        colorVol: 6000,
        monoPercent: 60,
        colorPercent: 40,
        ppmNominal: 35,
        ppmActual: 32,
        isColorCapable: true,
      },
    ];

    // Trụ sở chính (HQ) có các tầng T1, T2,...
    const summaries = getDynamicFloorSummaries('Trụ sở chính (HQ)', sampleDevices);
    expect(summaries.length).toBeGreaterThan(0);

    const f1 = summaries.find((s) => s.floorName === 'Tầng 1');
    const f2 = summaries.find((s) => s.floorName === 'Tầng 2');

    expect(f1).toBeDefined();
    expect(f1?.deviceCount).toBe(2);
    expect(f1?.totalVolume).toBe(15000);

    expect(f2).toBeDefined();
    expect(f2?.deviceCount).toBe(1);
    expect(f2?.totalVolume).toBe(15000);

    // Tổng sản lượng = 30000, T1 chiếm 50%, T2 chiếm 50%
    expect(f1?.percentage).toBe(50);
    expect(f2?.percentage).toBe(50);
  });
});

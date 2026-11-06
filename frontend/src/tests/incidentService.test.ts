/**
 * Frontend/src/tests/incidentService.test.ts
 *
 * Kiểm thử Service Layer của Phân hệ Sự Cố & Tái sử dụng Tri thức Lịch sử:
 * - Tuân thủ AGENTS.md Rule 5 & Rule 7.1 (< 300 LOC).
 */

import { describe, it, expect } from 'vitest';
import { createIncidentService } from '../services/incidentService';

describe('incidentService (Mock Provider)', () => {
  const service = createIncidentService('mock');

  it('lấy danh sách sự cố thành công', async () => {
    const incidents = await service.getIncidents();
    expect(Array.isArray(incidents)).toBe(true);
    expect(incidents.length).toBeGreaterThan(0);
  });

  it('tra cứu tri thức lịch sử sửa chữa với mã lỗi SC542', async () => {
    if (!service.getKnowledgeReuse) {
      throw new Error('getKnowledgeReuse chưa được triển khai');
    }

    const rec = await service.getKnowledgeReuse('SC542', 'Ricoh MP C6004');
    expect(rec.errorCode).toBe('SC542');
    expect(rec.historicalSuccessCount).toBeGreaterThanOrEqual(1);
    expect(rec.recommendedSopSteps.length).toBeGreaterThan(0);
    expect(rec.suggestedParts.length).toBeGreaterThan(0);
  });
});

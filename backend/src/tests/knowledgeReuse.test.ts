/**
 * Backend/src/tests/knowledgeReuse.test.ts
 *
 * Kiểm thử Động cơ Tái sử dụng Tri thức Lịch sử (Knowledge Reuse Engine):
 * - Tra cứu mã lỗi Ricoh SC542, Canon E000-0001, HP 13.00.00.
 * - Kiểm tra cơ chế Fallback an toàn cho mã lỗi chưa từng gặp FM-UNK-01.
 * - Tuân thủ AGENTS.md Rule 6 & Rule 7.1 (< 300 LOC).
 */

import { describe, it, expect } from 'vitest';
import { knowledgeReuseService } from '../services/knowledgeReuseService';

describe('knowledgeReuseService - getRecommendation', () => {
  it('đề xuất chính xác quy trình SOP và linh kiện cho lỗi Ricoh SC542', async () => {
    const rec = await knowledgeReuseService.getRecommendation('SC542', 'Ricoh MP C6004');
    expect(rec.errorCode).toBe('SC542');
    expect(rec.historicalSuccessCount).toBeGreaterThanOrEqual(1);
    expect(rec.recommendedSopSteps.length).toBeGreaterThanOrEqual(4);
    expect(rec.suggestedParts.some((p) => p.partCode === 'D242-4001')).toBe(true);
    expect(rec.suggestedParts.some((p) => p.partCode === 'G-GREASE-50G')).toBe(true);
  });

  it('đề xuất chính xác linh kiện cho lỗi sấy Canon E000-0001', async () => {
    const rec = await knowledgeReuseService.getRecommendation('E000-0001', 'Canon IR 2630i');
    expect(rec.errorCode).toBe('E000-0001');
    expect(rec.suggestedParts.some((p) => p.partName.includes('Ceramic Heater'))).toBe(true);
    expect(rec.recommendedSopSteps.some((s) => s.includes('Service Mode'))).toBe(true);
  });

  it('đề xuất chính xác linh kiện kéo giấy cho lỗi kẹt giấy HP 13.00.00', async () => {
    const rec = await knowledgeReuseService.getRecommendation('13.00.00', 'HP LaserJet M608');
    expect(rec.errorCode).toBe('13.00.00');
    expect(rec.suggestedParts.some((p) => p.partCode === 'RM2-6800')).toBe(true);
  });

  it('cung cấp hướng dẫn fallback an toàn khi gặp mã lỗi chưa từng có trong từ điển', async () => {
    const rec = await knowledgeReuseService.getRecommendation('UNKNOWN_ERR_9999', 'Model X');
    expect(rec.recommendedSopSteps.length).toBeGreaterThan(0);
    expect(rec.historicalSuccessCount).toBe(1);
  });
});

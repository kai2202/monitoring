/**
 * Frontend/src/services/providers/mock/MockIncidentProvider.ts
 *
 * Triển khai IIncidentService quản lý sự cố và triage trong bộ nhớ.
 * Tuyệt đối không chứa trường actionGuidance.
 */

import { IIncidentService, TriageIncidentDto, KnowledgeReuseRecommendation } from '../../interfaces/IIncidentService';
import { Incident } from '../../../types/printer';
import { mockIncidents } from '../../../mocks';

export class MockIncidentProvider implements IIncidentService {
  private incidents: Incident[] = [...mockIncidents];

  async getIncidents(): Promise<Incident[]> {
    await new Promise(r => setTimeout(r, 40));
    return [...this.incidents];
  }

  async getIncidentById(id: string): Promise<Incident | null> {
    await new Promise(r => setTimeout(r, 20));
    const found = this.incidents.find(inc => inc.id === id);
    return found ? { ...found } : null;
  }

  async triageIncident(id: string, dto: TriageIncidentDto): Promise<Incident> {
    await new Promise(r => setTimeout(r, 60));
    const idx = this.incidents.findIndex(inc => inc.id === id);
    if (idx === -1) {
      throw new Error(`Không tìm thấy sự cố có mã ${id}`);
    }

    const current = this.incidents[idx];
    const now = new Date().toISOString();

    const noteText = dto.pendingReason
      ? `${dto.note} (Lý do chờ: ${dto.pendingReason}${dto.contingencyPlan ? ` | Dự phòng: ${dto.contingencyPlan}` : ''}${dto.nextCheckDate ? ` | Ngày kiểm tra: ${dto.nextCheckDate}` : ''})`
      : dto.note;

    const updatedHistory = [
      ...(current.statusHistory || []),
      {
        time: now,
        status: dto.status,
        note: noteText,
      },
    ];

    const updated: Incident = {
      ...current,
      status: dto.status,
      lifecycle: dto.lifecycle,
      statusHistory: updatedHistory,
    };

    this.incidents[idx] = updated;
    return { ...updated };
  }

  async updateIncidentStatus(id: string, status: 'Active' | 'Resolved', note: string): Promise<Incident> {
    await new Promise(r => setTimeout(r, 50));
    const idx = this.incidents.findIndex(inc => inc.id === id);
    if (idx === -1) {
      throw new Error(`Không tìm thấy sự cố có mã ${id}`);
    }

    const current = this.incidents[idx];
    const now = new Date().toISOString();

    const updatedHistory = [
      ...(current.statusHistory || []),
      {
        time: now,
        status,
        note,
      },
    ];

    const updated: Incident = {
      ...current,
      status,
      lifecycle: status === 'Resolved' ? 'Resolved (Đã xử lý & nghiệm thu)' : current.lifecycle,
      statusHistory: updatedHistory,
    };

    this.incidents[idx] = updated;
    return { ...updated };
  }

  async getKnowledgeReuse(errorCode: string, model: string = 'General'): Promise<KnowledgeReuseRecommendation> {
    await new Promise(r => setTimeout(r, 30));
    return {
      errorCode,
      model,
      historicalSuccessCount: 14,
      averageResolutionMinutes: 75,
      recommendedSopSteps: [
        'Ngắt nguồn máy in, chờ cụm sấy hoặc linh kiện nguội an toàn',
        'Tháo nắp bảo vệ và kiểm tra giắc cắm cảm biến / cáp tín hiệu',
        'Vệ sinh muội mực, tra mỡ nhiệt bôi trơn chuyên dụng',
        'Vào chế độ bảo trì xóa mã lỗi tạm thời và in test 10 trang nghiệm thu',
      ],
      suggestedParts: [
        { partName: 'Cụm sấy Fuser Unit chính hãng', partCode: 'D242-4001', quantity: 1, unitCostVnd: 4500000 },
        { partName: 'Mỡ nhiệt bôi trơn cao cấp', partCode: 'G-GREASE-50G', quantity: 1, unitCostVnd: 150000 },
      ],
      lastResolvedWorkLog: {
        id: 'WL-2026-001',
        technicianName: 'Lê Hoàng Nam',
        workPerformed: 'Thay thế cụm bao lụa sấy Fuser Assembly và vệ sinh trục sấy nhiệt.',
        testPrintResult: 'PASSED',
        notes: 'Bản in test 10 trang đạt chuẩn PASSED, nhiệt độ ổn định 185°C.',
      },
    };
  }
}


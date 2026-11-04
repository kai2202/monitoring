/**
 * Frontend/src/services/providers/mock/MockIncidentProvider.ts
 *
 * Triển khai IIncidentService quản lý sự cố và triage trong bộ nhớ.
 * Tuyệt đối không chứa trường actionGuidance.
 */

import { IIncidentService, TriageIncidentDto } from '../../interfaces/IIncidentService';
import { Incident } from '../../../types/printer';
import { mockIncidents } from '../../../mocks/mockIncidents';

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
}


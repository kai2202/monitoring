/**
 * Frontend/src/services/providers/api/ApiIncidentProvider.ts
 *
 * Triển khai IIncidentService thông qua REST API Backend.
 * Tuyệt đối không chứa trường actionGuidance.
 */

import { IIncidentService, TriageIncidentDto, KnowledgeReuseRecommendation } from '../../interfaces/IIncidentService';
import { Incident } from '../../../types/printer';
import { requestApi } from './apiClient';

export class ApiIncidentProvider implements IIncidentService {
  async getIncidents(): Promise<Incident[]> {
    return requestApi<Incident[]>('/incidents');
  }

  async getIncidentById(id: string): Promise<Incident | null> {
    try {
      return await requestApi<Incident>(`/incidents/${id}`);
    } catch (err: unknown) {
      if ((err as any)?.status === 404 || (err instanceof Error && err.message.includes('404'))) {
        return null;
      }
      throw err;
    }
  }

  async triageIncident(id: string, dto: TriageIncidentDto): Promise<Incident> {
    const res = await requestApi<any>(`/incidents/${id}/triage`, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
    return (res?.incident ?? res) as Incident;
  }

  async updateIncidentStatus(id: string, status: 'Active' | 'Resolved', note: string): Promise<Incident> {
    const res = await requestApi<any>(`/incidents/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, resolutionNote: note, note }),
    });
    return (res?.incident ?? res) as Incident;
  }

  async getKnowledgeReuse(errorCode: string, model: string = 'General'): Promise<KnowledgeReuseRecommendation> {
    return requestApi<KnowledgeReuseRecommendation>(
      `/incidents/knowledge-reuse?errorCode=${encodeURIComponent(errorCode)}&model=${encodeURIComponent(model)}`
    );
  }
}


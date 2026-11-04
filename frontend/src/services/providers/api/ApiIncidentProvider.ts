/**
 * Frontend/src/services/providers/api/ApiIncidentProvider.ts
 *
 * Triển khai IIncidentService thông qua REST API Backend.
 * Tuyệt đối không chứa trường actionGuidance.
 */

import { IIncidentService, TriageIncidentDto } from '../../interfaces/IIncidentService';
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
      if (err instanceof Error && err.message.includes('404')) {
        return null;
      }
      throw err;
    }
  }

  async triageIncident(id: string, dto: TriageIncidentDto): Promise<Incident> {
    return requestApi<Incident>(`/incidents/${id}/triage`, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  async updateIncidentStatus(id: string, status: 'Active' | 'Resolved', note: string): Promise<Incident> {
    return requestApi<Incident>(`/incidents/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, note }),
    });
  }
}


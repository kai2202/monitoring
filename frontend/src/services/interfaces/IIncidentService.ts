/**
 * Frontend/src/services/interfaces/IIncidentService.ts
 *
 * Hợp đồng Service Layer cho Quản lý Hàng đợi sự cố & Triage.
 */

import { Incident } from '../../types/printer';

export interface TriageIncidentDto {
  status: 'Active' | 'Resolved';
  lifecycle: string;
  note: string;
  pendingReason?: string;
  contingencyPlan?: string;
  nextCheckDate?: string;
}

export interface IIncidentService {
  getIncidents(): Promise<Incident[]>;
  getIncidentById(id: string): Promise<Incident | null>;
  triageIncident(id: string, dto: TriageIncidentDto): Promise<Incident>;
  updateIncidentStatus(id: string, status: 'Active' | 'Resolved', note: string): Promise<Incident>;
}


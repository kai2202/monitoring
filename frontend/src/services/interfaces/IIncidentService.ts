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

export interface KnowledgeReuseRecommendation {
  errorCode: string;
  model: string;
  historicalSuccessCount: number;
  averageResolutionMinutes: number;
  recommendedSopSteps: string[];
  suggestedParts: Array<{
    partName: string;
    partCode: string;
    quantity: number;
    unitCostVnd: number | null;
  }>;
  lastResolvedWorkLog?: {
    id: string;
    technicianName: string;
    workPerformed: string;
    testPrintResult: string;
    notes?: string;
  };
}

export interface IIncidentService {
  getIncidents(): Promise<Incident[]>;
  getIncidentById(id: string): Promise<Incident | null>;
  triageIncident(id: string, dto: TriageIncidentDto): Promise<Incident>;
  updateIncidentStatus(id: string, status: 'Active' | 'Resolved', note: string): Promise<Incident>;
  getKnowledgeReuse?(errorCode: string, model?: string): Promise<KnowledgeReuseRecommendation>;
}


/**
 * Backend/src/controllers/incidents/incidentController.ts
 *
 * Controller xử lý REST API cho Sự Cố Kỹ Thuật Máy In (Incidents API):
 * - Tích hợp 100% Prisma ORM kết nối bảng Incident, Printer và AuditLog.
 * - Tuân thủ AGENTS.md Rule 6 (Hardware Errors & Incidents) & Rule 8 (< 300 LOC).
 */

import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { knowledgeReuseService } from '../../services/incidents/knowledgeReuseService';

export class IncidentController {
  // GET /api/v1/incidents
  async getIncidents(req: Request, res: Response) {
    try {
      const { severity, status, printerId, subsystem, timeframe } = req.query;
      const whereClause: any = {};

      if (severity && severity !== 'all') {
        whereClause.severity = { equals: String(severity).toLowerCase() };
      }
      if (status && status !== 'all') {
        whereClause.status = { equals: String(status).toUpperCase() };
      }
      if (printerId && printerId !== 'all') {
        whereClause.printerId = { equals: String(printerId) };
      }
      if (subsystem && subsystem !== 'all') {
        whereClause.subsystem = { contains: String(subsystem), mode: 'insensitive' };
      }
      if (timeframe) {
        const now = new Date();
        let past = new Date();
        if (timeframe === '24h') past.setHours(past.getHours() - 24);
        else if (timeframe === '7d') past.setDate(past.getDate() - 7);
        else if (timeframe === '30d') past.setDate(past.getDate() - 30);
        whereClause.detectedAt = { gte: past, lte: now };
      }

      const dbIncidents = await prisma.incident.findMany({
        where: whereClause,
        include: { printer: true, tasks: true },
        orderBy: { detectedAt: 'desc' },
      });

      const mapped = dbIncidents.map((i) => ({
        id: i.id,
        printerId: i.printerId,
        printerName: i.printer?.name || i.printerId,
        errorCode: i.errorCode || 'UNKNOWN',
        canonicalCode: i.canonicalCode,
        errorDescription: i.description || i.title,
        severity: (i.severity.toLowerCase() === 'critical' ? 'Critical' : 'Warning') as 'Critical' | 'Warning',
        subsystem: i.subsystem || 'Chung',
        status: (i.status.toUpperCase() === 'RESOLVED' ? 'Resolved' : 'Active') as 'Active' | 'Resolved',
        detectedAt: i.detectedAt.toISOString(),
        resolvedAt: i.resolvedAt ? i.resolvedAt.toISOString() : null,
        triageStatus: i.status === 'RESOLVED' ? 'Resolved' : i.tasks.length > 0 ? 'Triaged' : 'Pending',
        tasksCount: i.tasks.length,
      }));

      return res.status(200).json(mapped);
    } catch (err: any) {
      console.error('[IncidentController.getIncidents] Lỗi truy vấn:', err);
      return res.status(500).json({ error: 'Không thể lấy danh sách sự cố', message: err.message });
    }
  }

  // GET /api/v1/incidents/:id
  async getIncidentById(req: Request, res: Response) {
    try {
      const found = await prisma.incident.findUnique({
        where: { id: req.params.id },
        include: { printer: true, tasks: { include: { workLogs: true, attachments: true } } },
      });

      if (!found) {
        return res.status(404).json({ error: 'Không tìm thấy sự cố với mã chỉ định' });
      }

      return res.status(200).json({
        id: found.id,
        printerId: found.printerId,
        printerName: found.printer?.name || found.printerId,
        errorCode: found.errorCode || 'UNKNOWN',
        canonicalCode: found.canonicalCode,
        errorDescription: found.description || found.title,
        severity: found.severity,
        subsystem: found.subsystem || 'Chung',
        status: found.status,
        detectedAt: found.detectedAt.toISOString(),
        resolvedAt: found.resolvedAt ? found.resolvedAt.toISOString() : null,
        printer: found.printer,
        tasks: found.tasks,
      });
    } catch (err: any) {
      console.error('[IncidentController.getIncidentById] Lỗi truy vấn:', err);
      return res.status(500).json({ error: 'Không thể lấy chi tiết sự cố', message: err.message });
    }
  }

  // POST /api/v1/incidents/:id/resolve
  async resolveIncident(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { resolutionNote } = req.body;

      const incident = await prisma.incident.findUnique({ where: { id } });
      if (!incident) {
        return res.status(404).json({ error: 'Không tìm thấy sự cố' });
      }

      const updated = await prisma.incident.update({
        where: { id },
        data: {
          status: 'RESOLVED',
          resolvedAt: new Date(),
          description: resolutionNote ? `${incident.description || ''} | Xử lý: ${resolutionNote}` : incident.description,
        },
      });

      const remainingIncidents = await prisma.incident.count({
        where: { printerId: incident.printerId, status: { not: 'RESOLVED' } },
      });

      if (remainingIncidents === 0) {
        await prisma.printer.update({
          where: { id: incident.printerId },
          data: { health: 'Healthy', alertSeverity: 'info' },
        });
      }

      await prisma.auditLog.create({
        data: {
          userId: req.user?.userId || null,
          action: 'TASK_UPDATE',
          targetId: incident.id,
          ipAddress: req.ip,
          diffJson: { action: 'RESOLVE_INCIDENT', note: resolutionNote || null },
        },
      });

      return res.status(200).json({ success: true, incident: updated });
    } catch (err: any) {
      console.error('[IncidentController.resolveIncident] Lỗi đóng sự cố:', err);
      return res.status(500).json({ error: 'Không thể đóng sự cố', message: err.message });
    }
  }

  // POST /api/v1/incidents/:id/triage
  async triageIncident(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { triageStatus, notes } = req.body;

      const updated = await prisma.incident.update({
        where: { id },
        data: {
          status: triageStatus === 'Resolved' ? 'RESOLVED' : 'IN_PROGRESS',
          description: notes ? `${notes}` : undefined,
          resolvedAt: triageStatus === 'Resolved' ? new Date() : undefined,
        },
      });

      return res.status(200).json({ success: true, incident: updated });
    } catch (err: any) {
      console.error('[IncidentController.triageIncident] Lỗi phân loại sự cố:', err);
      return res.status(500).json({ error: 'Không thể phân loại sự cố', message: err.message });
    }
  }

  // GET /api/v1/incidents/knowledge-reuse
  async getKnowledgeReuse(req: Request, res: Response) {
    try {
      const errorCode = (req.query.errorCode as string) || 'SC542';
      const model = (req.query.model as string) || 'Ricoh MP C6004';
      const recommendation = await knowledgeReuseService.getRecommendation(errorCode, model);
      return res.status(200).json(recommendation);
    } catch (err: any) {
      console.error('[IncidentController.getKnowledgeReuse] Lỗi tra cứu kinh nghiệm:', err);
      return res.status(500).json({ error: 'Không thể tra cứu kinh nghiệm xử lý', message: err.message });
    }
  }
}

export const incidentController = new IncidentController();


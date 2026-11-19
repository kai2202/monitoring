/**
 * Backend/src/controllers/auth/settingsController.ts
 *
 * Controller xử lý REST API cho Cấu Hình Hệ Thống, Zabbix Live Ping & Từ Điển Mã Lỗi:
 * - Tích hợp 100% Prisma ORM (`Printer`, `ErrorDictionary`, `CsvImportJob`, `AuditLog`).
 * - Quản lý vòng đời bộ CSV Từ điển mã lỗi (Nạp, xem thời gian nạp, gỡ toàn bộ, đối chiếu mã chưa tích hợp).
 * - Tuân thủ AGENTS.md Rule 5 (MetricValue = number | null) & Rule 8 (< 300 LOC).
 */

import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { zabbixApiClient } from '../../services/zabbix/zabbixApiClient';
import { csvImportService } from '../../services/auth/csvImportService';
import { errorDictLifecycleService } from '../../services/auth/errorDictLifecycleService';
import { applyRuntimeRulesPatch, loadActiveRuntimeRules } from '../../services/auth/runtimeSettingsStore';

function maskZabbixEndpoint(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl);
    return `${parsed.protocol}//${parsed.hostname}${parsed.port ? ':' + parsed.port : ''}${parsed.pathname}`;
  } catch {
    return rawUrl;
  }
}

export class SettingsController {
  // GET /api/v1/settings
  async getSettings(_req: Request, res: Response) {
    try {
      const [discoveredHostsCount, latestSyncedPrinter, activeRules] = await Promise.all([
        prisma.printer.count(),
        prisma.printer.findFirst({
          where: { lastSyncTime: { not: null } },
          orderBy: { lastSyncTime: 'desc' },
          select: { lastSyncTime: true, syncStatus: true },
        }),
        loadActiveRuntimeRules(),
      ]);

      return res.status(200).json({
        autoClosure: activeRules.autoClosure,
        cache: activeRules.cache,
        thresholds: activeRules.thresholds,
        zabbix: {
          ...activeRules.zabbix,
          apiUrl: maskZabbixEndpoint(activeRules.zabbix.apiUrl),
          discoveredHostsCount,
          lastSyncTime: latestSyncedPrinter?.lastSyncTime
            ? latestSyncedPrinter.lastSyncTime.toISOString()
            : null,
          connectionStatus: latestSyncedPrinter?.syncStatus === 'SUCCESS' ? 'Connected' : 'Unverified',
        },
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Không thể lấy cấu hình hệ thống', message: err.message });
    }
  }

  // PATCH /api/v1/settings
  async updateSettings(req: Request, res: Response) {
    try {
      const updated = applyRuntimeRulesPatch({
        thresholds: req.body?.thresholds,
        autoClosure: req.body?.autoClosure,
        cache: req.body?.cache,
      });

      await prisma.auditLog.create({
        data: {
          userId: req.user?.userId || null,
          action: 'TASK_UPDATE',
          targetId: 'SYSTEM_RUNTIME_SETTINGS',
          ipAddress: req.ip || req.socket?.remoteAddress || null,
          diffJson: {
            thresholds: updated.thresholds,
            autoClosure: updated.autoClosure,
            cache: updated.cache,
            updatedAt: new Date().toISOString(),
          },
        },
      });

      return this.getSettings(req, res);
    } catch (err: any) {
      return res.status(500).json({ error: 'Không thể cập nhật cấu hình hệ thống', message: err.message });
    }
  }

  // POST /api/v1/settings/test-zabbix
  async testZabbix(_req: Request, res: Response) {
    const startTime = Date.now();
    try {
      const [version, discoveredHostsCount] = await Promise.all([
        zabbixApiClient.checkVersion(),
        prisma.printer.count(),
      ]);
      const latencyMs = Math.max(1, Date.now() - startTime);
      applyRuntimeRulesPatch({ zabbixVersion: version });

      return res.status(200).json({
        success: true,
        message: 'Kết nối Zabbix API JSON-RPC thành công.',
        zabbixVersion: version,
        latencyMs,
        discoveredHostsCount,
      });
    } catch (err: any) {
      return res.status(200).json({
        success: false,
        message: `Chưa thể kết nối Zabbix API: ${err.message}`,
        zabbixVersion: null,
        latencyMs: null,
        discoveredHostsCount: null,
      });
    }
  }

  // GET /api/v1/settings/errors
  async getErrors(_req: Request, res: Response) {
    try {
      const dict = await prisma.errorDictionary.findMany({
        orderBy: [{ vendor: 'asc' }, { rawCode: 'asc' }],
      });

      return res.status(200).json(
        dict.map((d) => ({
          id: d.id,
          vendor: d.vendor,
          errorCode: d.rawCode,
          canonicalCode: d.canonicalCode,
          errorName: d.canonicalCode,
          affectedSubsystem: d.subsystem,
          severity: d.severity === 'critical' ? 'Critical' : d.severity === 'info' ? 'Info' : 'Warning',
          description: d.descriptionVi,
        }))
      );
    } catch (err: any) {
      return res.status(500).json({ error: 'Không thể lấy từ điển mã lỗi', message: err.message });
    }
  }

  // GET /api/v1/settings/errors/lookup/:code
  async lookupError(req: Request, res: Response) {
    try {
      const code = req.params.code.trim();
      const vendor = req.query.vendor as string | undefined;

      const found = await prisma.errorDictionary.findFirst({
        where: {
          rawCode: { equals: code, mode: 'insensitive' },
          ...(vendor ? { vendor: { equals: vendor, mode: 'insensitive' } } : {}),
        },
      });

      if (!found) {
        return res.status(404).json({ error: 'Không tìm thấy mã lỗi trong từ điển' });
      }

      return res.status(200).json({
        id: found.id,
        vendor: found.vendor,
        errorCode: found.rawCode,
        canonicalCode: found.canonicalCode,
        errorName: found.canonicalCode,
        affectedSubsystem: found.subsystem,
        severity: found.severity === 'critical' ? 'Critical' : found.severity === 'info' ? 'Info' : 'Warning',
        description: found.descriptionVi,
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Lỗi tra cứu từ điển mã lỗi', message: err.message });
    }
  }

  // GET /api/v1/settings/csv/dictionary-status
  async getDictionaryStatus(_req: Request, res: Response) {
    try {
      const status = await errorDictLifecycleService.getStatus();
      return res.status(200).json(status);
    } catch (err: any) {
      return res.status(500).json({ error: 'Không thể tải trạng thái từ điển CSV', message: err.message });
    }
  }

  // DELETE /api/v1/settings/csv/dictionary
  async unloadDictionary(req: Request, res: Response) {
    try {
      const result = await errorDictLifecycleService.unloadDictionary(
        req.user?.userId,
        req.ip || req.socket?.remoteAddress
      );
      return res.status(200).json(result);
    } catch (err: any) {
      return res.status(500).json({ error: 'Không thể gỡ bộ từ điển CSV khỏi cơ sở dữ liệu', message: err.message });
    }
  }

  // POST /api/v1/settings/csv/import
  async importCsv(req: Request, res: Response) {
    try {
      const { fileName, csvContent } = req.body;
      if (!csvContent) {
        return res.status(400).json({ error: 'Nội dung file CSV không được để trống' });
      }
      const result = await csvImportService.importErrorDictionary(
        fileName || 'upload.csv',
        csvContent,
        req.user?.userId,
        req.ip || req.socket?.remoteAddress
      );
      return res.status(200).json(result);
    } catch (err: any) {
      return res.status(500).json({ error: 'Thao tác nạp CSV thất bại', message: err.message });
    }
  }

  // GET /api/v1/settings/csv/jobs
  async getCsvJobs(req: Request, res: Response) {
    try {
      const jobs = await csvImportService.getImportJobs(Number(req.query.limit) || 20);
      return res.status(200).json(jobs);
    } catch (err: any) {
      return res.status(500).json({ error: 'Không thể tải lịch sử nạp CSV', message: err.message });
    }
  }

  // GET /api/v1/settings/audit-logs
  async getAuditLogs(req: Request, res: Response) {
    try {
      const logs = await csvImportService.getAuditLogs(Number(req.query.limit) || 50);
      return res.status(200).json(logs);
    } catch (err: any) {
      return res.status(500).json({ error: 'Không thể tải nhật ký an ninh', message: err.message });
    }
  }
}

export const settingsController = new SettingsController();


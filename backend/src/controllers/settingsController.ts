/**
 * Backend/src/controllers/settingsController.ts
 *
 * Controller xử lý REST API cho Cấu Hình Hệ Thống, Zabbix Live Ping & Từ Điển Mã Lỗi:
 * - Tích hợp 100% Prisma ORM (`Printer`, `ErrorDictionary`, `CsvImportJob`, `AuditLog`).
 * - Hỗ trợ kiểm tra kết nối thực tế tới Zabbix JSON-RPC 2.0 và đồng bộ ngưỡng cảnh báo.
 * - Tuân thủ AGENTS.md Rule 5 (MetricValue = number | null) & Rule 7.1 (< 300 LOC).
 */

import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { zabbixClient } from '../services/zabbixClient';
import { csvImportService } from '../services/csvImportService';

let runtimeThresholds = {
  tonerWarningPercent: 15,
  tonerCriticalPercent: 5,
  daysUntilEmptyWarning: 7,
  maxFuserTempCelsius: 215,
  maxJamRatePercent: 1.5,
};

let runtimeSettings: any = {
  zabbix: {
    apiUrl: process.env.ZABBIX_URL || process.env.ZABBIX_API_URL || 'http://localhost:8080/api_jsonrpc.php',
    apiTokenMasked: process.env.ZABBIX_API_TOKEN ? '••••••••••••••••' : 'Chưa cấu hình token',
    hostGroup: process.env.ZABBIX_PRINTER_GROUP || 'Printers',
    pollIntervalSeconds: 30,
    fastPollIntervalSeconds: 30,
    slowPollIntervalHours: 1,
    connectionTimeoutSeconds: 10,
    zabbixVersion: null as string | null,
  },
  autoClosure: {
    enabled: true,
    verificationWaitMinutes: 10,
    safeWindowMinutes: 10,
    protectCriticalIncidents: true,
    protectUserReportedIncidents: true,
    protectionLevel: 'CRITICAL_CONFIRMATION_REQUIRED',
    autoCloseRecoveredIncidents: true,
  },
  cache: {
    inMemoryTtlSeconds: 60,
    telemetryTtlSeconds: 60,
    maxMemoryMb: 50,
  },
};

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
      const [discoveredHostsCount, latestSyncedPrinter, persistedConfigLog] = await Promise.all([
        prisma.printer.count(),
        prisma.printer.findFirst({
          where: { lastSyncTime: { not: null } },
          orderBy: { lastSyncTime: 'desc' },
          select: { lastSyncTime: true, syncStatus: true },
        }),
        prisma.auditLog.findFirst({
          where: { targetId: 'SYSTEM_RUNTIME_SETTINGS' },
          orderBy: { createdAt: 'desc' },
          select: { diffJson: true },
        }),
      ]);

      const savedDiff: any =
        persistedConfigLog?.diffJson && typeof persistedConfigLog.diffJson === 'object'
          ? persistedConfigLog.diffJson
          : null;

      if (savedDiff?.thresholds && typeof savedDiff.thresholds === 'object') {
        runtimeThresholds = { ...runtimeThresholds, ...savedDiff.thresholds };
      }
      if (savedDiff?.autoClosure && typeof savedDiff.autoClosure === 'object') {
        runtimeSettings.autoClosure = { ...runtimeSettings.autoClosure, ...savedDiff.autoClosure };
      }
      if (savedDiff?.cache && typeof savedDiff.cache === 'object') {
        runtimeSettings.cache = { ...runtimeSettings.cache, ...savedDiff.cache };
      }

      return res.status(200).json({
        ...runtimeSettings,
        thresholds: runtimeThresholds,
        zabbix: {
          ...runtimeSettings.zabbix,
          apiUrl: maskZabbixEndpoint(runtimeSettings.zabbix.apiUrl),
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
      if (req.body?.thresholds && typeof req.body.thresholds === 'object') {
        runtimeThresholds = {
          ...runtimeThresholds,
          ...req.body.thresholds,
        };
      }
      runtimeSettings = {
        ...runtimeSettings,
        ...(req.body.autoClosure ? { autoClosure: { ...runtimeSettings.autoClosure, ...req.body.autoClosure } } : {}),
        ...(req.body.cache ? { cache: { ...runtimeSettings.cache, ...req.body.cache } } : {}),
      };

      await prisma.auditLog.create({
        data: {
          userId: req.user?.userId || null,
          action: 'TASK_UPDATE',
          targetId: 'SYSTEM_RUNTIME_SETTINGS',
          ipAddress: req.ip || req.socket?.remoteAddress || null,
          diffJson: {
            thresholds: runtimeThresholds,
            autoClosure: runtimeSettings.autoClosure,
            cache: runtimeSettings.cache,
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
        zabbixClient.checkVersion(),
        prisma.printer.count(),
      ]);
      const latencyMs = Math.max(1, Date.now() - startTime);
      runtimeSettings.zabbix.zabbixVersion = version;

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

      const mapped = dict.map((d) => ({
        id: d.id,
        vendor: d.vendor,
        errorCode: d.rawCode,
        canonicalCode: d.canonicalCode,
        errorName: d.canonicalCode,
        affectedSubsystem: d.subsystem,
        severity: d.severity === 'critical' ? 'Critical' : d.severity === 'info' ? 'Info' : 'Warning',
        description: d.descriptionVi,
      }));

      return res.status(200).json(mapped);
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
        severity: found.severity === 'critical' ? 'Critical' : 'Warning',
        description: found.descriptionVi,
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Lỗi tra cứu từ điển mã lỗi', message: err.message });
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
        req.ip || req.socket.remoteAddress
      );

      return res.status(200).json(result);
    } catch (err: any) {
      return res.status(500).json({ error: 'Thao tác nạp CSV thất bại', message: err.message });
    }
  }

  // GET /api/v1/settings/csv/jobs
  async getCsvJobs(req: Request, res: Response) {
    try {
      const limit = Number(req.query.limit) || 20;
      const jobs = await csvImportService.getImportJobs(limit);
      return res.status(200).json(jobs);
    } catch (err: any) {
      return res.status(500).json({ error: 'Không thể tải lịch sử nạp CSV', message: err.message });
    }
  }

  // GET /api/v1/settings/audit-logs
  async getAuditLogs(req: Request, res: Response) {
    try {
      const limit = Number(req.query.limit) || 50;
      const logs = await csvImportService.getAuditLogs(limit);
      return res.status(200).json(logs);
    } catch (err: any) {
      return res.status(500).json({ error: 'Không thể tải nhật ký an ninh', message: err.message });
    }
  }
}

export const settingsController = new SettingsController();

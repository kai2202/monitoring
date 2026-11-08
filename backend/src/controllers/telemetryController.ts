/**
 * Backend/src/controllers/telemetryController.ts
 *
 * Controller xử lý các yêu cầu REST API cho Phân hệ Đo lường & Sản lượng Đội Máy In (Fleet Telemetry).
 * Tuân thủ AGENTS.md Rule 5 & Rule 7.1 (< 300 LOC).
 */

import { Request, Response } from 'express';
import { backendTelemetryService } from '../services/telemetryService';
import { telemetryExtendedService } from '../services/telemetryExtendedService';
import { computeDeviceComparison } from '../services/analytics/compareAnalyticsService';
import { zabbixClient } from '../services/zabbixClient';

export class TelemetryController {
  async getAvailabilityTimeline(req: Request, res: Response) {
    try {
      const hours = Number(req.query.hours) || 24;
      const timeline = await backendTelemetryService.getAvailabilityTimeline(hours);
      return res.status(200).json(timeline);
    } catch (err: any) {
      return res.status(500).json({ error: 'Không thể tải chuỗi thời gian khả dụng', message: err.message });
    }
  }

  async getVolumeTrend(req: Request, res: Response) {
    try {
      const days = Number(req.query.days) || 30;
      const trend = await telemetryExtendedService.getVolumeTrend(days);
      return res.status(200).json(trend);
    } catch (err: any) {
      return res.status(500).json({ error: 'Không thể tải xu hướng sản lượng', message: err.message });
    }
  }

  async getProductionTrend(req: Request, res: Response) {
    try {
      const days = Number(req.query.days) || 30;
      const series = await telemetryExtendedService.getVolumeTrend(days);
      return res.status(200).json({ granularity: req.query.granularity || 'day', series });
    } catch (err: any) {
      return res.status(500).json({ error: 'Không thể tải xu hướng sản lượng nâng cao', message: err.message });
    }
  }

  async getTopPrintersVolume(req: Request, res: Response) {
    try {
      const limit = Number(req.query.limit) || 10;
      const top = await telemetryExtendedService.getTopPrintersVolume(limit, 30);
      return res.status(200).json(top);
    } catch (err: any) {
      return res.status(500).json({ error: 'Không thể tải top sản lượng máy in', message: err.message });
    }
  }

  async getRankings(req: Request, res: Response) {
    try {
      const data = await telemetryExtendedService.getRankings({
        scope: req.query.scope as string | undefined,
        periodDays: Number(req.query.periodDays) || 30,
        brand: req.query.brand as string | undefined,
        search: req.query.search as string | undefined,
      });
      return res.status(200).json(data);
    } catch (err: any) {
      return res.status(500).json({ error: 'Không thể tải bảng xếp hạng sản lượng', message: err.message });
    }
  }

  async getInventory(req: Request, res: Response) {
    try {
      const data = await telemetryExtendedService.getInventory({
        page: Number(req.query.page) || 1,
        pageSize: Number(req.query.pageSize) || 20,
        search: req.query.search as string | undefined,
        brand: req.query.brand as string | undefined,
        department: req.query.department as string | undefined,
      });
      return res.status(200).json(data);
    } catch (err: any) {
      return res.status(500).json({ error: 'Không thể tải kiểm kê telemetry', message: err.message });
    }
  }

  async getHeatmap(req: Request, res: Response) {
    try {
      const limit = Number(req.query.limit) || 50;
      const data = await telemetryExtendedService.getHeatmap(14, limit);
      return res.status(200).json(data);
    } catch (err: any) {
      return res.status(500).json({ error: 'Không thể tải bản đồ nhiệt sản lượng', message: err.message });
    }
  }

  async getCompare(req: Request, res: Response) {
    try {
      const rawIds = String(req.query.printerIds || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const items = await computeDeviceComparison(rawIds);
      return res.status(200).json(items);
    } catch (err: any) {
      return res.status(500).json({ error: 'Không thể đối chiếu máy in', message: err.message });
    }
  }

  async getReliabilityStats(_req: Request, res: Response) {
    try {
      const stats = await backendTelemetryService.getReliabilityStats();
      return res.status(200).json(stats);
    } catch (err: any) {
      return res.status(500).json({ error: 'Không thể tải thống kê độ tin cậy', message: err.message });
    }
  }

  async getLemonDevices(_req: Request, res: Response) {
    try {
      const lemons = await backendTelemetryService.getLemonDevices();
      return res.status(200).json(lemons);
    } catch (err: any) {
      return res.status(500).json({ error: 'Không thể tải danh sách thiết bị hay lỗi', message: err.message });
    }
  }

  async getZabbixStatus(_req: Request, res: Response) {
    try {
      const version = await zabbixClient.checkVersion();
      return res.status(200).json({ status: 'connected', version });
    } catch (err: any) {
      return res.status(200).json({ status: 'disconnected', error: err.message });
    }
  }

  async get3DScatterData(req: Request, res: Response) {
    try {
      const brand = req.query.brand as string | undefined;
      const department = req.query.department as string | undefined;
      const data = await backendTelemetryService.get3DScatterData(brand, department);
      return res.status(200).json(data);
    } catch (err: any) {
      return res.status(500).json({ error: 'Không thể tải dữ liệu phân tích đa chiều', message: err.message });
    }
  }

  async getDailyRollups(req: Request, res: Response) {
    try {
      const printerId = req.query.printerId as string | undefined;
      const days = Number(req.query.days) || 30;
      const rollups = await backendTelemetryService.getDailyRollups(printerId, days);
      return res.status(200).json(rollups);
    } catch (err: any) {
      return res.status(500).json({ error: 'Không thể tải lịch sử bộ đếm', message: err.message });
    }
  }

  async recordCounterRollup(req: Request, res: Response) {
    try {
      const { printerId, monoPages, colorPages, scanPages } = req.body;
      if (!printerId || monoPages === undefined || colorPages === undefined) {
        return res.status(400).json({ error: 'Thiếu printerId, monoPages hoặc colorPages' });
      }
      const result = await backendTelemetryService.recordCounterRollup(
        printerId,
        Number(monoPages),
        Number(colorPages),
        scanPages ? Number(scanPages) : 0
      );
      return res.status(200).json(result);
    } catch (err: any) {
      return res.status(500).json({ error: 'Không thể ghi nhận bộ đếm', message: err.message });
    }
  }
}

export const telemetryController = new TelemetryController();

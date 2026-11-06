/**
 * Backend/src/controllers/telemetryController.ts
 *
 * Controller xử lý các yêu cầu REST API cho Phân hệ Phân tích Sản lượng Đội Máy In (Fleet Analytics).
 */

import { Request, Response } from 'express';
import { backendTelemetryService } from '../services/telemetryService';
import { zabbixClient } from '../services/zabbixClient';

export class TelemetryController {
  // GET /api/telemetry/availability
  async getAvailabilityTimeline(req: Request, res: Response) {
    try {
      const hours = Number(req.query.hours) || 24;
      const timeline = await backendTelemetryService.getAvailabilityTimeline(hours);
      return res.status(200).json(timeline);
    } catch (err: any) {
      return res.status(500).json({ error: 'Không thể tải chuỗi thời gian khả dụng', message: err.message });
    }
  }

  // GET /api/telemetry/reliability-stats
  async getReliabilityStats(_req: Request, res: Response) {
    try {
      const stats = await backendTelemetryService.getReliabilityStats();
      return res.status(200).json(stats);
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch reliability stats', message: err.message });
    }
  }

  // GET /api/telemetry/lemon-devices
  async getLemonDevices(_req: Request, res: Response) {
    try {
      const lemons = await backendTelemetryService.getLemonDevices();
      return res.status(200).json(lemons);
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch lemon devices', message: err.message });
    }
  }

  // GET /api/telemetry/zabbix-status
  async getZabbixStatus(_req: Request, res: Response) {
    try {
      const version = await zabbixClient.checkVersion();
      return res.status(200).json({ status: 'connected', version });
    } catch (err: any) {
      return res.status(200).json({ status: 'disconnected', error: err.message });
    }
  }

  // GET /api/telemetry/scatter-3d
  async get3DScatterData(req: Request, res: Response) {
    try {
      const brand = req.query.brand as string | undefined;
      const department = req.query.department as string | undefined;
      const data = await backendTelemetryService.get3DScatterData(brand, department);
      return res.status(200).json(data);
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch 3D scatter data', message: err.message });
    }
  }

  // GET /api/telemetry/rollups
  async getDailyRollups(req: Request, res: Response) {
    try {
      const printerId = req.query.printerId as string | undefined;
      const days = Number(req.query.days) || 30;
      const rollups = await backendTelemetryService.getDailyRollups(printerId, days);
      return res.status(200).json(rollups);
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch counter rollups', message: err.message });
    }
  }

  // POST /api/telemetry/rollups
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
      return res.status(500).json({ error: 'Failed to record counter rollup', message: err.message });
    }
  }
}

export const telemetryController = new TelemetryController();


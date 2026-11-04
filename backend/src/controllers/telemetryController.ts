/**
 * Backend/src/controllers/telemetryController.ts
 *
 * Controller xử lý các yêu cầu REST API cho Phân hệ Phân tích Sản lượng Đội Máy In (Fleet Analytics).
 */

import { Request, Response } from 'express';
import { backendTelemetryService } from '../services/telemetryService';
import { zabbixClient } from '../services/zabbixClient';

export class TelemetryController {
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
}

export const telemetryController = new TelemetryController();


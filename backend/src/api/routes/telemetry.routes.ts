import { Router, Request, Response } from 'express';
import { PrinterDataService } from '../../services/printerDataService.js';

export function createTelemetryRouter(service: PrinterDataService): Router {
  const router = Router();

  // GET /telemetry/availability
  router.get('/telemetry/availability', async (req: Request, res: Response) => {
    const timeframe = (req.query['timeframe'] as string) || '24h';
    const allowedTimeframes = ['1h', '6h', '24h', '7d'];
    if (!allowedTimeframes.includes(timeframe)) {
      res.status(400).json({
        error: 'BadRequest',
        message: `Invalid timeframe. Must be one of: ${allowedTimeframes.join(', ')}`,
        statusCode: 400,
      });
      return;
    }
    try {
      const timeline = await service.getAvailabilityTimeline(timeframe);
      res.json(timeline);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Internal error';
      console.error('[GET /api/telemetry/availability]', message);
      res.status(503).json({
        error: 'ServiceUnavailable',
        message: 'Unable to retrieve availability data.',
        statusCode: 503,
      });
    }
  });

  // GET /telemetry/print-volume?range=24h|7d|30d&printerId=...
  router.get('/telemetry/print-volume', async (req: Request, res: Response) => {
    const range = (req.query['range'] as string) || '24h';
    const allowedRanges = ['24h', '7d', '30d'];
    if (!allowedRanges.includes(range)) {
      res.status(400).json({
        error: 'BadRequest',
        message: `Invalid range. Must be one of: ${allowedRanges.join(', ')}`,
        statusCode: 400,
      });
      return;
    }
    const printerId = req.query['printerId'] as string | undefined;

    try {
      const telemetry = await service.getPrintVolumeTelemetry(range as '24h' | '7d' | '30d', printerId);
      res.json(telemetry);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Internal error';
      console.error('[GET /api/telemetry/print-volume]', message);
      res.status(503).json({
        error: 'ServiceUnavailable',
        message: 'Unable to retrieve historical print volume telemetry from Zabbix.',
        statusCode: 503,
      });
    }
  });

  return router;
}

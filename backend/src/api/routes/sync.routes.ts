import { Router, Request, Response } from 'express';
import { PrinterDataService } from '../../services/printerDataService.js';

export function createSyncRouter(service: PrinterDataService): Router {
  const router = Router();

  // POST /sync (Manual sync trigger from UI)
  router.post('/sync', async (_req: Request, res: Response) => {
    try {
      const syncResult = await service.syncNow();
      res.json(syncResult);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Internal error';
      console.error('[POST /api/sync]', message);
      res.status(503).json({
        error: 'ServiceUnavailable',
        message: 'Lỗi đồng bộ Zabbix: ' + message,
        statusCode: 503,
      });
    }
  });

  return router;
}

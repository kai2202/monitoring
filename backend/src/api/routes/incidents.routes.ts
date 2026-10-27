import { Router, Request, Response } from 'express';
import { PrinterDataService } from '../../services/printerDataService.js';

export function createIncidentsRouter(service: PrinterDataService): Router {
  const router = Router();

  // GET /incidents
  router.get('/incidents', async (_req: Request, res: Response) => {
    try {
      const incidents = await service.getIncidents();
      res.json(incidents);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Internal error';
      console.error('[GET /api/incidents]', message);
      res.status(503).json({
        error: 'ServiceUnavailable',
        message: 'Unable to retrieve incident data from Zabbix API.',
        statusCode: 503,
      });
    }
  });

  // POST /incidents/:id/status (Chỉnh thủ công 2 trạng thái: Active | Resolved)
  router.post('/incidents/:id/status', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    if (status !== 'Active' && status !== 'Resolved') {
      res.status(400).json({
        error: 'BadRequest',
        message: 'Trạng thái không hợp lệ. Phải là Active hoặc Resolved.',
        statusCode: 400,
      });
      return;
    }
    service.setIncidentStatus(id, status);
    res.json({
      success: true,
      message: `Đã cập nhật trạng thái sự cố ${id} thành ${status === 'Active' ? 'Đang xử lý' : 'Đã xử lý'}.`,
      status,
    });
  });

  // POST /incidents/:id/resolve (Chuyển sang Đã xử lý)
  router.post('/incidents/:id/resolve', async (req: Request, res: Response) => {
    const { id } = req.params;
    service.setIncidentStatus(id, 'Resolved');
    res.json({
      success: true,
      message: `Sự cố ${id} đã được chuyển sang trạng thái Đã xử lý.`,
      status: 'Resolved',
    });
  });

  return router;
}

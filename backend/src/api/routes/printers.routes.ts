import { Router, Request, Response } from 'express';
import { PrinterDataService } from '../../services/printerDataService.js';

export function createPrintersRouter(service: PrinterDataService): Router {
  const router = Router();

  // GET /printers
  router.get('/printers', async (_req: Request, res: Response) => {
    try {
      const printers = await service.getPrinters();
      res.json(printers);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Internal error';
      console.error('[GET /api/printers]', message);
      res.status(503).json({
        error: 'ServiceUnavailable',
        message: 'Unable to retrieve printer data from Zabbix API.',
        statusCode: 503,
      });
    }
  });

  // GET /printers/:id
  router.get('/printers/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const printer = await service.getPrinterById(id);
      if (!printer) {
        res.status(404).json({
          error: 'NotFound',
          message: `Không tìm thấy máy in với định danh: ${id}`,
          statusCode: 404,
        });
        return;
      }
      res.json(printer);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Internal error';
      console.error(`[GET /api/printers/${id}]`, message);
      res.status(503).json({
        error: 'ServiceUnavailable',
        message: 'Unable to retrieve printer data from Zabbix API.',
        statusCode: 503,
      });
    }
  });

  // PATCH /printers/:id/location
  router.patch('/printers/:id/location', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { location } = req.body;
    if (typeof location !== 'string') {
      res.status(400).json({
        error: 'BadRequest',
        message: 'Trường location phải là chuỗi văn bản.',
        statusCode: 400,
      });
      return;
    }
    await service.setPrinterLocation(id, location.trim());
    res.json({
      success: true,
      message: `Đã cập nhật vị trí lắp đặt thành: ${location.trim() || 'Chưa thiết lập'}.`,
      location: location.trim(),
    });
  });

  return router;
}

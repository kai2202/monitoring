/**
 * src/api/routes/index.ts
 *
 * Router aggregator mounting domain-specific routes:
 *   - Printers:   GET /printers, PATCH /printers/:id/location
 *   - Incidents:  GET /incidents, POST /incidents/:id/status, POST /incidents/:id/resolve
 *   - Telemetry:  GET /telemetry/availability, GET /telemetry/print-volume
 *   - Sync:       POST /sync
 */

import { Router } from 'express';
import { PrinterDataService } from '../../services/printerDataService.js';
import { createPrintersRouter } from './printers.routes.js';
import { createIncidentsRouter } from './incidents.routes.js';
import { createTelemetryRouter } from './telemetry.routes.js';
import { createSyncRouter } from './sync.routes.js';

export function createApiRouter(service: PrinterDataService): Router {
  const router = Router();

  router.use(createPrintersRouter(service));
  router.use(createIncidentsRouter(service));
  router.use(createTelemetryRouter(service));
  router.use(createSyncRouter(service));

  return router;
}

// Backward-compatible alias
export const createPrinterRouter = createApiRouter;

export { createPrintersRouter } from './printers.routes.js';
export { createIncidentsRouter } from './incidents.routes.js';
export { createTelemetryRouter } from './telemetry.routes.js';
export { createSyncRouter } from './sync.routes.js';

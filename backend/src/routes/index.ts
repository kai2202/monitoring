/**
 * Backend/src/routes/index.ts
 *
 * Public API Gate & Master Router cho toàn bộ RESTful APIs của FleetMonitor Backend:
 * - Tập hợp 6 miền nghiệp vụ đồng bộ 1-1 với cấu trúc Controllers:
 *   1. Auth & Admin Settings (/auth, /settings)
 *   2. Printers & Telemetry (/printers, /telemetry)
 *   3. Incidents, Integrations & Notifications (/incidents, /integrations, /notifications)
 *   4. Tasks & Approvals (/tasks, /approvals)
 *   5. Operations & Logistics (/supplies, /inventory, /procurement, /vendors)
 *   6. Analytics, Dashboard & Finance (/dashboard, /analytics, /finance)
 * - Tuân thủ AGENTS.md Rule 4 & Rule 7.1 (< 300 LOC).
 */

import { Router } from 'express';
import { authRouter, settingsRouter } from './authRoutes';
import { printerRouter, telemetryRouter } from './printerRoutes';
import { incidentRouter, integrationRouter, notificationRouter } from './incidentRoutes';
import { taskRouter, approvalRouter } from './taskRoutes';
import { suppliesRouter, inventoryRouter, procurementRouter, vendorRouter } from './operationsRoutes';
import { dashboardRouter, analyticsRouter, financeRouter } from './analyticsRoutes';

export const apiRouter = Router();

// 1. Auth & Admin Settings
apiRouter.use('/auth', authRouter);
apiRouter.use('/settings', settingsRouter);

// 2. Printers & Telemetry
apiRouter.use('/printers', printerRouter);
apiRouter.use('/telemetry', telemetryRouter);

// 3. Incidents, Integrations & Notifications
apiRouter.use('/incidents', incidentRouter);
apiRouter.use('/integrations', integrationRouter);
apiRouter.use('/notifications', notificationRouter);

// 4. Tasks & Approvals
apiRouter.use('/tasks', taskRouter);
apiRouter.use('/approvals', approvalRouter);

// 5. Operations & Logistics
apiRouter.use('/supplies', suppliesRouter);
apiRouter.use('/inventory', inventoryRouter);
apiRouter.use('/procurement', procurementRouter);
apiRouter.use('/vendors', vendorRouter);

// 6. Analytics, Dashboard & Finance
apiRouter.use('/dashboard', dashboardRouter);
apiRouter.use('/analytics', analyticsRouter);
apiRouter.use('/finance', financeRouter);

// Re-export router miền nghiệp vụ phục vụ testing hoặc import riêng lẻ
export * from './authRoutes';
export * from './printerRoutes';
export * from './incidentRoutes';
export * from './taskRoutes';
export * from './operationsRoutes';
export * from './analyticsRoutes';

export default apiRouter;

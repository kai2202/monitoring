/**
 * Backend/src/app.ts
 *
 * Khởi tạo ứng dụng máy chủ Express cho FleetMonitor Backend API:
 * - Tích hợp Helmet bảo vệ HTTP Headers & Rate Limiting chống tấn công DoS / Brute-force.
 * - Định tuyến đầy đủ cho chuẩn RESTful /api/v1/... và tương thích ngược /api/...
 * - Tuân thủ AGENTS.md Rule 4 & Rule 7.1 (< 300 LOC).
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { generalApiLimiter } from './middlewares/rateLimiter';
import { authRouter } from './routes/authRoutes';
import { telemetryRouter } from './routes/telemetryRoutes';
import { printerRouter } from './routes/printerRoutes';
import { taskRouter } from './routes/taskRoutes';
import { settingsRouter } from './routes/settingsRoutes';
import { dashboardRouter } from './routes/dashboardRoutes';
import { incidentRouter } from './routes/incidentRoutes';
import { analyticsRouter } from './routes/analyticsRoutes';
import { workLogRouter } from './routes/workLogRoutes';
import { suppliesRouter } from './routes/suppliesRoutes';
import { integrationRouter } from './routes/integrationRoutes';
import { notificationRouter } from './routes/notificationRoutes';
import { inventoryRouter } from './routes/inventoryRoutes';
import { procurementRouter } from './routes/procurementRoutes';
import { vendorRouter } from './routes/vendorRoutes';
import { financeRouter } from './routes/financeRoutes';
import { approvalRouter } from './routes/approvalRoutes';

export const app = express();

// 1. Bảo mật HTTP Headers (Helmet) & CORS
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  })
);

// 2. Body Parser, Cookie Parser & Rate Limiter
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());
app.use('/api', generalApiLimiter);

// 3. Định tuyến chuẩn RESTful v1 (/api/v1/...)
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/telemetry', telemetryRouter);
app.use('/api/v1/printers', printerRouter);
app.use('/api/v1/tasks', taskRouter);
app.use('/api/v1/settings', settingsRouter);
app.use('/api/v1/dashboard', dashboardRouter);
app.use('/api/v1/incidents', incidentRouter);
app.use('/api/v1/analytics', analyticsRouter);
app.use('/api/v1/supplies', suppliesRouter);
app.use('/api/v1/integrations', integrationRouter);
app.use('/api/v1/notifications', notificationRouter);
app.use('/api/v1/inventory', inventoryRouter);
app.use('/api/v1/procurement', procurementRouter);
app.use('/api/v1/vendors', vendorRouter);
app.use('/api/v1/finance', financeRouter);
app.use('/api/v1/approvals', approvalRouter);
app.use('/api/v1', workLogRouter);

// 4. Định tuyến tương thích ngược (/api/...)
app.use('/api/auth', authRouter);
app.use('/api/telemetry', telemetryRouter);
app.use('/api/printers', printerRouter);
app.use('/api/tasks', taskRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/incidents', incidentRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/supplies', suppliesRouter);
app.use('/api/integrations', integrationRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/procurement', procurementRouter);
app.use('/api/vendors', vendorRouter);
app.use('/api/finance', financeRouter);
app.use('/api/approvals', approvalRouter);
app.use('/api', workLogRouter);

// 5. Health Check Endpoint
app.get(['/api/v1/health', '/api/health'], (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'FleetMonitor Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
  });
});

// 6. Central Error Handling Middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[FleetMonitor Backend Error]:', err);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: process.env.NODE_ENV === 'production' ? 'Đã xảy ra lỗi máy chủ nội bộ' : err.message,
    },
    timestamp: new Date().toISOString(),
  });
});

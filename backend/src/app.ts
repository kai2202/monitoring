/**
 * Backend/src/app.ts
 *
 * Khởi tạo ứng dụng máy chủ Express cho FleetMonitor Backend API.
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { telemetryRouter } from './routes/telemetryRoutes';

export const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  })
);

app.use(express.json());

// Routes
app.use('/api/telemetry', telemetryRouter);

// Health Check Endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'FleetMonitor Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Central Error Handling Middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[FleetMonitor Backend Error]:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Đã xảy ra lỗi máy chủ nội bộ' : err.message,
  });
});


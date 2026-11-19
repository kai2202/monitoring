/**
 * Backend/src/app.ts
 *
 * Khởi tạo ứng dụng máy chủ Express cho FleetMonitor Backend API:
 * - Tích hợp Helmet bảo vệ HTTP Headers & Rate Limiting chống tấn công DoS / Brute-force.
 * - Định tuyến tập trung qua apiRouter cho chuẩn RESTful /api/v1/... và tương thích ngược /api/...
 * - Tuân thủ AGENTS.md Rule 4 & Rule 7.1 (< 300 LOC).
 */

import express, { Request, Response, NextFunction, ErrorRequestHandler, RequestHandler } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { generalApiLimiter } from './middlewares/rateLimiter';
import { apiRouter } from './routes';

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
app.use('/api', generalApiLimiter as unknown as RequestHandler);

// 3. Định tuyến RESTful tập trung (/api/v1/ và tương thích ngược /api/)
app.use('/api/v1', apiRouter);
app.use('/api', apiRouter);

// 4. Health Check Endpoints
const handleHealthCheck = (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'FleetMonitor Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
  });
};

app.get('/api/v1/health', handleHealthCheck);
app.get('/api/health', handleHealthCheck);

// 5. Central Error Handling Middleware
const errorHandler: ErrorRequestHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[FleetMonitor Backend Error]:', err);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: process.env.NODE_ENV === 'production' ? 'Đã xảy ra lỗi máy chủ nội bộ' : err?.message || 'Lỗi không xác định',
    },
    timestamp: new Date().toISOString(),
  });
};

app.use(errorHandler);

export default app;

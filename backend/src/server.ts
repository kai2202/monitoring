/**
 * Backend/src/server.ts
 *
 * Entry point khởi chạy HTTP Server của FleetMonitor Backend.
 */

import { app } from './app';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;

const server = app.listen(PORT, () => {
  console.log(`[FleetMonitor Backend] Máy chủ đang chạy tại http://localhost:${PORT}`);
  console.log(`[FleetMonitor Backend] Health Check: http://localhost:${PORT}/api/health`);
});

// Xử lý tắt ứng dụng an toàn (Graceful Shutdown)
const handleShutdown = (signal: string) => {
  console.log(`[FleetMonitor Backend] Nhận tín hiệu ${signal}, đang đóng kết nối...`);
  server.close(() => {
    console.log('[FleetMonitor Backend] Đã đóng máy chủ an toàn.');
    process.exit(0);
  });
};

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));


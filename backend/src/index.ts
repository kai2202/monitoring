import 'dotenv/config'; // reloaded with updated Zabbix API URL
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import os from 'os';

import { getZabbixClient, ZabbixClientError } from './zabbix/client.js';
import { PrinterDataService } from './services/printerDataService.js';
import { createApiRouter } from './api/routes/index.js';

const PORT = Number(process.env['PORT'] ?? 3001);
const CORS_ORIGIN = process.env['CORS_ORIGIN'] ?? 'http://localhost:3000';

function getLocalIpAddresses(): string[] {
  const interfaces = os.networkInterfaces();
  const addresses: string[] = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push(iface.address);
      }
    }
  }
  return addresses;
}

async function main(): Promise<void> {
  const app = express();

  // --------------------------------------------------------------------------
  // Middleware
  // --------------------------------------------------------------------------
  app.use(cors({ origin: CORS_ORIGIN }));
  app.use(express.json());

  // Health check endpoint (does not require Zabbix to be available)
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // --------------------------------------------------------------------------
  // Zabbix client initialization
  // --------------------------------------------------------------------------
  let service: PrinterDataService;

  try {
    const zabbixClient = getZabbixClient();
    await zabbixClient.authenticate();
    console.info('[Startup] Kết nối Zabbix API thành công.');
    service = new PrinterDataService(zabbixClient);
  } catch (err) {
    if (err instanceof ZabbixClientError) {
      console.warn(
        '[Startup] Chưa kết nối được Zabbix API lúc khởi động:',
        err.message,
        '\nMáy chủ vẫn hoạt động, các API /api/* sẽ báo lỗi kết nối cho đến khi Zabbix online.'
      );
      // Still create service — it will error gracefully per request
      const zabbixClient = getZabbixClient();
      service = new PrinterDataService(zabbixClient);
    } else {
      throw err;
    }
  }

  // --------------------------------------------------------------------------
  // REST API Routes
  // --------------------------------------------------------------------------
  app.use('/api', createApiRouter(service));

  // --------------------------------------------------------------------------
  // Static Frontend Hosting (Production Mode - Single Port for VM deployment)
  // --------------------------------------------------------------------------
  const candidatePaths = [
    path.resolve(process.cwd(), '../frontend/dist'),
    path.resolve(process.cwd(), 'frontend/dist'),
    path.resolve(process.cwd(), 'dist/public'),
  ];
  const frontendDistPath = candidatePaths.find(p => fs.existsSync(p));

  if (frontendDistPath) {
    app.use(express.static(frontendDistPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(frontendDistPath, 'index.html'));
    });
  } else {
    // 404 handler for API-only dev mode
    app.use((_req, res) => {
      res.status(404).json({ error: 'NotFound', message: 'Endpoint not found', statusCode: 404 });
    });
  }

  // --------------------------------------------------------------------------
  // Start server and background synchronization
  // --------------------------------------------------------------------------
  const server = app.listen(PORT, async () => {
    const localIps = getLocalIpAddresses();
    const primaryIp = localIps[0] || '127.0.0.1';

    console.info('\n================================================================');
    console.info('🚀 HỆ THỐNG GIÁM SÁT MÁY IN ĐÃ KHỞI CHẠY THÀNH CÔNG!');
    console.info('================================================================');
    console.info(`👉 Truy cập Web Localhost : http://localhost:${PORT}`);
    console.info(`👉 Truy cập Web qua Mạng  : http://${primaryIp}:${PORT}`);
    console.info(`🔗 Zabbix Target API      : ${process.env['ZABBIX_API_URL'] ?? '(chưa cấu hình)'}`);
    console.info('================================================================\n');

    // Launch initial background sync and recurring schedule
    await service.startBackgroundSync();
  });

  // Graceful shutdown
  const shutdown = () => {
    console.info('[Server] Đang dừng dịch vụ an toàn...');
    service.stopBackgroundSync();
    server.close(() => {
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch(err => {
  console.error('[Startup] Lỗi nghiêm trọng:', err);
  process.exit(1);
});

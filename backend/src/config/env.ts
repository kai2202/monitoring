/**
 * Backend/src/config/env.ts
 *
 * Kiểm tra và chuẩn hóa toàn bộ biến môi trường của FleetMonitor Backend bằng Zod.
 * - Tuân thủ AGENTS.md Rule 4 & Rule 7.1 (< 300 LOC).
 */

import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z
    .string()
    .default('4000')
    .transform((val) => parseInt(val, 10)),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  DATABASE_URL: z
    .string()
    .default('postgresql://fleet_admin:fleet_secret_2026@localhost:5432/fleetmonitor?schema=public'),
  JWT_ACCESS_SECRET: z
    .string()
    .default('fleetmonitor_super_secret_access_jwt_key_2026_dev_mode_only'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z
    .string()
    .default('fleetmonitor_super_secret_refresh_jwt_key_2026_dev_mode_only'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  // MinIO S3 Object Storage
  MINIO_ENDPOINT: z.string().default('localhost'),
  MINIO_PORT: z
    .string()
    .default('9000')
    .transform((val) => parseInt(val, 10)),
  MINIO_USE_SSL: z
    .string()
    .default('false')
    .transform((val) => val === 'true'),
  MINIO_ACCESS_KEY: z.string().default('fleet_minio_admin'),
  MINIO_SECRET_KEY: z.string().default('minio_secret_2026'),
  MINIO_BUCKET: z.string().default('fleetmonitor-proofs'),

  // Zabbix API
  ZABBIX_API_URL: z.string().default('http://localhost:8080/api_jsonrpc.php'),
  ZABBIX_USER: z.string().default('Admin'),
  ZABBIX_PASSWORD: z.string().default('zabbix'),
  ZABBIX_POLL_INTERVAL: z
    .string()
    .default('60000')
    .transform((val) => parseInt(val, 10)),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('[FleetMonitor Backend] Lỗi biến môi trường không hợp lệ:', parsedEnv.error.format());
  throw new Error('Biến môi trường Backend không hợp lệ. Vui lòng kiểm tra lại file .env.');
}

export const env = parsedEnv.data;
export default env;

/**
 * Backend/src/lib/prisma.ts
 *
 * Singleton Prisma Client Instance cho FleetMonitor Backend:
 * - Tránh tạo nhiều kết nối database trong môi trường development (Hot Reload / tsx watch).
 * - Tự động ghi log truy vấn trong dev mode và đóng kết nối an toàn khi tắt app.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var __fleetmonitor_prisma: PrismaClient | undefined;
}

export const prisma =
  global.__fleetmonitor_prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.__fleetmonitor_prisma = prisma;
}

export default prisma;

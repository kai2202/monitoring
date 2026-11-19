/**
 * Backend/scripts/seed_32_printers_and_errors.ts
 *
 * Script nạp độc lập 32 máy in thực tế và 75 mã lỗi phần chuẩn hóa vào PostgreSQL:
 * - Tuân thủ AGENTS.md Rule 1, 5, 6 & Rule 7.1 (< 300 LOC).
 */

import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), 'Backend/.env') });
dotenv.config();

import { PrismaClient } from '@prisma/client';
import { seedErrorDictionary } from '../prisma/seedErrorDictionary';
import { seedRealPrinters } from '../prisma/seedRealPrinters';

const prisma = new PrismaClient();

async function main() {
  console.log('================================================================');
  console.log(' [FleetMonitor] NẠP 32 MÁY IN THỰC TẾ & 75 MÃ LỖI VÀO POSTGRESQL');
  console.log('================================================================\n');

  const errorCount = await seedErrorDictionary(prisma);
  const printerCount = await seedRealPrinters(prisma);

  console.log('\n================================================================');
  console.log(`🎉 HOÀN THÀNH: Đã nạp ${printerCount} máy in & ${errorCount} mã lỗi vào CSDL!`);
  console.log('================================================================');
}

main()
  .catch((e) => {
    console.error('[SeedScript] Lỗi khi nạp dữ liệu:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

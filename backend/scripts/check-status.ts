import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), 'Backend/.env') });
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const printers = await prisma.printer.findMany({
    include: { consumable: true, incidents: true, counterRollups: true },
  });

  console.log(`\n=== DANH SÁCH MÁY IN TRONG POSTGRESQL (${printers.length} máy) ===`);
  if (printers.length === 0) {
    console.log('CSDL hiện chưa có máy in nào.');
  } else {
    for (const p of printers) {
      console.log(`- [${p.id}] ${p.name} | IP: ${p.ip} | Trạng thái: ${p.connectionStatus} | Mực K: ${p.consumable?.tonerBlack ?? 'N/A'}%`);
    }
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });


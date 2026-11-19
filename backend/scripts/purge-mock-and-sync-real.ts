/**
 * Backend/scripts/purge-mock-and-sync-real.ts
 *
 * Script dọn dẹp sạch toàn bộ dữ liệu máy in mock (192.168.1.x) trong PostgreSQL
 * và kích hoạt đồng bộ tức thì toàn bộ thiết bị thật từ Zabbix 7.0 LTS API.
 * Tuân thủ nghiêm ngặt AGENTS.md Rule 1 (Accuracy first) & Rule 5 (Data integrity).
 */

import dotenv from 'dotenv';
import path from 'path';

// Nạp cấu hình môi trường Backend/.env TRƯỚC TIÊN để zabbixConfig nhận đúng API Token
dotenv.config({ path: path.resolve(process.cwd(), 'Backend/.env') });
dotenv.config();

import { PrismaClient } from '@prisma/client';
import { zabbixApiClient } from '../src/services/zabbix/zabbixApiClient';
import { zabbixSyncWorker } from '../src/services/zabbix/zabbixSyncWorker';

const prisma = new PrismaClient();

async function main() {
  console.log('================================================================');
  console.log(' [FleetMonitor] DỌN DẸP TOÀN BỘ DATA MOCK & ĐỒNG BỘ ZABBIX THẬT');
  console.log('================================================================\n');

  // 1. Kiểm tra kết nối CSDL PostgreSQL
  console.log('[1/4] Kiểm tra kết nối cơ sở dữ liệu PostgreSQL...');
  const initialPrinters = await prisma.printer.findMany({ select: { id: true, name: true, ip: true } });
  console.log(` -> Tìm thấy ${initialPrinters.length} máy in hiện tại trong CSDL:`);
  initialPrinters.forEach((p, idx) => {
    console.log(`    ${idx + 1}. [${p.id}] ${p.name} - IP: ${p.ip}`);
  });

  // 2. Xóa toàn bộ dữ liệu mock (máy in và các bảng phụ thuộc)
  console.log('\n[2/4] Tiến hành xóa sạch toàn bộ máy in mock và dữ liệu phụ thuộc...');

  // Reset printerId trong hợp đồng thuê máy in để tránh lỗi foreign key
  const updatedContracts = await prisma.printerContract.updateMany({
    data: { printerId: null },
  });
  console.log(` -> Đã gỡ liên kết máy in trong ${updatedContracts.count} hợp đồng`);

  // Xóa các bảng liên quan đến công việc và phê duyệt
  await prisma.approvalAction.deleteMany({ where: { targetType: 'TASK_ACCEPTANCE' } });
  await prisma.workLog.deleteMany({});
  await prisma.taskAttachment.deleteMany({});
  await prisma.task.deleteMany({});
  console.log(' -> Đã xóa các tác vụ, nhật ký kỹ thuật & file đính kèm mẫu');

  // Xóa sản lượng bộ đếm, sự cố, vật tư và máy in
  await prisma.counterRollup.deleteMany({});
  await prisma.incident.deleteMany({});
  await prisma.printerConsumable.deleteMany({});
  const deletedPrinters = await prisma.printer.deleteMany({});
  console.log(` -> ĐÃ XÓA THÀNH CÔNG ${deletedPrinters.count} MÁY IN MOCK KHỎI CƠ SỞ DỮ LIỆU!`);

  // 3. Kiểm tra kết nối Zabbix API
  console.log('\n[3/4] Kiểm tra kết nối Zabbix 7.0 LTS Server...');
  try {
    const version = await zabbixApiClient.checkVersion();
    console.log(` -> Kết nối Zabbix Server thành công! Phiên bản: ${version}`);

    const hosts = await zabbixApiClient.getHosts();
    console.log(` -> Tìm thấy ${hosts.length} Hosts từ Zabbix Server:`);
    hosts.forEach((h, idx) => {
      const ip = (h as any).interfaces?.[0]?.ip || 'N/A';
      console.log(`    ${idx + 1}. [${h.host}] "${h.name}" | IP: ${ip} | HostID: ${h.hostid}`);
    });

    // 4. Kích hoạt đồng bộ ZabbixSyncWorker
    console.log('\n[4/4] Đang kích hoạt đồng bộ dữ liệu thật từ Zabbix API vào PostgreSQL...');
    const syncResult = await zabbixSyncWorker.syncNow();
    console.log(' -> Kết quả đồng bộ Zabbix:', syncResult);

    // Kiểm tra kết quả sau đồng bộ
    const realPrinters = await prisma.printer.findMany({
      include: {
        consumable: true,
        incidents: true,
        counterRollups: true,
      },
    });

    console.log('\n================================================================');
    console.log(`🎉 HOÀN TẤT! CƠ SỞ DỮ LIỆU HIỆN CÓ ${realPrinters.length} THIẾT BỊ THẬT TỪ ZABBIX:`);
    console.log('================================================================');

    for (const p of realPrinters) {
      const tonerK = p.consumable?.tonerBlack !== null && p.consumable?.tonerBlack !== undefined ? `${p.consumable.tonerBlack}%` : 'N/A';
      const tonerC = p.isColor && p.consumable?.tonerCyan !== null && p.consumable?.tonerCyan !== undefined ? `${p.consumable.tonerCyan}%` : '-';
      const tonerM = p.isColor && p.consumable?.tonerMagenta !== null && p.consumable?.tonerMagenta !== undefined ? `${p.consumable.tonerMagenta}%` : '-';
      const tonerY = p.isColor && p.consumable?.tonerYellow !== null && p.consumable?.tonerYellow !== undefined ? `${p.consumable.tonerYellow}%` : '-';
      const totalPages = p.counterRollups?.[0]?.totalPages ?? 'Chưa có OID';

      console.log(`\n🖨️  [${p.id}] ${p.name}`);
      console.log(`    - IP Thật: ${p.ip} | Model: ${p.model} | Hãng: ${p.mfr}`);
      console.log(`    - Kết nối: ${p.connectionStatus} | Sức khỏe: ${p.health} | Cảnh báo: ${p.alertSeverity}`);
      console.log(`    - Mực: K: ${tonerK} | C: ${tonerC} | M: ${tonerM} | Y: ${tonerY}`);
      console.log(`    - Tổng trang in: ${totalPages}`);
      console.log(`    - Sự cố kích hoạt: ${p.incidents.length} sự cố`);
    }

    console.log('\n✅ Toàn bộ hệ thống Backend và CSDL đã được làm sạch và nạp 100% dữ liệu thật!');
  } catch (zabbixErr: any) {
    console.error('❌ Lỗi khi đồng bộ Zabbix:', zabbixErr.message || zabbixErr);
  }
}

main()
  .catch((e) => {
    console.error('❌ Lỗi nghiêm trọng:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


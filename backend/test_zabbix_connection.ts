/**
 * Test kết nối trực tiếp Zabbix 7.0 LTS API JSON-RPC
 */
import { zabbixApiClient } from './src/services/zabbix/zabbixApiClient';
import dotenv from 'dotenv';

dotenv.config();

async function runTest() {
  console.log('====================================================');
  console.log(' [FleetMonitor] Bắt đầu kiểm tra kết nối Zabbix API');
  console.log(' URL:', process.env.ZABBIX_API_URL);
  console.log(' Token:', process.env.ZABBIX_API_TOKEN ? 'Đã nhận (' + process.env.ZABBIX_API_TOKEN.substring(0, 8) + '...)' : 'CHƯA CÓ');
  console.log('====================================================\n');

  try {
    console.log('[1/3] Gọi kiểm tra phiên bản Zabbix (apiinfo.version)...');
    const version = await zabbixApiClient.checkVersion();
    console.log('✅ Phiên bản Zabbix Server:', version);

    console.log('\n[2/3] Lấy danh sách Hosts qua Client chuẩn Zabbix 7.0 (host.get)...');
    const hosts = await zabbixApiClient.getHosts();
    console.log(`✅ LẤY THÀNH CÔNG ${hosts.length} HOSTS TỪ ZABBIX THẬT:`);
    hosts.forEach((h, idx) => {
      const ip = (h as any).interfaces?.[0]?.ip || 'N/A';
      console.log(`   ${idx + 1}. [${h.host}] "${h.name}" - IP: ${ip} (HostID: ${h.hostid})`);
    });

    console.log('\n[3/3] Kiểm tra các sự cố cảnh báo đang kích hoạt (problem.get)...');
    const problems = await zabbixApiClient.getActiveProblems();
    console.log(`✅ Số vấn đề/cảnh báo đang kích hoạt: ${problems.length}`);
    problems.forEach((p, idx) => {
      console.log(`   ${idx + 1}. EventID: ${p.eventid} - Severity: ${p.severity} - Name: ${p.name}`);
    });

    console.log('\n====================================================');
    console.log('🎉 KẾT QUẢ: KẾT NỐI VÀ XÁC THỰC ZABBIX THÀNH CÔNG 100%!');
    console.log('====================================================');
    hosts.forEach((h, idx) => {
      const ip = h.interfaces?.[0]?.ip || 'N/A';
      console.log(`   ${idx + 1}. [${h.host}] "${h.name}" - IP: ${ip} (HostID: ${h.hostid})`);
    });

    console.log('\n[3/3] Kiểm tra các sự cố cảnh báo đang kích hoạt (problem.get)...');
    const problems = await zabbixApiClient.getActiveProblems();
    console.log(`✅ Số vấn đề/cảnh báo đang kích hoạt: ${problems.length}`);
    problems.forEach((p, idx) => {
      console.log(`   ${idx + 1}. EventID: ${p.eventid} - Severity: ${p.severity} - Name: ${p.name}`);
    });

    console.log('\n====================================================');
    console.log('🎉 KẾT QUẢ: KẾT NỐI VÀ XÁC THỰC ZABBIX THÀNH CÔNG 100%!');
    console.log('====================================================');
  } catch (err: any) {
    console.error('\n❌ LỖI KẾT NỐI:', err.message || err);
  }
}

runTest();


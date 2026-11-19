/**
 * Backend/scripts/snmp_probe_and_walk.ts
 *
 * Script kiểm tra kết nối (ICMP Ping / Socket Test) và thăm dò SNMP OIDs
 * dựa trên danh mục kiểm kê thực tế 32 máy in của công ty.
 */

import net from 'net';
import dgram from 'dgram';

export interface TargetDevice {
  stt: number | string;
  location: string;
  subLocation: string;
  model: string;
  ip: string;
}

export const TARGET_PRINTERS: TargetDevice[] = [
  { stt: 1, location: 'AB1', subLocation: 'Tầng trệt lễ tân', model: 'Canon 223', ip: '10.48.90.221' },
  { stt: 2, location: 'AB1', subLocation: 'Tầng 2 JPC', model: 'Canon 223', ip: '10.48.90.69' },
  { stt: 3, location: 'AB1', subLocation: 'Tầng 2 RDD', model: 'Ricoh 4503 in màu - máy photo', ip: '10.48.3.252' },
  { stt: 4, location: 'AB1', subLocation: 'Tầng 2 MSA', model: 'Canon 223', ip: '10.48.90.188' },
  { stt: '5a', location: 'AB1', subLocation: 'Tầng 2 giáo vụ', model: 'Canon 223', ip: '10.48.90.129' },
  { stt: '5b', location: 'AB1', subLocation: 'Tầng 2 giáo vụ', model: 'Epson 1802 in màu', ip: '10.48.3.55' },
  { stt: 6, location: 'AB1', subLocation: 'Tầng 2 Kaizen', model: 'Ricoh 5002 - máy photo', ip: '10.48.3.253' },
  { stt: 7, location: 'AB1', subLocation: 'Tầng 5', model: 'Ricoh 5002 - máy photo', ip: '10.48.50.86' },
  { stt: 8, location: 'AB1', subLocation: 'Tầng 5 lưu học', model: 'Canon mf 241', ip: '10.48.50.66' },
  { stt: 10, location: 'AB1', subLocation: 'Tầng 5 Koka', model: 'Canon 223', ip: '10.48.90.40' },
  { stt: 11, location: 'AB1', subLocation: 'Tầng 6', model: 'Ricoh 4503 in màu - máy photo', ip: '10.48.90.77' },
  { stt: '12a', location: 'AB1', subLocation: 'Tầng 6 kế toán', model: 'HP + Epson in màu', ip: '192.168.2.6' },
  { stt: 13, location: 'AB1', subLocation: 'Tầng 6 kế toán', model: 'Canon 223', ip: '10.48.90.192' },
  { stt: 14, location: 'AB1', subLocation: 'Tầng 6 nhân sự', model: 'Canon 223', ip: '192.168.2.100' },
  { stt: 15, location: 'AB1', subLocation: 'Tầng 6 proskills', model: 'Epson 1205 in màu', ip: '192.168.2.86' },
  { stt: 16, location: 'AB1', subLocation: 'Tầng 7', model: 'Ricoh 5002 - máy photo', ip: '10.48.90.66' },
  { stt: 17, location: 'AB2', subLocation: 'AB2 Tầng 6', model: 'Canon 223 + Epson 1800', ip: '10.48.91.165' },
  { stt: 18, location: 'ÂU CƠ', subLocation: 'Âu Cơ ESUTECH', model: 'Máy in Ricoh', ip: '10.10.47.104' },
  { stt: '19a', location: 'BÌNH DƯƠNG', subLocation: 'TTLK Bình Dương', model: 'Canon LBP6230', ip: '192.168.88.15' },
  { stt: '19b', location: 'BÌNH DƯƠNG', subLocation: 'TTLK Bình Dương', model: 'Brother HL-L2320D', ip: '192.168.88.46' },
  { stt: 22, location: 'TRÀ VINH', subLocation: 'Trà Vinh', model: 'Ricoh MP 4054', ip: '192.168.85.200' },
  { stt: 23, location: 'VŨNG TÀU', subLocation: 'Vũng Tàu', model: 'Canon mf 443dw', ip: '172.30.1.173' },
  { stt: 25, location: 'TIỀN GIANG', subLocation: 'Tiền Giang', model: 'i-SENSYS LBP246dw II', ip: '172.30.1.49' },
  { stt: 26, location: 'HÀ NỘI', subLocation: 'Hà Nội', model: 'Canon MF240', ip: '192.168.94.243' },
  { stt: 27, location: 'JPC', subLocation: 'JPC', model: 'TOSHIBA e-STUDIO5018A', ip: '192.168.131.48' },
  { stt: '28a', location: 'ĐÀ NẴNG', subLocation: 'Đà Nẵng máy 1', model: 'Ricoh 3054', ip: '192.168.31.250' },
  { stt: '28b', location: 'ĐÀ NẴNG', subLocation: 'Đà Nẵng máy 2', model: 'Ricoh 3054', ip: '192.168.31.249' },
  { stt: 29, location: 'LONG AN', subLocation: 'Long An', model: 'HP LaserJet Pro M402-M403', ip: '192.168.80.13' },
  { stt: 31, location: 'VĨNH LONG', subLocation: 'Vĩnh Long', model: 'TOSHIBA e-STUDIO306', ip: '192.168.83.150' },
  { stt: 32, location: 'AB1', subLocation: 'Tầng 2 giáo vụ', model: 'Olivetti PR2', ip: '10.48.91.138' },
];

console.log(`Đã nạp ${TARGET_PRINTERS.length} IP máy in từ danh mục kiểm kê thực tế.`);


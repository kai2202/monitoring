/**
 * mocks/mockIncidents.ts
 *
 * Dữ liệu mô phỏng danh sách sự cố vận hành FleetMonitor.
 * - Phản ánh đúng quy trình xử lý thực tế và trạng thái chờ (Pending Management).
 * - Tuyệt đối không chứa trường actionGuidance.
 * - Nhãn và ghi chú sử dụng tiếng Việt chuẩn doanh nghiệp.
 */

import { Incident } from '../types/printer';

export const mockIncidents: Incident[] = [
  {
    id: 'INC-20261028-0001',
    printer: 'Ricoh MP C6004 - P.Kế toán',
    type: 'Hardware Error',
    desc: 'SC541-00 Lỗi cụm sấy: Đứt mạch nhiệt độ nung thanh nhiệt',
    severity: 'Critical',
    status: 'Active',
    start: new Date(Date.now() - 2 * 3600 * 1000 - 15 * 60 * 1000).toISOString(),
    duration: '2h 15m',
    notificationStatus: 'Sent',
    lifecycle: 'In Progress (Chờ linh kiện thay thế)',
    statusHistory: [
      {
        time: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        status: 'Active',
        note: 'Hệ thống Zabbix phát hiện mã lỗi SC541 qua SNMP trap',
      },
      {
        time: new Date(Date.now() - 1.5 * 3600 * 1000).toISOString(),
        status: 'In Progress',
        note: 'Kỹ thuật viên Nguyễn Văn A đã tiếp nhận và tháo cụm sấy kiểm tra',
      },
      {
        time: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
        status: 'Waiting',
        note: 'Đang chờ linh kiện: Cụm sấy Ricoh Part No D242-4000 từ nhà cung cấp',
      },
    ],
    diagnostic: {
      subsystem: 'Fuser',
      errorCode: 'SC541',
      vendor: 'Ricoh',
      model: 'MP C6004',
      componentName: 'Cụm sấy (Fuser Unit)',
      recommendedActionSummary: 'Yêu cầu thay thế thanh nhiệt hoặc cả cụm sấy. Không thử reset cưỡng bức để tránh chập cháy.',
    },
  },
  {
    id: 'INC-20261028-0002',
    printer: 'Canon iR-ADV C5535i - Ban Giám Đốc',
    type: 'Hardware Error',
    desc: 'Mã lỗi E000-0001: Lỗi quá nhiệt cụm sấy',
    severity: 'Critical',
    status: 'Active',
    start: new Date(Date.now() - 1 * 3600 * 1000 - 40 * 60 * 1000).toISOString(),
    duration: '1h 40m',
    notificationStatus: 'Sent',
    lifecycle: 'Waiting (Đã hẹn kỹ thuật hãng Canon)',
    statusHistory: [
      {
        time: new Date(Date.now() - 1.5 * 3600 * 1000).toISOString(),
        status: 'Active',
        note: 'Cảnh báo nhiệt độ khối nung vượt ngưỡng an toàn',
      },
      {
        time: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        status: 'Waiting',
        note: 'Đã liên hệ bảo hành Canon Việt Nam, kỹ thuật viên hãng hẹn đến lúc 09:00 sáng mai',
      },
    ],
  },
  {
    id: 'INC-20261028-0003',
    printer: 'Canon MF445dw - Kho Vận',
    type: 'Connectivity',
    desc: 'Thiết bị mất kết nối mạng ICMP Ping timeout',
    severity: 'Critical',
    status: 'Active',
    start: new Date(Date.now() - 48 * 60 * 1000).toISOString(),
    duration: '48m',
    notificationStatus: 'Sent',
    lifecycle: 'Assigned',
    statusHistory: [
      {
        time: new Date(Date.now() - 48 * 60 * 1000).toISOString(),
        status: 'Active',
        note: 'Mất tín hiệu ping từ Zabbix Server',
      },
      {
        time: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
        status: 'Assigned',
        note: 'Đã phân công kỹ thuật viên kiểm tra switch mạng Tầng 1 Kho Vận',
      },
    ],
  },
  {
    id: 'INC-20261028-0004',
    printer: 'Ricoh MP C6004 - P.Kinh doanh 1',
    type: 'Hardware Error',
    desc: 'SC101 Lỗi đèn quét khối quang học ADF',
    severity: 'Warning',
    status: 'Active',
    start: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    duration: '4h 00m',
    notificationStatus: 'Sent',
    lifecycle: 'In Progress',
    statusHistory: [
      {
        time: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
        status: 'Active',
        note: 'Người dùng báo không scan được tài liệu từ khay nạp tự động ADF',
      },
      {
        time: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
        status: 'In Progress',
        note: 'Kỹ thuật viên kiểm tra cáp bẹ tín hiệu scanner',
      },
    ],
  },
  {
    id: 'INC-20261028-0005',
    printer: 'HP PageWide 556xh - P.Dự Án',
    type: 'Operational',
    desc: 'Kẹt giấy liên tục tại khay giấy số 2 (Paper Jam Tray 2)',
    severity: 'Warning',
    status: 'Active',
    start: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    duration: '35m',
    notificationStatus: 'Sent',
    lifecycle: 'New',
    statusHistory: [
      {
        time: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
        status: 'Active',
        note: 'Cảm biến nạp giấy báo kẹt liên tục 3 lần trong 10 phút',
      },
    ],
  },
  {
    id: 'INC-20261027-0012',
    printer: 'Ricoh MP 3055 - Sảnh Lễ tân',
    type: 'Supply Alert',
    desc: 'Hết mực đen cartridge (Toner Empty)',
    severity: 'Warning',
    status: 'Resolved',
    start: '2026-10-27T08:30:00.000Z',
    endTime: '2026-10-27T09:15:00.000Z',
    duration: '45m',
    notificationStatus: 'Sent',
    lifecycle: 'Closed',
    statusHistory: [
      {
        time: '2026-10-27T08:30:00.000Z',
        status: 'Active',
        note: 'Mức mực đọc được là 0%',
      },
      {
        time: '2026-10-27T09:15:00.000Z',
        status: 'Resolved',
        note: 'Đã thay hộp mực mới Ricoh MP 3055, mực hồi phục 100%',
      },
    ],
  },
  {
    id: 'INC-20261026-0008',
    printer: 'HP LaserJet M608 - P.Pháp Chế',
    type: 'Operational',
    desc: 'Kẹt giấy khay cuốn tự động Duplex',
    severity: 'Warning',
    status: 'Resolved',
    start: '2026-10-26T14:10:00.000Z',
    endTime: '2026-10-26T14:30:00.000Z',
    duration: '20m',
    notificationStatus: 'Sent',
    lifecycle: 'Closed',
    statusHistory: [
      {
        time: '2026-10-26T14:10:00.000Z',
        status: 'Active',
        note: 'Phát hiện kẹt giấy',
      },
      {
        time: '2026-10-26T14:30:00.000Z',
        status: 'Resolved',
        note: 'Kỹ thuật viên đã gắp giấy kẹt và vệ sinh quả đào kéo giấy',
      },
    ],
  },
];

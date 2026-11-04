/**
 * mocks/mockSettings.ts
 *
 * Dữ liệu mô phỏng cấu hình hệ thống và từ điển mã lỗi phần cứng đa thương hiệu.
 * Tuyệt đối không chứa trường actionGuidance.
 */

export interface MockErrorCode {
  id: string;
  vendor: 'Ricoh' | 'Canon' | 'HP' | 'Epson' | 'General';
  errorCode: string;
  errorName: string;
  affectedSubsystem: 'Fuser' | 'Scanner_ADF' | 'Paper_Feed' | 'Laser_Optics' | 'Controller_Board' | 'General';
  severity: 'Critical' | 'Warning' | 'Info';
  description: string;
}

export const mockSystemSettings = {
  zabbix: {
    apiUrl: 'http://192.168.1.50/zabbix/api_jsonrpc.php',
    apiTokenMasked: '••••••••••••••••••••••••••••••••3a9f',
    hostGroup: 'Enterprise Printers',
    pollIntervalSeconds: 60,
    connectionStatus: 'Connected',
    zabbixVersion: '7.0.3 LTS',
    lastSyncTime: new Date(Date.now() - 30 * 1000).toISOString(),
  },
  autoClosure: {
    enabled: true,
    verificationWaitMinutes: 10,
    protectCriticalIncidents: true,   // Bất biến: Không tự đóng Critical
    protectUserReportedIncidents: true, // Bất biến: Không tự đóng User-Reported
  },
  cache: {
    inMemoryTtlSeconds: 60,
    telemetryTtlSeconds: 300,
  },
};

export const mockErrorDictionary: MockErrorCode[] = [
  // Ricoh SC Codes
  {
    id: 'err-001',
    vendor: 'Ricoh',
    errorCode: 'SC541',
    errorName: 'Lỗi cụm sấy: Đứt mạch cảm biến nhiệt nung',
    affectedSubsystem: 'Fuser',
    severity: 'Critical',
    description: 'Nhiệt độ cụm sấy không tăng lên sau khi bật máy nung trong thời gian quy định.',
  },
  {
    id: 'err-002',
    vendor: 'Ricoh',
    errorCode: 'SC542',
    errorName: 'Lỗi cụm sấy: Quá nhiệt rơ-le nhiệt độ bảo vệ',
    affectedSubsystem: 'Fuser',
    severity: 'Critical',
    description: 'Nhiệt độ cụm sấy vượt ngưỡng 230 độ C, kích hoạt rơ-le nhiệt bảo vệ an toàn.',
  },
  {
    id: 'err-003',
    vendor: 'Ricoh',
    errorCode: 'SC101',
    errorName: 'Lỗi khối quang học: Hỏng đèn quét hoặc cảm biến CCD',
    affectedSubsystem: 'Scanner_ADF',
    severity: 'Warning',
    description: 'Mức ánh sáng trắng chuẩn đọc từ tấm căn chỉnh quang học không đạt yêu cầu.',
  },
  {
    id: 'err-004',
    vendor: 'Ricoh',
    errorCode: 'SC320',
    errorName: 'Lỗi khối quang học Laser: Động cơ đa giác (Polygon Motor) không quay',
    affectedSubsystem: 'Laser_Optics',
    severity: 'Critical',
    description: 'Tín hiệu khóa tốc độ động cơ laser polygon không đạt sau 10 giây khởi động.',
  },

  // Canon Error Codes
  {
    id: 'err-005',
    vendor: 'Canon',
    errorCode: 'E000',
    errorName: 'Lỗi cụm sấy Canon: Bộ nung không gia nhiệt',
    affectedSubsystem: 'Fuser',
    severity: 'Critical',
    description: 'Thanh nhiệt gốm (Ceramic Heater) hoặc đèn sấy không đạt nhiệt độ khởi động.',
  },
  {
    id: 'err-006',
    vendor: 'Canon',
    errorCode: 'E001',
    errorName: 'Lỗi cụm sấy Canon: Quá nhiệt bất thường',
    affectedSubsystem: 'Fuser',
    severity: 'Critical',
    description: 'Cảm biến nhiệt độ cụm sấy đọc giá trị vượt quá mức trần an toàn.',
  },
  {
    id: 'err-007',
    vendor: 'Canon',
    errorCode: 'E010',
    errorName: 'Lỗi động cơ chính (Main Motor failure)',
    affectedSubsystem: 'Controller_Board',
    severity: 'Critical',
    description: 'Động cơ dẫn động chính của máy in Canon không quay hoặc bị kẹt cơ học.',
  },

  // HP Error Codes
  {
    id: 'err-008',
    vendor: 'HP',
    errorCode: '50.1',
    errorName: 'Lỗi Fuser HP: Nhiệt độ sấy thấp',
    affectedSubsystem: 'Fuser',
    severity: 'Critical',
    description: 'Khối sấy máy in HP LaserJet không đủ nhiệt để nung chảy mực in.',
  },
  {
    id: 'err-009',
    vendor: 'HP',
    errorCode: '13.00',
    errorName: 'Kẹt giấy khay nạp (Paper Jam In Tray)',
    affectedSubsystem: 'Paper_Feed',
    severity: 'Warning',
    description: 'Giấy không rời khỏi khay nạp đúng thời gian chu kỳ quét cảm biến.',
  },
];

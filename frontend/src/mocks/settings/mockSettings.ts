/**
 * Frontend/src/mocks/settings/mockSettings.ts
 *
 * Dữ liệu mô phỏng cấu hình hệ thống và từ điển mã lỗi phần cứng đa thương hiệu.
 * Tuyệt đối không chứa trường actionGuidance.
 * Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
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
    protectCriticalIncidents: true,
    protectUserReportedIncidents: true,
  },
  cache: {
    inMemoryTtlSeconds: 60,
    telemetryTtlSeconds: 300,
  },
};

export const mockErrorDictionary: MockErrorCode[] = [
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
    errorName: 'Lỗi cụm sấy: Quá nhiệt nhiệt điện trở',
    affectedSubsystem: 'Fuser',
    severity: 'Critical',
    description: 'Nhiệt độ cụm sấy vượt ngưỡng an toàn cho phép (>240°C). Ngắt relay bảo vệ.',
  },
  {
    id: 'err-003',
    vendor: 'Ricoh',
    errorCode: 'SC320',
    errorName: 'Lỗi mô-tơ đa giác Laser Polygon Motor',
    affectedSubsystem: 'Laser_Optics',
    severity: 'Critical',
    description: 'Mô-tơ gương đa giác quét tia laser không đạt tốc độ đồng bộ sau 20 giây khởi động.',
  },
  {
    id: 'err-004',
    vendor: 'Canon',
    errorCode: 'E000-0000',
    errorName: 'Lỗi nhiệt độ sấy không đạt ngưỡng khởi động',
    affectedSubsystem: 'Fuser',
    severity: 'Critical',
    description: 'Cụm nhiệt áp không đạt 100°C trong vòng 35 giây kể từ khi kích hoạt gia nhiệt.',
  },
  {
    id: 'err-005',
    vendor: 'Canon',
    errorCode: 'E001-0001',
    errorName: 'Cảnh báo quá nhiệt cụm sấy (Fuser Overheat)',
    affectedSubsystem: 'Fuser',
    severity: 'Critical',
    description: 'Nhiệt độ cụm sấy phát hiện vượt quá 230°C liên tục trong 1 giây.',
  },
  {
    id: 'err-006',
    vendor: 'HP',
    errorCode: '50.1',
    errorName: 'Fuser Error: Nhiệt độ sấy thấp bất thường',
    affectedSubsystem: 'Fuser',
    severity: 'Critical',
    description: 'Thanh gia nhiệt Ceramic không đạt nhiệt độ vận hành tối thiểu.',
  },
  {
    id: 'err-007',
    vendor: 'HP',
    errorCode: '50.2',
    errorName: 'Fuser Error: Lỗi khởi động chậm cụm sấy',
    affectedSubsystem: 'Fuser',
    severity: 'Warning',
    description: 'Thời gian làm nóng cụm nhiệt áp vượt quá ngưỡng cho phép của bộ điều khiển.',
  },
  {
    id: 'err-008',
    vendor: 'General',
    errorCode: 'JAM-TRAY1',
    errorName: 'Kẹt giấy khay nạp 1 (Tray 1 Misfeed)',
    affectedSubsystem: 'Paper_Feed',
    severity: 'Warning',
    description: 'Giấy không đi qua cảm biến nhận giấy khay 1 trong thời gian quy định.',
  },
  {
    id: 'err-009',
    vendor: 'General',
    errorCode: 'JAM-DUPLEX',
    errorName: 'Kẹt giấy khối đảo mặt tự động (Duplex Jam)',
    affectedSubsystem: 'Paper_Feed',
    severity: 'Warning',
    description: 'Giấy bị kẹt tại cụm cò đảo mặt in 2 mặt tự động.',
  },
  {
    id: 'err-010',
    vendor: 'General',
    errorCode: 'TONER-EMPTY-K',
    errorName: 'Bình mực Đen đã cạn kiệt (Black Toner Empty)',
    affectedSubsystem: 'General',
    severity: 'Critical',
    description: 'Bộ cảm biến mức mực ghi nhận bình mực Đen đạt 0%. Cần thay thế ống mực mới.',
  },
];


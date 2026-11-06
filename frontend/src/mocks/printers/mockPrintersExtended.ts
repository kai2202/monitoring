import { Printer } from '../../types/printer';

export const mockPrintersExtended: Printer[] = [
  // --- 4. EPSON ---
  {
    id: 'prt-013',
    name: 'Epson WF-C879R - P.Truyền Thông',
    ip: '192.168.1.130',
    mfr: 'Epson',
    model: 'WorkForce Pro WF-C879R',
    deviceType: 'Color MFP',
    colorCapability: 'Color',
    serial: 'EPS-C879-88120',
    firmware: 'v1.82',
    connectionStatus: 'Online',
    monitoringStatus: 'Hệ thống mực túi dung lượng lớn (RIPS)',
    status: 'Online',
    alertSeverity: 'clear',
    alertText: 'Mực dồi dào, sẵn sàng in',
    location: 'Tầng 2 - Phòng Truyền thông Đối ngoại',
    snmpStatus: 'SNMP_AGENT_OK',
    lastScrape: new Date(Date.now() - 30 * 1000).toISOString(),
    lastSuccessfulScrape: new Date(Date.now() - 30 * 1000).toISOString(),
    isStale: false,
    health: 'Healthy',
    scannerErr: '',
    adfErr: '',
    copierErr: '',
    mfpErr: '',
    supplies: {
      black: 92,
      cyan: 89,
      magenta: 85,
      yellow: 90,
      waste: 15,
    },
    counters: {
      total: 184000,
      copier: 45000,
      fax: 150,
      scanner: 32000,
    },
    thirtyDayVolume: 12800,
    incidents: [],
  },
  {
    id: 'prt-014',
    name: 'Epson L15150 - P.Kỹ Thuật Phần Mềm',
    ip: '192.168.1.131',
    mfr: 'Epson',
    model: 'EcoTank L15150',
    deviceType: 'Color MFP',
    colorCapability: 'Color',
    serial: 'EPS-L151-22401',
    firmware: 'v1.10',
    connectionStatus: 'Online',
    monitoringStatus: 'Giám sát bình thường',
    status: 'Online',
    alertSeverity: 'clear',
    alertText: 'Hoạt động ổn định',
    location: 'Tầng 3 - Phòng Phát triển Phần mềm',
    snmpStatus: 'SNMP_AGENT_OK',
    lastScrape: new Date(Date.now() - 20 * 1000).toISOString(),
    lastSuccessfulScrape: new Date(Date.now() - 20 * 1000).toISOString(),
    isStale: false,
    health: 'Healthy',
    scannerErr: '',
    adfErr: '',
    copierErr: '',
    mfpErr: '',
    supplies: {
      black: 75,
      cyan: 68,
      magenta: 70,
      yellow: 72,
      waste: 25,
    },
    counters: {
      total: 96500,
      copier: 21000,
      fax: null,
      scanner: 15400,
    },
    thirtyDayVolume: 5400,
    incidents: [],
  },

  // --- 5. ZEBRA (Máy in tem nhãn công nghiệp) ---
  {
    id: 'prt-015',
    name: 'Zebra ZT410 - Kho Thành Phẩm',
    ip: '192.168.1.140',
    mfr: 'Zebra',
    model: 'ZT410 300dpi',
    deviceType: 'Industrial Thermal',
    colorCapability: 'Monochrome',
    serial: 'ZBR-ZT410-66710',
    firmware: 'V75.20.14Z',
    connectionStatus: 'Online',
    monitoringStatus: 'Giám sát in nhiệt tem nhãn mã vạch',
    status: 'Online',
    alertSeverity: 'clear',
    alertText: 'Sẵn sàng in tem nhãn barcode',
    location: 'Kho Trung tâm - Băng chuyền Đóng gói',
    snmpStatus: 'SNMP_AGENT_OK',
    lastScrape: new Date(Date.now() - 10 * 1000).toISOString(),
    lastSuccessfulScrape: new Date(Date.now() - 10 * 1000).toISOString(),
    isStale: false,
    health: 'Healthy',
    scannerErr: '',
    adfErr: '',
    copierErr: '',
    mfpErr: '',
    supplies: {
      black: 80, // Ribbon mực nhiệt
      cyan: null,
      magenta: null,
      yellow: null,
      waste: null,
    },
    counters: {
      total: 512000, // Đếm mét tem nhãn
      copier: null,
      fax: null,
      scanner: null,
    },
    thirtyDayVolume: 42000,
    incidents: [],
  },
  {
    id: 'prt-016',
    name: 'Zebra ZT410 - Kho Nguyên Liệu',
    ip: '192.168.1.141',
    mfr: 'Zebra',
    model: 'ZT410 300dpi',
    deviceType: 'Industrial Thermal',
    colorCapability: 'Monochrome',
    serial: 'ZBR-ZT410-66712',
    firmware: 'V75.20.14Z',
    connectionStatus: 'Online',
    monitoringStatus: 'Giám sát in nhiệt tem nhãn',
    status: 'Online',
    alertSeverity: 'warning',
    alertText: 'Cuộn ruy-băng mực nhiệt gần hết (còn 12%)',
    location: 'Kho Trung tâm - Khu Tiếp nhận Vật tư',
    snmpStatus: 'SNMP_AGENT_OK',
    lastScrape: new Date(Date.now() - 12 * 1000).toISOString(),
    lastSuccessfulScrape: new Date(Date.now() - 12 * 1000).toISOString(),
    isStale: false,
    health: 'Warning',
    scannerErr: '',
    adfErr: '',
    copierErr: '',
    mfpErr: '',
    supplies: {
      black: 12,
      cyan: null,
      magenta: null,
      yellow: null,
      waste: null,
    },
    counters: {
      total: 384000,
      copier: null,
      fax: null,
      scanner: null,
    },
    thirtyDayVolume: 28000,
    incidents: [],
  },

  // --- CÁC THIẾT BỊ BỔ SUNG KHẮP CÁC TẦNG TÒA NHÀ & CHI NHÁNH (Tổng cộng 35 máy) ---
  ...Array.from({ length: 19 }, (_, i) => {
    const idx = i + 17;
    const vendorMap = ['Ricoh', 'Canon', 'HP', 'Epson'] as const;
    const v = vendorMap[i % 4];
    const isColor = i % 2 === 0;
    const isOffline = i === 5 || i === 12; // Tạo 2 máy offline
    const isCriticalToner = i === 1 || i === 8 || i === 15;
    const isWarningToner = i === 3 || i === 10 || i === 17;

    // Phân bổ chi nhánh: 7 máy HQ, 7 máy Miền Nam, 5 máy Miền Trung
    const branchName =
      i < 7
        ? 'Trụ sở chính (HQ)'
        : i < 14
        ? 'Chi nhánh Miền Nam'
        : 'Chi nhánh Miền Trung';

    const floorNum = (i % 3) + 1;
    const floorLabel = `Tầng ${floorNum}`;

    return {
      id: `prt-${idx.toString().padStart(3, '0')}`,
      name: `${v} ${isColor ? 'Color Pro' : 'Laser'} P.${idx} - ${floorLabel}`,
      ip: `192.168.1.${idx + 150}`,
      mfr: v,
      model: isColor ? `${v} MPC-${idx}00` : `${v} M-${idx}0`,
      deviceType: (isColor ? 'Color MFP' : 'Mono Laser') as any,
      colorCapability: (isColor ? 'Color' : 'Monochrome') as any,
      serial: `${v.toUpperCase()}-SN-${idx}9281`,
      firmware: 'v2.40-rel',
      connectionStatus: isOffline ? 'Offline' : 'Online',
      monitoringStatus: isOffline ? 'Mất kết nối giám sát' : 'Giám sát bình thường',
      status: isOffline ? 'Offline' : 'Online',
      alertSeverity: isOffline ? 'critical' : isCriticalToner ? 'critical' : isWarningToner ? 'warning' : 'clear',
      alertText: isOffline ? 'Thiết bị không phản hồi' : isCriticalToner ? 'Mực in khẩn cấp (<15%)' : isWarningToner ? 'Mực in sắp hết (<25%)' : 'Sẵn sàng in',
      branch: branchName,
      floor: floorLabel,
      location: `${branchName} - ${floorLabel} - Phòng ${idx * 10}`,
      snmpStatus: isOffline ? 'SNMP_DOWN' : 'SNMP_AGENT_OK',
      lastScrape: new Date(Date.now() - (isOffline ? 3600000 : 30000)).toISOString(),
      lastSuccessfulScrape: new Date(Date.now() - (isOffline ? 3600000 : 30000)).toISOString(),
      downtimeDuration: isOffline ? '1 giờ 15 phút' : undefined,
      isStale: isOffline,
      health: isOffline ? 'Offline' : isCriticalToner ? 'Critical' : isWarningToner ? 'Warning' : 'Healthy',
      scannerErr: '',
      adfErr: '',
      copierErr: '',
      mfpErr: '',
      supplies: {
        black: isOffline ? null : isCriticalToner ? 8 : isWarningToner ? 18 : 75 + (i % 20),
        cyan: isColor ? (isOffline ? null : isCriticalToner ? 11 : 60 + (i % 30)) : null,
        magenta: isColor ? (isOffline ? null : isWarningToner ? 21 : 50 + (i % 40)) : null,
        yellow: isColor ? (isOffline ? null : 65 + (i % 25)) : null,
        waste: isOffline ? null : isCriticalToner ? 85 : 30 + (i % 45),
      },
      counters: {
        total: 100000 + idx * 8500,
        copier: isColor ? 40000 + idx * 2000 : null,
        fax: null,
        scanner: 15000 + idx * 1000,
      },
      thirtyDayVolume: isOffline ? null : 4500 + idx * 250,
      incidents: [],
    } as Printer;
  }),
];


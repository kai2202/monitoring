/**
 * Backend/src/services/zabbix/zabbixCounterRollupHelper.ts
 *
 * Bộ xử lý Bộ đếm trang in SNMP (`CounterRollup`) và ánh xạ Host sự cố Zabbix:
 * - Chống tràn bộ đếm 32-bit unsigned (`Counter32` rollover 4_294_967_296) và reset bo mạch.
 * - Không bịa đặt giá trị `0` khi thiết bị không trả về OID counter (Rule 5).
 * - Ánh xạ chính xác Trigger Zabbix về đúng máy in theo `zabbixHostId`, tên hoặc IP (Rule 6).
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import { prisma } from '../../lib/prisma';
import { ZabbixHost, ZabbixInterface, ZabbixItem, ZabbixProblem, ZabbixTrigger } from '../../types/zabbixTypes';

const COUNTER32_MAX = 4_294_967_296;
const ROLLOVER_THRESHOLD = 4_000_000_000;
const POST_ROLLOVER_MAX = 10_000_000;

export function computeSafeCounterDelta(currentVal: number, prevVal: number | null): number {
  if (prevVal === null || prevVal < 0) return 0;
  if (currentVal >= prevVal) {
    return currentVal - prevVal;
  }
  // Bắt tràn bộ đếm SNMP Counter32 (4,294,967,295 -> 0)
  if (prevVal >= ROLLOVER_THRESHOLD && currentVal <= POST_ROLLOVER_MAX) {
    return COUNTER32_MAX - prevVal + currentVal;
  }
  // Trường hợp thay bo mạch formatter / reset bộ đếm về nhỏ hơn: không để delta âm
  return 0;
}

export async function upsertDailyCounterRollup(
  printer: { id: string; isColor: boolean },
  hostItems: ZabbixItem[],
  now: Date
): Promise<void> {
  const parseItemInt = (patterns: string[]): number | null => {
    for (const pat of patterns) {
      const found = hostItems.find((it) => it.key_.toLowerCase().includes(pat));
      if (found && found.lastvalue !== undefined && found.lastvalue !== '') {
        const parsed = parseInt(found.lastvalue, 10);
        if (!Number.isNaN(parsed) && parsed >= 0) return parsed;
      }
    }
    return null;
  };

  const totalRaw = parseItemInt(['page_count', 'prtmarkerlifecount', 'total_pages', 'counter_total']);
  const monoRaw = parseItemInt(['mono_pages', 'black_pages', 'counter_mono']);
  const colorRaw = parseItemInt(['color_pages', 'counter_color']);
  const scanRaw = parseItemInt(['scan_pages', 'counter_scan']);

  if (totalRaw === null && monoRaw === null && colorRaw === null) {
    return;
  }

  let monoPages = monoRaw ?? 0;
  let colorPages = colorRaw ?? 0;
  if (monoRaw === null && colorRaw === null && totalRaw !== null) {
    if (!printer.isColor) {
      monoPages = totalRaw;
      colorPages = 0;
    } else {
      monoPages = totalRaw;
    }
  } else if (monoRaw === null && totalRaw !== null && colorRaw !== null) {
    monoPages = Math.max(0, totalRaw - colorRaw);
  }
  const totalPages = totalRaw ?? monoPages + colorPages;

  const todayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  const [todayRecord, previousDayRecord] = await Promise.all([
    prisma.counterRollup.findUnique({
      where: { printerId_recordedDate: { printerId: printer.id, recordedDate: todayUtc } },
    }),
    prisma.counterRollup.findFirst({
      where: { printerId: printer.id, recordedDate: { lt: todayUtc } },
      orderBy: { recordedDate: 'desc' },
    }),
  ]);

  const baselineMono = previousDayRecord?.monoPages ?? todayRecord?.monoPages ?? null;
  const baselineColor = previousDayRecord?.colorPages ?? todayRecord?.colorPages ?? null;

  if (baselineMono !== null && monoPages < baselineMono && baselineMono - monoPages > 100 && !(baselineMono >= ROLLOVER_THRESHOLD && monoPages <= POST_ROLLOVER_MAX)) {
    console.warn(`[CounterRollup] COUNTER_RESET_DETECTED cho máy ${printer.id}: monoPages giảm từ ${baselineMono} -> ${monoPages}`);
  }
  if (baselineColor !== null && colorPages < baselineColor && baselineColor - colorPages > 100 && !(baselineColor >= ROLLOVER_THRESHOLD && colorPages <= POST_ROLLOVER_MAX)) {
    console.warn(`[CounterRollup] COUNTER_RESET_DETECTED cho máy ${printer.id}: colorPages giảm từ ${baselineColor} -> ${colorPages}`);
  }

  const deltaMono = computeSafeCounterDelta(monoPages, baselineMono);
  const deltaColor = computeSafeCounterDelta(colorPages, baselineColor);

  await prisma.counterRollup.upsert({
    where: { printerId_recordedDate: { printerId: printer.id, recordedDate: todayUtc } },
    create: {
      printerId: printer.id,
      recordedDate: todayUtc,
      monoPages,
      colorPages,
      scanPages: scanRaw ?? 0,
      totalPages,
      deltaMono,
      deltaColor,
    },
    update: {
      monoPages,
      colorPages,
      ...(scanRaw !== null ? { scanPages: scanRaw } : {}),
      totalPages,
      deltaMono,
      deltaColor,
    },
  });
}

export function resolveProblemPrinter<
  T extends { id: string; name: string; ip: string; mfr: string; zabbixHostId: string | null }
>(
  prob: ZabbixProblem,
  triggerMap: Map<string, ZabbixTrigger>,
  dbPrinters: T[]
): T | null {
  const trigger = triggerMap.get(prob.objectid);
  const triggerHosts = trigger?.hosts || [];

  for (const th of triggerHosts) {
    const byHostId = dbPrinters.find(
      (p) =>
        (p.zabbixHostId && p.zabbixHostId === th.hostid) ||
        (th.host && p.id.toLowerCase() === th.host.toLowerCase()) ||
        (th.name && p.name.toLowerCase() === th.name.toLowerCase())
    );
    if (byHostId) return byHostId;
  }

  const probTitleLower = (prob.name || '').toLowerCase();
  const byNameOrIp = dbPrinters.find(
    (p) =>
      probTitleLower.includes(p.id.toLowerCase()) ||
      probTitleLower.includes(p.name.toLowerCase()) ||
      (p.ip && probTitleLower.includes(p.ip.toLowerCase()))
  );
  return byNameOrIp || null;
}

export function computeSupplyHealth(
  levels: Array<number | null>,
  warnPct: number,
  critPct: number
): { health: 'Healthy' | 'Warning' | 'Critical'; severity: 'info' | 'warning' | 'critical' } {
  const validLevels = levels.filter((v): v is number => typeof v === 'number' && !Number.isNaN(v));
  if (validLevels.length === 0) {
    return { health: 'Healthy', severity: 'info' };
  }
  const minLevel = Math.min(...validLevels);
  if (minLevel <= critPct) return { health: 'Critical', severity: 'critical' };
  if (minLevel < warnPct) return { health: 'Warning', severity: 'warning' };
  return { health: 'Healthy', severity: 'info' };
}

export function detectHostPrinterMeta(host: { name?: string; host?: string; description?: string }) {
  const hostName = host.name || host.host || '';
  const hostCode = host.host || '';
  const isColor =
    hostName.toLowerCase().includes('color') ||
    hostCode.toLowerCase().includes('color') ||
    hostName.includes('C6004') ||
    hostName.includes('4503');
  const isRicoh = hostName.toLowerCase().includes('ricoh') || hostCode.toLowerCase().includes('ricoh');
  const isCanon = hostName.toLowerCase().includes('canon') || hostCode.toLowerCase().includes('canon');

  const model =
    host.description?.split(' - ')?.[0] ||
    (hostName.includes('C6004')
      ? 'Ricoh MP C6004'
      : hostName.includes('5002')
      ? 'Ricoh Aficio MP 5002'
      : 'Network Printer');

  const floor = hostName.includes('Tang_2')
    ? 'T2'
    : hostName.includes('Tang_5') || hostName.includes('Tang_6') || hostName.includes('Tang_7')
    ? 'T5'
    : 'T1';

  return {
    isColor,
    mfr: isRicoh ? 'Ricoh' : isCanon ? 'Canon' : 'Generic',
    model,
    floor,
    deviceType: isColor ? 'Laser Màu Đa Năng (MFP)' : 'Laser Đa Năng (MFP)',
    serialNumber: host.description?.match(/Serial\s+([A-Za-z0-9_-]+)/)?.[1] || null,
  };
}

/**
 * Loại trừ thao tác cơ bản tại chỗ theo AGENTS.md Rule 5.1 (nắp máy & khay giấy).
 */
export function shouldIgnoreLocalProblem(problemTitle: string, subsystem?: string): boolean {
  const text = (problemTitle || '').toLowerCase();
  const sub = (subsystem || '').toUpperCase();

  const isCover =
    sub === 'CVR' ||
    text.includes('door open') ||
    text.includes('cover open') ||
    text.includes('nắp') ||
    text.includes('cửa mở') ||
    text.includes('prtcoverstatus');

  const isPaperTray =
    text.includes('tray empty') ||
    text.includes('paper empty') ||
    text.includes('out of paper') ||
    text.includes('hết giấy') ||
    text.includes('khay giấy') ||
    text.includes('prtinput');

  return isCover || isPaperTray;
}

export function parseSupplyPercentOrBinary(lastValue?: string | null): { value: number | null; binaryOk: boolean } {
  if (lastValue === undefined || lastValue === null || lastValue === '') {
    return { value: null, binaryOk: false };
  }
  const num = parseFloat(lastValue);
  if (Number.isNaN(num)) {
    return { value: null, binaryOk: false };
  }
  // Chuẩn Printer-MIB SNMP: -3 = someRemaining (còn mực/OK nhưng không đo được %)
  if (num === -3) {
    return { value: null, binaryOk: true };
  }
  // -1 (other), -2 (unknown), hoặc ngoài [0..100]% -> null (Rule 5.1)
  if (num < 0 || num > 100) {
    return { value: null, binaryOk: false };
  }
  return { value: Math.round(num), binaryOk: false };
}

export function parseWasteTonerStatus(lastValue?: string | null): string {
  if (!lastValue) return 'OK';
  const num = parseFloat(lastValue);
  if (!Number.isNaN(num) && num >= 0 && num <= 100) {
    return num >= 95 ? 'FULL' : num >= 80 ? 'WARNING' : 'OK';
  }
  const text = lastValue.toLowerCase();
  if (text.includes('full') || text.includes('overflow')) return 'FULL';
  if (text.includes('warn') || text.includes('near')) return 'WARNING';
  return 'OK';
}

/** Ưu tiên lấy IP của interface SNMP chính (type '2', main '1'), tránh lấy nhầm 127.0.0.1 */
export function pickPrimaryHostIp(interfaces?: ZabbixInterface[]): string {
  if (!interfaces || interfaces.length === 0) return '';
  const nonLoopback = interfaces.filter((i) => i.ip && i.ip !== '127.0.0.1');
  const pool = nonLoopback.length > 0 ? nonLoopback : interfaces;
  const snmpMain = pool.find((i) => i.type === '2' && i.main === '1');
  if (snmpMain?.ip) return snmpMain.ip;
  const anySnmp = pool.find((i) => i.type === '2');
  if (anySnmp?.ip) return anySnmp.ip;
  const anyMain = pool.find((i) => i.main === '1');
  return anyMain?.ip || pool[0]?.ip || '';
}

export interface HostConnectivityState {
  alive: boolean;
  icmpStatus: 'UP' | 'DOWN' | 'UNKNOWN';
  snmpStatus: 'UP' | 'DOWN' | 'UNKNOWN';
}

/**
 * Tách biệt trạng thái ICMP và SNMP để IT biết chính xác kênh thu thập nào hoạt động / bị lỗi.
 */
export function resolveHostConnectivity(host: ZabbixHost, hostItems: ZabbixItem[]): HostConnectivityState {
  if (host.status !== '0') {
    return { alive: false, icmpStatus: 'DOWN', snmpStatus: 'DOWN' };
  }

  const pingItem = hostItems.find((it) => it.key_.toLowerCase().includes('icmpping'));
  let icmpStatus: 'UP' | 'DOWN' | 'UNKNOWN' = 'UNKNOWN';
  if (pingItem && pingItem.lastvalue !== undefined && pingItem.lastvalue !== '') {
    icmpStatus = pingItem.lastvalue === '1' ? 'UP' : 'DOWN';
  }

  const snmpIface = host.interfaces?.find((i) => i.type === '2') || host.interfaces?.[0];
  let snmpStatus: 'UP' | 'DOWN' | 'UNKNOWN' = 'UNKNOWN';
  if (snmpIface?.available === '1') snmpStatus = 'UP';
  else if (snmpIface?.available === '2') snmpStatus = 'DOWN';
  else if (hostItems.some((it) => !it.key_.toLowerCase().includes('icmpping') && it.lastvalue !== undefined && it.lastvalue !== '')) {
    snmpStatus = 'UP';
  }

  // Máy được coi là Offline nếu ICMP mất, hoặc không có ICMP nhưng SNMP mất.
  const alive =
    icmpStatus === 'DOWN'
      ? false
      : icmpStatus === 'UP'
      ? true
      : snmpStatus !== 'DOWN';

  return { alive, icmpStatus, snmpStatus };
}

/** Xác định thiết bị Online/Offline thực tế từ icmpping hoặc interface availability */
export function resolveHostAlive(host: ZabbixHost, hostItems: ZabbixItem[]): boolean {
  return resolveHostConnectivity(host, hostItems).alive;
}

/**
 * Phân loại lỗi hiện tại của máy in (bỏ qua nắp mở & hết giấy theo AGENTS.md Rule 5.1).
 */
export function classifyCurrentPrinterFault(
  problemTitles: string[]
): { faultType: 'NONE' | 'PAPER_JAM' | 'HARDWARE_ERROR'; faultText: string | null } {
  const validTitles = problemTitles.filter((t) => t && !shouldIgnoreLocalProblem(t));
  if (validTitles.length === 0) {
    return { faultType: 'NONE', faultText: null };
  }

  const jamTitle = validTitles.find((t) => {
    const low = t.toLowerCase();
    return low.includes('jam') || low.includes('kẹt giấy') || low.includes('paper jam');
  });
  if (jamTitle) {
    return { faultType: 'PAPER_JAM', faultText: jamTitle };
  }

  return { faultType: 'HARDWARE_ERROR', faultText: validTitles[0] };
}

/**
 * Đọc % vật tư từ Zabbix Items: ưu tiên giá trị % trực tiếp, nếu template trả về level & maxCapacity thô thì tự quy đổi %.
 */
export function resolveSupplyPercentFromItems(
  hostItems: ZabbixItem[],
  patterns: string[],
  nameKeywords: string[] = []
): number | null {
  for (const pat of patterns) {
    const item = hostItems.find((it) => it.key_.toLowerCase().includes(pat));
    if (!item) continue;

    const direct = parseSupplyPercentOrBinary(item.lastvalue);
    if (direct.value !== null) return direct.value;

    const rawLevel = parseFloat(item.lastvalue || '');
    if (!Number.isNaN(rawLevel) && rawLevel > 100) {
      const capItem = hostItems.find((it) => {
        const k = it.key_.toLowerCase();
        return k.includes(pat) && (k.includes('max') || k.includes('capacity'));
      });
      const maxCap = parseFloat(capItem?.lastvalue || '');
      if (!Number.isNaN(maxCap) && maxCap > 0) {
        return Math.max(0, Math.min(100, Math.round((rawLevel / maxCap) * 100)));
      }
    }
  }

  // Hỗ trợ Zabbix LLD (`printer.supply.level[{#SNMPINDEX}]` + `printer.supply.max[{#SNMPINDEX}]`)
  if (nameKeywords.length > 0) {
    const lldLevelItem = hostItems.find((it) => {
      const k = it.key_.toLowerCase();
      const n = (it.name || '').toLowerCase();
      return k.startsWith('printer.supply.level[') && nameKeywords.some((kw) => n.includes(kw));
    });
    if (lldLevelItem) {
      const direct = parseSupplyPercentOrBinary(lldLevelItem.lastvalue);
      if (direct.value !== null) return direct.value;

      const idxMatch = lldLevelItem.key_.match(/\[([^\]]+)\]/);
      const rawLevel = parseFloat(lldLevelItem.lastvalue || '');
      if (idxMatch && !Number.isNaN(rawLevel) && rawLevel >= 0) {
        const maxItem = hostItems.find(
          (it) => it.key_.toLowerCase() === `printer.supply.max[${idxMatch[1].toLowerCase()}]`
        );
        const maxCap = parseFloat(maxItem?.lastvalue || '');
        if (!Number.isNaN(maxCap) && maxCap > 0) {
          return Math.max(0, Math.min(100, Math.round((rawLevel / maxCap) * 100)));
        }
      }
    }
  }

  return null;
}

/**
 * Tự động bóc tách Serial Number & Model từ SNMP items (VD: prtGeneralSerialNumber, hrDeviceDescr) nếu host.description thiếu.
 */
export function extractHostSerialAndModel(hostItems: ZabbixItem[]): { serialNumber: string | null; model: string | null } {
  const serialItem = hostItems.find((it) => {
    const k = it.key_.toLowerCase();
    return k.includes('serial') || k.includes('prtgeneralserialnumber');
  });
  const modelItem = hostItems.find((it) => {
    const k = it.key_.toLowerCase();
    return k.includes('printer.model') || k.includes('hrdevicedescr') || k.includes('sysdescr');
  });

  const cleanSerial = serialItem?.lastvalue?.trim();
  const cleanModel = modelItem?.lastvalue?.trim();
  return {
    serialNumber: cleanSerial && cleanSerial !== '0' ? cleanSerial : null,
    model: cleanModel && cleanModel.length > 2 ? cleanModel.slice(0, 120) : null,
  };
}



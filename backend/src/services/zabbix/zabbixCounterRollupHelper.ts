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
import { ZabbixItem, ZabbixProblem, ZabbixTrigger } from '../../types/zabbixTypes';

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


/**
 * Backend/src/services/zabbix/siteSubnetResolver.ts
 *
 * Phân giải Site / Chi nhánh cho máy in dựa trên dải mạng IP (CIDR) hoặc Zabbix Host Group:
 * - Hỗ trợ quy mô nhiều site (VD: 24 site, mỗi site một dải IP riêng).
 * - Khi không khớp dải CIDR, fallback về tên Host Group trên Zabbix (bỏ qua group hệ thống chung).
 */

export interface SiteSubnetRule {
  siteName: string;
  subnetCidr: string | null;
}

const GENERIC_ZABBIX_GROUPS = new Set([
  'printers',
  'network printers',
  'discovered hosts',
  'templates',
  'templates/network devices',
  'linux servers',
  'windows servers',
]);

function ipv4ToInt(ip: string): number | null {
  const parts = ip.trim().split('.');
  if (parts.length !== 4) return null;
  let result = 0;
  for (const part of parts) {
    if (!/^\d+$/.test(part)) return null;
    const num = Number(part);
    if (num < 0 || num > 255) return null;
    result = (result << 8) | num;
  }
  return result >>> 0;
}

export function isIpInCidr(ip: string, cidr: string): boolean {
  const [networkStr, prefixStr] = cidr.trim().split('/');
  if (!networkStr || prefixStr === undefined) return false;

  const ipInt = ipv4ToInt(ip);
  const netInt = ipv4ToInt(networkStr);
  const prefix = Number(prefixStr);

  if (ipInt === null || netInt === null || !Number.isInteger(prefix) || prefix < 0 || prefix > 32) {
    return false;
  }
  if (prefix === 0) return true;

  const mask = (0xffffffff << (32 - prefix)) >>> 0;
  return (ipInt & mask) === (netInt & mask);
}

/**
 * Tìm Site/Chi nhánh phù hợp nhất cho máy in theo IP (ưu tiên CIDR dài nhất) hoặc Zabbix Host Group.
 */
export function resolveSiteForPrinter(
  ip: string,
  rules: SiteSubnetRule[],
  zabbixGroups?: Array<{ name?: string }>
): string | null {
  let bestMatch: { siteName: string; prefixLen: number } | null = null;

  for (const rule of rules) {
    if (!rule.subnetCidr || !rule.siteName) continue;
    const cidrs = rule.subnetCidr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    for (const cidr of cidrs) {
      if (isIpInCidr(ip, cidr)) {
        const prefixLen = Number(cidr.split('/')[1] || 0);
        if (!bestMatch || prefixLen > bestMatch.prefixLen) {
          bestMatch = { siteName: rule.siteName.trim(), prefixLen };
        }
      }
    }
  }

  if (bestMatch) return bestMatch.siteName;

  if (Array.isArray(zabbixGroups)) {
    for (const grp of zabbixGroups) {
      const name = (grp.name || '').trim();
      if (name && !GENERIC_ZABBIX_GROUPS.has(name.toLowerCase())) {
        return name;
      }
    }
  }

  return null;
}

/**
 * Frontend/src/features/dashboard/components/SiteSummaryPanel.tsx
 *
 * Khối tổng hợp trạng thái máy in gom theo từng Site / Chi nhánh (hỗ trợ quy mô ~24 site):
 * - Hiển thị số máy Tổng, Online, Offline, Lỗi SNMP, Mực < 15%, Đang có lỗi phần cứng/kẹt giấy.
 * - Nhấp vào 1 site để lọc nhanh Dashboard theo site đó.
 */

import React, { useMemo } from 'react';
import { Printer } from '../../../types/printer';
import { FontAwesomeIcon, faBuilding } from '../../../shared/icons';

interface SiteSummaryRow {
  site: string;
  total: number;
  online: number;
  offline: number;
  snmpError: number;
  lowToner: number;
  faulted: number;
}

export interface SiteSummaryPanelProps {
  printers: Printer[];
  selectedBranch: string;
  onSelectBranch: (site: string) => void;
}

function hasLowTonerUnder15(p: Printer): boolean {
  const s = p.supplies;
  if (!s) return false;
  const levels = [s.black, s.cyan, s.magenta, s.yellow].filter(
    (v): v is number => typeof v === 'number' && !Number.isNaN(v)
  );
  return levels.some((v) => v < 15);
}

export const SiteSummaryPanel: React.FC<SiteSummaryPanelProps> = ({
  printers,
  selectedBranch,
  onSelectBranch,
}) => {
  const siteRows = useMemo<SiteSummaryRow[]>(() => {
    const map = new Map<string, SiteSummaryRow>();
    for (const p of printers) {
      const site = (p.branch || p.building || 'Chưa phân Site').trim();
      const row = map.get(site) || {
        site,
        total: 0,
        online: 0,
        offline: 0,
        snmpError: 0,
        lowToner: 0,
        faulted: 0,
      };
      row.total++;
      if (p.connectionStatus === 'Online') row.online++;
      else row.offline++;
      if (p.snmpStatus === 'DOWN') row.snmpError++;
      if (hasLowTonerUnder15(p)) row.lowToner++;
      if (p.currentFaultType && p.currentFaultType !== 'NONE') row.faulted++;
      map.set(site, row);
    }

    return Array.from(map.values()).sort((a, b) => {
      const aIssues = a.offline + a.faulted + a.lowToner;
      const bIssues = b.offline + b.faulted + b.lowToner;
      if (bIssues !== aIssues) return bIssues - aIssues;
      return a.site.localeCompare(b.site, 'vi');
    });
  }, [printers]);

  if (siteRows.length === 0) return null;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={faBuilding} className="text-blue-600 text-sm" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 m-0">
            Tổng hợp theo Site / Chi nhánh ({siteRows.length} site)
          </h3>
        </div>
        {selectedBranch !== 'all' && (
          <button
            type="button"
            onClick={() => onSelectBranch('all')}
            className="text-xs font-semibold text-blue-600 hover:underline bg-transparent border-0 cursor-pointer"
          >
            Xem tất cả site
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {siteRows.map((row) => {
          const isSelected = selectedBranch.toLowerCase() === row.site.toLowerCase();
          const hasAlert = row.offline > 0 || row.faulted > 0 || row.lowToner > 0 || row.snmpError > 0;
          return (
            <button
              key={row.site}
              type="button"
              onClick={() => onSelectBranch(isSelected ? 'all' : row.site)}
              className={`text-left rounded-lg border p-3 transition-all cursor-pointer ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/30'
                  : hasAlert
                  ? 'border-amber-200 dark:border-amber-900/50 bg-slate-50/50 dark:bg-slate-800/40 hover:border-blue-400'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-blue-400'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate" title={row.site}>
                  {row.site}
                </span>
                <span className="text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300">
                  {row.online}/{row.total} Online
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap text-[10.5px]">
                {row.offline > 0 && (
                  <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 font-semibold">
                    {row.offline} Offline
                  </span>
                )}
                {row.snmpError > 0 && (
                  <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold">
                    {row.snmpError} Lỗi SNMP
                  </span>
                )}
                {row.lowToner > 0 && (
                  <span className="px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 font-semibold">
                    {row.lowToner} Mực &lt;15%
                  </span>
                )}
                {row.faulted > 0 && (
                  <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 font-semibold">
                    {row.faulted} Lỗi máy
                  </span>
                )}
                {!hasAlert && (
                  <span className="text-emerald-600 font-medium">Hoạt động ổn định</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

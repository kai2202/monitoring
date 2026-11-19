/**
 * Frontend/src/features/dashboard/components/diagnostics/DiagnosticsCmykTab.tsx
 *
 * Tab Chẩn Đoán & Vật Tư trong Diagnostics Drawer:
 * - Thanh Telemetry 4 chỉ số: Kết nối SNMP, Tổng trang in, Sản lượng 30 ngày, Quét gần nhất.
 * - Bố cục 2 cột phẳng hiện đại: Mức vật tư CMYK/Waste (Trái) & Chẩn đoán phần cứng + Thông số (Phải).
 * - Tuân thủ AGENTS.md Rule 5 (MetricValue, không bịa dữ liệu khi null, tách biệt Connectivity vs Hardware Error) & Rule 7.1 (< 300 LOC).
 */

import React from 'react';
import {
  FontAwesomeIcon,
  faBox,
  faChartLine,
  faTriangleExclamation,
  faShieldCheck,
  faWifi,
  faPrint,
  faClock,
} from '../../../../shared/icons';
import { Printer } from '../../../../types/printer';
import { ScrambleNumber } from '../../../../shared/components/ScrambleNumber';

interface DiagnosticsCmykTabProps {
  printer: Printer;
}

const formatTimestamp = (value?: string | null): string => {
  if (!value) return 'Chưa có dữ liệu';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return `${parsed.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} • ${parsed.toLocaleDateString('vi-VN')}`;
};

export const DiagnosticsCmykTab: React.FC<DiagnosticsCmykTabProps> = ({ printer }) => {
  const supplies = printer.supplies || { cyan: null, magenta: null, yellow: null, black: null, waste: null };
  const counters = printer.counters || { total: null, copier: null, fax: null, scanner: null };

  const isColorPrinter =
    printer.colorCapability === 'Color' ||
    printer.deviceType === 'Color MFP' ||
    supplies.cyan !== null ||
    supplies.magenta !== null ||
    supplies.yellow !== null;

  const cmykTracks = [
    { label: 'Cyan (Xanh)', val: supplies.cyan, color: '#06b6d4', isColorTrack: true },
    { label: 'Magenta (Hồng)', val: supplies.magenta, color: '#ec4899', isColorTrack: true },
    { label: 'Yellow (Vàng)', val: supplies.yellow, color: '#eab308', isColorTrack: true },
    { label: 'Black (Đen)', val: supplies.black, color: '#0f172a', isColorTrack: false },
  ];

  const isOffline = printer.connectionStatus === 'Offline' || printer.status === 'Offline';
  const isConnUnknown = printer.connectionStatus === 'Unknown';
  const hasHardwareAlert =
    printer.alertSeverity === 'critical' ||
    printer.alertSeverity === 'warning' ||
    Boolean(printer.diagnostic?.errorCode) ||
    (Boolean(printer.alertText) && !printer.alertText.toLowerCase().includes('bình thường'));

  const lastScrapeValue = printer.lastSuccessfulScrape || printer.lastScrape;
  const volume30d = printer.thirtyDayVolume ?? null;

  return (
    <div className="p-5 flex flex-col gap-4">
      {/* Banner trạng thái Lưu kho hoặc Dữ liệu đã cũ */}
      {printer.monitoringStatus === 'Storage' && (
        <div className="px-3.5 py-2.5 rounded-lg bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200 border-l-4 border-l-slate-500 flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
          <FontAwesomeIcon icon={faBox} className="text-slate-500 shrink-0" />
          <span>
            <strong>Thiết bị đang lưu kho dự phòng:</strong> Tạm ngưng thu thập SNMP. Bấm <strong>"Giám sát lại"</strong> trên thanh tiêu đề để khôi phục.
          </span>
        </div>
      )}

      {printer.isStale && printer.monitoringStatus !== 'Storage' && (
        <div className="px-3.5 py-2.5 rounded-lg bg-amber-50/80 border border-amber-200 border-l-4 border-l-amber-500 flex items-center gap-2.5 text-xs text-amber-900">
          <FontAwesomeIcon icon={faClock} className="text-amber-600 shrink-0" />
          <span>
            <strong>Dữ liệu đã cũ:</strong> Lần đồng bộ thành công gần nhất đã quá ngưỡng tươi mới; thông số hiện tại có thể chưa phản ánh trạng thái tức thời.
          </span>
        </div>
      )}

      {/* 1. Thanh Telemetry 4 chỉ số thực */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-800 overflow-hidden">
        <div className="px-4 py-3 flex flex-col gap-1">
          <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
            <FontAwesomeIcon icon={faWifi} className={isOffline ? 'text-rose-500' : isConnUnknown ? 'text-slate-400' : 'text-emerald-500'} />
            <span>Kết nối &amp; SNMP</span>
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`text-xs font-bold ${isOffline ? 'text-rose-600' : isConnUnknown ? 'text-slate-500' : 'text-emerald-600'}`}>
              {printer.connectionStatus || printer.status || 'Chưa rõ'}
            </span>
          </div>
          <div className="flex items-center gap-1 flex-wrap mt-0.5">
            {printer.icmpStatus && printer.icmpStatus !== 'UNKNOWN' && (
              <span
                className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded border ${
                  printer.icmpStatus === 'UP'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}
              >
                ICMP:{printer.icmpStatus === 'UP' ? 'OK' : 'Lỗi'}
              </span>
            )}
            {printer.snmpStatus && printer.snmpStatus !== 'UNKNOWN' && (() => {
              const snmpOk =
                printer.snmpStatus === 'UP' ||
                printer.snmpStatus === 'SNMP_AGENT_OK' ||
                printer.snmpStatus === 'OK';
              return (
                <span
                  className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded border ${
                    snmpOk
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  SNMP:{snmpOk ? 'OK' : 'Lỗi'}
                </span>
              );
            })()}
          </div>
          {isOffline && printer.downtimeDuration && (
            <span className="text-[10.5px] text-rose-500 font-medium">Mất kết nối: {printer.downtimeDuration}</span>
          )}
        </div>

        <div className="px-4 py-3 flex flex-col gap-1">
          <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
            <FontAwesomeIcon icon={faPrint} className="text-blue-500" />
            <span>Tổng trang in</span>
          </span>
          <strong className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100">
            {counters.total !== null && counters.total !== undefined ? (
              <ScrambleNumber value={counters.total} durationMs={400} />
            ) : (
              '—'
            )}
          </strong>
          {(counters.copier !== null || counters.scanner !== null) && (
            <span className="text-[10.5px] text-slate-400 font-mono">
              Copy: {counters.copier !== null ? counters.copier.toLocaleString('vi-VN') : '—'} • Scan: {counters.scanner !== null ? counters.scanner.toLocaleString('vi-VN') : '—'}
            </span>
          )}
        </div>

        <div className="px-4 py-3 flex flex-col gap-1">
          <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
            <FontAwesomeIcon icon={faChartLine} className="text-indigo-500" />
            <span>Sản lượng 30 ngày</span>
          </span>
          <strong className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100">
            {volume30d !== null && volume30d !== undefined ? (
              <ScrambleNumber value={volume30d} durationMs={400} />
            ) : (
              '—'
            )}
          </strong>
          {counters.fax !== null && (
            <span className="text-[10.5px] text-slate-400 font-mono">Fax: {counters.fax.toLocaleString('vi-VN')}</span>
          )}
        </div>

        <div className="px-4 py-3 flex flex-col gap-1">
          <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
            <FontAwesomeIcon icon={faClock} className="text-slate-400" />
            <span>Quét gần nhất</span>
          </span>
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            {formatTimestamp(lastScrapeValue)}
          </span>
          {printer.isStale && (
            <span className="text-[10px] font-semibold text-amber-600">Dữ liệu đã cũ</span>
          )}
        </div>
      </div>

      {/* 2. Lưới 2 cột phẳng: Vật tư (Trái) & Chẩn đoán + Thông số (Phải) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Cột trái: Vật tư & Hộp mực */}
        <div className="lg:col-span-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex flex-col gap-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faBox} className="text-blue-600 text-xs" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100 m-0">
                Mực In &amp; Vật Tư Tiêu Hao
              </h4>
            </div>
            <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {isColorPrinter ? 'CMYK' : 'Đơn sắc'}
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {cmykTracks.map((t) => {
              const isUnsupportedColor = !isColorPrinter && t.isColorTrack;
              const hasVal = !isUnsupportedColor && t.val !== null && t.val !== undefined;
              const pct = hasVal ? Math.max(0, Math.min(100, t.val!)) : 0;
              const isLow = hasVal && pct < 15;

              return (
                <div key={t.label} className={`flex flex-col gap-1 ${isUnsupportedColor ? 'opacity-50' : ''}`}>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-slate-600 dark:text-slate-300">{t.label}</span>
                    {isUnsupportedColor ? (
                      <span className="text-[10.5px] font-medium text-slate-400">Không hỗ trợ</span>
                    ) : (
                      <strong className={`font-mono ${isLow ? 'text-rose-600' : 'text-slate-900 dark:text-slate-100'}`}>
                        {hasVal ? <ScrambleNumber value={`${pct}%`} durationMs={350} /> : '—'}
                      </strong>
                    )}
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    {hasVal && (
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${pct}%`, backgroundColor: isLow ? '#ef4444' : t.color }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500">Hộp mực thải (Waste Toner)</span>
            <strong
              className={`font-mono ${
                supplies.waste === null || supplies.waste === undefined
                  ? 'text-slate-400'
                  : supplies.waste > 85
                  ? 'text-rose-600'
                  : 'text-emerald-600'
              }`}
            >
              {supplies.waste !== null && supplies.waste !== undefined ? `${supplies.waste}%` : '—'}
            </strong>
          </div>
        </div>

        {/* Cột phải: Chẩn đoán lỗi phần cứng & Thông số thiết bị */}
        <div className="lg:col-span-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
          <div className={`p-4 flex flex-col gap-2 ${hasHardwareAlert ? 'bg-rose-50/50 dark:bg-rose-950/20' : ''}`}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon
                  icon={hasHardwareAlert ? faTriangleExclamation : faShieldCheck}
                  className={`text-xs ${hasHardwareAlert ? 'text-rose-600' : 'text-emerald-600'}`}
                />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100 m-0">
                  Lỗi Phần Cứng &amp; Chẩn Đoán
                </h4>
              </div>
              {printer.currentFaultType && printer.currentFaultType !== 'NONE' && (
                <span
                  className={`text-[10.5px] font-bold px-2 py-0.5 rounded border ${
                    printer.currentFaultType === 'PAPER_JAM'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-rose-100 text-rose-700 border-rose-200'
                  }`}
                >
                  {printer.currentFaultType === 'PAPER_JAM' ? 'Kẹt giấy' : 'Lỗi phần cứng'}
                </span>
              )}
              {printer.diagnostic?.errorCode && (
                <span className="text-[10.5px] font-mono font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-700">
                  {printer.diagnostic.errorCode}
                </span>
              )}
            </div>

            <p className={`text-xs m-0 leading-relaxed ${hasHardwareAlert || (printer.currentFaultType && printer.currentFaultType !== 'NONE') ? 'text-rose-700 dark:text-rose-300 font-medium' : 'text-slate-500'}`}>
              {printer.currentFaultText || printer.diagnostic?.recommendedActionSummary || printer.alertText || 'Chưa ghi nhận mã lỗi phần cứng từ hệ thống giám sát.'}
            </p>

            {printer.diagnostic?.subsystem && (
              <div className="text-[11px] text-slate-500 flex items-center gap-2 flex-wrap">
                <span>Phân hệ: <strong className="text-slate-700 dark:text-slate-200">{printer.diagnostic.subsystem}</strong></span>
                {printer.diagnostic.componentName && <span>• Bộ phận: {printer.diagnostic.componentName}</span>}
              </div>
            )}
          </div>

          <div className="p-4 flex flex-col gap-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100 m-0">
              Thông Số Thiết Bị
            </h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              <div>
                <div className="text-[10.5px] text-slate-400">Site / Chi nhánh</div>
                <div className="font-semibold text-slate-800 dark:text-slate-200 truncate" title={printer.branch || printer.building}>
                  {printer.branch || printer.building || '—'}
                </div>
              </div>
              <div>
                <div className="text-[10.5px] text-slate-400">Tầng &amp; Phòng</div>
                <div className="font-semibold text-slate-800 dark:text-slate-200 truncate" title={printer.location}>
                  {[printer.floor, printer.room || printer.department].filter(Boolean).join(' • ') || printer.location || '—'}
                </div>
              </div>
              <div>
                <div className="text-[10.5px] text-slate-400">Hãng sản xuất</div>
                <div className="font-semibold text-slate-800 dark:text-slate-200">{printer.mfr || '—'}</div>
              </div>
              <div>
                <div className="text-[10.5px] text-slate-400">Dòng máy</div>
                <div className="font-semibold text-slate-800 dark:text-slate-200 truncate" title={printer.model}>{printer.model || '—'}</div>
              </div>
              <div>
                <div className="text-[10.5px] text-slate-400">Serial</div>
                <div className="font-semibold font-mono text-slate-800 dark:text-slate-200">{printer.serial || '—'}</div>
              </div>
              <div>
                <div className="text-[10.5px] text-slate-400">Địa chỉ IP</div>
                <div className="font-semibold font-mono text-slate-800 dark:text-slate-200">{printer.ip || '—'}</div>
              </div>
              <div>
                <div className="text-[10.5px] text-slate-400">Loại thiết bị</div>
                <div className="font-semibold text-slate-800 dark:text-slate-200">{printer.deviceType || '—'}</div>
              </div>
              <div>
                <div className="text-[10.5px] text-slate-400">Firmware</div>
                <div className="font-semibold font-mono text-slate-800 dark:text-slate-200 truncate">{printer.firmware || '—'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticsCmykTab;

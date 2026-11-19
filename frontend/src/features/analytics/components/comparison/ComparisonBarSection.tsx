/**
 * Frontend/src/features/analytics/components/comparison/ComparisonBarSection.tsx
 *
 * Biểu Đồ Cột Ngang Đối Chiếu Thiết Bị (Visual Comparison Tab):
 * - So sánh trực quan theo 5 chỉ số kỹ thuật thực tế.
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import React from 'react';
import { ComparisonDeviceKPIs, ComparisonMetricKey, ComparisonMetricTab } from '../../../../types/analyticsUI';

export const COMPARISON_TABS: ComparisonMetricTab[] = [
  { key: 'totalPages', label: 'Sản lượng in', unit: 'trang', description: 'Tổng số trang in tích lũy' },
  { key: 'ppmActual', label: 'Tốc độ thực tế', unit: 'PPM', description: 'Số trang in thực tế mỗi phút' },
  { key: 'uptimePercent', label: 'Độ khả dụng', unit: '%', description: 'Tỷ lệ thời gian máy sẵn sàng phục vụ' },
  { key: 'mtbfHours', label: 'Độ ổn định (MTBF)', unit: 'giờ', description: 'Thời gian trung bình giữa 2 lần lỗi' },
  { key: 'failureCount', label: 'Số lần sự cố', unit: 'lần', description: 'Tổng số sự cố phần cứng ghi nhận' },
];

interface ComparisonBarSectionProps {
  devicesKPIs: ComparisonDeviceKPIs[];
  activeMetricKey: ComparisonMetricKey;
  onSelectMetric: (key: ComparisonMetricKey) => void;
  maxMetricValue: number;
  currentTab: ComparisonMetricTab;
}

export const ComparisonBarSection: React.FC<ComparisonBarSectionProps> = ({
  devicesKPIs,
  activeMetricKey,
  onSelectMetric,
  maxMetricValue,
  currentTab,
}) => {
  return (
    <div className="p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 m-0">
            Biểu Đồ Đối Chiếu Chỉ Số
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 mb-0">
            {currentTab.description} ({currentTab.unit})
          </p>
        </div>

        <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 overflow-x-auto max-w-full">
          {COMPARISON_TABS.map((tab) => {
            const isActive = activeMetricKey === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => onSelectMetric(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3.5">
        {devicesKPIs.map((d) => {
          const rawVal = d[activeMetricKey];
          const numVal = typeof rawVal === 'number' ? rawVal : null;
          const widthPercent = numVal !== null && maxMetricValue > 0 ? Math.max(4, (numVal / maxMetricValue) * 100) : 0;

          return (
            <div key={d.printerId} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: d.color }}
                  />
                  <span className="font-bold text-slate-800 dark:text-slate-100 truncate">
                    {d.printerName}
                  </span>
                  <span className="text-[11px] text-slate-400 shrink-0">
                    ({d.floor})
                  </span>
                </div>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100 shrink-0">
                  {numVal !== null ? `${numVal.toLocaleString('vi-VN')} ${currentTab.unit}` : '—'}
                </span>
              </div>

              <div className="w-full h-3 rounded-full bg-slate-200/70 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${widthPercent}%`,
                    backgroundColor: d.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ComparisonBarSection;

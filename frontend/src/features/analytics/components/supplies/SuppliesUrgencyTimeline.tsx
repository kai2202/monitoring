/**
 * Frontend/src/features/analytics/components/supplies/SuppliesUrgencyTimeline.tsx
 *
 * Trình bày danh sách cảnh báo vật tư theo Lịch trình khẩn cấp (Urgency Timeline):
 * - Gom nhóm theo 3 mốc: Khẩn cấp (≤ 3 ngày), Trong tuần (4–7 ngày), Dự trù (> 7 ngày).
 * - Hỗ trợ bấm [Cấp phát] trực tiếp trên từng mốc để mở SuppliesDispatchModal.
 */

import React, { useMemo } from 'react';
import { ConsumableAlertItem } from '../../../../types/analyticsUI';
import { FontAwesomeIcon, faFire, faPlus } from '../../../../shared/icons';

export interface SuppliesUrgencyTimelineProps {
  alerts: ConsumableAlertItem[];
  onOpenDispatchModal: (item: ConsumableAlertItem) => void;
}

interface TimelineBucket {
  id: string;
  title: string;
  accent: string;
  bgTint: string;
  icon: typeof faFire;
  items: ConsumableAlertItem[];
}

export const SuppliesUrgencyTimeline: React.FC<SuppliesUrgencyTimelineProps> = ({
  alerts,
  onOpenDispatchModal,
}) => {
  const buckets = useMemo<TimelineBucket[]>(() => {
    const urgentOnly = [...alerts]
      .filter((a) => a.daysRemaining <= 3)
      .sort((a, b) => a.daysRemaining - b.daysRemaining);
    return [
      {
        id: 'immediate',
        title: 'Hộp mực khẩn cấp (≤ 3 ngày tới)',
        accent: '#ef4444',
        bgTint: 'rgba(239, 68, 68, 0.08)',
        icon: faFire,
        items: urgentOnly,
      },
    ].filter((b) => b.items.length > 0);
  }, [alerts]);

  if (buckets.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-5 px-4 text-center text-xs text-slate-500 dark:text-slate-400">
        Không có hộp mực nào ở ngưỡng khẩn cấp (≤ 3 ngày tới) theo bộ lọc hiện tại.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3.5">
      {buckets.map((bucket) => (
        <div
          key={bucket.id}
          className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs"
        >
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 inline-flex items-center justify-center text-xs">
                <FontAwesomeIcon icon={bucket.icon} />
              </span>
              <span className="text-[13px] font-bold text-slate-900 dark:text-slate-100">
                {bucket.title}
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200/70 dark:border-rose-800/60">
              {bucket.items.length} hộp mực
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {bucket.items.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-slate-200/80 dark:border-slate-800 border-l-2 border-l-rose-500 bg-slate-50/70 dark:bg-slate-800/40 px-3.5 py-2.5 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {item.printerName}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {item.itemName} •{' '}
                    <strong className="font-mono text-rose-600 dark:text-rose-400">
                      {item.currentPercent}%
                    </strong>{' '}
                    ({item.daysRemaining} ngày)
                  </div>
                  <div className="text-[10.5px] text-slate-400 dark:text-slate-500 mt-0.5">
                    {item.floor} • Hết dự kiến: {item.estimatedEmptyDate}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenDispatchModal(item)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-rose-600 hover:bg-rose-700 text-white border-none cursor-pointer shrink-0 transition-colors"
                >
                  <FontAwesomeIcon icon={faPlus} className="text-[10px]" />
                  <span>Cấp phát</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SuppliesUrgencyTimeline;

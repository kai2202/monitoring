import React from 'react';
import { cn } from '../utils/cn';

export type StatusBadgeVariant =
  | 'online'
  | 'offline'
  | 'warning'
  | 'critical'
  | 'healthy'
  | 'info'
  | 'neutral';

export interface StatusBadgeProps {
  status: StatusBadgeVariant | string;
  label?: string;
  withDot?: boolean;
  pulseDot?: boolean;
  className?: string;
}

const statusConfig: Record<
  StatusBadgeVariant,
  { label: string; badgeClass: string; dotClass: string }
> = {
  online: {
    label: 'Online',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
    dotClass: 'bg-emerald-500',
  },
  healthy: {
    label: 'Tốt',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
    dotClass: 'bg-emerald-500',
  },
  offline: {
    label: 'Ngoại tuyến',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800',
    dotClass: 'bg-rose-500',
  },
  critical: {
    label: 'Khẩn cấp',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800',
    dotClass: 'bg-rose-500',
  },
  warning: {
    label: 'Cảnh báo',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800',
    dotClass: 'bg-amber-500',
  },
  info: {
    label: 'Thông tin',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800',
    dotClass: 'bg-blue-500',
  },
  neutral: {
    label: 'Bình thường',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    dotClass: 'bg-slate-400',
  },
};

/**
 * Frontend/src/shared/displays/StatusBadge.tsx
 *
 * Huy hiệu trạng thái tiêu chuẩn kèm chấm sáng động.
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  withDot = true,
  pulseDot = false,
  className,
}) => {
  const normalizedKey = (status?.toLowerCase() || 'neutral') as StatusBadgeVariant;
  const config = statusConfig[normalizedKey] || statusConfig.neutral;
  const displayLabel = label || config.label;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border',
        config.badgeClass,
        className
      )}
    >
      {withDot && (
        <span className="relative flex h-2 w-2">
          {pulseDot && (
            <span
              className={cn(
                'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
                config.dotClass
              )}
            />
          )}
          <span className={cn('relative inline-flex rounded-full h-2 w-2', config.dotClass)} />
        </span>
      )}
      <span>{displayLabel}</span>
    </span>
  );
};


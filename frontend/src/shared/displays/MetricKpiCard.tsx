import React, { ReactNode } from 'react';
import { cn } from '../utils/cn';

export interface MetricKpiCardProps {
  title: string;
  value: string | number;
  subText?: string;
  badgeText?: string;
  badgeVariant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  icon?: ReactNode;
  iconBgColor?: string;
  onClick?: () => void;
  className?: string;
  isLoading?: boolean;
}

const badgeStyles = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
  warning: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800',
  danger: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800',
  info: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800',
  neutral: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
};

/**
 * Frontend/src/shared/displays/MetricKpiCard.tsx
 *
 * Thẻ hiển thị chỉ số đo lường KPI chuẩn Dribbble/SaaS.
 */
export const MetricKpiCard: React.FC<MetricKpiCardProps> = ({
  title,
  value,
  subText,
  badgeText,
  badgeVariant = 'neutral',
  icon,
  iconBgColor = 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400',
  onClick,
  className,
  isLoading = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'p-5 rounded-2xl bg-card border border-border/70 shadow-sm transition-all duration-200',
        onClick && 'cursor-pointer hover:shadow-md hover:border-primary/40 hover:-translate-y-0.5',
        className
      )}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider line-clamp-1">
          {title}
        </span>
        {icon && (
          <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', iconBgColor)}>
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        {isLoading ? (
          <div className="h-8 w-24 bg-muted animate-pulse rounded-lg" />
        ) : (
          <span className="text-2xl font-black text-foreground tracking-tight font-mono">
            {value}
          </span>
        )}

        {badgeText && !isLoading && (
          <span
            className={cn(
              'px-2 py-0.5 text-xs font-semibold rounded-full border shrink-0',
              badgeStyles[badgeVariant]
            )}
          >
            {badgeText}
          </span>
        )}
      </div>

      {subText && (
        <p className="text-xs text-muted-foreground mt-2 line-clamp-1">
          {subText}
        </p>
      )}
    </div>
  );
};


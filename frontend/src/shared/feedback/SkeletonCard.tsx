import React from 'react';
import { cn } from '../utils/cn';

export interface SkeletonCardProps {
  height?: number | string;
  className?: string;
  variant?: 'card' | 'row' | 'chart';
}

/**
 * Frontend/src/shared/feedback/SkeletonCard.tsx
 *
 * Khung placeholder tải dữ liệu mượt mà, chống layout shift.
 */
export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  height = 140,
  className,
  variant = 'card',
}) => {
  if (variant === 'row') {
    return (
      <div
        className={cn(
          'w-full h-12 rounded-xl bg-slate-100 dark:bg-slate-800/60 animate-pulse flex items-center px-4 gap-4',
          className
        )}
      >
        <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700/50" />
        <div className="h-4 flex-1 bg-slate-200 dark:bg-slate-700/50 rounded" />
        <div className="w-20 h-4 bg-slate-200 dark:bg-slate-700/50 rounded" />
      </div>
    );
  }

  return (
    <div
      style={{ height }}
      className={cn(
        'w-full rounded-2xl bg-slate-100 dark:bg-slate-800/50 border border-border/50 animate-pulse p-5 flex flex-col justify-between',
        className
      )}
    >
      <div className="flex justify-between items-center">
        <div className="h-4 w-28 bg-slate-200 dark:bg-slate-700/60 rounded" />
        <div className="h-8 w-8 rounded-xl bg-slate-200 dark:bg-slate-700/60" />
      </div>
      <div className="space-y-2">
        <div className="h-7 w-36 bg-slate-200 dark:bg-slate-700/60 rounded-lg" />
        <div className="h-3 w-48 bg-slate-200 dark:bg-slate-700/40 rounded" />
      </div>
    </div>
  );
};


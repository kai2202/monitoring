import React from 'react';
import { cn } from '../utils/cn';

export interface TimeframeOption {
  key: string;
  label: string;
}

export interface TimeframeButtonGroupProps {
  value: string;
  onChange: (key: string) => void;
  options?: TimeframeOption[];
  className?: string;
}

const defaultOptions: TimeframeOption[] = [
  { key: 'hourly', label: '24 Giờ' },
  { key: '7days', label: '7 Ngày' },
  { key: '30days', label: '30 Ngày' },
];

/**
 * Frontend/src/shared/inputs/TimeframeButtonGroup.tsx
 *
 * Cụm nút bấm chọn khung thời gian dạng viên thuốc nối liền (Segmented Button Group).
 */
export const TimeframeButtonGroup: React.FC<TimeframeButtonGroupProps> = ({
  value,
  onChange,
  options = defaultOptions,
  className,
}) => {
  return (
    <div
      className={cn(
        'inline-flex items-center p-1 bg-slate-100 dark:bg-slate-900 border border-border/80 rounded-full select-none',
        className
      )}
    >
      {options.map((opt) => {
        const isActive = value === opt.key;
        return (
          <button
            key={opt.key}
            type="button"
            onClick={() => onChange(opt.key)}
            className={cn(
              'px-3 py-1 text-xs font-semibold rounded-full transition-all duration-150',
              isActive
                ? 'bg-card text-foreground shadow-sm font-bold border border-border/60'
                : 'text-muted-foreground hover:text-foreground hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};


import React from 'react';
import { cn } from '../utils/cn';

export interface PillSegmentItem {
  key: string;
  label: string;
  value: number | null | undefined;
  color: string;
}

export interface PillSegmentProgressProps {
  segments: PillSegmentItem[];
  height?: number;
  className?: string;
  showLabels?: boolean;
}

/**
 * Frontend/src/shared/displays/PillSegmentProgress.tsx
 *
 * Thanh tiến trình phân đoạn dạng viên thuốc (Segmented Pills).
 */
export const PillSegmentProgress: React.FC<PillSegmentProgressProps> = ({
  segments,
  height = 8,
  className,
  showLabels = false,
}) => {
  return (
    <div className={cn('w-full flex flex-col gap-1.5', className)}>
      <div
        className="w-full flex rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800"
        style={{ height }}
      >
        {segments.map((seg) => {
          const val = seg.value ?? 0;
          if (val <= 0) return null;

          return (
            <div
              key={seg.key}
              title={`${seg.label}: ${val}%`}
              className="h-full transition-all duration-300"
              style={{
                width: `${val}%`,
                backgroundColor: seg.color,
              }}
            />
          );
        })}
      </div>

      {showLabels && (
        <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium pt-0.5">
          {segments.map((seg) => (
            <div key={seg.key} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: seg.color }} />
              <span>{seg.label}</span>
              <strong className="font-mono text-foreground">{seg.value ?? '—'}%</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


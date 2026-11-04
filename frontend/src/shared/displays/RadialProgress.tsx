import React from 'react';
import { cn } from '../utils/cn';

export interface RadialProgressProps {
  percentage: number | null | undefined;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  showText?: boolean;
  className?: string;
}

/**
 * Frontend/src/shared/displays/RadialProgress.tsx
 *
 * Biểu đồ vòng tròn tiến trình SVG mượt mà.
 */
export const RadialProgress: React.FC<RadialProgressProps> = ({
  percentage,
  size = 48,
  strokeWidth = 4,
  color = '#2563eb',
  trackColor = '#e2e8f0',
  showText = true,
  className,
}) => {
  const safePercent = Math.max(0, Math.min(100, percentage ?? 0));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (safePercent / 100) * circumference;

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={percentage === null ? circumference : offset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      {showText && (
        <span className="absolute text-[10px] font-bold font-mono text-foreground">
          {percentage === null || percentage === undefined ? '—' : `${Math.round(safePercent)}%`}
        </span>
      )}
    </div>
  );
};


import React from 'react';
import { cn } from '../utils/cn';

export interface RangeSliderBrushProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  step?: number;
  label?: string;
  className?: string;
}

/**
 * Frontend/src/shared/inputs/RangeSliderBrush.tsx
 *
 * Thanh trượt brush slider chọn khoảng xem dữ liệu (viewport).
 */
export const RangeSliderBrush: React.FC<RangeSliderBrushProps> = ({
  min,
  max,
  value,
  onChange,
  step = 1,
  label,
  className,
}) => {
  const [start, end] = value;

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStart = Math.min(Number(e.target.value), end - step);
    onChange([newStart, end]);
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEnd = Math.max(Number(e.target.value), start + step);
    onChange([start, newEnd]);
  };

  const leftPercent = ((start - min) / (max - min)) * 100;
  const rightPercent = ((end - min) / (max - min)) * 100;

  return (
    <div className={cn('flex flex-col gap-1.5 w-full', className)}>
      {label && (
        <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
          <span>{label}</span>
          <span className="font-mono font-semibold text-foreground">
            #{start} – #{end} / {max}
          </span>
        </div>
      )}

      <div className="relative h-6 flex items-center select-none">
        {/* Track nền */}
        <div className="absolute w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800" />

        {/* Đoạn active highlight */}
        <div
          className="absolute h-2 rounded-full bg-primary/80"
          style={{
            left: `${leftPercent}%`,
            width: `${Math.max(0, rightPercent - leftPercent)}%`,
          }}
        />

        {/* Input start */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={start}
          onChange={handleStartChange}
          className="absolute w-full h-2 appearance-none pointer-events-none bg-transparent accent-primary"
          style={{ pointerEvents: 'auto' }}
        />

        {/* Input end */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={end}
          onChange={handleEndChange}
          className="absolute w-full h-2 appearance-none pointer-events-none bg-transparent accent-primary"
          style={{ pointerEvents: 'auto' }}
        />
      </div>
    </div>
  );
};


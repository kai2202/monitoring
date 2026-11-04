import React, { ReactNode } from 'react';
import { cn } from '../utils/cn';

export interface PopoverHoverCardProps {
  x: number;
  y: number;
  visible: boolean;
  children: ReactNode;
  className?: string;
}

/**
 * Frontend/src/shared/modals/PopoverHoverCard.tsx
 *
 * Thẻ thông tin nổi (Popover Card) theo tọa độ chuột khi hover biểu đồ / phần tử đồ họa.
 */
export const PopoverHoverCard: React.FC<PopoverHoverCardProps> = ({
  x,
  y,
  visible,
  children,
  className,
}) => {
  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        left: x + 12,
        top: y + 12,
        zIndex: 60,
        pointerEvents: 'none',
      }}
      className={cn(
        'p-3.5 rounded-xl bg-slate-900/95 text-slate-100 border border-slate-700/80 shadow-xl backdrop-blur-md text-xs transition-opacity duration-150 animate-in fade-in',
        className
      )}
    >
      {children}
    </div>
  );
};


import React, { ReactNode } from 'react';
import { FontAwesomeIcon, faInbox } from '../icons';
import { cn } from '../utils/cn';

export interface EmptyStateViewProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

/**
 * Frontend/src/shared/feedback/EmptyStateView.tsx
 *
 * Giao diện hiển thị khi không có dữ liệu hoặc không tìm thấy kết quả.
 * 100% FontAwesome Icons (AGENTS.md Rule 7.1).
 */
export const EmptyStateView: React.FC<EmptyStateViewProps> = ({
  title = 'Chưa có dữ liệu',
  description = 'Không tìm thấy thông tin phù hợp với điều kiện lọc hiện tại.',
  icon,
  action,
  className,
}) => {
  return (
    <div
      className={cn(
        'w-full py-12 px-6 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30 border border-dashed border-border/80 flex flex-col items-center justify-center text-center',
        className
      )}
    >
      <div className="w-12 h-12 rounded-2xl bg-muted/60 text-muted-foreground flex items-center justify-center mb-3">
        {icon || <FontAwesomeIcon icon={faInbox} size="lg" />}
      </div>
      <h3 className="text-sm font-bold text-foreground mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground max-w-sm mb-4 leading-relaxed">
        {description}
      </p>
      {action}
    </div>
  );
};

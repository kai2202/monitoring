import React, { ReactNode, useEffect } from 'react';
import { FontAwesomeIcon, faXmark } from '../icons';
import { cn } from '../utils/cn';

export interface SlideOverDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  widthClass?: string;
}

/**
 * Frontend/src/shared/modals/SlideOverDrawer.tsx
 *
 * Khung trượt bên phải (Slide-Over Drawer Shell).
 * 100% FontAwesome Icons (AGENTS.md Rule 7.1).
 */
export const SlideOverDrawer: React.FC<SlideOverDrawerProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  widthClass = 'max-w-2xl',
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div
          className={cn(
            'w-screen bg-card border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-300',
            widthClass
          )}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-border flex items-center justify-between shrink-0">
            <div>
              {typeof title === 'string' ? (
                <h3 className="text-lg font-bold text-foreground">{title}</h3>
              ) : (
                title
              )}
              {description && (
                <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Đóng (Esc)"
            >
              <FontAwesomeIcon icon={faXmark} size="sm" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="px-6 py-4 border-t border-border bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

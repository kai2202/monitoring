import React from 'react';
import { FontAwesomeIcon, faMagnifyingGlass, faXmark } from '../icons';
import { cn } from '../utils/cn';

export interface PillSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onClear?: () => void;
}

/**
 * Frontend/src/shared/inputs/PillSearchInput.tsx
 *
 * Ô nhập tìm kiếm dạng viên thuốc tròn mịn chuẩn Dribbble/Figma.
 * 100% FontAwesome Icons (AGENTS.md Rule 7.1).
 */
export const PillSearchInput: React.FC<PillSearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Tìm kiếm nhanh...',
  className,
  onClear,
}) => {
  return (
    <div
      className={cn(
        'relative flex items-center bg-slate-50 dark:bg-slate-900 border border-border/80 rounded-full px-3.5 py-1.5 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all duration-200',
        className
      )}
    >
      <FontAwesomeIcon icon={faMagnifyingGlass} size="xs" className="text-muted-foreground shrink-0 mr-2" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none pr-6"
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            onChange('');
            if (onClear) onClear();
          }}
          className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors"
          title="Xóa tìm kiếm"
        >
          <FontAwesomeIcon icon={faXmark} size="xs" />
        </button>
      )}
    </div>
  );
};

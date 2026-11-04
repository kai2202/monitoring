import React from 'react';
import { FontAwesomeIcon, faChevronDown } from '../icons';
import { cn } from '../utils/cn';

export interface DropdownOption {
  value: string;
  label: string;
}

export interface DropdownSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  label?: string;
  className?: string;
}

/**
 * Frontend/src/shared/inputs/DropdownSelect.tsx
 *
 * Menu chọn thả xuống bo góc tròn tinh tế chuẩn SaaS.
 * 100% FontAwesome Icons (AGENTS.md Rule 7.1).
 */
export const DropdownSelect: React.FC<DropdownSelectProps> = ({
  value,
  onChange,
  options,
  label,
  className,
}) => {
  return (
    <div className={cn('relative inline-flex items-center', className)}>
      {label && (
        <span className="text-xs font-medium text-muted-foreground mr-2 shrink-0">
          {label}:
        </span>
      )}
      <div className="relative inline-block w-full">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="appearance-none w-full bg-slate-50 dark:bg-slate-900 border border-border/80 rounded-full pl-3.5 pr-8 py-1.5 text-xs font-semibold text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-150 cursor-pointer"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <FontAwesomeIcon
          icon={faChevronDown}
          size="xs"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
        />
      </div>
    </div>
  );
};

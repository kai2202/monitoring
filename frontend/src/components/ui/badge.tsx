import * as React from 'react';
import { cn } from '../../shared/utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const base = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none';

  const variants = {
    default: 'border-transparent bg-primary/10 text-primary',
    secondary: 'border-transparent bg-secondary text-secondary-foreground',
    destructive: 'border-transparent bg-destructive/10 text-destructive',
    outline: 'border border-border text-foreground',
    success: 'border-transparent bg-status-online-bg text-status-online',
    warning: 'border-transparent bg-status-warning-bg text-status-warning',
  };

  return <div className={cn(base, variants[variant], className)} {...props} />;
}


import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
}

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  const variantStyles = {
    default: 'bg-slate-100 dark:bg-[#282828] text-slate-800 dark:text-neutral-300 border border-slate-200 dark:border-[#383838]',
    success: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50',
    warning: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50',
    danger: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50',
    info: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50',
    outline: 'border border-slate-300 dark:border-[#444] text-slate-700 dark:text-neutral-300',
  };

  return (
    <span
      className={cn('inline-flex items-center px-2 py-0.5 text-xs font-semibold uppercase tracking-wider', variantStyles[variant], className)}
      {...props}
    >
      {children}
    </span>
  );
}

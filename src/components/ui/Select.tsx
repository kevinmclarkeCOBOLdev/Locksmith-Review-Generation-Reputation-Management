import React from 'react';
import { cn } from '@/lib/utils';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, children, disabled, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 uppercase tracking-wider">
            {label}
          </label>
        )}
        <select
          ref={ref}
          disabled={disabled}
          className={cn(
            'w-full px-3 py-2 bg-white dark:bg-[#1f1f1f] border border-slate-300 dark:border-[#383838] text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#00d492] focus:border-[#00d492] transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500',
            className
          )}
          {...props}
        >
          {children}
        </select>
        {error && <p className="text-[11px] font-semibold text-rose-500">{error}</p>}
        {helperText && !error && (
          <p className="text-[11px] text-slate-500 dark:text-neutral-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          type={type}
          ref={ref}
          className={cn(
            'w-full px-3.5 py-2.5 bg-white dark:bg-[#222222] border text-slate-900 dark:text-neutral-100 text-sm placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-[#00d492] transition-all disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-[#181818]',
            error ? 'border-rose-500' : 'border-slate-300 dark:border-[#383838]',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-rose-500 font-medium">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

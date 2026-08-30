import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-bold transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none';

    const variantStyles = {
      primary: 'bg-[#00d492] text-slate-950 hover:bg-[#00bc82] shadow-sm font-bold',
      secondary: 'bg-slate-200 dark:bg-[#2e2e2e] text-slate-900 dark:text-neutral-100 hover:bg-slate-300 dark:hover:bg-[#383838]',
      outline: 'border border-slate-300 dark:border-[#383838] bg-transparent text-slate-800 dark:text-neutral-200 hover:bg-slate-100 dark:hover:bg-[#282828]',
      danger: 'bg-rose-600 text-white hover:bg-rose-700',
      ghost: 'bg-transparent text-slate-600 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-[#282828] hover:text-slate-900 dark:hover:text-white',
    };

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2.5 text-sm',
      lg: 'px-6 py-3.5 text-base',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

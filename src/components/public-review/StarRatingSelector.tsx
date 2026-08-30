'use client';

import React, { useState } from 'react';
import { Star } from 'lucide-react';

export interface StarRatingSelectorProps {
  rating: number | null;
  onChange: (rating: number) => void;
  disabled?: boolean;
  size?: 'md' | 'lg';
}

const RATING_LABELS: Record<number, { title: string; subtitle: string; color: string }> = {
  1: {
    title: 'Terrible',
    subtitle: 'Major issues experienced',
    color: 'text-rose-500 dark:text-rose-400',
  },
  2: {
    title: 'Poor',
    subtitle: 'Below expectations',
    color: 'text-amber-600 dark:text-amber-500',
  },
  3: {
    title: 'Average',
    subtitle: 'Service was acceptable',
    color: 'text-amber-500 dark:text-amber-400',
  },
  4: {
    title: 'Good',
    subtitle: 'Satisfied with service',
    color: 'text-lime-500 dark:text-lime-400',
  },
  5: {
    title: 'Excellent!',
    subtitle: 'Fast, professional & high quality',
    color: 'text-emerald-500 dark:text-emerald-400',
  },
};

export function StarRatingSelector({
  rating,
  onChange,
  disabled = false,
  size = 'lg',
}: StarRatingSelectorProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const activeRating = hoverRating || rating || 0;
  const currentLabel = activeRating > 0 ? RATING_LABELS[activeRating] : null;

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      {/* 5-Star Touch Selector */}
      <div
        className="flex items-center justify-center gap-2 sm:gap-4 py-2 select-none"
        onMouseLeave={() => !disabled && setHoverRating(null)}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= activeRating;
          return (
            <button
              key={star}
              type="button"
              disabled={disabled}
              onClick={() => !disabled && onChange(star)}
              onMouseEnter={() => !disabled && setHoverRating(star)}
              onFocus={() => !disabled && setHoverRating(star)}
              onBlur={() => !disabled && setHoverRating(null)}
              className={`p-2.5 sm:p-3 rounded-none transition-all duration-150 transform cursor-pointer disabled:cursor-not-allowed focus:outline-none ${
                isFilled
                  ? 'text-amber-400 dark:text-amber-400 scale-110 drop-shadow-[0_2px_8px_rgba(251,191,36,0.35)]'
                  : 'text-slate-300 dark:text-neutral-700 hover:text-amber-200 dark:hover:text-amber-600 scale-100'
              } ${!disabled ? 'active:scale-95 hover:scale-125' : 'opacity-80'}`}
              aria-label={`Rate ${star} out of 5 stars`}
            >
              <Star
                size={size === 'lg' ? 44 : 32}
                className="transition-colors duration-150"
                fill={isFilled ? 'currentColor' : 'transparent'}
                strokeWidth={isFilled ? 1.5 : 1.75}
              />
            </button>
          );
        })}
      </div>

      {/* Dynamic Sentiment Label */}
      <div className="h-10 flex flex-col items-center justify-center text-center transition-all duration-200">
        {currentLabel ? (
          <>
            <span className={`text-base font-black tracking-wide ${currentLabel.color}`}>
              {currentLabel.title}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-neutral-400">
              {currentLabel.subtitle}
            </span>
          </>
        ) : (
          <span className="text-xs text-slate-400 dark:text-neutral-500 font-medium">
            Tap a star to rate your experience
          </span>
        )}
      </div>
    </div>
  );
}

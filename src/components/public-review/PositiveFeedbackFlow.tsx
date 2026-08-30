'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Star,
  Copy,
  Check,
} from 'lucide-react';
import type { ReviewPlatformDestination } from '@/services/public-review.service';

export interface PositiveFeedbackFlowProps {
  token: string;
  rating: number;
  businessName: string;
  customerFirstName?: string;
  initialPlatforms?: ReviewPlatformDestination[];
}

export function PositiveFeedbackFlow({
  token,
  rating,
  businessName,
  customerFirstName,
  initialPlatforms = [],
}: PositiveFeedbackFlowProps) {
  const [platforms, setPlatforms] = useState<ReviewPlatformDestination[]>(initialPlatforms);
  const [copied, setCopied] = useState(false);
  const [clickedPlatform, setClickedPlatform] = useState<string | null>(null);

  useEffect(() => {
    if (initialPlatforms.length === 0) {
      fetch(`/api/reviews/public/platforms?token=${encodeURIComponent(token)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data?.platforms) {
            setPlatforms(data.data.platforms);
          }
        })
        .catch((err) => console.warn('Could not fetch review platforms:', err));
    }
  }, [token, initialPlatforms]);

  const handlePlatformClick = async (platform: ReviewPlatformDestination) => {
    setClickedPlatform(platform.platformName);

    // Track click event asynchronously
    try {
      await fetch('/api/reviews/public/track-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, platformName: platform.platformName }),
      });
    } catch (err) {
      console.warn('Track click notice:', err);
    }

    // Open destination URL in new tab
    window.open(platform.destinationUrl, '_blank', 'noopener,noreferrer');
  };

  const primaryPlatform = platforms.find((p) => p.isPrimary) || platforms[0];
  const secondaryPlatforms = platforms.filter((p) => p !== primaryPlatform);

  const handleCopyLink = () => {
    if (primaryPlatform?.destinationUrl) {
      navigator.clipboard.writeText(primaryPlatform.destinationUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <Card className="border border-slate-200 dark:border-[#333333] shadow-2xl text-center p-6 sm:p-8 bg-white dark:bg-[#1f1f1f]">
      <CardContent className="p-0 space-y-6">
        {/* Celebration Badge */}
        <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-500 border border-emerald-300 dark:border-emerald-800 mx-auto flex items-center justify-center">
          <Sparkles size={32} />
        </div>

        {/* Header & Gratitude */}
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Thank You for the {rating}-Star Rating!
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-neutral-300 max-w-sm mx-auto leading-relaxed">
            {customerFirstName ? `Hi ${customerFirstName}, your ` : 'Your '}
            feedback means the world to <span className="font-bold text-slate-900 dark:text-white">{businessName}</span>.
          </p>
        </div>

        {/* Render Stars */}
        <div className="flex items-center justify-center gap-1.5 py-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              size={24}
              className={s <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-neutral-700'}
            />
          ))}
        </div>

        {/* Public Platform Call to Action Box */}
        <div className="p-4 bg-[#00d492]/10 dark:bg-[#00d492]/10 border border-[#00d492]/30 dark:border-[#00d492]/30 space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#00d492]">
              Support Our Local Business
            </span>
            <p className="text-xs text-slate-700 dark:text-neutral-200 leading-snug">
              Would you mind sharing your quick rating on Google? It takes less than 30 seconds and helps your neighbors find a trusted locksmith.
            </p>
          </div>

          {/* Primary Action Button (Google Reviews) */}
          {primaryPlatform && (
            <Button
              size="lg"
              onClick={() => handlePlatformClick(primaryPlatform)}
              className="w-full py-4 text-sm font-bold flex items-center justify-center gap-2 bg-[#00d492] hover:bg-[#00bc82] text-slate-950 shadow-md cursor-pointer"
            >
              <Star size={16} className="fill-slate-950" />
              <span>{primaryPlatform.label}</span>
              <ExternalLink size={14} className="ml-1" />
            </Button>
          )}

          {/* Secondary Platform Buttons if configured */}
          {secondaryPlatforms.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-[#00d492]/20 dark:border-[#00d492]/20">
              <span className="text-[10px] text-slate-500 dark:text-neutral-400 block font-semibold">
                Or share on:
              </span>
              <div className="flex flex-col gap-2">
                {secondaryPlatforms.map((p) => (
                  <button
                    key={p.platformName}
                    onClick={() => handlePlatformClick(p)}
                    className="w-full py-2.5 px-3 border border-slate-300 dark:border-[#404040] bg-white dark:bg-[#1a1a1a] hover:bg-slate-50 dark:hover:bg-[#282828] text-xs font-bold text-slate-800 dark:text-neutral-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <span>{p.label}</span>
                    <ExternalLink size={12} className="text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Copy Link Utility */}
          {primaryPlatform?.destinationUrl && (
            <div className="pt-2 flex items-center justify-center">
              <button
                type="button"
                onClick={handleCopyLink}
                className="text-[11px] font-semibold text-slate-500 dark:text-neutral-400 hover:text-[#00d492] flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                {copied ? 'Review link copied to clipboard!' : 'Copy direct review link'}
              </button>
            </div>
          )}
        </div>

        {/* Verification Footer */}
        <div className="p-3 bg-slate-50 dark:bg-[#282828] border border-slate-200 dark:border-[#3a3a3a] text-xs text-slate-500 dark:text-neutral-400 flex items-center justify-center gap-2">
          <ShieldCheck size={14} className="text-emerald-500" />
          <span>{clickedPlatform ? 'Click recorded. Thank you for supporting us!' : 'Verified Customer Review'}</span>
        </div>
      </CardContent>
    </Card>
  );
}

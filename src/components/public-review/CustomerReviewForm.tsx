'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StarRatingSelector } from './StarRatingSelector';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Ban,
  HelpCircle,
  Phone,
  ArrowRight,
  Star,
} from 'lucide-react';
import { PositiveFeedbackFlow } from './PositiveFeedbackFlow';
import { PrivateFeedbackFlow } from './PrivateFeedbackFlow';
import type { PublicReviewViewModel } from '@/services/public-review.service';
import type { ReviewSentiment } from '@/types/review';

export interface CustomerReviewFormProps {
  initialData: PublicReviewViewModel;
  token: string;
}

export function CustomerReviewForm({ initialData, token }: CustomerReviewFormProps) {
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submissionResult, setSubmissionResult] = useState<{
    sentiment: ReviewSentiment;
    rating: number;
    message?: string;
  } | null>(null);

  const businessName = initialData.businessName || 'Atypikal Locksmith Services';
  const customerName = initialData.customerFirstName;
  const status = initialData.status;

  const handleSubmitRating = async (ratingToSubmit?: number) => {
    const rating = ratingToSubmit || selectedRating;
    if (!rating) {
      setErrorMessage('Please select a star rating between 1 and 5.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/reviews/public/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, rating }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit rating.');
      }

      setSubmissionResult({
        sentiment: data.data.sentiment,
        rating: data.data.rating,
        message: data.data.message,
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // State: Post-Submission Success (Positive or Negative Flow)
  if (submissionResult) {
    if (submissionResult.sentiment === 'positive') {
      return (
        <PositiveFeedbackFlow
          token={token}
          rating={submissionResult.rating}
          businessName={businessName}
          customerFirstName={customerName}
        />
      );
    }

    return (
      <PrivateFeedbackFlow
        token={token}
        rating={submissionResult.rating}
        businessName={businessName}
        customerFirstName={customerName}
      />
    );
  }

  // State: Already Responded
  if (status === 'already_responded') {
    return (
      <Card className="border border-slate-200 dark:border-[#333333] shadow-2xl text-center p-6 sm:p-8 bg-white dark:bg-[#1f1f1f]">
        <CardContent className="p-0 space-y-6">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/50 text-blue-500 border border-blue-300 dark:border-blue-800 mx-auto flex items-center justify-center">
            <CheckCircle2 size={32} />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Feedback Already Received
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-neutral-300 max-w-sm mx-auto leading-relaxed">
              {customerName ? `Hi ${customerName}, your ` : 'Your '}
              feedback for this service has already been recorded. Thank you for taking the time to share your experience with {businessName}.
            </p>
          </div>

          {initialData.rating && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Your Recorded Rating
              </span>
              <div className="flex items-center justify-center gap-1.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={22}
                    className={s <= (initialData.rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-neutral-700'}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="p-3 bg-slate-50 dark:bg-[#282828] border border-slate-200 dark:border-[#3a3a3a] text-xs text-slate-500 dark:text-neutral-400 flex items-center justify-center gap-2">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>Verified Customer Response</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // State: Expired Link
  if (status === 'expired') {
    return (
      <Card className="border border-slate-200 dark:border-[#333333] shadow-2xl text-center p-6 sm:p-8 bg-white dark:bg-[#1f1f1f]">
        <CardContent className="p-0 space-y-6">
          <div className="w-16 h-16 bg-amber-50 dark:bg-amber-950/50 text-amber-500 border border-amber-300 dark:border-amber-800 mx-auto flex items-center justify-center">
            <Clock size={32} />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Review Link Expired
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-neutral-300 max-w-sm mx-auto leading-relaxed">
              This review request link is past its expiration window. If you would like to get in touch with {businessName}, please reach out directly.
            </p>
          </div>

          {initialData.businessPhone && (
            <div className="p-3 bg-slate-50 dark:bg-[#282828] border border-slate-200 dark:border-[#3a3a3a] text-xs text-slate-700 dark:text-neutral-300 flex items-center justify-center gap-2">
              <Phone size={14} className="text-[#E76A0E]" />
              <span>Call: <a href={`tel:${initialData.businessPhone}`} className="font-bold underline">{initialData.businessPhone}</a></span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // State: Cancelled Link
  if (status === 'cancelled') {
    return (
      <Card className="border border-slate-200 dark:border-[#333333] shadow-2xl text-center p-6 sm:p-8 bg-white dark:bg-[#1f1f1f]">
        <CardContent className="p-0 space-y-6">
          <div className="w-16 h-16 bg-slate-100 dark:bg-neutral-800 text-slate-500 border border-slate-300 dark:border-neutral-700 mx-auto flex items-center justify-center">
            <Ban size={32} />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Review Link Inactive
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-neutral-300 max-w-sm mx-auto leading-relaxed">
              This review request has been marked as inactive by {businessName}.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // State: Invalid Link / 404
  if (status === 'invalid') {
    return (
      <Card className="border border-slate-200 dark:border-[#333333] shadow-2xl text-center p-6 sm:p-8 bg-white dark:bg-[#1f1f1f]">
        <CardContent className="p-0 space-y-6">
          <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/50 text-rose-500 border border-rose-300 dark:border-rose-800 mx-auto flex items-center justify-center">
            <HelpCircle size={32} />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Invalid Review Link
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-neutral-300 max-w-sm mx-auto leading-relaxed">
              This review link could not be verified. Please check the URL from your SMS or Email message.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default Active Rating State
  return (
    <Card className="border border-slate-200 dark:border-[#333333] shadow-2xl text-center p-6 sm:p-8 bg-white dark:bg-[#1f1f1f]">
      <CardHeader className="p-0 mb-6 space-y-3">
        <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 bg-orange-50 dark:bg-orange-950/40 text-[#E76A0E] border border-orange-200 dark:border-orange-900/40 text-[10px] font-bold uppercase tracking-widest mx-auto">
          <Sparkles size={12} />
          Quick 30-Second Feedback
        </div>

        <CardTitle className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          {customerName ? `Hi ${customerName}, how did we do?` : 'How was your experience today?'}
        </CardTitle>

        <CardDescription className="text-xs sm:text-sm text-slate-500 dark:text-neutral-400 max-w-xs mx-auto">
          Please rate your overall experience with <span className="font-bold text-slate-900 dark:text-neutral-200">{businessName}</span>.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0 space-y-6">
        {errorMessage && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-center gap-2">
            <AlertTriangle size={14} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 1-5 Star Interactive Selector */}
        <StarRatingSelector
          rating={selectedRating}
          onChange={(newRating) => {
            setSelectedRating(newRating);
            setErrorMessage(null);
          }}
          disabled={isSubmitting}
        />

        {/* Submit Rating Button */}
        <Button
          onClick={() => handleSubmitRating()}
          disabled={!selectedRating || isSubmitting}
          className="w-full py-3.5 text-sm font-bold flex items-center justify-center gap-2 shadow-lg"
          size="lg"
        >
          {isSubmitting ? (
            'Submitting Rating...'
          ) : (
            <>
              Confirm Rating <ArrowRight size={16} />
            </>
          )}
        </Button>

        {/* Security & Verification Guarantee */}
        <div className="pt-2">
          <div className="p-3 bg-slate-50 dark:bg-[#252525] border border-slate-200 dark:border-[#333333] text-[11px] text-slate-500 dark:text-neutral-400 flex items-center justify-center gap-2">
            <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
            <span>Direct, encrypted feedback for {businessName}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

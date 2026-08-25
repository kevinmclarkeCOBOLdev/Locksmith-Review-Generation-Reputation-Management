'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import {
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Star,
  Send,
  PhoneCall,
} from 'lucide-react';

export interface PrivateFeedbackFlowProps {
  token: string;
  rating: number;
  businessName: string;
  customerFirstName?: string;
}

export function PrivateFeedbackFlow({
  token,
  rating,
  businessName,
  customerFirstName,
}: PrivateFeedbackFlowProps) {
  const [feedbackText, setFeedbackText] = useState('');
  const [requestContact, setRequestContact] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!feedbackText.trim()) {
      setErrorMessage('Please enter a few words about your experience.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/reviews/public/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          feedbackText: feedbackText.trim(),
          requestContact,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit feedback.');
      }

      setIsSubmitted(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // State: Private Feedback Successfully Submitted
  if (isSubmitted) {
    return (
      <Card className="border border-slate-200 dark:border-[#333333] shadow-2xl text-center p-6 sm:p-8 bg-white dark:bg-[#1f1f1f]">
        <CardContent className="p-0 space-y-6">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/50 text-blue-500 border border-blue-300 dark:border-blue-800 mx-auto flex items-center justify-center">
            <CheckCircle2 size={32} />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Message Delivered to Management
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-neutral-300 max-w-sm mx-auto leading-relaxed">
              {customerFirstName ? `Thank you ${customerFirstName}. ` : 'Thank you. '}
              Your comments have been securely delivered to the management team at <span className="font-bold text-slate-900 dark:text-white">{businessName}</span>.
            </p>
          </div>

          {requestContact && (
            <div className="p-3 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 text-xs text-blue-800 dark:text-blue-200 flex items-center justify-center gap-2">
              <PhoneCall size={14} className="shrink-0 text-blue-500" />
              <span>A management representative will follow up with you directly.</span>
            </div>
          )}

          <div className="p-3 bg-slate-50 dark:bg-[#282828] border border-slate-200 dark:border-[#3a3a3a] text-xs text-slate-500 dark:text-neutral-400 flex items-center justify-center gap-2">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>Private Customer Resolution Ticket Logged</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Active Feedback Form State
  return (
    <Card className="border border-slate-200 dark:border-[#333333] shadow-2xl text-center p-6 sm:p-8 bg-white dark:bg-[#1f1f1f]">
      <CardContent className="p-0 space-y-6">
        {/* Header Icon */}
        <div className="w-16 h-16 bg-amber-50 dark:bg-amber-950/50 text-amber-500 border border-amber-300 dark:border-amber-800 mx-auto flex items-center justify-center">
          <MessageSquare size={30} />
        </div>

        {/* Heading & Empathy Copy */}
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            We&apos;re Sorry to Hear That
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-neutral-300 max-w-sm mx-auto leading-relaxed">
            {customerFirstName ? `Hi ${customerFirstName}, we ` : 'We '}
            aim for 5 stars on every job. How can we make things right or improve?
          </p>
        </div>

        {/* Stars */}
        <div className="flex items-center justify-center gap-1.5 py-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              size={22}
              className={s <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-neutral-700'}
            />
          ))}
        </div>

        {/* Feedback Input Form */}
        <form onSubmit={handleSubmit} className="text-left space-y-4">
          {errorMessage && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700 dark:text-neutral-300">
              Private Message for Management:
            </label>
            <Textarea
              value={feedbackText}
              onChange={(e) => {
                setFeedbackText(e.target.value);
                setErrorMessage(null);
              }}
              rows={4}
              placeholder="What went wrong with the service? (e.g. response time, pricing clarity, lock fit, etc.)"
              className="text-xs bg-white dark:bg-[#181818]"
              disabled={isSubmitting}
            />
          </div>

          {/* Contact Request Toggle */}
          <label className="flex items-start gap-2.5 p-3 bg-slate-50 dark:bg-[#282828] border border-slate-200 dark:border-[#3a3a3a] cursor-pointer">
            <input
              type="checkbox"
              checked={requestContact}
              onChange={(e) => setRequestContact(e.target.checked)}
              className="mt-0.5 rounded-none text-[#E76A0E] focus:ring-[#E76A0E]"
              disabled={isSubmitting}
            />
            <span className="text-xs text-slate-700 dark:text-neutral-300 leading-snug">
              I would like a management representative from <span className="font-bold">{businessName}</span> to contact me regarding this.
            </span>
          </label>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting || !feedbackText.trim()}
            className="w-full py-3.5 text-sm font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer"
            size="lg"
          >
            <Send size={15} />
            <span>{isSubmitting ? 'Sending to Management...' : 'Send Private Feedback'}</span>
          </Button>
        </form>

        {/* Security & Confidentiality */}
        <div className="p-3 bg-slate-50 dark:bg-[#252525] border border-slate-200 dark:border-[#333333] text-[11px] text-slate-500 dark:text-neutral-400 flex items-center justify-center gap-2">
          <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
          <span>Your message is kept strictly confidential and sent directly to senior management.</span>
        </div>
      </CardContent>
    </Card>
  );
}

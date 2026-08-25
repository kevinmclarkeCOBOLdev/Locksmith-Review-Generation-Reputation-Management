'use client';

import React, { useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  ExternalLink,
  Copy,
  Check,
  Smartphone,
  Mail,
  MessageSquare,
  Star,
  ShieldCheck,
  User,
} from 'lucide-react';
import type { ReviewRequestItem, ReviewRequestStatus } from '@/types/review';

export interface ReviewRequestDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: ReviewRequestItem | null;
}

export function ReviewRequestDetailModal({
  isOpen,
  onClose,
  request,
}: ReviewRequestDetailModalProps) {
  const [copied, setCopied] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  if (!request) return null;

  const publicReviewUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/review/${request.secureToken}`
    : `https://lockreview.atypikalstudio.dev/review/${request.secureToken}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicReviewUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResend = async () => {
    setIsResending(true);
    setResendStatus(null);
    try {
      const res = await fetch(`/api/reviews/${request.id}/retry`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResendStatus('Review request re-sent successfully!');
      } else {
        setResendStatus(`Failed: ${data.error || 'Delivery failed'}`);
      }
    } catch (err: any) {
      setResendStatus(`Error: ${err.message}`);
    } finally {
      setIsResending(false);
      setTimeout(() => setResendStatus(null), 4000);
    }
  };

  const getStatusBadge = (status: ReviewRequestStatus) => {
    switch (status) {
      case 'positive':
        return <Badge variant="success">Positive (4–5★)</Badge>;
      case 'negative':
        return <Badge variant="warning">Private Feedback (1–3★)</Badge>;
      case 'responded':
        return <Badge variant="success">Responded</Badge>;
      case 'sent':
      case 'delivered':
        return <Badge variant="info">{status}</Badge>;
      case 'pending':
      case 'scheduled':
        return <Badge variant="outline">{status}</Badge>;
      case 'failed':
      case 'expired':
      case 'cancelled':
        return <Badge variant="danger">{status}</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      title={
        <div className="flex items-center gap-2">
          <span>Review Request Details</span>
          {getStatusBadge(request.status)}
        </div>
      }
      description={`Unique Request ID: ${request.id}`}
    >
      <div className="space-y-5 text-xs">
        {resendStatus && (
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 font-semibold">
            {resendStatus}
          </div>
        )}

        {/* Customer & Job Section */}
        <div className="p-3 bg-slate-50 dark:bg-[#202020] border border-slate-200 dark:border-[#333333] space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#2e2e2e] pb-2 font-bold text-slate-900 dark:text-white">
            <span className="flex items-center gap-1.5">
              <User size={14} className="text-[#E76A0E]" /> Customer Details
            </span>
            <span className="text-[11px] font-medium text-slate-500 dark:text-neutral-400">
              Shared MySQL Record
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-slate-700 dark:text-neutral-300">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Name</span>
              <span className="font-bold text-slate-900 dark:text-white">{request.customerName || 'N/A'}</span>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Service Type</span>
              <span className="font-bold text-slate-900 dark:text-white">{request.serviceType || 'Locksmith Service'}</span>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Phone Number</span>
              <span>{request.customerPhone || 'N/A'}</span>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Email Address</span>
              <span>{request.customerEmail || 'N/A'}</span>
            </div>

            {request.postcode && (
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Postcode</span>
                <span>{request.postcode}</span>
              </div>
            )}
          </div>
        </div>

        {/* Public Review URL & Security */}
        <div className="p-3 bg-slate-50 dark:bg-[#202020] border border-slate-200 dark:border-[#333333] space-y-2">
          <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-500" /> Customer Review Link
            </span>
            <span className="text-[10px] text-slate-400 uppercase font-mono">64-char token</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={publicReviewUrl}
              className="w-full px-2.5 py-1.5 bg-white dark:bg-[#181818] border border-slate-300 dark:border-[#3a3a3a] text-[11px] font-mono text-slate-800 dark:text-neutral-200 focus:outline-none select-all"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopyLink}
              className="shrink-0 flex items-center gap-1 text-xs"
            >
              {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
            <a
              href={publicReviewUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 border border-slate-300 dark:border-[#3a3a3a] hover:bg-slate-100 dark:hover:bg-[#282828] text-slate-700 dark:text-white flex items-center justify-center cursor-pointer"
              title="Open customer review page"
            >
              <ExternalLink size={14} />
            </a>
          </div>
        </div>

        {/* Dispatch & Lifecycle Details */}
        <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-[#202020] border border-slate-200 dark:border-[#333333] text-slate-700 dark:text-neutral-300">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Channel</span>
            <span className="font-bold uppercase text-slate-900 dark:text-white flex items-center gap-1.5 mt-0.5">
              {request.channel === 'sms' && <Smartphone size={13} />}
              {request.channel === 'email' && <Mail size={13} />}
              {request.channel === 'both' && <MessageSquare size={13} />}
              {request.channel}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Rating</span>
            <span className="font-bold text-slate-900 dark:text-white mt-0.5 flex items-center gap-1">
              {request.rating ? (
                <>
                  <Star size={13} className="text-amber-500 fill-amber-500" />
                  {request.rating} / 5
                </>
              ) : (
                'Pending Response'
              )}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Created At</span>
            <span>{new Date(request.createdAt).toLocaleString('en-GB')}</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Sent At</span>
            <span>
              {request.sentAt ? new Date(request.sentAt).toLocaleString('en-GB') : 'Not yet dispatched'}
            </span>
          </div>

          {request.expiresAt && (
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Expires At</span>
              <span>{new Date(request.expiresAt).toLocaleString('en-GB')}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-[#2e2e2e]">
          <Button
            size="sm"
            variant="outline"
            onClick={handleResend}
            disabled={isResending}
            className="flex items-center gap-1.5 text-xs font-bold"
          >
            {isResending ? 'Sending...' : 'Resend Review Request'}
          </Button>

          <Button size="sm" variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

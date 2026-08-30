'use client';

import React from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Star,
  User,
  Phone,
  Mail,
  MapPin,
  Wrench,
  Clock,
  MessageSquare,
  ShieldCheck,
  Calendar,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import type { FeedbackDetailResult } from '@/services/feedback-inbox.service';

export interface FeedbackDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  feedbackItem: FeedbackDetailResult | null;
  isLoading?: boolean;
}

export function FeedbackDetailModal({
  isOpen,
  onClose,
  feedbackItem,
  isLoading = false,
}: FeedbackDetailModalProps) {
  if (!isOpen) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="xl"
      title={
        <div className="flex items-center justify-between w-full pr-6">
          <div className="flex items-center gap-2">
            <MessageSquare size={18} className="text-[#00d492]" />
            <span>Customer Feedback Inspector</span>
          </div>
          {feedbackItem && (
            <Badge
              variant={feedbackItem.sentiment === 'positive' ? 'success' : 'warning'}
              className="text-[10px] uppercase font-bold"
            >
              {feedbackItem.sentiment === 'positive' ? 'Positive (4-5★)' : 'Private Issue (1-3★)'}
            </Badge>
          )}
        </div>
      }
      description={feedbackItem ? `Feedback ID: ${feedbackItem.id}` : undefined}
    >
      {isLoading ? (
        <div className="p-12 text-center text-slate-500 space-y-3">
          <div className="w-8 h-8 border-2 border-[#00d492] border-t-transparent animate-spin mx-auto" />
          <p className="text-xs">Loading feedback details and timeline...</p>
        </div>
      ) : !feedbackItem ? (
        <div className="p-8 text-center text-slate-500">
          <p className="text-sm">Feedback item not found.</p>
        </div>
      ) : (
        <div className="space-y-6 text-xs">
          {/* Rating Banner */}
          <div
            className={`p-4 border flex flex-col sm:flex-row items-center justify-between gap-4 ${
              feedbackItem.sentiment === 'positive'
                ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40'
                : 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={20}
                    className={
                      s <= feedbackItem.rating
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-300 dark:text-neutral-700'
                    }
                  />
                ))}
              </div>
              <span className="text-base font-extrabold text-slate-900 dark:text-white">
                {feedbackItem.rating}.0 / 5
              </span>
            </div>

            {feedbackItem.publicPlatformClicked && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 font-bold text-[11px] border border-emerald-300 dark:border-emerald-800">
                <Sparkles size={13} className="text-emerald-500" />
                <span>Clicked {feedbackItem.publicPlatformName || 'Google'} Review Link</span>
              </div>
            )}
          </div>

          {/* Customer & Job Info */}
          <div className="p-4 bg-slate-50 dark:bg-[#1f1f1f] border border-slate-200 dark:border-[#333333] space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Customer & Job Details
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700 dark:text-neutral-300">
              <div className="flex items-center gap-2">
                <User size={14} className="text-slate-400" />
                <span className="font-semibold">{feedbackItem.customerName}</span>
              </div>
              {feedbackItem.customerPhone && (
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-slate-400" />
                  <a href={`tel:${feedbackItem.customerPhone}`} className="hover:text-[#00d492]">
                    {feedbackItem.customerPhone}
                  </a>
                </div>
              )}
              {feedbackItem.customerEmail && (
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-slate-400" />
                  <a href={`mailto:${feedbackItem.customerEmail}`} className="hover:text-[#00d492]">
                    {feedbackItem.customerEmail}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Wrench size={14} className="text-slate-400" />
                <span>{feedbackItem.serviceType}</span>
              </div>
              {feedbackItem.postcode && (
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-slate-400" />
                  <span>{feedbackItem.postcode}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-slate-400" />
                <span>{new Date(feedbackItem.createdAt).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Private Feedback Comments */}
          {feedbackItem.feedbackText && (
            <div className="p-4 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-900/50 space-y-2">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs">
                <AlertTriangle size={15} />
                <span>Customer Private Comment (Internal Resolution Only)</span>
              </div>
              <p className="text-xs text-slate-800 dark:text-neutral-200 bg-white dark:bg-[#161616] p-3 border border-amber-200 dark:border-amber-950 leading-relaxed italic">
                &ldquo;{feedbackItem.feedbackText}&rdquo;
              </p>
              <div className="text-[11px] text-slate-500 dark:text-neutral-400 flex items-center gap-1">
                <ShieldCheck size={13} className="text-emerald-500" />
                <span>Captured privately; not published to public review profiles.</span>
              </div>
            </div>
          )}

          {/* Request Lifecycle Timeline */}
          {feedbackItem.timeline && feedbackItem.timeline.length > 0 && (
            <div className="space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Request Lifecycle Timeline
              </span>
              <div className="border-l-2 border-slate-200 dark:border-[#333333] ml-3 pl-4 space-y-4">
                {feedbackItem.timeline.map((evt, idx) => (
                  <div key={idx} className="relative space-y-1">
                    <div className="absolute -left-[23px] top-0.5 w-3 h-3 rounded-full bg-[#00d492] border-2 border-white dark:border-[#1f1f1f]" />
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white text-xs">
                        {evt.title}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock size={11} />
                        {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-neutral-400">
                      {evt.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="border-t border-slate-200 dark:border-[#2a2a2a] pt-4 mt-6 flex items-center justify-end gap-3">
            <Button variant="outline" onClick={onClose} className="cursor-pointer">
              Close Inspector
            </Button>
            {feedbackItem.customerPhone && (
              <Button
                onClick={() => {
                  window.location.href = `tel:${feedbackItem.customerPhone}`;
                }}
                className="flex items-center gap-1.5 cursor-pointer"
              >
                <Phone size={13} />
                <span>Call Customer</span>
              </Button>
            )}
          </div>
        </div>
      )}
    </Dialog>
  );
}

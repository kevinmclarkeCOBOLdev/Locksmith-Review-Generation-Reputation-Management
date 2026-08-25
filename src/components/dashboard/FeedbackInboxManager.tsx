'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import {
  Star,
  Search,
  MessageSquare,
  Sparkles,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Eye,
} from 'lucide-react';
import { FeedbackDetailModal } from './FeedbackDetailModal';
import type { FeedbackInboxItem, FeedbackSummaryStats, FeedbackDetailResult } from '@/services/feedback-inbox.service';

export interface FeedbackInboxManagerProps {
  initialItems?: FeedbackInboxItem[];
  initialSummary?: FeedbackSummaryStats;
  initialTotal?: number;
}

export function FeedbackInboxManager({
  initialItems = [],
  initialSummary = {
    totalFeedback: 0,
    positiveCount: 0,
    negativeCount: 0,
    averageRating: 0,
    platformClickCount: 0,
    platformClickRate: 0,
  },
  initialTotal = 0,
}: FeedbackInboxManagerProps) {
  const [items, setItems] = useState<FeedbackInboxItem[]>(initialItems);
  const [summary, setSummary] = useState<FeedbackSummaryStats>(initialSummary);
  const [total, setTotal] = useState<number>(initialTotal);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState<'all' | 'positive' | 'negative'>('all');
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');
  const [platformClickFilter, setPlatformClickFilter] = useState<'all' | 'yes' | 'no'>('all');

  // Modal State
  const [selectedFeedbackId, setSelectedFeedbackId] = useState<string | null>(null);
  const [detailItem, setDetailItem] = useState<FeedbackDetailResult | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const fetchFeedback = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', limit.toString());
      if (sentimentFilter !== 'all') params.set('sentiment', sentimentFilter);
      if (ratingFilter !== 'all') params.set('rating', ratingFilter.toString());
      if (platformClickFilter !== 'all') params.set('platformClicked', platformClickFilter);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());

      const res = await fetch(`/api/feedback?${params.toString()}`);
      const data = await res.json();

      if (data.success && data.data) {
        setItems(data.data.items);
        setTotal(data.data.total);
        setTotalPages(data.data.totalPages);
        if (data.data.summary) {
          setSummary(data.data.summary);
        }
      }
    } catch (err) {
      console.warn('Could not fetch feedback inbox:', err);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, sentimentFilter, ratingFilter, platformClickFilter, searchQuery]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const handleOpenDetail = async (item: FeedbackInboxItem) => {
    setSelectedFeedbackId(item.id);
    setIsDetailLoading(true);
    try {
      const res = await fetch(`/api/feedback/${item.id}`);
      const data = await res.json();
      if (data.success && data.data) {
        setDetailItem(data.data);
      } else {
        setDetailItem(item as any);
      }
    } catch (err) {
      console.warn('Error fetching feedback detail:', err);
      setDetailItem(item as any);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const positiveRate =
    summary.totalFeedback > 0
      ? Math.round((summary.positiveCount / summary.totalFeedback) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Summary Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border border-slate-200 dark:border-[#333333] p-4 bg-white dark:bg-[#1a1a1a]">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400 block">
            Total Feedback
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {summary.totalFeedback}
            </span>
            <MessageSquare size={18} className="text-slate-400" />
          </div>
        </Card>

        <Card className="border border-slate-200 dark:border-[#333333] p-4 bg-white dark:bg-[#1a1a1a]">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400 block">
            Average Rating
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {summary.averageRating.toFixed(1)}
              </span>
              <Star size={16} className="text-amber-400 fill-amber-400" />
            </div>
            <TrendingUp size={18} className="text-amber-500" />
          </div>
        </Card>

        <Card className="border border-slate-200 dark:border-[#333333] p-4 bg-white dark:bg-[#1a1a1a]">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400 block">
            Positive Ratio (4-5★)
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {positiveRate}%
            </span>
            <Sparkles size={18} className="text-emerald-500" />
          </div>
        </Card>

        <Card className="border border-slate-200 dark:border-[#333333] p-4 bg-white dark:bg-[#1a1a1a]">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400 block">
            Public Platform Clicks
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-black text-[#E76A0E]">
                {summary.platformClickCount}
              </span>
              <span className="text-xs text-slate-400">({summary.platformClickRate}%)</span>
            </div>
            <ExternalLink size={18} className="text-[#E76A0E]" />
          </div>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <Card className="border border-slate-200 dark:border-[#333333] p-4 bg-white dark:bg-[#1a1a1a] space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Search customer, phone, comment..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="pl-9 text-xs"
            />
          </div>

          {/* Sentiment Filter Tabs */}
          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => {
                setSentimentFilter('all');
                setPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                sentimentFilter === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-black'
                  : 'bg-slate-100 dark:bg-[#252525] text-slate-700 dark:text-neutral-300 hover:bg-slate-200'
              }`}
            >
              All ({summary.totalFeedback})
            </button>
            <button
              onClick={() => {
                setSentimentFilter('positive');
                setPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                sentimentFilter === 'positive'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
              }`}
            >
              <Sparkles size={12} />
              <span>Positive 4-5★ ({summary.positiveCount})</span>
            </button>
            <button
              onClick={() => {
                setSentimentFilter('negative');
                setPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                sentimentFilter === 'negative'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 hover:bg-amber-100'
              }`}
            >
              <AlertTriangle size={12} />
              <span>Private 1-3★ ({summary.negativeCount})</span>
            </button>
          </div>

          {/* Refresh Action */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchFeedback()}
            disabled={isLoading}
            className="shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>

        {/* Secondary Filters */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 dark:border-[#2a2a2a] text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-semibold">Stars:</span>
            <select
              value={ratingFilter}
              onChange={(e) => {
                setRatingFilter(e.target.value === 'all' ? 'all' : Number(e.target.value));
                setPage(1);
              }}
              className="px-2 py-1 bg-slate-50 dark:bg-[#252525] border border-slate-200 dark:border-[#333333] text-xs"
            >
              <option value="all">All Stars</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-semibold">Google / Platform Click:</span>
            <select
              value={platformClickFilter}
              onChange={(e) => {
                setPlatformClickFilter(e.target.value as any);
                setPage(1);
              }}
              className="px-2 py-1 bg-slate-50 dark:bg-[#252525] border border-slate-200 dark:border-[#333333] text-xs"
            >
              <option value="all">All Responses</option>
              <option value="yes">Clicked External Platform</option>
              <option value="no">No Platform Click</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Feedback Feed / Table */}
      <Card className="border border-slate-200 dark:border-[#333333] bg-white dark:bg-[#1a1a1a] overflow-hidden">
        {isLoading && items.length === 0 ? (
          <div className="p-16 text-center text-slate-500 space-y-3">
            <div className="w-8 h-8 border-2 border-[#E76A0E] border-t-transparent animate-spin mx-auto" />
            <p className="text-xs">Loading customer feedback...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-12 h-12 bg-slate-100 dark:bg-[#252525] mx-auto flex items-center justify-center text-slate-400">
              <MessageSquare size={24} />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-neutral-200">
              No Feedback Entries Found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery || sentimentFilter !== 'all' || ratingFilter !== 'all'
                ? 'Try adjusting your search query or filter settings.'
                : 'Customer ratings and private comments will appear here as review links are completed.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-[#262626]">
            {items.map((item) => (
              <div
                key={item.id}
                className="p-4 sm:p-5 hover:bg-slate-50/70 dark:hover:bg-[#222222] transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                {/* Left Side: Rating & Customer */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Stars */}
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={14}
                          className={
                            s <= item.rating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-200 dark:text-neutral-700'
                          }
                        />
                      ))}
                    </div>
                    <span className="font-extrabold text-slate-900 dark:text-white text-xs">
                      {item.rating}.0
                    </span>

                    {/* Sentiment Badge */}
                    <Badge
                      variant={item.sentiment === 'positive' ? 'success' : 'warning'}
                      className="text-[10px] uppercase font-bold px-1.5 py-0.5"
                    >
                      {item.sentiment === 'positive' ? 'Positive' : 'Private Issue'}
                    </Badge>

                    {/* Public Platform Click Badge */}
                    {item.publicPlatformClicked && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 border border-emerald-200 dark:border-emerald-900/60">
                        <Sparkles size={11} />
                        <span>Clicked {item.publicPlatformName || 'Google'}</span>
                      </span>
                    )}
                  </div>

                  {/* Customer & Service Info */}
                  <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-neutral-300 flex-wrap">
                    <span className="font-bold text-slate-900 dark:text-white">{item.customerName}</span>
                    <span className="text-slate-300 dark:text-neutral-600">•</span>
                    <span className="text-slate-600 dark:text-neutral-400">{item.serviceType}</span>
                    {item.postcode && (
                      <>
                        <span className="text-slate-300 dark:text-neutral-600">•</span>
                        <span className="text-slate-500 dark:text-neutral-500">{item.postcode}</span>
                      </>
                    )}
                  </div>

                  {/* Private Feedback Comment Snippet */}
                  {item.feedbackText ? (
                    <div className="p-2.5 bg-amber-50/50 dark:bg-amber-950/20 border-l-2 border-amber-500 text-xs text-slate-700 dark:text-neutral-300 mt-1 italic leading-relaxed">
                      &ldquo;{item.feedbackText}&rdquo;
                    </div>
                  ) : item.sentiment === 'positive' ? (
                    <p className="text-[11px] text-slate-400 dark:text-neutral-500">
                      Customer submitted a 5-star positive review rating.
                    </p>
                  ) : null}
                </div>

                {/* Right Side: Timestamp & Inspect Action */}
                <div className="flex sm:flex-col md:flex-row items-center gap-3 w-full md:w-auto justify-between shrink-0">
                  <span className="text-[11px] text-slate-400">
                    {new Date(item.createdAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenDetail(item)}
                    className="flex items-center gap-1.5 text-xs cursor-pointer"
                  >
                    <Eye size={13} />
                    <span>Inspect</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-[#262626] flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total} items
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || isLoading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="cursor-pointer"
              >
                <ChevronLeft size={14} />
              </Button>
              <span className="font-semibold">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages || isLoading}
                onClick={() => setPage((p) => p + 1)}
                className="cursor-pointer"
              >
                <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Inspector Modal */}
      <FeedbackDetailModal
        isOpen={Boolean(selectedFeedbackId)}
        onClose={() => {
          setSelectedFeedbackId(null);
          setDetailItem(null);
        }}
        feedbackItem={detailItem}
        isLoading={isDetailLoading}
      />
    </div>
  );
}

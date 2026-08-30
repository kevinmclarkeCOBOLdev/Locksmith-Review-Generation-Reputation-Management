'use client';

import React, { useState, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Star,
  TrendingUp,
  ExternalLink,
  MessageSquare,
  Sparkles,
  RefreshCw,
  Clock,
  Smartphone,
  Mail,
  Layers,
  HelpCircle,
  BarChart3,
} from 'lucide-react';
import type { ReputationAnalyticsResult, AnalyticsTimeRange } from '@/services/analytics.service';

export interface AnalyticsDashboardManagerProps {
  initialData: ReputationAnalyticsResult;
}

export function AnalyticsDashboardManager({ initialData }: AnalyticsDashboardManagerProps) {
  const [data, setData] = useState<ReputationAnalyticsResult>(initialData);
  const [timeRange, setTimeRange] = useState<AnalyticsTimeRange>(initialData.timeRange || '30d');
  const [isLoading, setIsLoading] = useState(false);

  const fetchAnalytics = useCallback(async (selectedRange: AnalyticsTimeRange) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/analytics/reputation?timeRange=${selectedRange}`);
      const result = await res.json();
      if (result.success && result.data) {
        setData(result.data);
      }
    } catch (err) {
      console.warn('Error fetching analytics:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleTimeRangeChange = (range: AnalyticsTimeRange) => {
    setTimeRange(range);
    fetchAnalytics(range);
  };

  const { metrics, ratingDistribution, channelPerformance, platformPerformance } = data;

  return (
    <div className="space-y-6">
      {/* Time Range Selector & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white dark:bg-[#1a1a1a] p-4 border border-slate-200 dark:border-[#333333]">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-[#00d492]" />
          <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Reporting Period:
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
          {(
            [
              { id: 'today', label: 'Today' },
              { id: '7d', label: 'Last 7 Days' },
              { id: '30d', label: 'Last 30 Days' },
              { id: 'all', label: 'All Time' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => handleTimeRangeChange(t.id)}
              className={`px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                timeRange === t.id
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-sm'
                  : 'bg-slate-100 dark:bg-[#252525] text-slate-700 dark:text-neutral-300 hover:bg-slate-200 dark:hover:bg-[#303030]'
              }`}
            >
              {t.label}
            </button>
          ))}

          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchAnalytics(timeRange)}
            disabled={isLoading}
            className="ml-1 cursor-pointer"
          >
            <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
          </Button>
        </div>
      </div>

      {/* Core KPI Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1: Sent Requests */}
        <Card className="border border-slate-200 dark:border-[#333333] p-5 bg-white dark:bg-[#1a1a1a] relative">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400">
              Requests Dispatched
            </span>
            <div title="Total review request notifications sent via SMS and Email">
              <HelpCircle size={13} className="text-slate-400 cursor-help" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-3">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {metrics.sentRequests}
            </span>
            <MessageSquare size={20} className="text-[#00d492]" />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-2">
            {metrics.totalRequests} total created ({metrics.failedRequests} failed)
          </p>
        </Card>

        {/* Metric 2: Response Rate */}
        <Card className="border border-slate-200 dark:border-[#333333] p-5 bg-white dark:bg-[#1a1a1a]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400">
              Response Rate
            </span>
            <div title="Percentage of sent review requests that received a 1–5 star rating">
              <HelpCircle size={13} className="text-slate-400 cursor-help" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-3">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                {metrics.responseRate}%
              </span>
            </div>
            <TrendingUp size={20} className="text-emerald-500" />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-2">
            {metrics.responseCount} verified customer responses
          </p>
        </Card>

        {/* Metric 3: Average Rating */}
        <Card className="border border-slate-200 dark:border-[#333333] p-5 bg-white dark:bg-[#1a1a1a]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400">
              Average Rating
            </span>
            <div title="Arithmetic mean of all ratings submitted by customers in MySQL">
              <HelpCircle size={13} className="text-slate-400 cursor-help" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-3">
            <div className="flex items-center gap-1.5">
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                {metrics.averageRating > 0 ? metrics.averageRating.toFixed(1) : '0.0'}
              </span>
              <Star size={20} className="text-amber-400 fill-amber-400" />
            </div>
            <Sparkles size={20} className="text-amber-500" />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-2">
            {metrics.positiveRatio}% positive (4–5★) ratio
          </p>
        </Card>

        {/* Metric 4: Public Platform Click Rate */}
        <Card className="border border-slate-200 dark:border-[#333333] p-5 bg-white dark:bg-[#1a1a1a]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400">
              Public Review Clicks
            </span>
            <div title="Customers who clicked through to Google Reviews or Trustpilot">
              <HelpCircle size={13} className="text-slate-400 cursor-help" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-[#00d492]">
                {metrics.publicClickCount}
              </span>
              <span className="text-xs font-bold text-slate-400">
                ({metrics.publicClickRate}%)
              </span>
            </div>
            <ExternalLink size={20} className="text-[#00d492]" />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-2">
            One-tap Google Reviews conversion
          </p>
        </Card>
      </div>

      {/* Row 2: Star Rating Distribution & Sentiment Split */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Star Rating Distribution Visualizer */}
        <Card className="border border-slate-200 dark:border-[#333333] p-6 bg-white dark:bg-[#1a1a1a] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <BarChart3 size={16} className="text-[#00d492]" />
              <span>Rating Distribution</span>
            </h3>
            <span className="text-xs text-slate-400">
              {metrics.responseCount} Total Responses
            </span>
          </div>

          <div className="space-y-3 pt-1 text-xs">
            {ratingDistribution.map((b) => (
              <div key={b.stars} className="flex items-center gap-3">
                <div className="w-14 flex items-center gap-1 shrink-0 font-bold text-slate-700 dark:text-neutral-300">
                  <span>{b.stars}</span>
                  <Star size={12} className="text-amber-400 fill-amber-400" />
                </div>

                <div className="flex-1 bg-slate-100 dark:bg-[#262626] h-3 rounded-none overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      b.stars >= 4
                        ? 'bg-emerald-500'
                        : b.stars === 3
                        ? 'bg-amber-400'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${b.percentage}%` }}
                  />
                </div>

                <div className="w-20 text-right shrink-0">
                  <span className="font-extrabold text-slate-900 dark:text-white">{b.count}</span>
                  <span className="text-[11px] text-slate-400 ml-1">({b.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Sentiment & Public Platform Redirection */}
        <Card className="border border-slate-200 dark:border-[#333333] p-6 bg-white dark:bg-[#1a1a1a] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles size={16} className="text-emerald-500" />
              <span>Sentiment & Public Routing</span>
            </h3>
            <Badge variant="outline" className="text-[10px] uppercase">
              Routing Breakdown
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
                Positive (4–5★)
              </span>
              <div className="text-2xl font-black text-emerald-800 dark:text-emerald-200">
                {metrics.positiveCount}
              </div>
              <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80">
                Routed to Google Review boost
              </p>
            </div>

            <div className="p-4 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-400 block">
                Private Issues (1–3★)
              </span>
              <div className="text-2xl font-black text-amber-800 dark:text-amber-200">
                {metrics.negativeCount}
              </div>
              <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80">
                Intercepted for private resolution
              </p>
            </div>
          </div>

          {/* External Platform Clicks */}
          <div className="pt-2 border-t border-slate-100 dark:border-[#2a2a2a] space-y-2 text-xs">
            <span className="text-[11px] font-bold text-slate-700 dark:text-neutral-300 block">
              External Destination Clicks:
            </span>
            <div className="space-y-1.5">
              {platformPerformance.map((p) => (
                <div
                  key={p.platformName}
                  className="flex items-center justify-between p-2 bg-slate-50 dark:bg-[#202020] border border-slate-200 dark:border-[#2e2e2e]"
                >
                  <div className="flex items-center gap-2">
                    <ExternalLink size={12} className="text-[#00d492]" />
                    <span className="font-semibold text-slate-800 dark:text-neutral-200">{p.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold">
                    <span>{p.clickCount} clicks</span>
                    <span className="text-slate-400 text-[10px]">({p.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Row 3: Channel Performance Breakdown (SMS vs Email) */}
      <Card className="border border-slate-200 dark:border-[#333333] p-6 bg-white dark:bg-[#1a1a1a] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Layers size={16} className="text-[#00d492]" />
              <span>Channel Performance & Conversion</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
              Compare response rates and satisfaction metrics across dispatch channels.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-[#2e2e2e] text-slate-500 font-bold uppercase text-[10px]">
                <th className="py-2.5 px-3">Channel</th>
                <th className="py-2.5 px-3">Dispatched</th>
                <th className="py-2.5 px-3">Responses</th>
                <th className="py-2.5 px-3">Response Rate</th>
                <th className="py-2.5 px-3">Avg Rating</th>
                <th className="py-2.5 px-3">Positive Reviews</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#252525]">
              {channelPerformance.map((ch) => (
                <tr key={ch.channel} className="hover:bg-slate-50/60 dark:hover:bg-[#202020]">
                  <td className="py-3 px-3 font-bold uppercase flex items-center gap-2">
                    {ch.channel === 'sms' && <Smartphone size={14} className="text-[#00d492]" />}
                    {ch.channel === 'email' && <Mail size={14} className="text-blue-500" />}
                    {ch.channel === 'both' && <MessageSquare size={14} className="text-emerald-500" />}
                    <span>{ch.channel}</span>
                  </td>
                  <td className="py-3 px-3 font-semibold">{ch.sent}</td>
                  <td className="py-3 px-3 font-semibold">{ch.responded}</td>
                  <td className="py-3 px-3 font-extrabold text-emerald-600 dark:text-emerald-400">
                    {ch.responseRate}%
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1 font-bold">
                      <span>{ch.averageRating > 0 ? ch.averageRating.toFixed(1) : '—'}</span>
                      {ch.averageRating > 0 && <Star size={11} className="text-amber-400 fill-amber-400" />}
                    </div>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-700 dark:text-neutral-300">
                    {ch.positiveCount} (
                    {ch.responded > 0
                      ? Math.round((ch.positiveCount / ch.responded) * 100)
                      : 0}
                    %)
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

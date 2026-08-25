import React from 'react';
import Link from 'next/link';
import {
  Send,
  Star,
  TrendingUp,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  MessageSquare,
  Plus,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { resolveAuthenticatedTenantContext } from '@/services/tenant.service';
import { getDashboardOverviewData } from '@/services/dashboard.service';

export const dynamic = 'force-dynamic';

export default async function DashboardOverviewPage() {
  // 1. Authoritative server-side tenant resolution
  const context = await resolveAuthenticatedTenantContext();

  // 2. Fetch live MySQL reputation and review metrics for the resolved tenant
  const data = await getDashboardOverviewData(context.tenantId);
  const { metrics, recentRequests, recentFeedback } = data;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* 1. Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 dark:border-[#2a2a2a] pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Reputation Overview
            </h1>
            <Badge variant="outline" className="hidden sm:inline-flex items-center gap-1.5 py-0.5 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              MySQL Live
            </Badge>
          </div>
          <p className="text-sm text-slate-600 dark:text-neutral-400 mt-1">
            Real-time review generation, response rates, and Google Reviews conversion metrics for{' '}
            <strong className="text-slate-800 dark:text-neutral-200">{context.tenant.name}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link href="/dashboard/settings">
            <Button variant="outline" size="sm" className="gap-2">
              Platform Settings
            </Button>
          </Link>
          <Link href="/dashboard/requests">
            <Button variant="primary" size="sm" className="gap-2 bg-[#E76A0E] hover:bg-[#d05c08] text-white">
              <Plus size={16} />
              New Review Request
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Primary 4-Card KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: Requests Sent */}
        <Card className="shadow-sm hover:shadow transition-all border-slate-200 dark:border-[#333]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400">
                Requests Sent
              </span>
              <div className="w-10 h-10 bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <Send size={20} />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-black text-slate-900 dark:text-white">
                {metrics.sentRequests}
              </div>
              <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
                {metrics.totalRequests} total requests created
              </p>
            </div>
          </CardContent>
        </Card>

        {/* KPI 2: Response Rate */}
        <Card className="shadow-sm hover:shadow transition-all border-slate-200 dark:border-[#333]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400">
                Response Rate
              </span>
              <div className="w-10 h-10 bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <TrendingUp size={20} />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-black text-slate-900 dark:text-white">
                {metrics.responseRate}%
              </div>
              <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
                {metrics.responseCount} customer responses recorded
              </p>
            </div>
          </CardContent>
        </Card>

        {/* KPI 3: Average Star Rating */}
        <Card className="shadow-sm hover:shadow transition-all border-slate-200 dark:border-[#333]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400">
                Average Rating
              </span>
              <div className="w-10 h-10 bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Star size={20} className="fill-amber-500" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-black text-slate-900 dark:text-white flex items-baseline gap-2">
                {metrics.averageRating > 0 ? metrics.averageRating.toFixed(1) : '—'}
                <span className="text-sm font-semibold text-amber-500">/ 5.0</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
                {metrics.positiveRate}% positive (4–5 ★)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* KPI 4: Google Review Clicks */}
        <Card className="shadow-sm hover:shadow transition-all border-slate-200 dark:border-[#333]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400">
                Public Review Clicks
              </span>
              <div className="w-10 h-10 bg-[#E76A0E]/10 text-[#E76A0E] flex items-center justify-center">
                <ExternalLink size={20} />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-black text-slate-900 dark:text-white">
                {metrics.publicClicks}
              </div>
              <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
                {metrics.publicClickRate}% public platform conversion
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Sentiment Distribution & Routing Architecture */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Rating Breakdown Progress */}
        <Card className="lg:col-span-2 shadow-sm border-slate-200 dark:border-[#333]">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Customer Rating Distribution</CardTitle>
            <CardDescription>
              Breakdown of 1–5 star customer feedback responses
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = metrics.ratingDistribution[stars as 1 | 2 | 3 | 4 | 5] || 0;
              const percent = metrics.responseCount > 0 ? Math.round((count / metrics.responseCount) * 100) : 0;
              const isPositive = stars >= 4;

              return (
                <div key={stars} className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1 w-14 font-bold text-slate-700 dark:text-neutral-300">
                    <span>{stars}</span>
                    <Star size={12} className="fill-amber-400 text-amber-400" />
                  </div>
                  <div className="flex-1 h-3 bg-slate-100 dark:bg-[#262626] overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isPositive ? 'bg-amber-400' : 'bg-rose-400'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="w-20 text-right font-semibold text-slate-500 dark:text-neutral-400">
                    {count} ({percent}%)
                  </div>
                </div>
              );
            })}

            <div className="pt-4 border-t border-slate-200 dark:border-[#2a2a2a] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-amber-400 inline-block"></span>
                <span className="text-slate-600 dark:text-neutral-400">
                  Positive Feedback (4–5★): <strong>{metrics.positiveCount}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-rose-400 inline-block"></span>
                <span className="text-slate-600 dark:text-neutral-400">
                  Private Recovery (1–3★): <strong>{metrics.negativeCount}</strong>
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right 1 Col: Two-Way Routing Visualizer */}
        <Card className="shadow-sm border-slate-200 dark:border-[#333] flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Feedback Routing</CardTitle>
            <CardDescription>Automated two-way reputation protection</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
                <CheckCircle2 size={16} />
                <span>Positive Routing (4–5 Stars)</span>
              </div>
              <p className="text-slate-600 dark:text-neutral-400 leading-relaxed">
                Satisfied customers are directed straight to <strong>Google Reviews</strong> to elevate Google Maps ranking.
              </p>
            </div>

            <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 space-y-1.5">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold">
                <AlertTriangle size={16} />
                <span>Private Interception (1–3 Stars)</span>
              </div>
              <p className="text-slate-600 dark:text-neutral-400 leading-relaxed">
                Unhappy customers submit constructive feedback privately to your dashboard before negative reviews hit public sites.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4. Recent Review Requests Table */}
      <Card className="shadow-sm border-slate-200 dark:border-[#333]">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-lg font-bold">Recent Review Requests</CardTitle>
            <CardDescription>Latest customer dispatches from completed jobs</CardDescription>
          </div>
          <Link href="/dashboard/requests">
            <Button variant="ghost" size="sm" className="gap-1 text-xs text-[#E76A0E]">
              View All Requests
              <ArrowUpRight size={14} />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentRequests.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <Send size={32} className="mx-auto text-slate-400 dark:text-neutral-600" />
              <p className="text-sm font-semibold text-slate-600 dark:text-neutral-400">
                No review requests created yet
              </p>
              <Link href="/dashboard/requests">
                <Button size="sm" variant="primary" className="bg-[#E76A0E] text-white">
                  Create First Review Request
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[11px] uppercase tracking-wider text-slate-400 dark:text-neutral-500 border-b border-slate-200 dark:border-[#2a2a2a]">
                  <tr>
                    <th className="py-3 px-2">Customer</th>
                    <th className="py-3 px-2">Service</th>
                    <th className="py-3 px-2">Channel</th>
                    <th className="py-3 px-2">Status</th>
                    <th className="py-3 px-2">Rating</th>
                    <th className="py-3 px-2 text-right">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#262626]">
                  {recentRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-[#222] transition-colors">
                      <td className="py-3 px-2 font-bold text-slate-900 dark:text-white">
                        {req.customerName}
                      </td>
                      <td className="py-3 px-2 text-slate-600 dark:text-neutral-400">
                        {req.serviceType}
                      </td>
                      <td className="py-3 px-2">
                        <span className="uppercase text-[10px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-[#333] text-slate-700 dark:text-neutral-300">
                          {req.channel}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <Badge
                          variant={
                            req.status === 'positive' || req.status === 'responded'
                              ? 'success'
                              : req.status === 'negative'
                              ? 'danger'
                              : req.status === 'sent'
                              ? 'default'
                              : 'outline'
                          }
                          className="text-[10px] uppercase font-bold"
                        >
                          {req.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-2">
                        {req.rating ? (
                          <div className="flex items-center gap-1 font-bold text-amber-500">
                            <span>{req.rating}</span>
                            <Star size={12} className="fill-amber-400" />
                          </div>
                        ) : (
                          <span className="text-slate-400 dark:text-neutral-600">—</span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-right text-slate-500 dark:text-neutral-400">
                        {new Date(req.createdAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 5. Recent Private Feedback Inbox Tickets */}
      <Card className="shadow-sm border-slate-200 dark:border-[#333]">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-lg font-bold">Recent Customer Feedback Feed</CardTitle>
            <CardDescription>Verified feedback submissions and private customer resolution</CardDescription>
          </div>
          <Link href="/dashboard/feedback">
            <Button variant="ghost" size="sm" className="gap-1 text-xs text-[#E76A0E]">
              Feedback Inbox
              <ArrowUpRight size={14} />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentFeedback.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <MessageSquare size={32} className="mx-auto text-slate-400 dark:text-neutral-600" />
              <p className="text-sm font-semibold text-slate-600 dark:text-neutral-400">
                No customer feedback submissions yet
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentFeedback.map((fb) => (
                <div
                  key={fb.id}
                  className="p-4 border border-slate-200 dark:border-[#2a2a2a] bg-slate-50 dark:bg-[#1a1a1a] space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {fb.customerName}
                      </p>
                      <span className="text-[10px] text-slate-500 dark:text-neutral-400">
                        {fb.serviceType}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 bg-amber-400/10 px-2 py-0.5 text-amber-500 font-bold text-xs">
                      <span>{fb.rating}</span>
                      <Star size={12} className="fill-amber-400" />
                    </div>
                  </div>

                  {fb.feedbackText ? (
                    <p className="text-xs text-slate-700 dark:text-neutral-300 italic bg-white dark:bg-[#222] p-2.5 border border-slate-200 dark:border-[#333]">
                      &ldquo;{fb.feedbackText}&rdquo;
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400 dark:text-neutral-500 italic">
                      Customer submitted rating without private comments.
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-1 text-[10px]">
                    {fb.sentiment === 'positive' ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 size={12} />
                        {fb.publicPlatformClicked ? 'Shared on Google Reviews' : 'Positive Rating'}
                      </span>
                    ) : (
                      <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
                        <AlertTriangle size={12} />
                        Private Recovery Ticket
                      </span>
                    )}

                    <span className="text-slate-400 dark:text-neutral-500">
                      {new Date(fb.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import React from 'react';
import { resolveAuthenticatedTenantContext } from '@/services/tenant.service';
import { getFeedbackInbox } from '@/services/feedback-inbox.service';
import { FeedbackInboxManager } from '@/components/dashboard/FeedbackInboxManager';

export const dynamic = 'force-dynamic';

export default async function FeedbackInboxPage() {
  const context = await resolveAuthenticatedTenantContext();
  const initialData = await getFeedbackInbox(context.tenant.id, { page: 1, limit: 15 });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="pb-6 border-b border-slate-200 dark:border-[#333333]">
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Feedback & Review Inbox
        </h1>
        <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
          Review feedback responses for <span className="font-semibold text-slate-900 dark:text-white">{context.tenant.name}</span>. Monitor 5-star public ratings, Google review click-throughs, and resolve 1–3 star private complaints directly.
        </p>
      </div>

      {/* Interactive Feedback Inbox Manager */}
      <FeedbackInboxManager
        initialItems={initialData.items}
        initialSummary={initialData.summary}
        initialTotal={initialData.total}
      />
    </div>
  );
}

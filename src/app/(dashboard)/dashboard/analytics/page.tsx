import React from 'react';
import { resolveAuthenticatedTenantContext } from '@/services/tenant.service';
import { getReputationAnalytics } from '@/services/analytics.service';
import { AnalyticsDashboardManager } from '@/components/dashboard/AnalyticsDashboardManager';

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
  const context = await resolveAuthenticatedTenantContext();
  const initialData = await getReputationAnalytics(context.tenant.id, '30d');

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200 dark:border-[#333333]">
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Reputation Analytics & ROI
        </h1>
        <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
          Evidence-based reputation growth, customer response rates, star distribution, and Google review conversions for <span className="font-semibold text-slate-900 dark:text-white">{context.tenant.name}</span>.
        </p>
      </div>

      {/* Interactive Analytics Dashboard */}
      <AnalyticsDashboardManager initialData={initialData} />
    </div>
  );
}

import React from 'react';
import { resolveAuthenticatedTenantContext } from '@/services/tenant.service';
import { getTenantReputationSettings } from '@/services/settings.service';
import { ReputationSettingsManager } from '@/components/dashboard/ReputationSettingsManager';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const context = await resolveAuthenticatedTenantContext();
  const settings = await getTenantReputationSettings(context.tenant.id);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200 dark:border-[#333333]">
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Reputation Platforms & Templates
        </h1>
        <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
          Configure public review destinations, automated delivery channels, dynamic templates, and expiration rules for <span className="font-semibold text-slate-900 dark:text-white">{context.tenant.name}</span>.
        </p>
      </div>

      {/* Interactive Settings Dashboard */}
      <ReputationSettingsManager initialSettings={settings} />
    </div>
  );
}

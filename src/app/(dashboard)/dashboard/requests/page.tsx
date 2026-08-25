import React from 'react';
import { resolveAuthenticatedTenantContext } from '@/services/tenant.service';
import { getReviewRequests } from '@/services/review.service';
import { ReviewRequestsManager } from '@/components/dashboard/ReviewRequestsManager';

export const dynamic = 'force-dynamic';

export default async function ReviewRequestsPage() {
  const context = await resolveAuthenticatedTenantContext();
  const initialData = await getReviewRequests(context.tenantId, { page: 1, limit: 20 });

  return (
    <div className="max-w-7xl mx-auto">
      <ReviewRequestsManager
        initialRequests={initialData.items}
        initialTotal={initialData.total}
        initialPage={initialData.page}
        initialLimit={initialData.limit}
        tenantName={context.tenant.name}
      />
    </div>
  );
}

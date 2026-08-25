import { NextResponse } from 'next/server';
import { processCompletedJobAutomations } from '@/services/automation.service';
import { resolveAuthenticatedTenantContext } from '@/services/tenant.service';
import type { ApiResponse } from '@/types/api';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    // 1. Authorization: either Bearer CRON_SECRET or authenticated session
    const authHeader = req.headers.get('authorization') || '';
    const cronSecret = process.env.CRON_SECRET || 'dev-cron-secret';
    const isCronAuthorized =
      authHeader === `Bearer ${cronSecret}` ||
      new URL(req.url).searchParams.get('secret') === cronSecret;

    let targetTenantId: string | undefined;

    if (!isCronAuthorized) {
      const context = await resolveAuthenticatedTenantContext(req);
      if (!context || !context.tenant) {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: 'Unauthorized: Valid CRON_SECRET or authenticated session required.',
          },
          { status: 401 }
        );
      }
      targetTenantId = context.tenant.id;
    } else {
      // If cron provided optional tenant filter in query
      const urlTenant = new URL(req.url).searchParams.get('tenantId');
      if (urlTenant) targetTenantId = urlTenant;
    }

    // 2. Run post-job automations
    const result = await processCompletedJobAutomations(targetTenantId);

    return NextResponse.json<ApiResponse<typeof result>>({
      success: true,
      data: result,
      message: `Processed ${result.totalInspected} completed leads: ${result.totalDispatched} dispatched, ${result.totalSkipped} skipped.`,
    });
  } catch (error: any) {
    console.error('[API /api/automation/trigger POST] Error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || 'Failed to process post-job review automations.',
      },
      { status: 500 }
    );
  }
}

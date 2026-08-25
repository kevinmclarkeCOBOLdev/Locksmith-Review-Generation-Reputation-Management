import { NextResponse } from 'next/server';
import { triggerLeadJobCompletionAutomation } from '@/services/automation.service';
import { resolveAuthenticatedTenantContext } from '@/services/tenant.service';
import type { ApiResponse } from '@/types/api';

export const dynamic = 'force-dynamic';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: leadId } = await params;
    if (!leadId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Missing lead ID parameter.' },
        { status: 400 }
      );
    }

    // Authorization: either Bearer CRON_SECRET or authenticated session
    const authHeader = req.headers.get('authorization') || '';
    const cronSecret = process.env.CRON_SECRET || 'dev-cron-secret';
    const isCronAuthorized =
      authHeader === `Bearer ${cronSecret}` ||
      new URL(req.url).searchParams.get('secret') === cronSecret;

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
    }

    const result = await triggerLeadJobCompletionAutomation(leadId);

    if (!result.success) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: `Lead review request skipped: ${result.decision.reason}`,
          data: result,
        },
        { status: 200 }
      );
    }

    return NextResponse.json<ApiResponse<typeof result>>({
      success: true,
      data: result,
      message: `Automated review request created and dispatched for lead ${leadId}.`,
    });
  } catch (error: any) {
    console.error('[API /api/automation/lead/[id]/complete POST] Error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || 'Failed to trigger job completion automation.',
      },
      { status: 500 }
    );
  }
}

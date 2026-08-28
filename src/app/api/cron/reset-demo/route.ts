import { NextResponse } from 'next/server';
import { demoResetScheduler, demoResetService } from '@/services/demo';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/cron/reset-demo
 * Returns the current status of the in-process demo reset scheduler and service diagnostics.
 */
export async function GET() {
  try {
    const schedulerStatus = demoResetScheduler.getStatus();
    const serviceStatus = demoResetService.getDemoResetStatus();

    return NextResponse.json({
      success: true,
      scheduler: schedulerStatus,
      service: serviceStatus,
    });
  } catch (err: any) {
    console.error('[API /api/cron/reset-demo GET] Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch demo reset status' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cron/reset-demo
 * Triggers an immediate reset run.
 * Can be called manually from the admin portal, by internal schedulers, or external cron triggers.
 * If CRON_SECRET is configured in environment, verifies Bearer authorization.
 */
export async function POST(req: Request) {
  try {
    // Optional secret verification for external webhook/cron triggers
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const authHeader = req.headers.get('authorization') || '';
      const secretHeader = req.headers.get('x-cron-secret') || '';
      const isBearerMatch = authHeader.replace(/^Bearer\s+/i, '').trim() === cronSecret.trim();
      const isHeaderMatch = secretHeader.trim() === cronSecret.trim();

      if (!isBearerMatch && !isHeaderMatch) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized: Invalid or missing cron secret' },
          { status: 401 }
        );
      }
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // Body is optional
    }

    const triggeredBy = body?.triggeredBy || 'API / Webhook Trigger';
    const result = await demoResetScheduler.triggerReset(triggeredBy);

    return NextResponse.json({
      success: true,
      message: 'LockReview demo database reset executed successfully.',
      result,
    });
  } catch (err: any) {
    console.error('[API /api/cron/reset-demo POST] Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to execute demo reset' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { checkDatabaseConnection } from '@/db';
import type { ApiResponse } from '@/types/api';

export async function GET() {
  const dbHealth = await checkDatabaseConnection();

  return NextResponse.json<ApiResponse>({
    success: true,
    data: {
      application: 'LockReview',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
      database: {
        connected: dbHealth.connected,
        error: dbHealth.error || null,
      },
    },
  });
}

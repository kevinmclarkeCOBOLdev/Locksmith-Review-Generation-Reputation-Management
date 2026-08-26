import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyJWT } from '@/lib/jwt';
import { HomeClient } from '@/components/home/HomeClient';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session')?.value;
  const session = sessionToken ? await verifyJWT(sessionToken) : null;

  if (session) {
    redirect('/dashboard');
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-[#181818]" />}>
      <HomeClient />
    </Suspense>
  );
}

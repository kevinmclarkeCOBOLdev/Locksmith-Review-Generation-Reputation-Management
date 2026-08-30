import React from 'react';
import { validateReviewToken } from '@/services/public-review.service';
import { CustomerReviewForm } from '@/components/public-review/CustomerReviewForm';
import { ShieldCheck } from 'lucide-react';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

interface PublicReviewPageProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function PublicCustomerReviewPage({ params }: PublicReviewPageProps) {
  const { token } = await params;
  const initialData = await validateReviewToken(token);
  const businessName = initialData.businessName || 'DEMO Locksmith';

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-100 dark:bg-[#141414] text-slate-900 dark:text-neutral-100 font-sans p-4 sm:p-6 transition-colors duration-200">
      {/* Mobile-first Header */}
      <div className="max-w-md w-full mx-auto text-center pt-4 sm:pt-8 space-y-2">
        {initialData.logoUrl ? (
          <div className="w-14 h-14 mx-auto mb-2 relative">
            <Image
              src={initialData.logoUrl}
              alt={businessName}
              fill
              className="object-contain"
            />
          </div>
        ) : (
          <div className="w-12 h-12 bg-[#00d492] text-slate-950 flex items-center justify-center font-black text-base mx-auto mb-2 shadow-md">
            {businessName.substring(0, 2).toUpperCase()}
          </div>
        )}

        <h1 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight">
          {businessName}
        </h1>

        <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-neutral-400">
          <ShieldCheck size={13} className="text-emerald-500" />
          <span>Verified Customer Review Portal</span>
        </div>
      </div>

      {/* Main Review Form Card */}
      <div className="max-w-md w-full mx-auto my-auto py-6">
        <CustomerReviewForm initialData={initialData} token={token} />
      </div>

      {/* Trust & Privacy Footer */}
      <div className="max-w-md w-full mx-auto text-center text-[11px] text-slate-400 dark:text-neutral-600 pb-4 space-y-1">
        <div>Powered by <span className="font-bold text-slate-600 dark:text-neutral-400">LockReview</span> • Reputation & Customer Protection</div>
        <div className="text-[10px] text-slate-400 dark:text-neutral-600">Your privacy is respected. No spam guaranteed.</div>
      </div>
    </div>
  );
}

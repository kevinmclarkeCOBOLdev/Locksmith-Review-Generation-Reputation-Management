import React, { Suspense } from 'react';
import Link from 'next/link';
import { Shield, Sparkles } from 'lucide-react';
import { LoginForm } from '@/components/auth/LoginForm';
import { ThemeToggle } from '@/components/ThemeProvider';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-[#181818] text-slate-900 dark:text-neutral-100 font-sans p-6">
      {/* Top bar */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#E76A0E] text-white flex items-center justify-center font-black text-xs">
            LR
          </div>
          <div>
            <span className="font-extrabold text-sm text-slate-900 dark:text-white">LockReview</span>
            <span className="ml-1.5 text-[9px] text-[#E76A0E] uppercase font-bold tracking-wider">Atypikal</span>
          </div>
        </Link>
        <ThemeToggle />
      </div>

      {/* Main card */}
      <div className="max-w-md w-full mx-auto my-auto py-8">
        <Card className="border border-slate-200 dark:border-[#383838] shadow-lg">
          <CardHeader className="text-center pb-2">
            <div className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1 bg-orange-50 dark:bg-orange-950/40 text-[#E76A0E] border border-orange-200 dark:border-orange-900/40 text-[10px] font-bold uppercase tracking-widest mx-auto mb-3">
              <Sparkles size={12} />
              Review & Reputation Suite
            </div>
            <CardTitle className="text-2xl font-black">Locksmith Sign In</CardTitle>
            <CardDescription className="text-xs">
              Authenticate using your shared LockQuote locksmith credentials.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4">
            <Suspense fallback={<div className="text-center py-8 text-xs text-slate-400">Loading auth form...</div>}>
              <LoginForm />
            </Suspense>
          </CardContent>
        </Card>

        {/* Security assurance */}
        <div className="mt-6 text-center text-xs text-slate-500 dark:text-neutral-500 flex items-center justify-center gap-1.5">
          <Shield size={13} className="text-[#E76A0E]" />
          <span>Server-Side Isolated Tenant Access</span>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-md w-full mx-auto text-center text-[11px] text-slate-400 dark:text-neutral-600">
        LockReview SaaS Platform • Coexisting with Shared MySQL Database
      </div>
    </div>
  );
}

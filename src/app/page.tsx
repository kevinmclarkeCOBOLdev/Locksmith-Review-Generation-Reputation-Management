import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ShieldCheck, ArrowRight, CheckCircle, ExternalLink, Sparkles, MessageSquare, ThumbsUp } from 'lucide-react';
import { verifyJWT } from '@/lib/jwt';
import { Button } from '@/components/ui/Button';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session')?.value;
  const session = sessionToken ? await verifyJWT(sessionToken) : null;

  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-[#181818] text-slate-900 dark:text-neutral-100">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-[#2e2e2e] bg-white dark:bg-[#1f1f1f] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#E76A0E] text-white flex items-center justify-center font-black text-sm">
              LR
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                LockReview
              </span>
              <span className="ml-2 text-[10px] text-[#E76A0E] uppercase tracking-widest font-bold">
                Ecosystem
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="http://localhost:3000"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <ExternalLink size={13} />
              Open LockQuote
            </Link>
            <Link href="/login">
              <Button size="sm" className="font-bold">
                Locksmith Sign In
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-16 md:py-24 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/50 text-[#E76A0E] text-xs font-bold uppercase tracking-wider mb-8">
          <Sparkles size={14} />
          LockQuote Ecosystem Reputation Engine
        </div>

        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white max-w-4xl leading-tight">
          Automate 5-Star Reviews & Protect Your Locksmith Reputation
        </h1>

        <p className="mt-6 text-base md:text-lg text-slate-600 dark:text-neutral-300 max-w-2xl leading-relaxed">
          Direct 4–5 star satisfied customers to Google Reviews in one tap. Intercept 1–3 star private complaints internally before they ever hit the public internet.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
          <Link href="/login">
            <Button size="lg" className="px-8 py-4 text-sm font-black uppercase tracking-wider flex items-center gap-2">
              Launch LockReview Dashboard
              <ArrowRight size={16} />
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg" className="px-8 py-4 text-sm font-bold uppercase tracking-wider">
              Demo Locksmith Login
            </Button>
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full">
          <div className="p-6 bg-white dark:bg-[#222222] border border-slate-200 dark:border-[#333333]">
            <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold mb-4">
              <ThumbsUp size={20} />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Positive Review Routing</h3>
            <p className="mt-2 text-xs text-slate-600 dark:text-neutral-400 leading-relaxed">
              4 & 5-star ratings immediately route the customer to your Google Business Profile, boosting local Google Maps pack rankings.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-[#222222] border border-slate-200 dark:border-[#333333]">
            <div className="w-10 h-10 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold mb-4">
              <MessageSquare size={20} />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Private Feedback Interception</h3>
            <p className="mt-2 text-xs text-slate-600 dark:text-neutral-400 leading-relaxed">
              1–3 star ratings invite private constructive feedback to your dashboard, allowing you to resolve customer issues before public harm.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-[#222222] border border-slate-200 dark:border-[#333333]">
            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold mb-4">
              <ShieldCheck size={20} />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Shared MySQL Database</h3>
            <p className="mt-2 text-xs text-slate-600 dark:text-neutral-400 leading-relaxed">
              Coexists seamlessly with LockQuote on the same database. Completed jobs and customer records are consumed authoritatively without duplicate data.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-[#2e2e2e] bg-white dark:bg-[#1a1a1a] py-6 px-6 text-center text-xs text-slate-500 dark:text-neutral-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} LockReview by Atypikal Studio. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <CheckCircle size={13} className="text-[#E76A0E]" /> Single-Tenant Shared MySQL
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck size={13} className="text-emerald-500" /> GDPR & UK DPA Ready
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

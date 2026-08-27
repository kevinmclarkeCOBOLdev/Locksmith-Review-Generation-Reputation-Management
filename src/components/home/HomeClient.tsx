'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { ShieldCheck, ArrowRight, MessageSquare, ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { LoginModal } from '@/components/auth/LoginModal';
import { ThemeToggle } from '@/components/ThemeProvider';

export function HomeClient() {
  const searchParams = useSearchParams();
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get('login') === 'true' || searchParams.get('login') === '1') {
      setIsLoginOpen(true);
    }
  }, [searchParams]);

  const handleCloseModal = () => {
    setIsLoginOpen(false);
    if (searchParams.has('login')) {
      window.history.replaceState({}, '', '/');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-[#181818] text-slate-900 dark:text-neutral-100">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-[#2e2e2e] bg-white dark:bg-[#1f1f1f] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center group">
            <Image
              src="/lockreview-icon-lt-lg.webp"
              alt="LockReview"
              width={180}
              height={32}
              priority
              className="h-8 w-auto block dark:hidden object-contain"
            />
            <Image
              src="/lockreview-icon-dk-lg.webp"
              alt="LockReview"
              width={180}
              height={33}
              priority
              className="h-8 w-auto hidden dark:block object-contain"
            />
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle iconOnly />
            <Button
              size="sm"
              className="font-bold cursor-pointer"
              onClick={() => setIsLoginOpen(true)}
            >
              Locksmith Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-16 md:py-24 flex flex-col items-center text-center">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white max-w-4xl leading-tight">
          Automate 5-Star Reviews &amp; Protect Your Locksmith Reputation
        </h1>

        <p className="mt-6 text-base md:text-lg text-slate-600 dark:text-neutral-300 max-w-2xl leading-relaxed">
          Direct 4–5 star satisfied customers to Google Reviews in one tap. Intercept 1–3 star private complaints internally before they ever hit the public internet.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
          <Button
            size="lg"
            className="px-8 py-4 text-sm font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer"
            onClick={() => setIsLoginOpen(true)}
          >
            Launch LockReview Dashboard
            <ArrowRight size={16} />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="px-8 py-4 text-sm font-bold uppercase tracking-wider cursor-pointer"
            onClick={() => setIsLoginOpen(true)}
          >
            Demo Locksmith Login
          </Button>
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
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Shared Database</h3>
            <p className="mt-2 text-xs text-slate-600 dark:text-neutral-400 leading-relaxed">
              Coexists seamlessly with LockQuote on the same database. Completed jobs and customer records are consumed authoritatively without duplicate data.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-[#2e2e2e] bg-white dark:bg-[#1a1a1a] py-6 px-6 text-xs text-slate-500 dark:text-neutral-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>
            © 2026{' '}
            <Link
              href="https://atypikalstudio.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline text-slate-700 dark:text-neutral-300 font-medium"
            >
              Atypikal Studio
            </Link>
            . LockReview is a product of Atypikal Studio. All rights reserved.
          </p>
          <div className="flex items-center gap-6 font-medium">
            <Link href="/documentation" className="hover:text-[#E76A0E] transition-colors">
              Documentation
            </Link>
            <Link href="/privacy-policy" className="hover:text-[#E76A0E] transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms-of-use" className="hover:text-[#E76A0E] transition-colors">
              Terms of Use
            </Link>
          </div>
        </div>
      </footer>

      {/* Login Modal Popup */}
      <LoginModal isOpen={isLoginOpen} onClose={handleCloseModal} />
    </div>
  );
}

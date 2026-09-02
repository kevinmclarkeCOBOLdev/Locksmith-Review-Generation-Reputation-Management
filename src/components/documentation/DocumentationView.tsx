import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  BookOpen,
  ArrowLeft,
  ExternalLink,
  Info,
  ShieldCheck,
  Sparkles,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeProvider';
import { DocumentationAccordion, DocTocItem } from './DocumentationAccordion';

export const documentationFeatures: DocTocItem[] = [
  {
    number: '1',
    title: 'Review Request Generation & Dispatch Engine',
    subItems: [
      { number: '1.1', title: 'Automated Email Dispatch Engine' },
      { number: '1.2', title: 'Customer Lead Selection from Shared Database' },
      { number: '1.3', title: 'High-Entropy Cryptographic Token URLs (/review/[token])' },
      { number: '1.4', title: 'Dynamic Template Interpolation ({customer_name}, {business_name}, {review_link})' },
      { number: '1.5', title: '30-Day Anti-Fatigue Customer Deduplication Guard' },
    ],
  },
  {
    number: '2',
    title: 'Positive Customer Feedback Routing (4–5 Stars)',
    subItems: [
      { number: '2.1', title: 'Mobile-First One-Tap Rating Selector (1–5 Gold Stars)' },
      { number: '2.2', title: 'Instant Positive Sentiment Confirmation Screen' },
      { number: '2.3', title: 'Direct Google Business Profile Review Redirection' },
      { number: '2.4', title: 'Multi-Platform Support (Trustpilot, Checkatrade, Facebook)' },
      { number: '2.5', title: 'Public Redirection Click Tracking & Evidence Logging' },
    ],
  },
  {
    number: '3',
    title: 'Private Constructive Feedback Interception (1–3 Stars)',
    subItems: [
      { number: '3.1', title: 'Unhappy Customer Service Recovery Shield' },
      { number: '3.2', title: 'Private Constructive Comment Collection' },
      { number: '3.3', title: 'Zero Public Search Indexation Guarantee' },
      { number: '3.4', title: 'Urgent Management Recovery Alert Generation' },
      { number: '3.5', title: 'One-Click Customer Phone & Email Outreach' },
    ],
  },
  {
    number: '4',
    title: 'Feedback Inbox & Service Recovery Operations',
    subItems: [
      { number: '4.1', title: 'Centralized Live Customer Sentiment Stream' },
      { number: '4.2', title: 'Multi-Attribute Filtering (Sentiment, Rating, Platform Click, Search)' },
      { number: '4.3', title: 'Complete Customer Review Lifecycle Timeline' },
      { number: '4.4', title: 'Dispatcher Status Tracking & Customer Resolution' },
      { number: '4.5', title: 'Strict Cross-Tenant Feedback Data Isolation' },
    ],
  },
  {
    number: '5',
    title: 'Reputation Analytics & Evidence-Based Reporting',
    subItems: [
      { number: '5.1', title: 'Deterministic Database Math (Response Rate, Avg Rating, Positive Ratio)' },
      { number: '5.2', title: '5-Star Distribution Visual Breakdown' },
      { number: '5.3', title: 'Email Delivery & Conversion Performance Rates' },
      { number: '5.4', title: 'Dynamic Time-Range Scoping (7 Days, 30 Days, All-Time)' },
      { number: '5.5', title: 'Defensive Zero-Division Safe Calculations' },
    ],
  },
  {
    number: '6',
    title: 'Post-Job Automation & Webhook Engine',
    subItems: [
      { number: '6.1', title: 'LockQuote Job Completion Status Trigger' },
      { number: '6.2', title: 'Customer Contact Completeness & Opt-In Verification' },
      { number: '6.3', title: 'Automated Token Generation & Scheduled Dispatch' },
      { number: '6.4', title: 'Shared Audit Log Ledger Recording' },
      { number: '6.5', title: 'Background Processing & Error Resilience' },
    ],
  },
  {
    number: '7',
    title: 'Reputation Platform Settings & Message Templates',
    subItems: [
      { number: '7.1', title: 'Google Business Profile Direct Link Configuration' },
      { number: '7.2', title: 'Secondary Platforms (Trustpilot UK, Checkatrade, Facebook)' },
      { number: '7.3', title: 'Dynamic Message Variable Tokens ({customer_name}, {business_name}, {review_link})' },
      { number: '7.4', title: 'Dynamic Email Subject & HTML Body Template Editor with Live Preview' },
      { number: '7.5', title: 'Tenant Configuration Audit Logging' },
    ],
  },
  {
    number: '8',
    title: 'Shared Database Architecture & Security',
    subItems: [
      { number: '8.1', title: 'Dual Independent Apps on One Shared Database Instance' },
      { number: '8.2', title: 'Shared Tables (tenants, users, leads, quotes, consents, audit_logs)' },
      { number: '8.3', title: 'LockReview-Owned Tables (review_requests, review_feedback, settings, templates)' },
      { number: '8.4', title: 'Server-Side JWT Tenant Isolation & Edge Route Protection' },
      { number: '8.5', title: 'High-Entropy Single-Use Review Tokens & Rate Limiting' },
    ],
  },
  {
    number: '9',
    title: 'Cross-App Ecosystem & LockQuote Integration',
    subItems: [
      { number: '9.1', title: 'Seamless Single-Sign-On Session Model' },
      { number: '9.2', title: 'Zero Lead Duplication Guarantee' },
      { number: '9.3', title: 'Unified Locksmith Business Identity & Branding' },
      { number: '9.4', title: 'Direct Cross-App Navigation & Deep Linking' },
      { number: '9.5', title: 'Regulatory Compliance & UK GDPR Audit Harmony' },
    ],
  },
];

export function DocumentationView() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#181818] text-slate-900 dark:text-neutral-100 font-sans selection:bg-[#00d492]/30 selection:text-[#00d492] transition-colors duration-200">
      {/* Ambient background lighting */}
      <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-[#00d492]/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Navigation Header */}
      <header className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between relative z-10 border-b border-slate-200 dark:border-[#383838]">
        <Link href="/dashboard" className="flex items-center cursor-pointer group shrink-0">
          {/* Viewports 1024px and below: Square Emblem Logo */}
          <div className="block min-[1025px]:hidden w-9 h-9 relative shrink-0">
            <Image
              src="/lockreview-icon-lt-sq.webp"
              alt="LockReview Instant Review Generation & Reputation Management"
              width={36}
              height={36}
              priority
              className="w-9 h-9 block dark:hidden object-contain transition-transform group-hover:scale-105"
            />
            <Image
              src="/lockreview-icon-dk-sq.webp"
              alt="LockReview Instant Review Generation & Reputation Management"
              width={36}
              height={36}
              priority
              className="w-9 h-9 hidden dark:block object-contain transition-transform group-hover:scale-105"
            />
          </div>

          {/* Viewports above 1024px: Wide Banner Logo */}
          <div className="hidden min-[1025px]:flex items-center h-10 max-h-10">
            <Image
              src="/lockreview-icon-lt-lg.webp"
              alt="LockReview Instant Review Generation & Reputation Management"
              width={180}
              height={32}
              priority
              className="block dark:hidden h-8 w-auto object-contain transition-transform group-hover:scale-[1.02]"
            />
            <Image
              src="/lockreview-icon-dk-lg.webp"
              alt="LockReview Instant Review Generation & Reputation Management"
              width={180}
              height={33}
              priority
              className="hidden dark:block h-8 w-auto object-contain transition-transform group-hover:scale-[1.02]"
            />
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle iconOnly />
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 bg-slate-200 dark:bg-[#2a2a2a] hover:bg-slate-300 dark:hover:bg-[#333333] border border-slate-300 dark:border-[#3d3d3d] text-slate-900 dark:text-white text-xs font-semibold px-3.5 py-2 transition-all cursor-pointer"
          >
            <ArrowLeft size={14} className="text-[#00d492]" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-12 relative z-10 space-y-12">
        {/* Header Metadata Section */}
        <header className="space-y-6 text-left border-b border-slate-200 dark:border-[#383838] pb-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#00d492]/10 border border-[#00d492]/30 text-xs font-bold text-[#00d492] uppercase tracking-wider">
            <BookOpen size={14} /> Platform Documentation &amp; Feature Manual
          </div>

          {/* Main Title & Subtitle */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              Documentation
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-neutral-400 max-w-3xl font-medium leading-relaxed">
              Comprehensive architectural guide, feature index, and operational reference for locksmith business owners operating the LockReview Review Generation &amp; Reputation Management SaaS Platform.
            </p>
          </div>

          {/* Metadata Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#383838] p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#00d492]/15 border border-[#00d492]/30 flex items-center justify-center text-[#00d492] shrink-0">
                <Layers size={18} />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 dark:text-neutral-400 font-bold uppercase tracking-wider block">
                  Edition
                </span>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                  v1.0 Pro <CheckCircle2 size={14} className="text-emerald-500" />
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#00d492]/15 border border-[#00d492]/30 flex items-center justify-center text-[#00d492] shrink-0">
                <ShieldCheck size={18} />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 dark:text-neutral-400 font-bold uppercase tracking-wider block">
                  Target Audience
                </span>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Locksmith Operators
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#00d492]/15 border border-[#00d492]/30 flex items-center justify-center text-[#00d492] shrink-0">
                <Sparkles size={18} />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 dark:text-neutral-400 font-bold uppercase tracking-wider block">
                  Architecture
                </span>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Dedicated Single-Tenant
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content & Table of Contents Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Informational Callout & Overview Cards */}
          <div className="lg:col-span-7 space-y-8">
            {/* Prominent Paid-Up Owner Notice Card */}
            <div className="bg-gradient-to-br from-[#00d492]/10 via-[#00d492]/5 to-transparent border-2 border-[#00d492]/30 dark:border-[#00d492]/40 p-6 sm:p-8 space-y-5 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none text-[#00d492]">
                <BookOpen size={120} />
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#00d492]/20 text-[#00d492] font-extrabold text-xs uppercase tracking-wider">
                <Info size={14} className="shrink-0" />
                <span>Subscription Access</span>
              </div>

              <div className="space-y-3">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Full Platform Manual &amp; Guides
                </h2>
                <p className="text-sm sm:text-base text-slate-700 dark:text-neutral-200 leading-relaxed font-medium">
                  LockReview documentation will be available to all paid-up owners of the review generation and reputation management platform.{' '}
                  <a
                    href="https://atypikalstudio.dev/locksmiths/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#00d492] font-extrabold underline decoration-[#00d492]/50 hover:decoration-[#00d492] hover:text-[#00bc82] transition-colors inline-flex items-center gap-1 group"
                  >
                    <span>Contact Atypikal Studio to find out more.</span>
                    <ExternalLink
                      size={15}
                      className="inline shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                    />
                  </a>
                </p>
              </div>

              <div className="pt-3 border-t border-[#00d492]/20 flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-neutral-300">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-[#00d492] shrink-0" />
                  <span>Dedicated Database setup</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-[#00d492] shrink-0" />
                  <span>Automated post-job review triggers</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-[#00d492] shrink-0" />
                  <span>Full operational handbook &amp; templates</span>
                </div>
              </div>
            </div>

            {/* Quick Overview Section */}
            <div className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#383838] p-6 space-y-4 shadow-sm">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers size={18} className="text-[#00d492]" />
                <span>Platform Capabilities at a Glance</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-neutral-400 leading-relaxed">
                LockReview is purpose-built for modern locksmith companies. It converts completed jobs from the LockQuote ecosystem into authoritative 5-star Google reviews while silently intercepting negative customer feedback internally before it damages local search rankings.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 bg-slate-50 dark:bg-[#222222] border border-slate-200 dark:border-[#2f2f2f]">
                  <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>🚀 Automated Review Triggers</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-neutral-400 mt-1 leading-relaxed">
                    Synchronizes completed jobs from LockQuote and dispatches Email review invitations automatically.
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-[#222222] border border-slate-200 dark:border-[#2f2f2f]">
                  <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>⭐ Positive Feedback Routing</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-neutral-400 mt-1 leading-relaxed">
                    Guides 4–5 star reviewers straight to your Google Business Profile, Trustpilot, or Checkatrade in one tap.
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-[#222222] border border-slate-200 dark:border-[#2f2f2f]">
                  <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>🛡️ Private Service Recovery</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-neutral-400 mt-1 leading-relaxed">
                    Intercepts 1–3 star ratings into your private Feedback Inbox for swift customer outreach before public posting.
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-[#222222] border border-slate-200 dark:border-[#2f2f2f]">
                  <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>📊 Evidence-Based Analytics</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-neutral-400 mt-1 leading-relaxed">
                    Deterministic Database calculations for response rates, star distribution breakdown, and conversion rates.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Hierarchical Numbered Accordion Index */}
          <div className="lg:col-span-5">
            <DocumentationAccordion features={documentationFeatures} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-[#383838] bg-slate-100 dark:bg-[#161616] py-8 relative z-10 mt-16">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-neutral-400 gap-4">
          <p>
            © {new Date().getFullYear()}{' '}
            <a
              href="https://atypikalstudio.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#00d492] underline transition-colors font-medium"
            >
              Atypikal Studio
            </a>
            . LockReview is a product of Atypikal Studio. All rights reserved.
          </p>
          <div className="flex items-center gap-6 font-medium">
            <Link href="/" className="hover:text-[#00d492] transition-colors">
              Home
            </Link>
            <Link href="/documentation" className="text-[#00d492] font-bold underline">
              Documentation
            </Link>
            <Link href="/privacy-policy" className="hover:text-[#00d492] transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms-of-use" className="hover:text-[#00d492] transition-colors">
              Terms of Use
            </Link>
            <Link
              href="https://lockquote.atypikalstudio.dev/dashboard/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#00d492] transition-colors"
            >
              Open LockQuote Dashboard
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

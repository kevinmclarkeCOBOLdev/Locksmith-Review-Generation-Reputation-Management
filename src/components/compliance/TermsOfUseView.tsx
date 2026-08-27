import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Scale,
  CheckSquare,
  Sparkles,
  ShieldAlert,
  ExternalLink,
  MessageSquareWarning,
  AlertTriangle,
  FileCode,
  Server,
  Lock,
  Globe,
  HelpCircle,
  ArrowLeft,
  Mail,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeProvider';
import { PolicyHeader } from './PolicyHeader';
import { PolicySection } from './PolicySection';
import { TableOfContents, TocItem } from './TableOfContents';

const tocItems: TocItem[] = [
  { id: 'introduction', title: 'Introduction & Platform Scope' },
  { id: 'acceptance-of-terms', title: 'Acceptance of Terms' },
  { id: 'description-of-services', title: 'Description of Services' },
  { id: 'user-responsibilities', title: 'User & Subscriber Responsibilities' },
  { id: 'review-routing-platforms', title: 'Review Routing & Third-Party Platforms' },
  { id: 'private-service-recovery', title: 'Private Feedback & Dispute Disclaimer' },
  { id: 'limitation-of-liability', title: 'Limitation of Liability' },
  { id: 'intellectual-property', title: 'Intellectual Property & Limited License' },
  { id: 'service-availability', title: 'Service Availability & Maintenance SLA' },
  { id: 'third-party-services', title: 'Third-Party Service Providers' },
  { id: 'privacy-reference', title: 'Data Protection & UK GDPR Reference' },
  { id: 'governing-law-metadata', title: 'Governing Law, Jurisdiction & Metadata' },
];

export function TermsOfUseView() {
  const version = '1.0.0';
  const effectiveDate = '2026-07-30';
  const lastUpdated = '2026-08-27';
  const contactEmail = 'support@atypikalstudio.dev';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#181818] text-slate-900 dark:text-neutral-100 font-sans selection:bg-[#E76A0E]/30 selection:text-[#E76A0E] transition-colors duration-200">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-[#E76A0E]/10 rounded-full blur-[140px] pointer-events-none" />

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
            <ArrowLeft size={14} className="text-[#E76A0E]" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </header>

      {/* Main Body Layout */}
      <main className="max-w-7xl mx-auto px-6 py-12 relative z-10 space-y-12">
        {/* Header Metadata Section */}
        <PolicyHeader
          title="Terms of Use"
          subtitle="These Terms of Use govern your access to and use of the LockReview SaaS Platform, including our automated review dispatch engine, public review routing workflows, private constructive feedback interception, and reputation analytics."
          version={version}
          effectiveDate={effectiveDate}
          lastUpdated={lastUpdated}
          badgeText="SaaS Subscription &amp; Platform Terms Compliant"
          badgeIcon={<Scale size={14} />}
          versionLabel="Terms Version"
        />

        {/* Content & Table of Contents Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Main Terms Content (3 Columns) */}
          <div className="lg:col-span-3 space-y-12">
            {/* 1. Introduction & Platform Scope */}
            <PolicySection
              id="introduction"
              number={1}
              title="Introduction &amp; Platform Scope"
              icon={<Scale size={20} />}
            >
              <p>
                Welcome to <strong>LockReview</strong>, a specialized software-as-a-service (SaaS) platform engineered by <strong>Atypikal Studio</strong> within the LockQuote product ecosystem. LockReview is designed to assist independent locksmith businesses in generating authentic customer reviews, boosting Google Business Profile star ratings, routing satisfied clients to public review directories, and privately intercepting negative feedback for swift internal resolution.
              </p>
              <p>
                Throughout these Terms of Use, &quot;Platform&quot;, &quot;LockReview&quot;, &quot;we&quot;, &quot;us&quot;, and &quot;our&quot; refer to <strong>Atypikal Studio</strong>. &quot;Subscriber&quot;, &quot;Locksmith Business&quot;, &quot;User&quot;, &quot;you&quot;, and &quot;your&quot; refer to any locksmith company, business administrator, staff member, or service customer accessing the platform or interacting with our review links.
              </p>
              <p>
                LockReview operates as an independent deployable SaaS application coexisting harmoniously on a shared MySQL persistence layer with LockQuote, synchronizing verified customer contact records without duplicate data entry.
              </p>
            </PolicySection>

            {/* 2. Acceptance of Terms */}
            <PolicySection
              id="acceptance-of-terms"
              number={2}
              title="Acceptance of Terms"
              icon={<CheckSquare size={20} />}
            >
              <p>
                By accessing our website, logging into the LockReview administration dashboard (<code>/dashboard</code>), creating or triggering review invitation campaigns, or submitting ratings through a secure mobile review link (<code>/review/[token]</code>), you agree to be bound by these Terms of Use and our associated{' '}
                <Link href="/privacy-policy" className="text-[#E76A0E] font-semibold underline">
                  Privacy Policy
                </Link>
                .
              </p>
              <p>
                If you are using LockReview on behalf of a locksmith business or legal entity, you represent and warrant that you possess the necessary authority to bind that entity to these Terms. If you do not agree to these Terms, you must immediately cease using the platform and its review generation features.
              </p>
            </PolicySection>

            {/* 3. Description of Services */}
            <PolicySection
              id="description-of-services"
              number={3}
              title="Description of Services"
              icon={<Sparkles size={20} />}
            >
              <p>
                LockReview provides reputation management and review automation tools tailored specifically for locksmith service providers, including:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  <strong>Multi-Channel Review Dispatch:</strong> Automated and manual generation of review requests via SMS (carrier gateway) and Email (Resend / SMTP) utilizing dynamic message templates.
                </li>
                <li>
                  <strong>Cryptographically Secure Customer Review Links:</strong> Unique, single-use 64-character high-entropy URL tokens (<code>/review/[token]</code>) offering mobile-first rating selector workflows.
                </li>
                <li>
                  <strong>Positive Feedback Routing (4–5 Stars):</strong> Guiding highly satisfied customers directly to configured public review profiles (e.g. Google Business Profile, Trustpilot UK, Checkatrade, Facebook) with click-through tracking.
                </li>
                <li>
                  <strong>Private Feedback Interception (1–3 Stars):</strong> Silently collecting constructive customer criticism and complaints into a secure in-app Feedback Inbox for swift management recovery before public posting.
                </li>
                <li>
                  <strong>Post-Job Automated Triggers:</strong> Automatic review scheduling triggered upon job completion in the shared LockQuote MySQL database with 30-day anti-fatigue cooldown guards.
                </li>
                <li>
                  <strong>Deterministic Reputation Analytics:</strong> Verified evidence-based calculations of response rates, 5-star distribution breakdowns, and channel delivery metrics.
                </li>
              </ul>
            </PolicySection>

            {/* 4. User & Subscriber Responsibilities */}
            <PolicySection
              id="user-responsibilities"
              number={4}
              title="User &amp; Subscriber Responsibilities"
              icon={<ShieldAlert size={20} />}
            >
              <p>
                When accessing LockReview or dispatching review invitations to customers:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Genuine Customer Contact Data:</strong> Subscribers agree to dispatch review requests only to genuine customers who have received locksmith services from their business.
                </li>
                <li>
                  <strong>Anti-Spam &amp; PECR Compliance:</strong> Subscribers are responsible for ensuring communications comply with UK Privacy and Electronic Communications Regulations (PECR), maintaining reasonable dispatch frequencies, and respecting customer opt-outs.
                </li>
                <li>
                  <strong>Prohibition of Deceptive Practices:</strong> Subscribers shall not manipulate ratings, generate fraudulent reviews, submit false customer feedback, or attempt to game third-party search engine algorithms.
                </li>
                <li>
                  <strong>Credential Security &amp; Tenant Isolation:</strong> Subscribers are strictly responsible for maintaining the confidentiality of their dashboard credentials and ensuring authorized access within their organization.
                </li>
                <li>
                  <strong>Platform Integrity:</strong> You must not attempt to reverse engineer, scrape, bypass rate limiting, brute-force review tokens, or disrupt the operation of LockReview servers or APIs.
                </li>
              </ul>
            </PolicySection>

            {/* 5. Review Routing & Third-Party Platforms */}
            <PolicySection
              id="review-routing-platforms"
              number={5}
              title="Review Routing &amp; Third-Party Platforms"
              icon={<Globe size={20} />}
            >
              <p>
                LockReview provides an automated routing bridge to external public review directories configured by the subscriber (including Google Business Profile, Trustpilot, Checkatrade, and Facebook):
              </p>
              <div className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#383838] p-4 space-y-2 text-xs">
                <p>
                  <strong>Important Notice on Third-Party Platform Policies:</strong>
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-700 dark:text-neutral-300">
                  <li>
                    Customers who click through to Google Reviews or other external platforms are subject to the respective terms of service and content policies of those third-party providers.
                  </li>
                  <li>
                    Atypikal Studio does not control, operate, or influence third-party review moderation algorithms, account suspension policies, or local Google Maps ranking positions.
                  </li>
                  <li>
                    We do not guarantee that any individual customer will complete a public review or that posted reviews will be displayed by third-party search engines.
                  </li>
                </ul>
              </div>
            </PolicySection>

            {/* 6. Private Feedback & Dispute Disclaimer */}
            <PolicySection
              id="private-service-recovery"
              number={6}
              title="Private Feedback &amp; Dispute Disclaimer"
              icon={<MessageSquareWarning size={20} />}
            >
              <p>
                The private feedback mechanism (1–3 stars) is provided as an internal customer care tool to enable locksmith operators to resolve customer dissatisfaction privately and proactively.
              </p>
              <p>
                <strong>Atypikal Studio is NOT a party to any commercial, technical, or service disputes</strong> between locksmith businesses and their customers. We assume no liability or responsibility for locksmith pricing, lock hardware performance, emergency callout attendance, or workmanship standards. All customer service disputes remain strictly between the customer and the independent locksmith contractor.
              </p>
            </PolicySection>

            {/* 7. Limitation of Liability */}
            <PolicySection
              id="limitation-of-liability"
              number={7}
              title="Limitation of Liability"
              icon={<AlertTriangle size={20} />}
            >
              <p>
                To the maximum extent permitted by applicable law under the jurisdiction of England and Wales, Atypikal Studio and its directors, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  Loss of business revenue, commercial goodwill, or search engine ranking positions.
                </li>
                <li>
                  Delays or failures in SMS/Email delivery caused by downstream mobile carriers, spam filters, or network provider outages.
                </li>
                <li>
                  Negative reviews or ratings posted publicly by customers independently of the platform.
                </li>
                <li>
                  Temporary platform downtime resulting from routine maintenance, server upgrades, or external hosting incidents.
                </li>
              </ul>
              <p>
                In all events, our total cumulative liability arising from or related to your use of LockReview shall not exceed the total fees paid by you to Atypikal Studio for the service during the three (3) months preceding the claim.
              </p>
            </PolicySection>

            {/* 8. Intellectual Property & Limited License */}
            <PolicySection
              id="intellectual-property"
              number={8}
              title="Intellectual Property &amp; Limited License"
              icon={<FileCode size={20} />}
            >
              <p>
                LockReview, including its underlying software, source code, user interfaces, branding, logos, algorithms, design systems, documentation, and database schemas, is the exclusive intellectual property of <strong>Atypikal Studio</strong> or its licensors and is protected by UK and international copyright and trademark laws.
              </p>
              <p>
                Active subscribers are granted a limited, revocable, non-exclusive, non-transferable license to access the LockReview dashboard and utilize review generation features solely for their direct business operations during valid subscription terms.
              </p>
            </PolicySection>

            {/* 9. Service Availability & Maintenance SLA */}
            <PolicySection
              id="service-availability"
              number={9}
              title="Service Availability &amp; Maintenance SLA"
              icon={<Server size={20} />}
            >
              <p>
                We strive to maintain high operational availability with an architectural target of <strong>99.9% uptime</strong> for review invitation token resolution and dashboard services.
              </p>
              <p>
                LockReview is provided on an &quot;as is&quot; and &quot;as available&quot; basis. We reserve the right to perform scheduled system maintenance, database indexing, and critical security updates. Where feasible, maintenance windows are scheduled during low-traffic periods to minimize operational disruption.
              </p>
            </PolicySection>

            {/* 10. Third-Party Service Providers */}
            <PolicySection
              id="third-party-services"
              number={10}
              title="Third-Party Service Providers"
              icon={<ExternalLink size={20} />}
            >
              <p>
                LockReview integrates with trusted third-party infrastructure providers to deliver its services:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#383838] p-3.5 text-xs space-y-1">
                  <span className="font-bold text-slate-900 dark:text-white block">
                    Hostinger MySQL &amp; Cloud Infrastructure
                  </span>
                  <span className="text-slate-500 dark:text-neutral-400">
                    High-performance database hosting and server infrastructure.
                  </span>
                </div>
                <div className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#383838] p-3.5 text-xs space-y-1">
                  <span className="font-bold text-slate-900 dark:text-white block">
                    Resend Inc. &amp; Hostinger SMTP
                  </span>
                  <span className="text-slate-500 dark:text-neutral-400">
                    Transactional email delivery for customer review invitations.
                  </span>
                </div>
                <div className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#383838] p-3.5 text-xs space-y-1">
                  <span className="font-bold text-slate-900 dark:text-white block">
                    Carrier SMS Gateways
                  </span>
                  <span className="text-slate-500 dark:text-neutral-400">
                    Carrier-grade SMS dispatch networks for mobile review invites.
                  </span>
                </div>
                <div className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#383838] p-3.5 text-xs space-y-1">
                  <span className="font-bold text-slate-900 dark:text-white block">
                    Public Platforms (Google, Trustpilot)
                  </span>
                  <span className="text-slate-500 dark:text-neutral-400">
                    Destination review profiles accessed via customer redirection.
                  </span>
                </div>
              </div>
            </PolicySection>

            {/* 11. Data Protection & UK GDPR Reference */}
            <PolicySection
              id="privacy-reference"
              number={11}
              title="Data Protection &amp; UK GDPR Reference"
              icon={<Lock size={20} />}
            >
              <p>
                Our collection, retention, and processing of customer names, telephone numbers, email addresses, ratings, and private constructive feedback is governed by our comprehensive{' '}
                <Link href="/privacy-policy" className="text-[#E76A0E] font-semibold underline">
                  Privacy Policy
                </Link>
                .
              </p>
              <p>
                All personal data is processed strictly under lawful bases specified in the UK General Data Protection Regulation (UK GDPR Article 6), with high-entropy token hashing, 365-day default retention cycles, and strict server-side tenant isolation.
              </p>
            </PolicySection>

            {/* 12. Governing Law, Jurisdiction & Metadata */}
            <PolicySection
              id="governing-law-metadata"
              number={12}
              title="Governing Law, Jurisdiction &amp; Metadata"
              icon={<HelpCircle size={20} />}
            >
              <p>
                These Terms of Use and any dispute or claim arising out of or in connection with them or their subject matter shall be governed by and construed in accordance with the <strong>laws of England and Wales</strong>.
              </p>
              <p>
                The courts of <strong>England and Wales</strong> shall have exclusive jurisdiction to settle any dispute or claim arising out of or in connection with these Terms.
              </p>

              <div className="bg-slate-100 dark:bg-[#151515] border border-slate-200 dark:border-[#2e2e2e] p-4 text-xs space-y-1 font-mono mt-4">
                <p>TERMS_VERSION: {version}</p>
                <p>TERMS_EFFECTIVE_DATE: {effectiveDate}</p>
                <p>TERMS_LAST_UPDATED: {lastUpdated}</p>
                <p>CONTACT_EMAIL: {contactEmail}</p>
              </div>

              <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-neutral-300">
                <Mail size={14} className="text-[#E76A0E]" />
                <span>
                  For legal inquiries or terms questions, contact:{' '}
                  <a href={`mailto:${contactEmail}`} className="text-[#E76A0E] underline">
                    {contactEmail}
                  </a>
                </span>
              </div>
            </PolicySection>
          </div>

          {/* Table of Contents Sidebar (1 Column) */}
          <div className="hidden lg:block">
            <TableOfContents items={tocItems} />
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
              className="hover:text-[#E76A0E] underline transition-colors font-medium"
            >
              Atypikal Studio
            </a>
            . LockReview is a product of Atypikal Studio. All rights reserved.
          </p>
          <div className="flex items-center gap-6 font-medium">
            <Link href="/" className="hover:text-[#E76A0E] transition-colors">
              Home
            </Link>
            <Link href="/documentation" className="hover:text-[#E76A0E] transition-colors">
              Documentation
            </Link>
            <Link href="/privacy-policy" className="hover:text-[#E76A0E] transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms-of-use" className="text-[#E76A0E] font-bold underline">
              Terms of Use
            </Link>
            <Link
              href="https://lockquote.atypikalstudio.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#E76A0E] transition-colors"
            >
              Open LockQuote
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

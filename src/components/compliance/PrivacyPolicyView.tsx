import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Shield,
  Mail,
  UserCheck,
  Database,
  Lock,
  Server,
  FileCheck,
  Clock,
  HelpCircle,
  Building2,
  ExternalLink,
  ArrowLeft,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeProvider';
import { PolicyHeader } from './PolicyHeader';
import { PolicySection } from './PolicySection';
import { TableOfContents, TocItem } from './TableOfContents';

const tocItems: TocItem[] = [
  { id: 'data-controller', title: 'Data Controller & Roles' },
  { id: 'contact-details', title: 'Contact Details' },
  { id: 'information-collected', title: 'Information We Collect' },
  { id: 'lawful-basis', title: 'Lawful Basis for Processing' },
  { id: 'how-used', title: 'How Information Is Used' },
  { id: 'third-parties', title: 'Third-Party Processors' },
  { id: 'data-retention', title: 'Data Retention & Anonymization' },
  { id: 'security-measures', title: 'Security & Cryptographic Safeguards' },
  { id: 'user-rights', title: 'Your Rights Under UK GDPR' },
  { id: 'contacting-ico', title: 'Contacting the ICO' },
  { id: 'policy-metadata', title: 'Policy Version & Metadata' },
  { id: 'policy-revisions', title: 'Policy Revisions & Updates' },
];

export function PrivacyPolicyView() {
  const version = '1.0.0';
  const effectiveDate = '2026-01-01';
  const lastUpdated = '2026-08-27';
  const defaultRetentionDays = '365';

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
          title="Privacy Policy"
          subtitle="This Privacy Policy explains how LockReview collects, processes, stores, and protects personal information in accordance with the UK General Data Protection Regulation (UK GDPR) and the UK Data Protection Act 2018."
          version={version}
          effectiveDate={effectiveDate}
          lastUpdated={lastUpdated}
        />

        {/* Content & Table of Contents Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Main Policy Content (3 Columns) */}
          <div className="lg:col-span-3 space-y-12">
            {/* 1. Data Controller & Roles */}
            <PolicySection
              id="data-controller"
              number={1}
              title="Data Controller &amp; Ecosystem Roles"
              icon={<Building2 size={20} />}
            >
              <p>
                <strong>Atypikal Studio</strong> operates as the SaaS technology provider and Data Processor for the <strong>LockReview</strong> Review Generation &amp; Reputation Management Platform.
              </p>
              <p>
                The subscriber business (the independent locksmith company or tenant operating the LockReview dashboard) acts as the <strong>Data Controller</strong> for customer contact records, review requests dispatched to their clients, and private feedback collected through the service.
              </p>
              <p>
                LockReview operates on a shared database architecture with LockQuote, ensuring customer contact details collected during quote generation and service fulfillment remain synchronized without unverified duplication across multiple databases.
              </p>
            </PolicySection>

            {/* 2. Contact Details */}
            <PolicySection
              id="contact-details"
              number={2}
              title="Contact Details"
              icon={<Mail size={20} />}
            >
              <p>
                If you have questions regarding this Privacy Policy, wish to exercise your legal data protection rights, or have inquiries regarding how reputation and review data is processed, please contact our Data Protection Lead:
              </p>
              <ul className="list-disc pl-5 space-y-1 font-medium text-slate-800 dark:text-neutral-200">
                <li>
                  <strong>Data Processor / Platform Developer:</strong> Atypikal Studio / LockReview SaaS Platform
                </li>
                <li>
                  <strong>Email Inquiries:</strong>{' '}
                  <a
                    href="mailto:support@atypikalstudio.dev"
                    className="text-[#E76A0E] underline"
                  >
                    support@atypikalstudio.dev
                  </a>
                </li>
                <li>
                  <strong>Privacy Compliance Contact:</strong> Data Protection &amp; Regulatory Compliance Lead
                </li>
                <li>
                  <strong>Official Website:</strong>{' '}
                  <a
                    href="https://atypikalstudio.dev"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#E76A0E] underline"
                  >
                    https://atypikalstudio.dev
                  </a>
                </li>
              </ul>
            </PolicySection>

            {/* 3. Information We Collect */}
            <PolicySection
              id="information-collected"
              number={3}
              title="Information We Collect"
              icon={<Database size={20} />}
            >
              <p>
                We collect and process personal data necessary to generate review invitations, record customer feedback, route positive ratings, and intercept private service recovery tickets:
              </p>
              <div className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#383838] p-4 space-y-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#E76A0E]">
                  Data Categories Processed in LockReview:
                </h3>
                <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-700 dark:text-neutral-300">
                  <li>
                    <strong>Customer Contact Data:</strong> Customer Full Name, Mobile Phone Number (for SMS dispatch), and Email Address (for Email dispatch), retrieved from verified completed jobs in the shared MySQL database.
                  </li>
                  <li>
                    <strong>Review &amp; Rating Data:</strong> Star Rating (1 to 5 stars), Sentiment Classification (Positive vs. Negative), and Private Feedback comments provided voluntarily by customers.
                  </li>
                  <li>
                    <strong>Reputation &amp; Platform Evidence:</strong> Timestamps of invitation delivery, review page access, rating submission, and platform click evidence (e.g. clicks to Google Business Profile or Trustpilot).
                  </li>
                  <li>
                    <strong>Cryptographic Token Data:</strong> High-entropy 64-character URL security tokens, SHA-256 token hashes, and token expiration/cancellation states.
                  </li>
                  <li>
                    <strong>Technical &amp; Audit Logs:</strong> User agent, IP address for security rate-limiting against token brute forcing, and administrative audit trails.
                  </li>
                </ul>
              </div>
            </PolicySection>

            {/* 4. Lawful Basis for Processing */}
            <PolicySection
              id="lawful-basis"
              number={4}
              title="Lawful Basis for Processing (UK GDPR Art. 6)"
              icon={<UserCheck size={20} />}
            >
              <p>
                Under UK GDPR Article 6, personal data is processed under the following lawful bases:
              </p>
              <ol className="list-decimal pl-5 space-y-2 font-medium">
                <li>
                  <strong>Legitimate Interests (Art. 6(1)(f)):</strong> Disagreeable service prevention and business reputation management. Locksmith businesses hold a legitimate commercial interest in inviting recent service recipients to review completed work and offering swift internal service recovery to unhappy customers.
                </li>
                <li>
                  <strong>Performance of a Contract (Art. 6(1)(b)):</strong> Customer communication regarding completed work and satisfaction follow-up agreed upon as part of service provision.
                </li>
                <li>
                  <strong>Consent (Art. 6(1)(a)):</strong> Customers voluntarily click on review links, select star ratings, and provide written constructive feedback comments.
                </li>
              </ol>
            </PolicySection>

            {/* 5. How Information Is Used */}
            <PolicySection
              id="how-used"
              number={5}
              title="How Information Is Used"
              icon={<FileCheck size={20} />}
            >
              <p>
                Personal data collected through LockReview is used strictly for operational review generation and reputation management:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  <strong>Positive Review Routing (4–5 Stars):</strong> Guiding highly satisfied customers directly to public third-party review platforms (such as Google Business Profile, Trustpilot, or Checkatrade) with one-tap action links.
                </li>
                <li>
                  <strong>Private Service Recovery (1–3 Stars):</strong> Capturing constructive criticism privately within the locksmith dashboard to enable swift dispute resolution without public exposure.
                </li>
                <li>
                  <strong>Anti-Fatigue Deduplication:</strong> Enforcing automated 30-day cooldown rules so customers are never spammed with repetitive review invitations.
                </li>
                <li>
                  <strong>Deterministic Analytics:</strong> Computing evidence-based response rates, sentiment ratios, and delivery statistics.
                </li>
              </ul>
            </PolicySection>

            {/* 6. Third-Party Processors */}
            <PolicySection
              id="third-parties"
              number={6}
              title="Third-Party Sub-Processors"
              icon={<Server size={20} />}
            >
              <p>
                We partner with vetted infrastructure and communications service providers. All sub-processors adhere to strict UK GDPR data processing agreements:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#383838] p-3.5 text-xs space-y-1">
                  <span className="font-bold text-slate-900 dark:text-white block">
                    Hostinger International Ltd
                  </span>
                  <span className="text-slate-500 dark:text-neutral-400">
                    Dedicated Single-Tenant MySQL database hosting and encrypted application servers.
                  </span>
                </div>
                <div className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#383838] p-3.5 text-xs space-y-1">
                  <span className="font-bold text-slate-900 dark:text-white block">
                    Resend Inc. / Hostinger SMTP
                  </span>
                  <span className="text-slate-500 dark:text-neutral-400">
                    Encrypted transactional email delivery provider for customer review invitations.
                  </span>
                </div>
                <div className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#383838] p-3.5 text-xs space-y-1">
                  <span className="font-bold text-slate-900 dark:text-white block">
                    SMS Gateway Providers
                  </span>
                  <span className="text-slate-500 dark:text-neutral-400">
                    Carrier-grade SMS dispatch gateway for mobile-optimized review invitation messages.
                  </span>
                </div>
                <div className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#383838] p-3.5 text-xs space-y-1">
                  <span className="font-bold text-slate-900 dark:text-white block">
                    Public Review Platforms (Google, Trustpilot)
                  </span>
                  <span className="text-slate-500 dark:text-neutral-400">
                    External destinations accessed only upon voluntary customer redirection.
                  </span>
                </div>
              </div>
            </PolicySection>

            {/* 7. Data Retention & Anonymization */}
            <PolicySection
              id="data-retention"
              number={7}
              title="Data Retention &amp; Anonymization"
              icon={<Clock size={20} />}
            >
              <p>
                We retain review request tokens, feedback comments, and audit logs for no longer than necessary to fulfill reputation management and service improvement obligations.
              </p>
              <p>
                The default platform data retention window is configured to <strong>{defaultRetentionDays} days (1 year)</strong>. Expired single-use tokens are automatically invalidated, and feedback history can be archived or permanently purged upon tenant administrator request in compliance with UK DPA standards.
              </p>
            </PolicySection>

            {/* 8. Security & Cryptographic Safeguards */}
            <PolicySection
              id="security-measures"
              number={8}
              title="Security &amp; Cryptographic Safeguards"
              icon={<Lock size={20} />}
            >
              <p>
                We implement comprehensive technical and organizational safeguards across the LockReview architecture:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  <strong>High-Entropy Review Tokens:</strong> Review invitations utilize 64-character cryptographically secure random tokens. Public endpoints expose only minimal view data (Business Name, Logo) without leaking customer emails or phone numbers.
                </li>
                <li>
                  <strong>Server-Side Tenant Isolation:</strong> Strict server-side verification resolves <code>tenant_id</code> exclusively from authenticated JWT sessions, preventing unauthorized cross-tenant data access.
                </li>
                <li>
                  <strong>Encryption in Transit &amp; at Rest:</strong> Enforced TLS 1.3 encryption across all client-server communications and encrypted database storage.
                </li>
                <li>
                  <strong>Rate Limiting &amp; Anti-Brute-Force:</strong> Public review endpoints and admin login forms are shielded with in-memory IP rate limiting to prevent automated scraping or token enumeration.
                </li>
              </ul>
            </PolicySection>

            {/* 9. Your Rights Under UK GDPR */}
            <PolicySection
              id="user-rights"
              number={9}
              title="Your Legal Rights Under UK GDPR"
              icon={<Shield size={20} />}
            >
              <p>
                Under the UK GDPR, data subjects have clear statutory rights regarding their personal data:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Right of Access:</strong> Request a complete record of personal data held about you in review request records.
                </li>
                <li>
                  <strong>Right to Rectification:</strong> Request correction of inaccurate customer names or contact details.
                </li>
                <li>
                  <strong>Right to Erasure (Right to be Forgotten):</strong> Request the permanent deletion of review feedback comments and invitation records.
                </li>
                <li>
                  <strong>Right to Restrict Processing:</strong> Request temporary suspension of review campaign processing.
                </li>
                <li>
                  <strong>Right to Object:</strong> Opt out of receiving review invitation reminders via SMS or Email.
                </li>
                <li>
                  <strong>Right to Data Portability:</strong> Obtain an export of submitted review data in structured CSV format.
                </li>
              </ul>
            </PolicySection>

            {/* 10. Contacting the ICO */}
            <PolicySection
              id="contacting-ico"
              number={10}
              title="Contacting the Information Commissioner's Office (ICO)"
              icon={<HelpCircle size={20} />}
            >
              <p>
                If you have concerns about our data processing practices, you have the right to lodge a complaint with the UK data protection supervisory authority:
              </p>
              <div className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#383838] p-4 text-xs space-y-2 font-medium">
                <p>
                  <strong>Information Commissioner&apos;s Office (ICO)</strong>
                </p>
                <p>Wycliffe House, Water Lane, Wilmslow, Cheshire, SK9 5AF</p>
                <p>
                  Helpline: 0303 123 1113 | Website:{' '}
                  <a
                    href="https://ico.org.uk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#E76A0E] underline inline-flex items-center gap-1"
                  >
                    https://ico.org.uk <ExternalLink size={11} />
                  </a>
                </p>
              </div>
            </PolicySection>

            {/* 11. Policy Version & Metadata */}
            <PolicySection
              id="policy-metadata"
              number={11}
              title="Policy Version &amp; System Metadata"
              icon={<FileCheck size={20} />}
            >
              <p>
                This document is maintained and versioned within the LockReview reputation platform configuration:
              </p>
              <div className="bg-slate-100 dark:bg-[#151515] border border-slate-200 dark:border-[#2e2e2e] p-4 text-xs space-y-1 font-mono">
                <p>PRIVACY_POLICY_VERSION: {version}</p>
                <p>PRIVACY_POLICY_EFFECTIVE_DATE: {effectiveDate}</p>
                <p>PRIVACY_POLICY_LAST_UPDATED: {lastUpdated}</p>
                <p>DEFAULT_RETENTION_DAYS: {defaultRetentionDays}</p>
              </div>
            </PolicySection>

            {/* 12. Policy Revisions & Updates */}
            <PolicySection
              id="policy-revisions"
              number={12}
              title="Policy Revisions &amp; Updates"
              icon={<Clock size={20} />}
            >
              <p>
                We may modify this Privacy Policy periodically to reflect technological improvements, statutory updates under UK GDPR, or changes to platform review distribution integrations.
              </p>
              <p>
                Material revisions will be published directly on this page with an updated version number and effective date. Locksmith operators and customers are encouraged to review this page periodically.
              </p>
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
            <Link href="/privacy-policy" className="text-[#E76A0E] font-bold underline">
              Privacy Policy
            </Link>
            <Link href="/terms-of-use" className="hover:text-[#E76A0E] transition-colors">
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

import * as fs from 'fs';
import * as path from 'path';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  BorderStyle,
  WidthType,
  AlignmentType,
  ShadingType,
  Header,
  Footer,
  PageNumber,
} from 'docx';

async function createHelpDocument() {
  const brandOrange = '00D492';
  const brandDark = '1E293B';
  const brandGray = '64748B';
  const brandLightBg = 'F8FAFC';
  const borderColor = 'CBD5E1';

  const tableBorder = {
    top: { style: BorderStyle.SINGLE, size: 1, color: borderColor },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: borderColor },
    left: { style: BorderStyle.SINGLE, size: 1, color: borderColor },
    right: { style: BorderStyle.SINGLE, size: 1, color: borderColor },
    insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: borderColor },
    insideVertical: { style: BorderStyle.SINGLE, size: 1, color: borderColor },
  };

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: 'Arial',
            size: 22, // 11pt
            color: brandDark,
          },
          paragraph: {
            spacing: { line: 280, before: 120, after: 120 },
          },
        },
        heading1: {
          run: {
            font: 'Arial',
            size: 36, // 18pt
            bold: true,
            color: brandOrange,
          },
          paragraph: {
            spacing: { before: 360, after: 160 },
          },
        },
        heading2: {
          run: {
            font: 'Arial',
            size: 28, // 14pt
            bold: true,
            color: brandDark,
          },
          paragraph: {
            spacing: { before: 260, after: 120 },
          },
        },
        heading3: {
          run: {
            font: 'Arial',
            size: 24, // 12pt
            bold: true,
            color: '0F172A',
          },
          paragraph: {
            spacing: { before: 180, after: 80 },
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch
              bottom: 1440,
              left: 1440,
              right: 1440,
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: 'LockReview — SaaS Platform User Guide & Manual',
                    size: 18,
                    color: brandGray,
                    italics: true,
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: 'Page ',
                    size: 18,
                    color: brandGray,
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 18,
                    color: brandGray,
                  }),
                  new TextRun({
                    text: ' of ',
                    size: 18,
                    color: brandGray,
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    size: 18,
                    color: brandGray,
                  }),
                ],
              }),
            ],
          }),
        },
        children: [
          // Document Header / Title
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'LOCKREVIEW',
                size: 48,
                bold: true,
                color: brandOrange,
              }),
            ],
            spacing: { before: 200, after: 60 },
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'Locksmith Review Generation & Reputation Management SaaS',
                size: 26,
                bold: true,
                color: brandDark,
              }),
            ],
            spacing: { before: 0, after: 120 },
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'Comprehensive Platform User Guide, Operations Manual & Architectural Blueprint',
                size: 20,
                italics: true,
                color: brandGray,
              }),
            ],
            spacing: { before: 0, after: 360 },
          }),

          // Callout Box: Quick Metadata
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorder,
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { type: ShadingType.CLEAR, fill: brandLightBg },
                    margins: { top: 160, bottom: 160, left: 200, right: 200 },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'Platform Deployment URL: ', bold: true }),
                          new TextRun({ text: 'https://darkslateblue-tiger-618670.hostingersite.com' }),
                        ],
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'Ecosystem Partner App: ', bold: true }),
                          new TextRun({ text: 'LockQuote SaaS (https://lockquote.atypikalstudio.dev)' }),
                        ],
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'Architecture: ', bold: true }),
                          new TextRun({ text: 'Single-Tenant Dedicated Instance with Shared MySQL Persistence' }),
                        ],
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'Document Version: ', bold: true }),
                          new TextRun({ text: '1.0.0 (Production Release)' }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({ text: '', spacing: { before: 180, after: 180 } }),

          // Section 1
          new Paragraph({
            text: '1. Executive Summary & Core Value Proposition',
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'LockReview is an automated, evidence-based review generation and reputation management software suite designed specifically for professional locksmith businesses. It integrates directly with the LockQuote ecosystem to turn every completed job into a strategic local SEO and 5-star reputation asset.',
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Primary Business Objectives:', bold: true }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'Automated & Manual Review Generation: ', bold: true }),
              new TextRun({ text: 'Seamlessly dispatch mobile-optimized review invitations via SMS and Email to customers whose jobs have been marked as completed.' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'Positive Feedback Routing (4–5 Stars): ', bold: true }),
              new TextRun({ text: 'Instantly direct satisfied customers directly to your Google Business Profile, Trustpilot UK, Checkatrade, or Facebook page with pre-configured 5-star prompts.' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'Private Customer Service Recovery (1–3 Stars): ', bold: true }),
              new TextRun({ text: 'Intercept complaints and low star ratings before they reach public search listings, capturing private constructive feedback on your internal dashboard for rapid resolution.' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'Shared MySQL Database Harmony: ', bold: true }),
              new TextRun({ text: 'Operate in perfect synchronization with LockQuote on the shared database without duplicating customer contact records, leads, quotes, or authentication users.' }),
            ],
          }),

          // Section 2
          new Paragraph({
            text: '2. System Architecture & Single-Tenant Operation',
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'LockReview is deployed as a dedicated, standalone Single-Tenant web application. It communicates directly with your Hostinger MySQL database instance, sharing persistence with LockQuote.',
              }),
            ],
          }),
          new Paragraph({
            text: 'Shared Tables vs. LockReview-Owned Tables',
            heading: HeadingLevel.HEADING_2,
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorder,
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { type: ShadingType.CLEAR, fill: brandOrange },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Table Name', bold: true, color: 'FFFFFF' })] })],
                  }),
                  new TableCell({
                    shading: { type: ShadingType.CLEAR, fill: brandOrange },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Ownership', bold: true, color: 'FFFFFF' })] })],
                  }),
                  new TableCell({
                    shading: { type: ShadingType.CLEAR, fill: brandOrange },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Primary Function in LockReview', bold: true, color: 'FFFFFF' })] })],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: 'tenants' })] }),
                  new TableCell({ children: [new Paragraph({ text: 'Shared (LockQuote)' })] }),
                  new TableCell({ children: [new Paragraph({ text: 'Business identity, phone, email, and company branding.' })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: 'users' })] }),
                  new TableCell({ children: [new Paragraph({ text: 'Shared (LockQuote)' })] }),
                  new TableCell({ children: [new Paragraph({ text: 'Locksmith admin authentication and dashboard login credentials.' })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: 'leads' })] }),
                  new TableCell({ children: [new Paragraph({ text: 'Shared (LockQuote)' })] }),
                  new TableCell({ children: [new Paragraph({ text: 'Customer contact information, phone, email, address, and job completion status.' })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: 'review_requests' })] }),
                  new TableCell({ children: [new Paragraph({ text: 'LockReview-Owned' })] }),
                  new TableCell({ children: [new Paragraph({ text: 'Tracks invitation tokens, delivery channels, rating status, and expiry.' })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: 'review_feedback' })] }),
                  new TableCell({ children: [new Paragraph({ text: 'LockReview-Owned' })] }),
                  new TableCell({ children: [new Paragraph({ text: 'Stores customer ratings (1-5★), private comments, and Google click logs.' })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: 'review_platform_settings' })] }),
                  new TableCell({ children: [new Paragraph({ text: 'LockReview-Owned' })] }),
                  new TableCell({ children: [new Paragraph({ text: 'Destination URLs for Google Business Profile, Trustpilot, Checkatrade.' })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: 'review_templates' })] }),
                  new TableCell({ children: [new Paragraph({ text: 'LockReview-Owned' })] }),
                  new TableCell({ children: [new Paragraph({ text: 'Dynamic SMS and Email dispatch message templates.' })] }),
                ],
              }),
            ],
          }),

          // Section 3
          new Paragraph({
            text: '3. Authentication & Logging In',
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'To access your LockReview dashboard, navigate to ',
              }),
              new TextRun({ text: '/login', bold: true }),
              new TextRun({
                text: ' on your deployed hostinger domain (or localhost during local development).',
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Authentication Rules:', bold: true }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'Authoritative Single User Record: ', bold: true }),
              new TextRun({ text: 'The login form strictly authenticates against the sole User record stored in your MySQL users table.' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'Cryptographic JWT Session: ', bold: true }),
              new TextRun({ text: 'Upon valid credential entry, an HTTP-only session cookie is created with HMAC-SHA256 signature, valid for 24 hours.' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'Route Middleware Guard: ', bold: true }),
              new TextRun({ text: 'All /dashboard routes are shielded. Any unauthenticated access attempt is instantly redirected to /login.' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'Brute Force Rate Limiting: ', bold: true }),
              new TextRun({ text: 'IP addresses exceeding 10 failed login attempts in 60 seconds are locked out automatically with security audit alerts.' }),
            ],
          }),

          // Section 4
          new Paragraph({
            text: '4. Overview Dashboard & Reputation Metrics (/dashboard)',
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'The main dashboard provides an instant, evidence-based health check of your local reputation and ongoing customer campaigns.',
              }),
            ],
          }),
          new Paragraph({
            text: 'Key Performance Indicators (KPIs)',
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'Total Requests & Sent Volume: ', bold: true }),
              new TextRun({ text: 'The total number of invitations generated and successfully dispatched over SMS/Email.' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'Response Rate (%): ', bold: true }),
              new TextRun({ text: 'The percentage of contacted customers who opened their review link and submitted feedback.' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'Average Rating (1.0 to 5.0): ', bold: true }),
              new TextRun({ text: 'The mathematical mean rating across all submitted responses in your database.' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'Positive Feedback Ratio (%): ', bold: true }),
              new TextRun({ text: 'The share of 4-star and 5-star ratings compared to total received feedback.' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'Public Platform Click Rate (%): ', bold: true }),
              new TextRun({ text: 'The percentage of positive reviewers who tapped the "Post to Google Reviews" button.' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'Star Distribution Breakdown: ', bold: true }),
              new TextRun({ text: 'Visual distribution chart partitioning 5★, 4★, 3★, 2★, and 1★ submissions.' }),
            ],
          }),

          // Section 5
          new Paragraph({
            text: '5. Review Requests Management (/dashboard/requests)',
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'The Review Requests page allows you to inspect all past review campaigns and dispatch new review invitations on demand.',
              }),
            ],
          }),
          new Paragraph({
            text: 'How to Manually Send a Review Request:',
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Step 1: ', bold: true }),
              new TextRun({ text: 'Click the "+ Create Review Request" button in the upper right corner.' }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Step 2: ', bold: true }),
              new TextRun({ text: 'Select a completed job/lead from the shared customer list. The system automatically pulls the customer name, phone number, and email address.' }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Step 3: ', bold: true }),
              new TextRun({ text: 'Choose the delivery channel: ' }),
              new TextRun({ text: 'SMS, Email, or Both.', bold: true }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Step 4: ', bold: true }),
              new TextRun({ text: 'Select a message template. Preview the live interpolated text containing the customer name and secure review URL.' }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Step 5: ', bold: true }),
              new TextRun({ text: 'Click "Send Review Request". The system assigns a 64-character high-entropy cryptographic token, records the request in MySQL, and dispatches the message.' }),
            ],
          }),
          new Paragraph({
            text: 'Anti-Fatigue & Deduplication Protection',
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'To avoid spamming customers, LockReview includes a built-in 30-day deduplication guard. If a customer was already invited within 30 days, the platform warns the administrator and requires an explicit override before sending another notification.',
              }),
            ],
          }),

          // Section 6
          new Paragraph({
            text: '6. The Customer Review Experience (/review/[token])',
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'When a customer opens their personalized link on their smartphone, they experience a streamlined, mobile-first rating interface.',
              }),
            ],
          }),
          new Paragraph({
            text: 'Mobile Review Flow Step-by-Step:',
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '1. Instant Star Selector: ', bold: true }),
              new TextRun({ text: 'The customer is greeted with "How was your experience with [Business Name]?" and 5 oversized, tap-friendly gold stars.' }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '2. Positive Rating Path (4 or 5 Stars):', bold: true }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'Appreciation screen appears: "Thank you! We\'re delighted you had a great experience."' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'A high-visibility button appears: "Share Your Review on Google" (with official Google icon).' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'Tapping the button opens your Google Business Profile review modal in 1 tap, while logging a click evidence event in your database.' }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '3. Private Service Recovery Path (1, 2, or 3 Stars):', bold: true }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'The system does NOT redirect the customer to Google Reviews.' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'Instead, it displays an empathetic recovery form: "We are so sorry things weren\'t perfect. How can we make this right?"' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'The customer enters their feedback privately and submits it.' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'An urgent resolution ticket is created in your Feedback Inbox for immediate manager follow-up.' }),
            ],
          }),

          // Section 7
          new Paragraph({
            text: '7. Feedback Inbox & Service Recovery (/dashboard/feedback)',
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'The Feedback Inbox is your central command for monitoring customer sentiment, reading private reviews, and performing rapid service recovery.',
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Inbox Features:', bold: true }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'Multi-Attribute Filtering: ', bold: true }),
              new TextRun({ text: 'Filter by Sentiment (All, Positive, Negative), Star Rating (1★ through 5★), Platform Clicked (Yes/No), and Customer Search.' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'Detail & Lifecycle Timeline: ', bold: true }),
              new TextRun({ text: 'Click "Inspect Details" on any feedback card to view joined customer phone/email, full comments, and a complete chronological event log (Request Created → Notification Dispatched → Rated → Public Review Clicked / Private Feedback Submitted).' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'Direct Customer Contact: ', bold: true }),
              new TextRun({ text: 'One-click "Call Customer" and "Send Email" action buttons allow dispatchers to immediately reach out to unhappy customers.' }),
            ],
          }),

          // Section 8
          new Paragraph({
            text: '8. Reputation Platform Settings & Message Templates (/dashboard/settings)',
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Customize your public review destination links and notification wording to match your business branding.',
              }),
            ],
          }),
          new Paragraph({
            text: 'Configuring Review Platforms',
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Google Business Profile (Primary): ', bold: true }),
              new TextRun({ text: 'Paste your direct Google Review URL (e.g. https://search.google.com/local/writereview?placeid=...).' }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Alternative Platforms: ', bold: true }),
              new TextRun({ text: 'Enable or disable Trustpilot UK, Checkatrade, and Facebook Reviews.' }),
            ],
          }),
          new Paragraph({
            text: 'Template Dynamic Variables',
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'You can customize SMS and Email templates using the following live tags:' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: '{customer_name}: ', bold: true }),
              new TextRun({ text: 'Replaced with the customer\'s full name (e.g. "John Smith").' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: '{business_name}: ', bold: true }),
              new TextRun({ text: 'Replaced with your registered business name (e.g. "DEMO Locksmith").' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: '{review_link}: ', bold: true }),
              new TextRun({ text: 'Replaced with the unique, encrypted customer review link.' }),
            ],
          }),

          // Section 9
          new Paragraph({
            text: '9. Post-Job Automation Engine',
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'LockReview features an automated webhook and scanning engine that automatically requests reviews as soon as jobs are completed in LockQuote.',
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Automated Lifecycle Workflow:', bold: true }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: '1. Trigger: ', bold: true }),
              new TextRun({ text: 'A lead status updates to "completed" in LockQuote (via API call or backend job update).' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: '2. Eligibility Check: ', bold: true }),
              new TextRun({ text: 'The automation service verifies that the customer has valid contact details and hasn\'t received a review request in the last 30 days.' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: '3. Automated Dispatch: ', bold: true }),
              new TextRun({ text: 'The review invitation is generated and sent automatically via SMS and/or Email.' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: '4. Audit Log: ', bold: true }),
              new TextRun({ text: 'An audit log entry ("AUTOMATION_POST_JOB_DISPATCHED") is permanently recorded in the shared database.' }),
            ],
          }),

          // Section 10
          new Paragraph({
            text: '10. Frequently Asked Questions (FAQ) & Maintenance',
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            text: 'Q: What happens if a customer rates 3 stars?',
            heading: HeadingLevel.HEADING_3,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'A: 3 stars is treated as a service recovery event. The customer is politely invited to provide private constructive feedback, preventing a mediocre rating from diluting your 5.0 Google Business Profile rating.',
              }),
            ],
          }),
          new Paragraph({
            text: 'Q: Can a customer submit a review more than once?',
            heading: HeadingLevel.HEADING_3,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'A: No. Each unique URL token can only be used once. Once submitted, the token status changes to "responded", and opening the link displays an "Already Submitted" appreciation card.',
              }),
            ],
          }),
          new Paragraph({
            text: 'Q: Where are emails and SMS messages configured?',
            heading: HeadingLevel.HEADING_3,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'A: Email providers (Hostinger SMTP or Resend) and SMS gateway providers are configured via environment variables (.env.local) on your deployment server.',
              }),
            ],
          }),
          new Paragraph({
            text: 'Q: How do I jump back to LockQuote from LockReview?',
            heading: HeadingLevel.HEADING_3,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'A: Click the "Open LockQuote" button in the left sidebar or landing page header to navigate directly to your LockQuote SaaS dashboard.',
              }),
            ],
          }),

          new Paragraph({ text: '', spacing: { before: 240, after: 240 } }),

          // Sign-off box
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorder,
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { type: ShadingType.CLEAR, fill: brandLightBg },
                    margins: { top: 180, bottom: 180, left: 240, right: 240 },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            text: 'LockReview SaaS Platform — Production Guide',
                            bold: true,
                            color: brandDark,
                          }),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            text: 'For technical inquiries or system configuration assistance, contact support@atypikalstudio.dev',
                            size: 20,
                            color: brandGray,
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      },
    ],
  });

  const outputFilePath = path.join(
    process.cwd(),
    'LockReview_User_Guide_and_Help_Documentation.docx'
  );
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputFilePath, buffer);
  console.log(`✅ Word Document Generated Successfully: ${outputFilePath}`);
}

createHelpDocument().catch((err) => {
  console.error('❌ Error generating Word document:', err);
  process.exit(1);
});

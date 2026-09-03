# Agent Settings

* Model: Gemini 3.8 Flash
* Thinking Level: HIGH

# Workspace Metadata

* Environment: SaaS Application Development
* Application: LockReview — Review Generation & Reputation Management Platform
* Ecosystem: LockQuote Product Ecosystem (Independent Deployable SaaS Application)
* Architecture: Single-Tenant (Dedicated Database Instance per Client) with Shared MySQL Persistence
* Frontend: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui
* Backend: Next.js API Routes (Serverless / Node.js runtime)
* Database: Shared MySQL Database (Hostinger / Local MySQL)
* ORM: Drizzle ORM (`mysql2`)
* Authentication: JWT / Cookie Session Auth with Route Middleware Protection (`/dashboard/:path*`), compatible with LockQuote auth/session model
* Email: Hostinger SMTP / Resend (Provider Abstraction Layer)
* SMS: Provider Abstraction Layer (Swappable Gateway)
* Validation: Zod
* Forms: React Hook Form
* Analytics: MySQL-backed evidence-based reputation & review reporting
* Deployment: Hostinger / Vercel

---

# Primary Goal

Build a production-ready **Locksmith Review Generation & Reputation Management SaaS application (LockReview)** within the existing LockQuote product ecosystem that helps locksmith businesses:

* **Generate Automated & Manual Review Requests**: Request reviews from completed jobs/customers stored in the shared MySQL database via SMS and Email.
* **Positive Feedback Routing (4–5 Stars)**: Direct satisfied customers straight to public review platforms (Google Business Profile, Trustpilot, Checkatrade, etc.) to boost local SEO and star ratings.
* **Private Feedback Interception (1–3 Stars)**: Capture constructive criticism and complaints privately to the locksmith dashboard for internal resolution before negative reviews hit public profiles.
* **Track Conversion & Engagement**: Monitor delivery statuses, open rates, response rates, sentiment distribution, and platform click-throughs with verified MySQL evidence.
* **Shared Database Harmony**: Coexist seamlessly on the shared MySQL database with LockQuote without duplicating core business records (tenants, users, leads, customers, quotes, jobs).
* **Produce Measurable ROI**: Increase positive review volume, improve local Google Maps pack rankings, and elevate customer trust.

---

# Core User Journeys

### 1. Locksmith Admin Journey (Review Request & Reputation Management)
1. Locksmith logs into LockReview dashboard (`/dashboard`) using shared credentials.
2. Views real-time reputation overview: review requests sent, response rates, average rating, positive vs negative sentiment, and public click-through activity.
3. Creates review requests manually by selecting completed leads/jobs from the shared database, or enables automated post-job triggers.
4. Customizes SMS/Email templates, delivery schedules, and public review destination URLs (e.g. Google Review link).
5. Monitors feedback inbox: responds to internal private feedback tickets and resolves customer issues.

### 2. Customer Review Journey (Mobile-First Experience)
1. Customer receives SMS or Email with a secure, unique review link (`/review/[token]`).
2. Opens mobile-first review page: “How was your experience with [Business Name]?” with 1–5 star rating selector.
3. **If 4 or 5 stars (Positive Flow)**:
   - System records positive sentiment.
   - Displays warm appreciation screen and one-tap action button: *"Share on Google Reviews"* (or configured platform).
   - Tracks platform click event upon redirection.
4. **If 1, 2, or 3 stars (Private Feedback Flow)**:
   - System records rating without immediate public redirect.
   - Invites constructive private feedback: *"We're sorry to hear that. How can we make things right?"*
   - Customer submits details privately.
   - Creates an immediate urgent alert on the Locksmith dashboard for swift customer service recovery.

### 3. Post-Job Automated Trigger Journey
1. Lead status changes to `completed` in shared database (via LockQuote job completion).
2. Automation engine evaluates eligibility (configured delay, duplicate check, customer opt-in).
3. Review request is scheduled/dispatched automatically via SMS/Email.
4. Audit log entry recorded in shared database.

---

# Critical Architectural Rules & Principles

## 1. Dual Independent Applications — One Shared MySQL Database
* **LockQuote** and **LockReview** are two standalone, independently deployable web applications.
* LockReview is **NOT** a submodule or subfolder of LockQuote; it has its own deployment lifecycle, codebase, and routing.
* Both applications connect to the **same single MySQL database instance**.
* **Do NOT create a second database.**
* Core business records have one authoritative source of truth. **Never duplicate** records for:
  - `tenants` (businesses)
  - `users` (staff/admins)
  - `leads` (customers / service requests / jobs)
  - `quotes`
  - `consents`
  - `audit_logs`
  - `security_events`

---

## 2. Database Ownership & Schema Boundaries

### Shared Tables (Consumed by LockReview from LockQuote):
* `tenants`: Primary business identity, branding, global settings.
* `users`: Authentication identities, email, credentials, tenant relationship.
* `leads`: Customer contact details (name, phone, email, address, postcode), job service type, status (`new`, `contacted`, `quoted`, `booked`, `completed`, `lost`).
* `quotes`: Price estimates, quote types, lead linkage.
* `audit_logs`: Centralized audit trail for tenant events.
* `consents`: GDPR / UK DPA compliance records.
* `security_events`: Security monitoring and access logs.

### LockReview-Owned Tables:
* `review_requests`:
  - `id` (varchar 36, UUID primary key)
  - `tenant_id` (references `tenants.id`, onDelete cascade)
  - `lead_id` (references `leads.id`, onDelete cascade)
  - `quote_id` (optional reference to `quotes.id`)
  - `status` (`pending`, `scheduled`, `sent`, `delivered`, `responded`, `positive`, `negative`, `failed`, `cancelled`, `expired`)
  - `channel` (`sms`, `email`, `both`)
  - `secure_token` / `token_hash` (cryptographically random URL token)
  - `rating` (tinyint / int: 1–5, nullable until responded)
  - `sent_at` (timestamp)
  - `responded_at` (timestamp)
  - `expires_at` (timestamp)
  - `created_at`, `updated_at`
* `review_feedback`:
  - `id` (varchar 36, UUID primary key)
  - `tenant_id` (references `tenants.id`, onDelete cascade)
  - `review_request_id` (references `review_requests.id`, onDelete cascade)
  - `rating` (int 1–5)
  - `sentiment` (`positive`, `negative`)
  - `feedback_text` (text, private constructive comments)
  - `public_platform_clicked` (boolean default false)
  - `public_platform_name` (varchar 50, e.g. `google`)
  - `created_at` (timestamp)
* `review_platform_settings`:
  - `id` (varchar 36, UUID primary key)
  - `tenant_id` (references `tenants.id`, onDelete cascade)
  - `platform_name` (varchar 50, e.g. `google`, `trustpilot`, `facebook`, `checkatrade`)
  - `destination_url` (text)
  - `is_enabled` (boolean default true)
  - `created_at`, `updated_at`
* `review_templates`:
  - `id` (varchar 36, UUID primary key)
  - `tenant_id` (references `tenants.id`, onDelete cascade)
  - `channel` (`sms`, `email`)
  - `template_name` (varchar 100)
  - `subject` (varchar 255, for email)
  - `body_template` (text with dynamic variables: `{customer_name}`, `{business_name}`, `{review_link}`)
  - `is_default` (boolean default false)
  - `created_at`, `updated_at`

---

## 3. Strict Server-Side Tenant Isolation & Security

* **No Row Level Security in MySQL**: Because MySQL lacks Supabase RLS, tenant isolation is strictly enforced in the application and database service layer.
* **Resolution Pipeline**:
  $$\text{Authenticated Request} \longrightarrow \text{Verify JWT / Session} \longrightarrow \text{Resolve Server-Side } tenant\_id \longrightarrow \text{Execute Scoped Query}$$
* **Golden Rule of Authorization**: Never trust a browser-supplied `tenant_id` or `business_id` in request query params or JSON body. Always derive the tenant context from the verified session token on the server.
* **Parameterised SQL**: All queries must use Drizzle ORM or parameterised queries via `mysql2`. Constructing SQL with raw string concatenation is strictly forbidden.
* **Public Token Security**:
  - Review request links use high-entropy cryptographically secure random tokens.
  - Public `/review/[token]` endpoints are unauthenticated for the end customer, but validate the token server-side, check expiration/cancellation, and expose only the minimal public view model (Business Name, Logo, Review Status). Never expose MySQL internals, lead emails, or phone numbers to the public client.
  - Public endpoints are rate-limited against brute-force enumeration.

---

## 4. Technology Alignment with LockQuote

To maintain seamless maintainability across the suite:
* **Framework**: Next.js 15 (App Router with Turbopack support)
* **Language**: TypeScript (strict mode enabled)
* **Styling**: Tailwind CSS v4, shadcn/ui component architecture
* **ORM & Driver**: Drizzle ORM (`drizzle-orm`) with `mysql2/promise` connection pooling
* **Authentication**: JWT cookie-based session verification with Next.js Middleware route protection
* **Validation**: Zod for all API route payloads and form submissions
* **Forms**: React Hook Form with `@hookform/resolvers/zod`
* **Icons**: `lucide-react`
* **Email Provider**: Resend / Hostinger SMTP (using the unified `EmailProvider` interface)
* **SMS Provider**: Swappable generic SMS gateway (using the unified `SMSProvider` interface)
* **UI Themes**: Clean, modern dark/light mode adhering to Atypikal Studio aesthetic guidelines

---

## 5. Production-Ready Code Standards

* **Zero Mock Slop in Production**: Never write TODOs, fake metrics, pseudo-code, mock database fallbacks in live service paths, or incomplete stubs.
* **Deterministic Analytics**: Every dashboard metric (requests sent, response rate, positive ratio, click rate) must be calculated from genuine MySQL records.
* **Standardized API Response Schema**:
  ```ts
  type ApiResponse<T = any> = {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
  };
  ```
* **Comprehensive Error Handling**: All API routes and server actions must catch exceptions, log operational failures to `audit_logs` / console, and return user-friendly error codes with appropriate HTTP status codes (400, 401, 403, 404, 429, 500).

---

## 6. Directory Structure Policy

```
/
├── .agents/                      # Phase specifications & system prompts
│   ├── AGENTS.md
│   ├── LockReview_Phase_01_Architecture_Foundation_MySQL.md
│   └── ...
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/               # Login / authentication routes
│   │   ├── (dashboard)/          # Protected LockReview dashboard routes
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx      # Reputation Overview & Metrics
│   │   │   │   ├── requests/     # Review Requests management & creation
│   │   │   │   ├── feedback/     # Private feedback inbox & resolution
│   │   │   │   ├── settings/     # Reputation platforms & template config
│   │   │   │   └── analytics/    # Deep-dive reputation reports
│   │   ├── (public)/             # Public review flow
│   │   │   └── review/[token]/   # Mobile-first customer review experience
│   │   ├── api/                  # API endpoints (tenant-scoped)
│   │   │   ├── auth/             # Login, logout, session check
│   │   │   ├── reviews/          # Review requests CRUD & dispatch
│   │   │   ├── feedback/         # Feedback submission & status updates
│   │   │   ├── settings/         # Platform & template settings
│   │   │   └── analytics/        # Aggregate metrics
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/               # Reusable UI & shadcn components
│   │   ├── ui/                   # Button, Card, Dialog, Input, Table, Badge, etc.
│   │   ├── layout/               # Sidebar, Header, UserMenu, TenantSwitcher
│   │   ├── dashboard/            # MetricsCards, ReviewRequestTable, FeedbackFeed
│   │   └── public-review/        # StarRating, PositivePrompt, FeedbackForm
│   ├── db/                       # Database layer
│   │   ├── index.ts              # MySQL connection pool & Drizzle client
│   │   ├── schema.ts             # Drizzle schema (shared + LockReview tables)
│   │   ├── migrations/           # Drizzle migration files
│   │   └── helpers.ts            # Tenant-scoped query helpers
│   ├── features/                 # Modular domain logic
│   ├── hooks/                    # React hooks (useAuth, useTenant, useToast)
│   ├── lib/                      # Utilities, config, crypto, env helpers
│   ├── middleware.ts             # Edge session validation & route guard
│   ├── providers/                # Email & SMS provider abstractions
│   │   ├── email/                # Resend, SMTP providers
│   │   └── sms/                  # Generic SMS gateway provider
│   ├── services/                 # Server-side business logic
│   │   ├── auth.service.ts
│   │   ├── review.service.ts
│   │   ├── notification.service.ts
│   │   ├── feedback.service.ts
│   │   └── analytics.service.ts
│   └── types/                    # Shared TypeScript interfaces & DTOs
├── .env.example                  # Documented environment template
├── drizzle.config.ts             # Drizzle ORM configuration
├── package.json
├── tsconfig.json
└── README.md
```

---

## 7. Anti-Slop Safeguards

* **Targeted Code Modifications**: Never overwrite unrelated files or regenerate entire components when tweaking specific logic.
* **No Breaking Changes to Shared Schema**: When creating migrations for LockReview, write additive migrations (`CREATE TABLE IF NOT EXISTS`, new indices). Never drop or modify columns in shared LockQuote tables (`tenants`, `users`, `leads`, `quotes`, `consents`) without explicit cross-application alignment.
* **No Mock Placeholders**: Eliminate placeholder comments (`// TODO: implement later`) in delivered phases. Every phase deliverable must be functional, linted, and verified.
* **Defensive Database Queries**: Always index foreign keys (`tenant_id`, `lead_id`, `review_request_id`, `secure_token`) for high performance.

---

## 8. UX Philosophy & Aesthetics

* **Brand Continuity**: Mirror the polished, dark-accented, high-trust visual identity of LockQuote.
* **Mobile-First Customer Experience**: The `/review/[token]` page is 100% optimized for smartphone touchscreens with oversized tap targets, fluid animations, and instant feedback.
* **Clarity for Non-Technical Locksmiths**: Dashboard metrics must be self-explanatory with clear tooltips and action-oriented layouts.
* **Speed & Performance**: Lightweight bundles, server-side data fetching where appropriate, and optimistic UI transitions.

# LockReview — Review Generation & Reputation Management SaaS

Standalone Next.js 15 application within the **LockQuote Product Ecosystem** designed to help locksmith businesses automate review requests, route 4–5 star reviews directly to Google Business Profile, and intercept 1–3 star complaints privately.

---

## Ecosystem Architecture

- **Independent Deployments**: LockQuote and LockReview are standalone web applications with separate lifecycles.
- **Shared MySQL Persistence**: Both applications connect to the **same single MySQL database instance**.
- **Core Shared Entities**: `tenants`, `users`, `leads`, `quotes`, `consents`, `audit_logs`, `security_events`.
- **LockReview-Owned Tables**: `review_requests`, `review_feedback`, `review_platform_settings`, `review_templates`.

---

## Authentication & Server-Side Tenant Isolation

Because MySQL lacks Supabase RLS, tenant isolation is strictly enforced in the application and database service layer:

$$\text{Authenticated Session} \longrightarrow \text{Verify HMAC-SHA256 JWT} \longrightarrow \text{Resolve Server-Side Tenant Context} \longrightarrow \text{Scoped Drizzle Query}$$

Client-supplied `tenant_id` or `business_id` parameters are never trusted.

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env.local
```

### 3. Run Automated Auth & Tenant Isolation Tests
```bash
npm run test:auth
```

### 4. Start Development Server
```bash
npm run dev
```

Dashboard will be available at `http://localhost:3001` (or next available port).
Default Demo Credentials:
- **Email**: `support@atypikalstudio.dev`
- **Password**: `MockPassword123!`
# Locksmith-Review-Generation-Reputation-Management

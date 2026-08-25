# LockReview — Database Schema & Architecture Documentation

## Overview

LockReview and LockQuote operate as **two standalone, independently deployable web applications sharing a single MySQL database instance**. 

This document defines the schema boundaries, authoritative core entities, LockReview-owned tables, foreign key constraints, lifecycle state machines, and application-level tenant isolation rules.

---

## 1. Schema Boundaries & Ownership Principle

```
+-----------------------------------------------------------------------------------+
|                            SHARED MYSQL DATABASE                                 |
|                                                                                   |
|  [SHARED TABLES] (Authoritative from LockQuote Core)                               |
|  ├── tenants                   - Business identity, branding, settings            |
|  ├── users                     - Admin/staff credentials & auth accounts          |
|  ├── leads                     - Customer details, service requests, job status   |
|  ├── quotes                    - Price estimates and quote details                |
|  ├── notifications             - Dispatch logs and notification delivery history  |
|  ├── service_areas             - Postcode coverage prefixes                       |
|  ├── audit_logs                - Centralized audit trail                          |
|  ├── consents                  - GDPR & UK DPA compliance consent records        |
|  └── security_events           - Security monitoring and access logs              |
|                                                                                   |
|  [LOCKREVIEW-OWNED TABLES] (Review Generation & Reputation Suite)                 |
|  ├── review_requests           - Review request lifecycle & secure public tokens  |
|  ├── review_feedback           - Customer ratings, sentiment & private feedback   |
|  ├── review_platform_settings  - Public review destinations (Google Reviews link) |
|  └── review_templates          - SMS & Email review message templates             |
+-----------------------------------------------------------------------------------+
```

---

## 2. LockReview-Owned Tables Specification

### 2.1 `review_requests`
Tracks individual review requests dispatched to customers.

| Column | Type | Nullable | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | VARCHAR(36) | No | PK | Unique UUID identifier |
| `tenant_id` | VARCHAR(36) | No | — | Foreign key referencing `tenants.id` (ON DELETE CASCADE) |
| `lead_id` | VARCHAR(36) | No | — | Foreign key referencing `leads.id` (ON DELETE CASCADE) |
| `quote_id` | VARCHAR(36) | Yes | NULL | Optional reference to `quotes.id` (ON DELETE SET NULL) |
| `status` | VARCHAR(50) | No | `'pending'` | Lifecycle status (see state machine below) |
| `channel` | VARCHAR(20) | No | `'sms'` | Delivery channel (`sms`, `email`, `both`) |
| `secure_token` | VARCHAR(64) | No | UNIQUE | Cryptographically random public URL token |
| `token_hash` | VARCHAR(64) | Yes | NULL | SHA-256 hash of secure token |
| `rating` | TINYINT | Yes | NULL | Submitted customer rating (1–5) |
| `sent_at` | TIMESTAMP | Yes | NULL | Timestamp when request was dispatched |
| `responded_at` | TIMESTAMP | Yes | NULL | Timestamp when customer submitted feedback |
| `expires_at` | TIMESTAMP | Yes | NULL | Expiration timestamp |
| `created_at` | TIMESTAMP | No | `CURRENT_TIMESTAMP` | Record creation timestamp |
| `updated_at` | TIMESTAMP | No | `CURRENT_TIMESTAMP ON UPDATE` | Record last updated timestamp |

**Indexes & Constraints**:
- `PRIMARY KEY (id)`
- `UNIQUE INDEX uniq_review_requests_token (secure_token)`
- `INDEX idx_review_requests_tenant (tenant_id)`
- `INDEX idx_review_requests_lead (lead_id)`
- `INDEX idx_review_requests_status (status)`
- `INDEX idx_review_requests_created_at (created_at)`

---

### 2.2 `review_feedback`
Stores feedback details, sentiment categorization, and public review click conversions.

| Column | Type | Nullable | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | VARCHAR(36) | No | PK | Unique UUID identifier |
| `tenant_id` | VARCHAR(36) | No | — | Foreign key referencing `tenants.id` (ON DELETE CASCADE) |
| `review_request_id` | VARCHAR(36) | No | — | Foreign key referencing `review_requests.id` (ON DELETE CASCADE) |
| `rating` | TINYINT | No | — | 1 to 5 star rating |
| `sentiment` | VARCHAR(20) | No | — | `'positive'` (4–5 stars) or `'negative'` (1–3 stars) |
| `feedback_text` | TEXT | Yes | NULL | Constructive private feedback comments |
| `public_platform_clicked` | BOOLEAN | No | `FALSE` | Whether user clicked the public review action |
| `public_platform_name` | VARCHAR(50) | Yes | NULL | Destination platform (e.g. `'google'`, `'trustpilot'`) |
| `created_at` | TIMESTAMP | No | `CURRENT_TIMESTAMP` | Submission timestamp |

**Indexes & Constraints**:
- `PRIMARY KEY (id)`
- `INDEX idx_review_feedback_tenant (tenant_id)`
- `INDEX idx_review_feedback_request (review_request_id)`
- `INDEX idx_review_feedback_sentiment (sentiment)`

---

### 2.3 `review_platform_settings`
Configures third-party public review platforms per business tenant.

| Column | Type | Nullable | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | VARCHAR(36) | No | PK | Unique UUID identifier |
| `tenant_id` | VARCHAR(36) | No | — | Foreign key referencing `tenants.id` (ON DELETE CASCADE) |
| `platform_name` | VARCHAR(50) | No | — | Platform identifier (`'google'`, `'trustpilot'`, `'facebook'`) |
| `destination_url` | TEXT | No | — | Direct review destination URL |
| `is_enabled` | BOOLEAN | No | `TRUE` | Whether platform is active |
| `created_at` | TIMESTAMP | No | `CURRENT_TIMESTAMP` | Creation timestamp |
| `updated_at` | TIMESTAMP | No | `CURRENT_TIMESTAMP ON UPDATE` | Update timestamp |

**Indexes & Constraints**:
- `PRIMARY KEY (id)`
- `INDEX idx_review_platform_tenant (tenant_id)`
- `INDEX idx_review_platform_name (platform_name)`

---

### 2.4 `review_templates`
Stores customizable SMS and Email notification templates with dynamic variables.

| Column | Type | Nullable | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | VARCHAR(36) | No | PK | Unique UUID identifier |
| `tenant_id` | VARCHAR(36) | No | — | Foreign key referencing `tenants.id` (ON DELETE CASCADE) |
| `channel` | VARCHAR(20) | No | — | `'sms'` or `'email'` |
| `template_name` | VARCHAR(100) | No | — | Display template name |
| `subject` | VARCHAR(255) | Yes | NULL | Email subject line |
| `body_template` | TEXT | No | — | Message body with `{customer_name}`, `{business_name}`, `{review_link}` |
| `is_default` | BOOLEAN | No | `FALSE` | Default template flag |
| `created_at` | TIMESTAMP | No | `CURRENT_TIMESTAMP` | Creation timestamp |
| `updated_at` | TIMESTAMP | No | `CURRENT_TIMESTAMP ON UPDATE` | Update timestamp |

**Indexes & Constraints**:
- `PRIMARY KEY (id)`
- `INDEX idx_review_templates_tenant (tenant_id)`
- `INDEX idx_review_templates_channel (channel)`

---

## 3. Review Request Lifecycle State Machine

```
                 +-----------+
                 |  pending  |
                 +-----+-----+
                       |
         +-------------+-------------+
         |                           |
   +-----v-----+               +-----v-----+
   | scheduled |               |   sent    |
   +-----+-----+               +-----+-----+
         |                           |
         +-------------+-------------+
                       |
               +-------v-------+
               |   delivered   | (when delivery evidence exists)
               +-------+-------+
                       |
         +-------------+-------------+
         |                           |
   +-----v-----+               +-----v-----+
   | positive  |               | negative  |
   | (4-5★)    |               | (1-3★)    |
   +-----------+               +-----------+
         |                           |
         v                           v
  Google Reviews              Private Feedback
   Redirection                 Inbox Ticket
```

Terminal states: `failed`, `cancelled`, `expired`.

---

## 4. Tenant Isolation & Query Security

1. **Server-Side Authorization**: Every tenant-scoped query resolves `tenant_id` exclusively from verified JWT cookie sessions on the server.
2. **Never Trust Client Inputs**: Any `tenant_id` or `business_id` passed in request bodies or query parameters is validated against the verified session context; mismatched IDs trigger an immediate `ForbiddenError` and log a security audit event.
3. **Parameterised SQL**: All queries execute through Drizzle ORM or parameterised queries via `mysql2`, eliminating SQL injection risks.

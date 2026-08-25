# LockReview — Phase 2: Authentication and Tenant Access

## Prerequisite
Phase 1 must be complete.

## Objective
Implement authenticated access to LockReview while remaining compatible with the existing LockQuote authentication, user and business/tenant architecture.

## Inspect First

Determine how LockQuote currently handles:

- user authentication;
- passwords or external authentication;
- sessions;
- cookies/tokens;
- user records;
- business/tenant membership;
- roles;
- permissions;
- protected routes;
- session restoration.

Do not assume a specific authentication provider.

Reuse the existing architecture wherever practical.

## Identity Principle

Do not create duplicate user identities unnecessarily.

Where technically practical, the same locksmith/business user should be capable of accessing both:

- LockQuote;
- LockReview;

through the same underlying identity architecture.

## Implement

Create:

- sign-in;
- sign-out;
- authenticated session handling;
- protected dashboard routes;
- session restoration;
- loading states;
- unauthorised states.

Use the existing LockQuote patterns where appropriate.

## Tenant Resolution

Create one authoritative server-side mechanism for resolving:

Authenticated User
→ User Role
→ Authorised Business/Tenant
→ Authorised Data Scope.

This mechanism must be reusable throughout LockReview.

## Database Access Rule

A client/browser request must never be allowed to determine authorisation simply by supplying a business_id.

Instead:

1. authenticate the user;
2. resolve the user's authorised business/tenant server-side;
3. use that resolved scope when accessing MySQL;
4. reject attempts to cross business boundaries.

## Role Permissions

Reuse LockQuote roles where practical.

At minimum, enforce that only authorised users can access LockReview administration.

## Query Security

Every tenant-owned database query must be scoped through the resolved business/tenant context.

Use parameterised queries or the existing ORM/query builder.

## Tests

Test:

- authenticated access;
- unauthenticated rejection;
- role restrictions;
- session restoration;
- cross-tenant isolation;
- attempted manipulation of business identifiers.

## Deliverables

A production-ready authentication and tenant-access layer that later LockReview phases can safely use.

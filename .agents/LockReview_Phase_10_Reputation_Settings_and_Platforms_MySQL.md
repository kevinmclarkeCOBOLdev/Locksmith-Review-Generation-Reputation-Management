# LockReview — Phase 10: Reputation Settings and Platforms

## Prerequisites
Phases 1–9 must be complete.

## Objective
Create per-business reputation settings stored in LockReview-owned MySQL tables.

## Initial Platform

Support Google Reviews as the primary configured public-review destination.

Do not hard-code the architecture so Google is the only possible platform.

Prepare the data model for future support of:

- Facebook;
- Trustpilot;
- other review platforms.

## Settings

Allow authorised users to manage:

- public review destination URL;
- enabled/disabled platform;
- default review-request behaviour;
- request expiry where appropriate;
- default review template.

Validate all destination URLs.

## Data Ownership

Settings must be explicitly associated with the authorised business/tenant.

All reads and writes must resolve tenant context server-side.

## Audit

Record significant settings changes using the established audit architecture.

If LockQuote already has an audit-log mechanism in MySQL, reuse or extend it where practical.

## Deliverables

- settings screen;
- MySQL-backed per-business configuration;
- Google review destination;
- extensible platform model;
- validation;
- audit logging.

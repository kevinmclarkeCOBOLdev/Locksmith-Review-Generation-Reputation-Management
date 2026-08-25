# LockReview — Phase 11: Analytics and Reputation Reporting

## Prerequisites
Phases 1–10 must be complete.

## Objective
Replace dashboard placeholders with real, evidence-based analytics calculated from LockReview and shared MySQL data.

## Metrics

Calculate only metrics supported by stored evidence, including where available:

- requests created;
- requests sent;
- responses received;
- response rate;
- average customer rating;
- positive versus negative feedback;
- public-review destination clicks;
- failed deliveries.

Do not present a public-review completion count unless it can be reliably verified.

## Query Scope

All analytics queries must be scoped to the authenticated user's authorised business.

Do not aggregate data across businesses unless a future authorised super-admin architecture explicitly permits it.

## Date Filters

Support:

- today;
- last 7 days;
- last 30 days;
- all time.

Use LockQuote-style filtering and presentation.

## Performance

Add appropriate MySQL indexes where real query patterns require them.

Avoid repeatedly executing expensive unbounded queries.

## Deliverables

- real dashboard metrics;
- MySQL-backed calculations;
- accurate tenant-scoped analytics;
- trend views where justified;
- metric definitions/tooltips;
- no fabricated analytics.

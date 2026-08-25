# LockReview — Phase 9: Review Management and Feedback

## Prerequisites
Phases 1–8 must be complete.

## Objective
Build operational management screens for LockReview review requests and customer feedback using tenant-scoped MySQL data.

## Review Requests

Create a searchable and filterable table using real database records.

Include:

- customer;
- related service/job where available;
- request status;
- delivery channel;
- creation date;
- sent date;
- rating;
- actions.

## Filters

Support filtering by:

- status;
- date;
- rating;
- positive/negative response;
- delivery channel.

All filtering and searching must remain constrained to the authenticated user's authorised business.

## Detail View

Provide a detail page or modal showing:

- related customer;
- related job/service where available;
- request lifecycle timeline;
- notification history;
- rating;
- private feedback;
- public-review click activity;
- failures/errors.

## Query Safety

Use the existing MySQL data-access technology.

Use parameterised queries or the established ORM/query builder.

Do not expose arbitrary record identifiers without tenant validation.

## Deliverables

- production-quality management tables;
- search;
- filters;
- detail views;
- tenant-safe MySQL queries;
- empty/loading/error states.

# LockReview — Phase 4: Backend Dashboard Shell

## Prerequisites
Phases 1–3 must be complete.

## Objective
Build the authenticated LockReview dashboard shell using the same UX/UI design language as LockQuote.

## Navigation

Create navigation for:

- Overview;
- Review Requests;
- Feedback;
- Settings.

Use the same visual hierarchy and responsive patterns as LockQuote.

## Overview

Create the dashboard structure for future evidence-based metrics.

Prepare areas for:

- requests created;
- requests sent;
- responses;
- positive feedback;
- negative/private feedback;
- public-review activity.

Do not hard-code fabricated metrics.

Do not use fake production data.

Connect the dashboard through service/query boundaries that are ready to consume real MySQL data.

## Data Access

Dashboard data must be retrieved server-side or through authorised API routes using the authenticated user's resolved business/tenant scope.

Do not allow browser-supplied business identifiers to control data access.

## UX/UI

Reuse or replicate LockQuote conventions for:

- cards;
- tables;
- buttons;
- typography;
- spacing;
- empty states;
- loading states;
- error states.

## Deliverables

- responsive authenticated dashboard;
- protected routes;
- working navigation;
- overview structure;
- MySQL-backed data-service boundaries;
- tenant-safe data access;
- production-quality empty/loading/error states.

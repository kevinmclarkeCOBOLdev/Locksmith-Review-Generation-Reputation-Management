# LockReview — Phase 12: Automation and Post-Job Triggers

## Prerequisites
Phases 1–11 must be complete.

## Objective
Introduce automated review-request eligibility after qualifying work is completed within the shared LockQuote/LockReview MySQL ecosystem.

## Inspect First

Determine whether the shared database contains a reliable completed-job or equivalent lifecycle event.

Do not invent an automation trigger if no reliable source event exists.

## Automation

Where reliable lifecycle data exists:

1. detect qualifying completed work;
2. resolve the associated business/tenant;
3. evaluate review eligibility;
4. apply duplicate rules;
5. create a review request;
6. optionally delay delivery;
7. send through the established notification infrastructure.

## Architecture

Do not rely on fragile browser-side automation.

Use appropriate server-side/background processing consistent with the existing hosting and application architecture.

The implementation may use:

- scheduled tasks;
- cron jobs;
- queue workers;
- application events;

depending on the actual technology already available.

Do not introduce unnecessary infrastructure.

## Audit

All automated actions must be traceable.

Record:

- trigger source;
- relevant job/customer reference;
- eligibility decision;
- action performed;
- timestamp;
- failure where applicable.

## Safety

Prevent:

- duplicate campaigns;
- uncontrolled repeat messaging;
- cross-tenant processing errors.

Respect the established communication and privacy architecture.

## Deliverables

- event/trigger integration;
- tenant-safe eligibility service;
- duplicate prevention;
- configurable automation;
- MySQL-backed audit trail;
- failure-safe behaviour.

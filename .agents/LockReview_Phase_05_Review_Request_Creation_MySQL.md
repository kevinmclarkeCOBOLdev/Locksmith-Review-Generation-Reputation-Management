# LockReview — Phase 5: Review Request Creation

## Prerequisites
Phases 1–4 must be complete.

## Objective
Allow an authorised locksmith/admin to create a review request using customer and job information already stored in the shared MySQL database.

## Workflow

The user must be able to:

1. choose an eligible existing customer, lead or completed job;
2. inspect the resolved contact details;
3. select an available delivery channel;
4. select the appropriate review template;
5. preview the request;
6. create the review request.

Do not duplicate customer records.

## Data Access

Customer, lead and job lookups must be scoped to the authenticated user's authorised business.

A user must never be able to access another business's customers by manipulating request parameters.

## Eligibility

If reliable completed-job lifecycle data exists, use it to identify eligible records.

If no reliable completed-job lifecycle exists, provide a safe manual selection workflow.

Do not fabricate job completion state.

## Status Lifecycle

Implement statuses based only on events that can actually be evidenced, such as:

- pending;
- scheduled;
- sent;
- delivered where provider evidence exists;
- responded;
- positive;
- negative;
- failed;
- cancelled;
- expired.

## Duplicate Protection

Prevent accidental duplicate review requests according to configurable business rules.

Check for existing active or recently sent requests using tenant-scoped database queries.

## MySQL Persistence

Persist review requests in LockReview-owned MySQL tables created through the established migration mechanism.

Reference shared records through stable keys.

## Deliverables

- create-review-request UI;
- tenant-scoped customer/job lookup;
- validation;
- eligibility checks;
- duplicate protection;
- persistent review-request records;
- request detail foundation.

# LockReview — Phase 3: Review Database Schema and Migrations

## Prerequisites
Phases 1 and 2 must be complete.

## Objective
Create the LockReview-owned MySQL schema required for review generation and reputation management while linking safely to existing LockQuote data.

## Inspect First

Inspect the real shared MySQL schema.

Identify stable authoritative relationships for:

- business/tenant;
- customer;
- lead;
- quote;
- job/completed service;
- user;
- notification records where applicable.

Do not assume table names or relationships.

## New LockReview-Owned Tables

Design and create the minimum required tables for:

1. review requests;
2. customer review feedback;
3. review platform settings;
4. review templates/settings where justified.

The final schema must follow the actual existing database conventions.

## Review Requests

The review-request entity should support concepts such as:

- primary identifier;
- business/tenant relationship;
- existing customer reference;
- existing lead reference where relevant;
- existing quote reference where relevant;
- existing job reference where relevant;
- request status;
- delivery channel;
- secure public token or token hash;
- rating;
- lifecycle timestamps;
- expiry state;
- cancellation state;
- created/updated timestamps.

Do not duplicate customer details unnecessarily.

## Relationships

Use appropriate MySQL:

- primary keys;
- foreign keys where compatible with the existing schema;
- indexes;
- unique constraints;
- delete/update behaviour.

Follow the established database conventions.

## Migrations

Use the existing LockQuote version-controlled MySQL migration mechanism.

Do not manually patch production schema.

Do not introduce a second migration framework without strong justification.

All schema changes must be reproducible.

## Tenant Isolation

MySQL is the shared persistence layer, but application-level authorisation must ensure users can only access records belonging to their authorised business.

Design new tables with an explicit business/tenant relationship where required.

## Public Access

Public review flows must never receive unrestricted database access.

Public routes must use server-side logic that validates secure request tokens and returns only the minimum required data.

## Query Security

Use parameterised queries or the existing ORM/query builder.

Never build SQL by concatenating untrusted input.

## Deliverables

- version-controlled MySQL migrations;
- new LockReview tables;
- indexes and constraints;
- safe relationships to shared LockQuote tables;
- schema documentation;
- verification/tests.

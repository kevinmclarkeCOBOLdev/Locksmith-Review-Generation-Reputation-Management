# LockReview — Phase 1: Architecture Foundation

## Role
Act as the senior full-stack engineer responsible for creating LockReview, a standalone Review Generation & Reputation Management SaaS application within the existing LockQuote product ecosystem.

## Prerequisite
This is the first implementation phase.

## Objective
Create the technical foundation for LockReview as an independently deployable web application that uses the same shared MySQL database as LockQuote.

LockReview must be a separate application. It must not be implemented as a module inside LockQuote.

## Critical Architecture

The target architecture is:

Two independent web applications:

- LockQuote
- LockReview

One shared MySQL database:

- existing shared core business data;
- LockQuote-owned tables;
- LockReview-owned tables.

The applications must remain independently deployable and independently maintainable.

Do not create a second database.

Do not duplicate shared core business records unnecessarily.

## Inspect Existing LockQuote First

Before implementation, inspect the existing LockQuote codebase and its actual architecture.

Determine:

- frontend framework;
- Node.js/backend architecture;
- database access technology;
- ORM or query builder;
- MySQL connection approach;
- migration mechanism;
- authentication architecture;
- user/session model;
- business/tenant model;
- role/permission model;
- validation libraries;
- testing tools;
- deployment conventions;
- existing environment variable conventions.

Do not assume any particular technology beyond the known use of MySQL.

Reuse the existing LockQuote conventions and technologies wherever practical.

## Shared MySQL Database

Inspect the real MySQL schema and identify the authoritative existing entities for:

- businesses/tenants;
- users;
- user/business relationships;
- customers;
- leads;
- quote requests;
- completed jobs or equivalent lifecycle records;
- notifications;
- audit logs;
- retention/security records where relevant.

Do not assume exact table names.

Create a concise architecture document inside the LockReview repository explaining:

1. shared tables consumed by LockReview;
2. LockReview-owned tables;
3. foreign-key relationships;
4. tenant/business isolation;
5. authentication strategy;
6. application/database access boundaries;
7. public versus authenticated route boundaries.

## Database Ownership Principle

Core business records must have one authoritative source.

Do not create duplicate LockReview copies of:

- customers;
- businesses;
- users;
- leads;
- quotes;
- jobs.

LockReview should reference authoritative existing records through stable keys and relationships.

Example conceptual relationship:

Authenticated User
→ authorised Business/Tenant
→ authorised Customer/Lead/Job records
→ LockReview review records.

## Technology Alignment

Use the same technologies and conventions as LockQuote wherever practical, including existing:

- frontend framework;
- Node.js/server architecture;
- Tailwind CSS;
- shadcn/ui;
- database access layer;
- ORM/query builder;
- authentication approach;
- validation;
- testing;
- deployment.

Do not introduce a new database technology.

Do not introduce a new ORM or migration framework unless there is a compelling technical reason.

## Application Structure

Create a maintainable structure for:

- authenticated dashboard;
- public customer review experience;
- server/API layer;
- services;
- database access;
- configuration;
- components;
- types;
- tests.

Adapt exact directory names to the actual framework.

## UX/UI

Use the existing LockQuote UX/UI design language for brand consistency.

Inspect and reuse the established:

- dashboard layout;
- navigation;
- typography;
- spacing;
- cards;
- tables;
- forms;
- buttons;
- dialogs;
- loading states;
- empty states;
- responsive behaviour;
- light/dark behaviour where applicable.

Do not redesign the visual system in this phase.

## Tenant Security Foundation

Because MySQL does not provide the Supabase Row Level Security model previously assumed, implement the architectural foundation for strict application-level tenant isolation.

All future database access must:

1. resolve the authenticated server-side user;
2. resolve the user's authorised business/tenant context;
3. enforce that context in every relevant data-access operation;
4. never trust a browser-supplied business_id as proof of authorisation.

Create or prepare a central mechanism for tenant-scoped database access.

## MySQL Security

Use parameterised queries or the existing ORM/query builder.

Never construct unsafe SQL through string concatenation.

Never expose MySQL credentials to the browser.

All privileged database access must remain server-side.

## Environment

Create `.env.example` using the existing LockQuote environment conventions.

Include placeholders only.

Never commit credentials.

Use the existing MySQL environment/configuration model.

## Feature Configuration

Create or prepare a central configuration layer for future feature flags.

Do not scatter environment-variable checks throughout the application.

## Deliverables

- standalone LockReview application skeleton;
- connection to the existing shared MySQL architecture;
- documented shared versus LockReview-owned data boundaries;
- LockQuote-style dashboard foundation;
- public review route boundary;
- tenant-scoping architecture;
- environment example;
- architecture documentation;
- build, lint and test commands working;
- no regression to LockQuote.

## Completion Rule

Do not implement full review functionality yet.

This phase establishes the application and shared-MySQL foundation required for all later phases.

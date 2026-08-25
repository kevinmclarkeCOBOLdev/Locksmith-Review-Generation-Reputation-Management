# LockReview — Phase 7: Public Customer Review Experience

## Prerequisites
Phases 1–6 must be complete.

## Objective
Create the public-facing, mobile-first customer review experience accessed through a secure review-request URL.

## Security

Use cryptographically secure, non-guessable public tokens.

Prefer storing a token hash where practical rather than unnecessarily storing reusable secrets in plain form.

Do not expose internal MySQL identifiers in the public URL.

Validate server-side:

- token validity;
- request status;
- expiry;
- cancellation state;
- submission eligibility.

Prevent duplicate submissions.

Rate-limit public endpoints where supported.

## Database Access

The public page must not connect directly to MySQL from the browser.

All token validation and database access must occur through authorised server-side code.

Return only the minimum data required by the public interface.

## UX

Use the LockQuote/LockReview brand language while keeping the public experience simple and mobile-first.

Display:

- business identity where available;
- thank-you message;
- clear satisfaction/rating interaction;
- appropriate next step.

Suggested opening:

“How was your experience with us?”

## States

Handle:

- valid request;
- already completed;
- expired;
- cancelled;
- invalid token.

## Deliverables

- secure public route;
- mobile-responsive review experience;
- server-side token validation;
- rating submission;
- MySQL persistence;
- duplicate protection;
- tests.

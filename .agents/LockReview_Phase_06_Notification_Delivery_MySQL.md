# LockReview — Phase 6: Notification Delivery

## Prerequisites
Phases 1–5 must be complete.

## Objective
Connect LockReview review requests to the existing notification infrastructure or compatible shared services used by LockQuote.

## Inspect First

Inspect LockQuote's existing notification architecture.

Determine:

- email provider abstraction;
- SMS provider abstraction;
- notification logging;
- retry handling;
- failure handling;
- provider message-ID storage;
- existing MySQL notification tables.

Reuse these systems wherever practical.

Do not create an unnecessary parallel notification system.

## Delivery

Support:

- email;
- SMS;
- both where configured and available.

Every message must contain a secure public review URL.

## Database Recording

Record notification evidence in the existing notification logging architecture or a compatible LockReview extension.

Capture where available:

- provider;
- recipient;
- channel;
- template;
- status;
- timestamp;
- provider message ID;
- error;
- retry count.

## Security

Provider credentials must remain server-side.

Do not expose email/SMS secrets to the browser.

## Failure Handling

Implement safe failure states and retry behaviour consistent with LockQuote.

Do not silently mark messages as delivered without provider evidence.

## Deliverables

- send workflow;
- existing notification-service integration where practical;
- MySQL-backed delivery logging;
- delivery-status handling;
- failure handling;
- safe retry behaviour.

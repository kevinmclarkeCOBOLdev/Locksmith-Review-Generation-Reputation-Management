# LockReview — Phase 8: Positive and Private Feedback Flows

## Prerequisites
Phases 1–7 must be complete.

## Objective
Implement the post-rating customer journey using the existing shared MySQL database and LockReview-owned review records.

## Positive Experience

For positive feedback:

1. validate and record the rating server-side;
2. persist the event in the appropriate LockReview MySQL tables;
3. display a thank-you state;
4. present the configured public-review action;
5. track the public-review destination click where technically possible.

Do not claim a public review was posted unless that event can be independently verified.

## Unsatisfactory Experience

For negative or unsatisfactory feedback:

1. record the rating;
2. invite private feedback;
3. securely store the explanation;
4. create a dashboard-visible issue or alert;
5. do not automatically redirect the customer to a public review destination.

This must not use deceptive or unlawful review-suppression practices.

## Data Protection

Store only the information required for the feedback workflow.

Use the established tenant and data-access architecture.

## Deliverables

- positive customer flow;
- private feedback flow;
- MySQL-backed feedback persistence;
- sentiment/status recording;
- dashboard alert hooks;
- accurate event tracking.

# Specification

## Summary
**Goal:** Make subscription activation depend on verified successful Stripe Checkout sessions, and improve the Pricing page post-checkout verification flow and status display.

**Planned changes:**
- Backend: track subscription activation per principal in canister state, and mark a user as subscribed when `getStripeSessionStatus(sessionId)` verifies a successful/paid session (idempotently).
- Backend: update `isUserSubscribed()` to return the stored Stripe-backed subscription state for the caller (default false), while keeping `getStripeSessionStatus(sessionId)` restricted to the session owner (or admin).
- Frontend: on `/pricing?success=true&session_id=...`, show an in-page “Verifying your subscription…” state, disable plan buttons, and automatically verify via `useVerifyCheckoutSession`.
- Frontend: handle verification failures with a visible retry action, keep the `session_id` available until verification succeeds or the flow is dismissed, and clean up `success/session_id/canceled` URL params without a full reload to prevent repeated verification/toasts.
- Frontend: after successful verification, refresh (invalidate/refetch) the existing subscription status query and update the Pricing UI to reflect an active subscription; prevent starting a new checkout when already subscribed (or clearly mark plan actions as unavailable).

**User-visible outcome:** After returning from Stripe Checkout, users see a clear verification step on the Pricing page; once verified, their subscription becomes active and is reflected in the UI, and subscribed users can’t start another checkout from the plan buttons.

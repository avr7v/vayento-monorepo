# Vayento hardening implementation notes

This version applies a broad MVP-to-production-readiness hardening pass across backend, frontend, database, media, payments, host/admin workflows and DevOps.

## Implemented critical fixes

- Fixed login redirect import/call to use the existing role redirect helper.
- Removed unsafe full-user Prisma responses by introducing safe user selectors/serializers.
- Added refresh token issue/rotation/logout storage on the User record.
- Added login attempt tracking, failed-login counters and temporary account lockout.
- Added lightweight route-level rate limiting for sensitive endpoints.
- Added optional email-verification enforcement through environment variables.
- Added change-password, update-email and account deactivation endpoints.
- Fixed storage env mismatch by supporting both STORAGE_* and legacy S3_* variables.
- Fixed media upload response mismatch by returning and persisting storageKey.
- Added media size/type limits, maximum images per property, S3 HeadObject verification and S3 delete-on-remove.
- Reworked mock payment mode so the frontend does not pass fake client secrets to Stripe Elements.
- Added mock payment confirmation endpoint for local/demo usage.
- Added Stripe webhook idempotency, amount/currency verification and payment failure handling.
- Added refund records and refund-on-cancellation logic for paid bookings.
- Added booking expiration for unpaid AWAITING_PAYMENT bookings.
- Added transactional booking creation and stricter overlapping booking/block checks.
- Added host submit-for-review flow.
- Added admin role-change safeguards and expanded audit logging.
- Added review moderation with PENDING/PUBLISHED/HIDDEN states.
- Added host lead backend and admin visibility.
- Added server-side HTML sanitization for admin-managed content.
- Added sitemap and robots routes.
- Added Dockerfiles, expanded docker-compose and CI workflow.

## Added/expanded database models

- Refund
- StripeWebhookEvent
- HostLead
- NotificationLog
- LoginAttempt
- FavoriteSearch
- HostPayout
- Dispute
- SupportTicket
- PropertyPricingRule
- PropertyAvailabilityOverride

Existing models were expanded with refresh-token fields, account-lock fields, booking expiration, media metadata and payment metadata.

## Frontend improvements

- Advanced public property filters: city, country, guests, dates, price range, type, sorting and pagination.
- Property detail page now has gallery modal, date/guest selector, quote preview and dynamic booking link.
- Booking page supports both real Stripe mode and local mock payment mode.
- Booking success page polls payment status to avoid webhook timing confusion.
- Host property editor can submit a listing for admin review.
- List-your-property form now posts to the backend.
- User settings page added for profile, email, password and account deactivation.
- Reviews no longer require users to manually type Booking IDs; eligible completed bookings are loaded from the API.
- Admin dashboard now includes review moderation and host leads.
- Site header now includes a mobile menu.

## Known remaining limitations

- The refresh-token implementation stores one active refresh token per user. A production marketplace would typically use a separate UserSession table for multiple devices.
- Pricing rules and availability overrides are modeled but not yet fully connected to quote calculation.
- Refund/cancellation logic is functional but simplified; a real production system should implement policy-specific refund percentages and cut-off windows.
- Messaging has unread/read tracking and notifications, but no real-time WebSocket updates.
- File upload validation checks metadata and object existence, but does not perform image processing, thumbnail generation or malware scanning.
- CI workflow is included, but the current environment did not install dependencies, so a complete build must be run locally after npm ci.

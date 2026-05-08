# Vayento smoke-test checklist

Use this checklist after running migrations and seeding the database.

## Backend

1. `GET /api/health` returns healthy status.
2. `POST /auth/register` creates a user and returns either tokens or verificationRequired depending on env.
3. `POST /auth/login` succeeds for seeded users and fails/locks after repeated bad attempts.
4. `POST /auth/refresh` rotates access/refresh tokens.
5. `POST /auth/logout` clears the stored refresh token.
6. `PATCH /users/me/password` changes password after validating the current password.
7. `PATCH /users/me/email` changes email and resets verification state.
8. `GET /properties` supports city/country/dates/guests/price/type filters.
9. `POST /bookings/quote` rejects invalid dates and unavailable dates.
10. `POST /bookings` creates AWAITING_PAYMENT booking with expiresAt.
11. `POST /payments/create-intent` returns mode=stripe when Stripe is configured, otherwise mode=mock.
12. `POST /payments/mock-confirm/:bookingId` confirms local bookings when Stripe is not configured.
13. Stripe webhook rejects amount/currency mismatch and ignores duplicate event IDs.
14. `PATCH /host/properties/:id/submit-review` moves a draft listing to REVIEW when required data exists.
15. `PATCH /admin/properties/:id/status` publishes or archives review listings and creates audit logs.
16. `POST /host-leads` stores a host lead and creates a notification log.
17. `POST /reviews` creates PENDING review only for completed eligible bookings.
18. `PATCH /admin/reviews/:id/status` publishes/hides review and recalculates property rating.

## Frontend

1. Home page loads without console errors.
2. Login/register flows work and redirect by role.
3. Property listing filters update results and pagination.
4. Property detail page opens gallery modal and computes quote from selected dates/guests.
5. Booking page validates required guest details.
6. Mock payment mode displays local confirmation UI instead of Stripe Elements.
7. Stripe mode displays Stripe Elements only with a real clientSecret.
8. Booking success page updates status after payment confirmation.
9. User dashboard displays bookings and wishlist.
10. Account settings update profile/email/password and deactivate account.
11. Host dashboard lists host properties/bookings/earnings.
12. Host property editor saves changes, uploads media and submits listing for review.
13. Admin dashboard shows KPIs, moderation queue, review moderation, host leads and audit counters.
14. Mobile menu opens/closes on small screens.

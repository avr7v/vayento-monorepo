# Vayento requested update pass

This update pass focuses on demo completeness for the thesis presentation and improves the connection between frontend, backend and seed data.

## Implemented

- Expanded registration form and DTO with phone, country, city, address, postal code, preferred language and explicit Terms/Privacy acceptance.
- Enforced stronger password policy in register/reset/change-password/admin-create-user flows.
- Added password strength guidance in the register UI.
- Added Forgot Password link from login page and kept the existing reset flow wired to Mailpit.
- Removed avatar URL from user-facing frontend/backend profile flows and schema.
- Added country dropdown via `/api/metadata/countries` and reused it in register, account settings, booking and host lead forms.
- Added/seeded legal content pages: Terms, Privacy Policy, Cookie Policy and Data Protection.
- Updated homepage to show featured properties from the backend.
- Updated logout behavior to always redirect to `/login`.
- Added a polished booking success screen with green success check and booking/payment details.
- Updated Stripe checkout form to redirect to `/booking/success?bookingId=...` after successful test payment.
- Updated account settings to preload existing user data before editing.
- Rebuilt create-property page with fuller form, country dropdown, amenities checkboxes, rules and initial image upload flow.
- Added property country to host lead flow and admin display.
- Added an admin blog creation panel and seeded multiple published blog posts.
- Rebuilt seed data with more users, hosts, properties, bookings, reviews, payments, support, host leads, content pages, blog posts, notifications and audit logs.
- Cleaned the main UI background toward white while keeping subtle card borders/shadows.

## Important local setup notes

Secret-bearing files are intentionally not included. Copy `.env.example` files before running locally:

```bash
cd backend
copy .env.example .env

cd ..\frontend
copy .env.example .env.local
```

Then set your own Stripe keys if you want real Stripe test payments. Leave Stripe keys empty to use mock payment mode.


# Vayento v4 updates

This package updates the Vayento monorepo with a stronger, more complete front-end experience and safer local-development behavior.

## Main improvements

- Rebuilt the public homepage with richer hero, featured stays, benefits, host teaser and trust sections.
- Reworked the global header and footer with stronger brand presence, additional navigation and thesis-ready visual polish.
- Rebuilt the listings page with more complete filters: keyword, city, country, dates, guests, property type, amenity, min/max price and sort.
- Rebuilt the property details page with gallery layout, property stats, amenities, rules, date selection, quote calculation and booking link generation.
- Rebuilt the booking page so it is no longer visually empty:
  - editable property/date/guest fields
  - guest details form
  - quote breakdown
  - clear validation messages
  - booking creation
  - safe Stripe initialization
- Added graceful Stripe handling when `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is missing so the page does not crash during screenshots/local testing.
- Reworked the create-property host form with richer sections:
  - presentation
  - amenities
  - pricing
  - capacity
  - location
  - starter image URLs
  - house rules
- Improved the user dashboard with KPI cards, booking cards, wishlist cards, latest stay and account summary.
- Added richer seed data for more properties so listings, homepage and screenshots look complete.
- Fixed role redirect helper compatibility.

## Local run reminder

Backend:

```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
npm run start:dev
```

Frontend:

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Add a real Stripe publishable key to `frontend/.env.local` only when testing the payment element:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

Seeded users:

```text
admin@vayento.com / Password123!
host@vayento.com / Password123!
user@vayento.com / Password123!
```

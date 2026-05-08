# Vayento

## Local development

### 1. Start PostgreSQL
```bash
docker compose up -d postgres
```

### 2. Backend
```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
npm run start:dev
```

Backend runs on:
- `http://localhost:4000/api`
- `http://localhost:4000/api/health`

### 3. Frontend
```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Frontend runs on:
- `http://localhost:3000`

## Staging / production notes

### Backend
- set `NODE_ENV=production`
- set `DATABASE_URL` to the managed PostgreSQL instance
- run `npx prisma migrate deploy` during deployment
- configure `CORS_ALLOWED_ORIGINS` with the real frontend domains
- configure Stripe secrets and webhook secret
- ensure the deployment platform supports raw request body for Stripe webhook verification

### Frontend
- set `NEXT_PUBLIC_API_URL` to the deployed API base URL
- set `NEXT_PUBLIC_APP_URL` to the deployed frontend URL
- set `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` for the environment

### Health check
Use:
- `GET /api/health`

### Payment return URLs
All Stripe return URLs should be generated from:
- `NEXT_PUBLIC_APP_URL`

### Recommended deployment flow
1. provision database
2. apply backend environment variables
3. run `prisma generate`
4. run `prisma migrate deploy`
5. deploy backend
6. configure Stripe webhook
7. deploy frontend
8. run smoke tests against `/api/health`, auth, property browsing, booking and dashboards

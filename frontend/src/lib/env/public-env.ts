const DEFAULT_API_URL = 'http://localhost:4000/api';
const DEFAULT_APP_URL = 'http://localhost:3000';

export function getPublicApiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL;
}

export function getPublicAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || DEFAULT_APP_URL;
}

export function getStripePublishableKey(): string {
  const value = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  if (!value) {
    throw new Error(
      'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is missing. Add it to your environment configuration.',
    );
  }

  return value;
}

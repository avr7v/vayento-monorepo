'use client';

import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '@/lib/stripe/stripe';
import { StripePaymentForm } from './stripe-payment-form';

export function StripeCheckoutShell({ clientSecret, bookingId }: { clientSecret: string; bookingId: string }) {
  return <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe', variables: { colorPrimary: '#1F2328', colorBackground: '#FBFAF7', colorText: '#1F2328', borderRadius: '16px' } } }}><StripePaymentForm bookingId={bookingId} /></Elements>;
}

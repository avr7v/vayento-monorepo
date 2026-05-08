'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';

export function StripePaymentForm({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!stripe || !elements) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setErrorMessage(submitError.message || 'Payment form validation failed.');
      setIsSubmitting(false);
      return;
    }

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/booking/success?bookingId=${bookingId}`,
      },
      redirect: 'if_required',
    });

    if (error) {
      setErrorMessage(error.message || 'Payment confirmation failed.');
      setIsSubmitting(false);
      return;
    }

    if (!paymentIntent || ['succeeded', 'processing', 'requires_capture'].includes(paymentIntent.status)) {
      router.push(`/booking/success?bookingId=${bookingId}`);
      return;
    }

    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-[24px] border border-[#E7DED1] bg-white p-4"><PaymentElement /></div>
      {errorMessage ? <div className="rounded-[18px] bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</div> : null}
      <button type="submit" disabled={!stripe || !elements || isSubmitting} className="w-full rounded-full bg-[#1F2328] px-6 py-4 text-sm font-medium text-white disabled:opacity-60">{isSubmitting ? 'Processing payment...' : 'Confirm and pay'}</button>
    </form>
  );
}

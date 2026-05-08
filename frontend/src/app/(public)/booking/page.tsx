'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useBookingQuote, useConfirmMockPayment, useCreateBooking, useCreatePaymentIntent } from '@/hooks/use-bookings';
import { getBookingSearchParams } from '@/lib/utils/booking-query';
import { StripeCheckoutShell } from '@/components/booking/stripe-checkout-shell';
import { CountrySelect } from '@/components/forms/country-select';

export default function BookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialParams = useMemo(() => getBookingSearchParams({ propertyId: searchParams.get('propertyId') || undefined, checkInDate: searchParams.get('checkInDate') || undefined, checkOutDate: searchParams.get('checkOutDate') || undefined, guestsCount: searchParams.get('guestsCount') || undefined }), [searchParams]);
  const [guestForm, setGuestForm] = useState({ firstName: '', lastName: '', email: '', phone: '', country: '', city: '', specialRequests: '' });
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentMode, setPaymentMode] = useState<'stripe' | 'mock' | null>(null);
  const quoteMutation = useBookingQuote();
  const createBookingMutation = useCreateBooking();
  const createPaymentIntentMutation = useCreatePaymentIntent();
  const confirmMockPayment = useConfirmMockPayment();

  const requiredMissing = !guestForm.firstName || !guestForm.lastName || !guestForm.email;
  const runQuote = async () => { await quoteMutation.mutateAsync(initialParams); };
  const continueToPayment = async () => {
    const booking = await createBookingMutation.mutateAsync({ ...initialParams, ...guestForm });
    setBookingId(booking.id);
    const paymentIntent = await createPaymentIntentMutation.mutateAsync({ bookingId: booking.id });
    setPaymentMode(paymentIntent.mode);
    setClientSecret(paymentIntent.clientSecret);
  };
  const confirmMock = async () => {
    if (!bookingId) return;
    await confirmMockPayment.mutateAsync(bookingId);
    router.push(`/booking/success?bookingId=${bookingId}`);
  };

  return (
    <div className="min-h-screen bg-white px-4 py-12">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-[34px] border border-[#E8DED0] bg-white p-8 shadow-[0_18px_50px_rgba(31,35,40,0.06)]">
          <div className="text-xs uppercase tracking-[0.24em] text-[#8A7660]">Booking flow</div>
          <h1 className="mt-3 text-4xl font-semibold text-[#1F2328]">Complete your reservation</h1>
          <div className="mt-5 rounded-[22px] bg-[#FCFBF9] p-5 text-sm leading-8 text-[#5F5A53]"><div>Property ID: {initialParams.propertyId}</div><div>{initialParams.checkInDate} → {initialParams.checkOutDate}</div><div>{initialParams.guestsCount} guests</div></div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <input value={guestForm.firstName} onChange={(e) => setGuestForm((p) => ({ ...p, firstName: e.target.value }))} className="rounded-[20px] border border-[#E7DED1] bg-white px-4 py-4 outline-none" placeholder="First name" />
            <input value={guestForm.lastName} onChange={(e) => setGuestForm((p) => ({ ...p, lastName: e.target.value }))} className="rounded-[20px] border border-[#E7DED1] bg-white px-4 py-4 outline-none" placeholder="Last name" />
            <input type="email" value={guestForm.email} onChange={(e) => setGuestForm((p) => ({ ...p, email: e.target.value }))} className="rounded-[20px] border border-[#E7DED1] bg-white px-4 py-4 outline-none md:col-span-2" placeholder="Email" />
            <input value={guestForm.phone} onChange={(e) => setGuestForm((p) => ({ ...p, phone: e.target.value }))} className="rounded-[20px] border border-[#E7DED1] bg-white px-4 py-4 outline-none" placeholder="Phone" />
            <CountrySelect value={guestForm.country} onChange={(value) => setGuestForm((p) => ({ ...p, country: value }))} className="rounded-[20px] border border-[#E7DED1] bg-white px-4 py-4 outline-none" />
            <textarea value={guestForm.specialRequests} onChange={(e) => setGuestForm((p) => ({ ...p, specialRequests: e.target.value }))} className="rounded-[20px] border border-[#E7DED1] bg-white px-4 py-4 outline-none md:col-span-2" placeholder="Special requests" />
          </div>
          <div className="mt-6 flex flex-wrap gap-3"><button onClick={runQuote} disabled={quoteMutation.isPending} className="rounded-full border border-[#1F2328] px-5 py-3 text-sm disabled:opacity-50">{quoteMutation.isPending ? 'Checking...' : 'Check quote'}</button><button onClick={continueToPayment} disabled={requiredMissing || createBookingMutation.isPending || createPaymentIntentMutation.isPending} className="rounded-full bg-[#1F2328] px-5 py-3 text-sm text-white disabled:opacity-50">{createBookingMutation.isPending || createPaymentIntentMutation.isPending ? 'Preparing...' : 'Continue to payment'}</button></div>
          {requiredMissing ? <div className="mt-4 text-sm text-[#8A7660]">First name, last name and email are required before payment.</div> : null}
          {quoteMutation.isError || createBookingMutation.isError || createPaymentIntentMutation.isError ? <div className="mt-6 rounded-[18px] bg-red-50 px-4 py-3 text-sm text-red-700">{((quoteMutation.error || createBookingMutation.error || createPaymentIntentMutation.error) as any)?.response?.data?.message ?? 'Booking flow failed. Please check your data and try again.'}</div> : null}
          {quoteMutation.data ? <div className="mt-6 rounded-[24px] bg-[#FCFBF9] p-6 text-sm leading-8 text-[#5F5A53]"><div>Nights: {quoteMutation.data.nights}</div><div>Subtotal: €{quoteMutation.data.breakdown.subtotal}</div><div>Cleaning fee: €{quoteMutation.data.breakdown.cleaningFee}</div><div>Service fee: €{quoteMutation.data.breakdown.serviceFee}</div><div>Taxes: €{quoteMutation.data.breakdown.taxes}</div><div className="font-semibold text-[#1F2328]">Total: €{quoteMutation.data.breakdown.totalAmount}</div></div> : null}
        </div>
        <div className="rounded-[34px] border border-[#E8DED0] bg-white p-8 shadow-[0_18px_50px_rgba(31,35,40,0.06)]">
          <div className="text-xs uppercase tracking-[0.24em] text-[#8A7660]">Payment</div>
          <h2 className="mt-3 text-3xl font-semibold text-[#1F2328]">Checkout</h2>
          {paymentMode === 'mock' && bookingId ? <div className="mt-6 rounded-[24px] bg-[#FCFBF9] p-6 text-sm leading-8 text-[#5F5A53]"><p>Stripe is not configured, so local demo mode is active. This confirms the booking through a mock payment endpoint without rendering Stripe Elements.</p><button onClick={confirmMock} disabled={confirmMockPayment.isPending} className="mt-5 w-full rounded-full bg-[#1F2328] px-6 py-4 text-sm font-medium text-white disabled:opacity-50">{confirmMockPayment.isPending ? 'Confirming...' : 'Confirm mock payment'}</button></div> : null}
          {paymentMode === 'stripe' && clientSecret && bookingId ? <div className="mt-6"><StripeCheckoutShell clientSecret={clientSecret} bookingId={bookingId} /></div> : null}
          {!paymentMode ? <p className="mt-4 text-sm leading-7 text-[#5F5A53]">Create a booking first to initialize payment.</p> : null}
        </div>
      </div>
    </div>
  );
}

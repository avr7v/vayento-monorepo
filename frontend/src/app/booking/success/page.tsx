'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useBookingPaymentStatus, useMyBooking } from '@/hooks/use-bookings';

export default function BookingSuccessPage() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId') || '';
  const { data: booking, isLoading } = useMyBooking(bookingId);
  const { data: status } = useBookingPaymentStatus(bookingId || null);
  const liveBookingStatus = status?.bookingStatus ?? booking?.bookingStatus;
  const livePaymentStatus = status?.paymentStatus ?? booking?.paymentStatus;
  const confirmed = liveBookingStatus === 'CONFIRMED' || livePaymentStatus === 'SUCCEEDED';

  return (
    <div className="min-h-screen bg-white px-4 py-12">
      <div className="mx-auto max-w-4xl overflow-hidden rounded-[38px] border border-[#D7EBDD] bg-white shadow-[0_24px_70px_rgba(31,35,40,0.08)]">
        <div className="bg-[linear-gradient(135deg,#eefaf1_0%,#ffffff_55%,#e1f4e7_100%)] px-8 py-12 text-center sm:px-12">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-600 text-5xl text-white shadow-[0_18px_36px_rgba(22,163,74,0.28)]">✓</div>
          <div className="mt-6 text-xs uppercase tracking-[0.28em] text-green-700">Payment completed</div>
          <h1 className="mt-4 text-5xl font-semibold text-[#1F2328]">Your booking is confirmed.</h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-8 text-[#5F5A53]">Thank you for choosing Vayento. Your payment was received and the reservation details have been sent to your email.</p>
        </div>

        <div className="p-8 sm:p-10">
          {isLoading ? <p className="text-[#5F5A53]">Loading booking details...</p> : <div className="rounded-[28px] border border-[#E8DED0] bg-white p-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <Info label="Booking status" value={liveBookingStatus ?? 'Processing'} highlight={confirmed} />
              <Info label="Payment status" value={livePaymentStatus ?? 'Processing'} highlight={confirmed} />
              <Info label="Property" value={booking?.property?.title ?? 'Selected stay'} />
              <Info label="Total" value={booking?.totalAmount ? `€${booking.totalAmount}` : 'Pending'} />
            </div>
            {liveBookingStatus === 'AWAITING_PAYMENT' ? <div className="mt-6 rounded-[20px] bg-[#FFF8E8] px-4 py-3 text-sm leading-7 text-[#8A6300]">Stripe has accepted the payment request and the final webhook confirmation may still be processing. Refresh the page in a few seconds if needed.</div> : null}
          </div>}

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/dashboard" className="rounded-full bg-[#1F2328] px-6 py-4 text-sm font-medium text-white">View my bookings</Link>
            <Link href="/properties" className="rounded-full border border-[#1F2328] px-6 py-4 text-sm font-medium text-[#1F2328]">Explore more stays</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return <div className={`rounded-[22px] border px-5 py-4 ${highlight ? 'border-green-200 bg-green-50' : 'border-[#E8DED0] bg-white'}`}><div className="text-xs uppercase tracking-[0.2em] text-[#8A7660]">{label}</div><div className="mt-2 text-xl font-semibold text-[#1F2328]">{value}</div></div>;
}

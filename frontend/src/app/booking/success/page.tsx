import { Suspense } from 'react';
import BookingSuccessClient from './booking-success-client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function BookingSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#f7f4ee] px-4 py-12">
          <div className="mx-auto max-w-4xl overflow-hidden rounded-[38px] border border-[#D7EBDD] bg-white shadow-[0_24px_70px_rgba(31,35,40,0.08)]">
            <div className="bg-[linear-gradient(135deg,#eefaf1_0%,#ffffff_55%,#e1f4e7_100%)] px-8 py-12 text-center sm:px-12">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-600 text-5xl text-white shadow-[0_18px_36px_rgba(22,163,74,0.28)]">
                ✓
              </div>

              <div className="mt-6 text-xs uppercase tracking-[0.28em] text-green-700">
                Booking success
              </div>

              <h1 className="mt-4 text-4xl font-semibold text-[#1F2328]">
                Loading confirmation...
              </h1>

              <p className="mx-auto mt-5 max-w-2xl text-sm leading-8 text-[#5F5A53]">
                Please wait while we load your booking details.
              </p>
            </div>
          </div>
        </main>
      }
    >
      <BookingSuccessClient />
    </Suspense>
  );
}
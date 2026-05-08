import { Suspense } from 'react';
import BookingClient from './booking-client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#f7f4ee] px-4 py-12">
          <section className="mx-auto max-w-3xl rounded-[34px] border border-[#E8DED0] bg-white p-8 shadow-[0_18px_50px_rgba(31,35,40,0.06)]">
            <div className="text-xs uppercase tracking-[0.24em] text-[#8A7660]">
              Booking flow
            </div>

            <h1 className="mt-3 text-3xl font-semibold text-[#1F2328]">
              Loading checkout...
            </h1>
          </section>
        </main>
      }
    >
      <BookingClient />
    </Suspense>
  );
}
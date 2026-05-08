'use client';

import Link from 'next/link';
import {
  useHostEarningsBookings,
  useHostEarningsSummary,
} from '@/hooks/use-host';

function money(value: number | string | null | undefined) {
  return `€${Number(value ?? 0).toFixed(2)}`;
}

export default function HostEarningsPage() {
  const {
    data: summary,
    isLoading: summaryLoading,
    isError: summaryError,
  } = useHostEarningsSummary();

  const {
    data: bookings,
    isLoading: bookingsLoading,
    isError: bookingsError,
  } = useHostEarningsBookings();

  return (
    <div className="min-h-screen bg-white px-4 py-12">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-[34px] border border-[#E8DED0] bg-white p-8 shadow-[0_18px_50px_rgba(31,35,40,0.06)] sm:p-10">
          <div className="text-xs uppercase tracking-[0.24em] text-[#8A7660]">
            Host earnings
          </div>

          <h1 className="mt-3 font-serif text-5xl text-[#1F2328]">
            Earnings summary
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-8 text-[#5F5A53]">
            Track revenue from confirmed and completed bookings connected to
            your properties.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/host"
              className="rounded-full border border-[#1F2328] px-4 py-2 text-sm transition hover:bg-[#1F2328] hover:text-white"
            >
              Back to dashboard
            </Link>

            <Link
              href="/host/bookings"
              className="rounded-full bg-[#1F2328] px-4 py-2 text-sm text-white"
            >
              View bookings
            </Link>
          </div>

          {summaryError ? (
            <div className="mt-6 rounded-[18px] bg-red-50 px-4 py-3 text-sm text-red-700">
              Failed to load earnings summary.
            </div>
          ) : null}

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <div className="rounded-[28px] border border-[#E8DED0] bg-[#FCFBF9] p-6">
              <div className="text-xs uppercase tracking-[0.22em] text-[#8A7660]">
                Total revenue
              </div>

              <div className="mt-3 text-4xl font-semibold text-[#1F2328]">
                {summaryLoading ? '...' : money(summary?.totalRevenue)}
              </div>
            </div>

            <div className="rounded-[28px] border border-[#E8DED0] bg-[#FCFBF9] p-6">
              <div className="text-xs uppercase tracking-[0.22em] text-[#8A7660]">
                Revenue bookings
              </div>

              <div className="mt-3 text-4xl font-semibold text-[#1F2328]">
                {summaryLoading ? '...' : summary?.bookingsCount ?? 0}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[34px] border border-[#E8DED0] bg-white p-8 shadow-[0_18px_50px_rgba(31,35,40,0.06)] sm:p-10">
          <div className="text-xs uppercase tracking-[0.24em] text-[#8A7660]">
            Revenue bookings
          </div>

          <h2 className="mt-3 font-serif text-4xl text-[#1F2328]">
            Confirmed and completed stays
          </h2>

          {bookingsError ? (
            <div className="mt-6 rounded-[18px] bg-red-50 px-4 py-3 text-sm text-red-700">
              Failed to load earnings bookings.
            </div>
          ) : null}

          <div className="mt-8 overflow-hidden rounded-[24px] border border-[#E8DED0]">
            <div className="hidden grid-cols-[1.2fr_1fr_1fr_0.8fr] bg-[#FCFBF9] px-5 py-4 text-xs uppercase tracking-[0.18em] text-[#8A7660] md:grid">
              <div>Property</div>
              <div>Dates</div>
              <div>Guest</div>
              <div>Total</div>
            </div>

            <div className="divide-y divide-[#E8DED0]">
              {bookingsLoading
                ? Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-20 animate-pulse bg-white"
                    />
                  ))
                : (bookings ?? []).map((booking: any) => (
                    <div
                      key={booking.id}
                      className="grid gap-3 px-5 py-5 text-sm text-[#5F5A53] md:grid-cols-[1.2fr_1fr_1fr_0.8fr]"
                    >
                      <div>
                        <div className="font-semibold text-[#1F2328]">
                          {booking.property?.title}
                        </div>

                        <div className="mt-1 text-xs uppercase tracking-[0.16em] text-[#8A7660]">
                          {booking.bookingStatus}
                        </div>
                      </div>

                      <div>
                        {booking.checkInDate?.slice?.(0, 10)} →{' '}
                        {booking.checkOutDate?.slice?.(0, 10)}
                      </div>

                      <div>
                        {booking.guestDetails
                          ? `${booking.guestDetails.firstName} ${booking.guestDetails.lastName}`
                          : 'Guest'}
                      </div>

                      <div className="font-semibold text-[#1F2328]">
                        {money(booking.totalAmount)}
                      </div>
                    </div>
                  ))}
            </div>
          </div>

          {!bookingsLoading && (bookings?.length ?? 0) === 0 ? (
            <div className="mt-6 rounded-[24px] border border-[#E8DED0] bg-[#FCFBF9] px-5 py-6 text-sm text-[#5F5A53]">
              No revenue bookings yet.
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
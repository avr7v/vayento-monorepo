'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import {
  useHostBookings,
  useHostDashboard,
  useHostEarningsSummary,
  useHostProperties,
} from '@/hooks/use-host';
import { useAuthStore } from '@/store/auth.store';

function money(value: number | string | null | undefined) {
  return `€${Number(value ?? 0).toFixed(2)}`;
}

export default function HostDashboardPage() {
  const user = useAuthStore((state) => state.user);

  const { data: dashboard } = useHostDashboard();
  const { data: properties, isLoading: propertiesLoading } = useHostProperties();
  const { data: bookings, isLoading: bookingsLoading } = useHostBookings();
  const { data: earnings } = useHostEarningsSummary();

  const recentBookings = useMemo(() => (bookings ?? []).slice(0, 5), [bookings]);
  const recentProperties = useMemo(
    () => (properties ?? []).slice(0, 4),
    [properties],
  );

  return (
    <div className="min-h-screen bg-white px-4 py-12">
      <div className="mx-auto max-w-7xl space-y-10">
        <section className="rounded-[34px] border border-[#E8DED0] bg-white p-8 shadow-[0_18px_50px_rgba(31,35,40,0.06)] sm:p-10">
          <div className="text-xs uppercase tracking-[0.24em] text-[#8A7660]">
            Host dashboard
          </div>

          <h1 className="mt-3 font-serif text-5xl text-[#1F2328]">
            Welcome back{user?.firstName ? `, ${user.firstName}` : ''}
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-8 text-[#5F5A53]">
            Manage listings, track reservations, review earnings and prepare
            properties for admin approval.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/host/properties/new"
              className="rounded-full bg-[#1F2328] px-5 py-3 text-sm text-white transition hover:bg-[#343A42]"
            >
              Create property
            </Link>

            <Link
              href="/host/properties"
              className="rounded-full border border-[#1F2328] px-5 py-3 text-sm transition hover:bg-[#1F2328] hover:text-white"
            >
              View properties
            </Link>

            <Link
              href="/host/bookings"
              className="rounded-full border border-[#1F2328] px-5 py-3 text-sm transition hover:bg-[#1F2328] hover:text-white"
            >
              Host bookings
            </Link>

            <Link
              href="/host/earnings"
              className="rounded-full border border-[#1F2328] px-5 py-3 text-sm transition hover:bg-[#1F2328] hover:text-white"
            >
              Earnings
            </Link>

            <Link
              href="/host/inbox"
              className="rounded-full border border-[#1F2328] px-5 py-3 text-sm transition hover:bg-[#1F2328] hover:text-white"
            >
              Inbox
            </Link>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-4">
            <MetricCard
              label="Properties"
              value={dashboard?.propertiesCount ?? 0}
            />

            <MetricCard
              label="Published"
              value={dashboard?.publishedCount ?? 0}
            />

            <MetricCard
              label="Bookings"
              value={dashboard?.bookingsCount ?? 0}
            />

            <MetricCard
              label="Revenue"
              value={money(earnings?.totalRevenue)}
            />
          </div>
        </section>

        <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-[34px] border border-[#E8DED0] bg-white p-8 shadow-[0_18px_50px_rgba(31,35,40,0.06)] sm:p-10">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.24em] text-[#8A7660]">
                  Listings
                </div>

                <h2 className="mt-3 font-serif text-4xl text-[#1F2328]">
                  Recent properties
                </h2>
              </div>

              <Link
                href="/host/properties"
                className="rounded-full bg-[#1F2328] px-5 py-3 text-sm text-white"
              >
                Manage all
              </Link>
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              {propertiesLoading
                ? Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-40 animate-pulse rounded-[28px] bg-[#FCFBF9]"
                    />
                  ))
                : recentProperties.map((property: any) => (
                    <div
                      key={property.id}
                      className="rounded-[28px] border border-[#E8DED0] bg-[#FCFBF9] p-6"
                    >
                      <div className="text-sm text-[#8A7660]">
                        {property.status}
                      </div>

                      <h3 className="mt-2 text-2xl font-semibold text-[#1F2328]">
                        {property.title}
                      </h3>

                      <p className="mt-2 text-sm text-[#5F5A53]">
                        {money(property.basePricePerNight)}/night ·{' '}
                        {property.location?.city ?? 'No city'}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-3">
                        <Link
                          href={`/host/properties/${property.id}`}
                          className="rounded-full border border-[#1F2328] px-4 py-2 text-sm transition hover:bg-[#1F2328] hover:text-white"
                        >
                          Edit
                        </Link>
                      </div>
                    </div>
                  ))}
            </div>

            {!propertiesLoading && recentProperties.length === 0 ? (
              <div className="mt-6 rounded-[24px] border border-[#E8DED0] bg-[#FCFBF9] px-5 py-6 text-sm text-[#5F5A53]">
                No properties yet.
              </div>
            ) : null}
          </section>

          <aside className="rounded-[34px] border border-[#E8DED0] bg-white p-8 shadow-[0_18px_50px_rgba(31,35,40,0.06)] sm:p-10">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.24em] text-[#8A7660]">
                  Reservations
                </div>

                <h2 className="mt-3 font-serif text-3xl text-[#1F2328]">
                  Recent bookings
                </h2>
              </div>

              <Link
                href="/host/bookings"
                className="rounded-full border border-[#1F2328] px-4 py-2 text-sm"
              >
                View all
              </Link>
            </div>

            <div className="mt-6 space-y-4">
              {bookingsLoading
                ? Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-24 animate-pulse rounded-[24px] bg-[#FCFBF9]"
                    />
                  ))
                : recentBookings.map((booking: any) => (
                    <div
                      key={booking.id}
                      className="rounded-[24px] border border-[#E8DED0] bg-[#FCFBF9] p-5"
                    >
                      <div className="text-sm text-[#8A7660]">
                        {booking.bookingStatus}
                      </div>

                      <div className="mt-2 text-lg font-semibold text-[#1F2328]">
                        {booking.property?.title}
                      </div>

                      <div className="mt-2 text-sm text-[#5F5A53]">
                        {booking.checkInDate?.slice?.(0, 10)} →{' '}
                        {booking.checkOutDate?.slice?.(0, 10)}
                      </div>

                      <div className="mt-2 text-sm font-medium text-[#1F2328]">
                        {money(booking.totalAmount)}
                      </div>
                    </div>
                  ))}
            </div>

            {!bookingsLoading && recentBookings.length === 0 ? (
              <div className="mt-6 rounded-[24px] border border-[#E8DED0] bg-[#FCFBF9] px-5 py-6 text-sm text-[#5F5A53]">
                No bookings yet.
              </div>
            ) : null}
          </aside>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-[28px] border border-[#E8DED0] bg-[#FCFBF9] p-6">
      <div className="text-xs uppercase tracking-[0.22em] text-[#8A7660]">
        {label}
      </div>

      <div className="mt-3 text-4xl font-semibold text-[#1F2328]">
        {value}
      </div>
    </div>
  );
}
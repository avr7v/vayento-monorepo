'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  useHostBookings,
  useUpdateHostBookingStatus,
} from '@/hooks/use-host';

function money(value: number | string | null | undefined) {
  return `€${Number(value ?? 0).toFixed(2)}`;
}

export default function HostBookingsPage() {
  const { data, isLoading, isError } = useHostBookings();
  const updateStatusMutation = useUpdateHostBookingStatus();

  const [statusFilter, setStatusFilter] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const bookings = useMemo(() => {
    return (data ?? []).filter((booking: any) =>
      statusFilter ? booking.bookingStatus === statusFilter : true,
    );
  }, [data, statusFilter]);

  const handleStatus = async (bookingId: string, status: string) => {
    setMessage('');
    setError('');

    try {
      await updateStatusMutation.mutateAsync({
        id: bookingId,
        status,
      });

      setMessage('Booking status updated.');
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          'Could not update booking status.',
      );
    }
  };

  return (
    <div className="min-h-screen bg-white px-4 py-12">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-[34px] border border-[#E8DED0] bg-white p-8 shadow-[0_18px_50px_rgba(31,35,40,0.06)] sm:p-10">
          <div className="text-xs uppercase tracking-[0.24em] text-[#8A7660]">
            Host bookings
          </div>

          <h1 className="mt-3 font-serif text-5xl text-[#1F2328]">
            Reservations
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-8 text-[#5F5A53]">
            View reservations connected to your properties and monitor payment
            status, dates and guest details.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/host"
              className="rounded-full border border-[#1F2328] px-4 py-2 text-sm transition hover:bg-[#1F2328] hover:text-white"
            >
              Back to dashboard
            </Link>

            <Link
              href="/host/earnings"
              className="rounded-full bg-[#1F2328] px-4 py-2 text-sm text-white"
            >
              View earnings
            </Link>
          </div>

          <div className="mt-8 max-w-sm">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-[20px] border border-[#E7DED1] bg-white px-4 py-4 outline-none"
            >
              <option value="">All statuses</option>
              <option value="AWAITING_PAYMENT">Awaiting payment</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </div>

          {message ? (
            <div className="mt-6 rounded-[18px] bg-green-50 px-4 py-3 text-sm text-green-700">
              {message}
            </div>
          ) : null}

          {error ? (
            <div className="mt-6 rounded-[18px] bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}
        </section>

        {isError ? (
          <div className="rounded-[18px] bg-red-50 px-4 py-3 text-sm text-red-700">
            Failed to load host bookings.
          </div>
        ) : null}

        <section className="grid gap-5 lg:grid-cols-2">
          {isLoading
            ? Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-64 animate-pulse rounded-[28px] bg-[#FCFBF9]"
                />
              ))
            : bookings.map((booking: any) => (
                <article
                  key={booking.id}
                  className="rounded-[28px] border border-[#E8DED0] bg-white p-6 shadow-[0_18px_50px_rgba(31,35,40,0.05)]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="text-xs uppercase tracking-[0.2em] text-[#8A7660]">
                        {booking.bookingStatus}
                      </div>

                      <h2 className="mt-3 text-2xl font-semibold text-[#1F2328]">
                        {booking.property?.title}
                      </h2>
                    </div>

                    <div className="rounded-full bg-[#FCFBF9] px-4 py-2 text-sm font-medium text-[#1F2328]">
                      {money(booking.totalAmount)}
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 text-sm text-[#5F5A53] sm:grid-cols-2">
                    <div>
                      Check-in:{' '}
                      <span className="font-medium text-[#1F2328]">
                        {booking.checkInDate?.slice?.(0, 10)}
                      </span>
                    </div>

                    <div>
                      Check-out:{' '}
                      <span className="font-medium text-[#1F2328]">
                        {booking.checkOutDate?.slice?.(0, 10)}
                      </span>
                    </div>

                    <div>
                      Guests:{' '}
                      <span className="font-medium text-[#1F2328]">
                        {booking.guestsCount}
                      </span>
                    </div>

                    <div>
                      Payment:{' '}
                      <span className="font-medium text-[#1F2328]">
                        {booking.paymentStatus}
                      </span>
                    </div>
                  </div>

                  {booking.guestDetails ? (
                    <div className="mt-5 rounded-[22px] bg-[#FCFBF9] p-5 text-sm leading-7 text-[#5F5A53]">
                      <div className="font-semibold text-[#1F2328]">
                        Guest details
                      </div>

                      <div className="mt-2">
                        {booking.guestDetails.firstName}{' '}
                        {booking.guestDetails.lastName}
                      </div>

                      <div>{booking.guestDetails.email}</div>

                      {booking.guestDetails.phone ? (
                        <div>{booking.guestDetails.phone}</div>
                      ) : null}
                    </div>
                  ) : null}

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => void handleStatus(booking.id, 'COMPLETED')}
                      disabled={updateStatusMutation.isPending}
                      className="rounded-full border border-[#1F2328] px-4 py-2 text-sm transition hover:bg-[#1F2328] hover:text-white disabled:opacity-60"
                    >
                      Mark completed
                    </button>

                    <button
                      type="button"
                      onClick={() => void handleStatus(booking.id, 'CANCELLED')}
                      disabled={updateStatusMutation.isPending}
                      className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 disabled:opacity-60"
                    >
                      Cancel
                    </button>
                  </div>
                </article>
              ))}
        </section>

        {!isLoading && bookings.length === 0 ? (
          <div className="rounded-[28px] border border-[#E8DED0] bg-[#FCFBF9] px-6 py-10 text-center text-sm text-[#5F5A53]">
            No bookings found.
          </div>
        ) : null}
      </div>
    </div>
  );
}
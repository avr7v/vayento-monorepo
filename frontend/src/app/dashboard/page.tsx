'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useMyBookings, useCancelBooking } from '@/hooks/use-bookings';
import { useWishlist, useRemoveFromWishlist } from '@/hooks/use-wishlist';
import { useAuthStore } from '@/store/auth.store';

function canCancelBooking(booking: any) {
  const cancellableStatuses = ['PENDING', 'AWAITING_PAYMENT', 'CONFIRMED'];

  if (!cancellableStatuses.includes(booking.bookingStatus)) {
    return false;
  }

  if (!booking.checkInDate) {
    return false;
  }

  const checkIn = new Date(booking.checkInDate);
  const today = new Date();

  today.setHours(0, 0, 0, 0);
  checkIn.setHours(0, 0, 0, 0);

  return checkIn > today;
}

function getCancelButtonText(booking: any) {
  const hasSucceededPayment =
    booking.paymentStatus === 'SUCCEEDED' ||
    booking.payments?.some(
      (payment: any) => payment.paymentStatus === 'SUCCEEDED',
    );

  return hasSucceededPayment ? 'Cancel & refund' : 'Cancel';
}

export default function UserDashboardPage() {
  const user = useAuthStore((state) => state.user);

  const {
    data: bookings,
    isLoading: bookingsLoading,
    isError: bookingsError,
  } = useMyBookings();

  const {
    data: wishlist,
    isLoading: wishlistLoading,
    isError: wishlistError,
  } = useWishlist();

  const cancelBookingMutation = useCancelBooking();
  const removeFromWishlistMutation = useRemoveFromWishlist();

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(
    null,
  );

  const upcomingBookings = useMemo(
    () =>
      (bookings ?? []).filter((booking: any) =>
        ['CONFIRMED', 'AWAITING_PAYMENT', 'PENDING'].includes(
          booking.bookingStatus,
        ),
      ),
    [bookings],
  );

  const totalSpent = useMemo(
    () =>
      (bookings ?? [])
        .filter((booking: any) =>
          ['CONFIRMED', 'COMPLETED'].includes(booking.bookingStatus),
        )
        .reduce(
          (sum: number, booking: any) => sum + Number(booking.totalAmount || 0),
          0,
        ),
    [bookings],
  );

  const handleCancelBooking = async (booking: any) => {
    if (!canCancelBooking(booking)) {
      setError('This booking cannot be cancelled.');
      return;
    }

    const confirmed = confirm(
      booking.paymentStatus === 'SUCCEEDED'
        ? 'This will cancel the booking and create a refund. Continue?'
        : 'This will cancel the booking. Continue?',
    );

    if (!confirmed) return;

    setMessage('');
    setError('');
    setCancellingBookingId(booking.id);

    try {
      const result = await cancelBookingMutation.mutateAsync(booking.id);

      if (result?.refund) {
        setMessage('Booking cancelled successfully and refund was created.');
      } else {
        setMessage('Booking cancelled successfully.');
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          'Booking cancellation failed. Please try again.',
      );
    } finally {
      setCancellingBookingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-white px-4 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-[34px] border border-[#E8DED0] bg-white p-8 shadow-[0_18px_50px_rgba(31,35,40,0.06)] sm:p-10">
          <div className="text-xs uppercase tracking-[0.24em] text-[#8A7660]">
            User dashboard
          </div>

          <h1 className="mt-3 text-5xl font-semibold text-[#1F2328]">
            Welcome back{user?.firstName ? `, ${user.firstName}` : ''}
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-8 text-[#5F5A53]">
            View your reservations, manage saved stays and keep track of your
            account activity.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/dashboard/settings"
              className="inline-flex rounded-full border border-[#1F2328] px-4 py-2 text-sm transition hover:bg-[#1F2328] hover:text-white"
            >
              Account settings
            </Link>

            <Link
              href="/dashboard/support"
              className="inline-flex rounded-full bg-[#1F2328] px-4 py-2 text-sm text-white transition hover:bg-[#343A42]"
            >
              Contact support
            </Link>
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

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <div className="rounded-[28px] border border-[#E8DED0] bg-[#FCFBF9] p-6">
              <div className="text-xs uppercase tracking-[0.22em] text-[#8A7660]">
                Total bookings
              </div>

              <div className="mt-3 text-4xl font-semibold text-[#1F2328]">
                {bookingsLoading ? '...' : bookings?.length ?? 0}
              </div>
            </div>

            <div className="rounded-[28px] border border-[#E8DED0] bg-[#FCFBF9] p-6">
              <div className="text-xs uppercase tracking-[0.22em] text-[#8A7660]">
                Upcoming stays
              </div>

              <div className="mt-3 text-4xl font-semibold text-[#1F2328]">
                {bookingsLoading ? '...' : upcomingBookings.length}
              </div>
            </div>

            <div className="rounded-[28px] border border-[#E8DED0] bg-[#FCFBF9] p-6">
              <div className="text-xs uppercase tracking-[0.22em] text-[#8A7660]">
                Total spent
              </div>

              <div className="mt-3 text-4xl font-semibold text-[#1F2328]">
                {bookingsLoading ? '...' : `€${totalSpent.toFixed(2)}`}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="space-y-8">
            <div className="rounded-[34px] border border-[#E8DED0] bg-white p-8 shadow-[0_18px_50px_rgba(31,35,40,0.06)] sm:p-10">
              <h2 className="text-3xl font-semibold text-[#1F2328]">
                Reservations
              </h2>

              {bookingsError ? (
                <div className="mt-6 rounded-[18px] bg-red-50 px-4 py-3 text-sm text-red-700">
                  Failed to load your bookings.
                </div>
              ) : null}

              <div className="mt-6 grid gap-5 lg:grid-cols-2">
                {(bookings ?? []).map((booking: any) => {
                  const cancellable = canCancelBooking(booking);
                  const isCancelling = cancellingBookingId === booking.id;

                  return (
                    <div
                      key={booking.id}
                      className="rounded-[24px] border border-[#E8DED0] bg-[#FCFBF9] p-6"
                    >
                      <div className="text-sm text-[#8A7660]">
                        {booking.bookingStatus}
                      </div>

                      <h3 className="mt-2 text-2xl font-semibold">
                        {booking.property?.title}
                      </h3>

                      <p className="mt-2 text-sm text-[#5F5A53]">
                        {booking.checkInDate?.slice?.(0, 10)} →{' '}
                        {booking.checkOutDate?.slice?.(0, 10)}
                      </p>

                      <p className="mt-2 text-sm text-[#5F5A53]">
                        Payment: {booking.paymentStatus}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-3">
                        <Link
                          href={`/booking/success?bookingId=${booking.id}`}
                          className="rounded-full border border-[#1F2328] px-4 py-2 text-sm transition hover:bg-[#1F2328] hover:text-white"
                        >
                          View
                        </Link>

                        {cancellable ? (
                          <button
                            type="button"
                            disabled={isCancelling}
                            onClick={() => void handleCancelBooking(booking)}
                            className="rounded-full bg-[#1F2328] px-4 py-2 text-sm text-white transition hover:bg-[#343A42] disabled:opacity-50"
                          >
                            {isCancelling
                              ? 'Cancelling...'
                              : getCancelButtonText(booking)}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>

              {!bookingsLoading && (bookings?.length ?? 0) === 0 ? (
                <p className="mt-6 text-sm text-[#5F5A53]">
                  You do not have bookings yet.
                </p>
              ) : null}
            </div>
          </section>

          <aside className="space-y-8">
            <div className="rounded-[34px] border border-[#E8DED0] bg-white p-8 shadow-[0_18px_50px_rgba(31,35,40,0.06)] sm:p-10">
              <h2 className="text-3xl font-semibold text-[#1F2328]">
                Wishlist
              </h2>

              {wishlistError ? (
                <div className="mt-6 rounded-[18px] bg-red-50 px-4 py-3 text-sm text-red-700">
                  Failed to load wishlist.
                </div>
              ) : null}

              <div className="mt-6 space-y-4">
                {(wishlist ?? []).map((item: any) => (
                  <div
                    key={item.id}
                    className="rounded-[24px] bg-[#FCFBF9] p-5"
                  >
                    <div className="text-xl font-semibold">
                      {item.property?.title}
                    </div>

                    <p className="mt-2 text-sm text-[#5F5A53]">
                      {item.property?.location?.city}
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        removeFromWishlistMutation.mutate(item.propertyId)
                      }
                      className="mt-4 rounded-full border border-[#1F2328] px-4 py-2 text-sm transition hover:bg-[#1F2328] hover:text-white"
                    >
                      Remove
                    </button>
                  </div>
                ))}

                {!wishlistLoading && (wishlist?.length ?? 0) === 0 ? (
                  <p className="text-sm text-[#5F5A53]">
                    No saved stays yet.
                  </p>
                ) : null}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
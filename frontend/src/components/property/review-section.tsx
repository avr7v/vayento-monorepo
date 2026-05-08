'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useCreateReview, useEligibleReviewBookings, usePropertyReviews } from '@/hooks/use-reviews';

export function ReviewSection({ propertyId }: { propertyId: string }) {
  const { data, isLoading, isError } = usePropertyReviews(propertyId);
  const user = useAuthStore((state) => state.user);
  const { data: eligibleBookings, isLoading: eligibleLoading } = useEligibleReviewBookings();
  const createMutation = useCreateReview(propertyId);
  const propertyEligibleBookings = useMemo(() => (eligibleBookings ?? []).filter((booking: any) => booking.propertyId === propertyId), [eligibleBookings, propertyId]);
  const [form, setForm] = useState({ bookingId: '', rating: 5, title: '', comment: '' });

  useEffect(() => {
    if (!form.bookingId && propertyEligibleBookings[0]?.id) setForm((prev) => ({ ...prev, bookingId: propertyEligibleBookings[0].id }));
  }, [form.bookingId, propertyEligibleBookings]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMutation.mutateAsync({
      propertyId,
      bookingId: form.bookingId,
      rating: Number(form.rating),
      title: form.title || undefined,
      comment: form.comment,
    });
    setForm({ bookingId: propertyEligibleBookings[0]?.id ?? '', rating: 5, title: '', comment: '' });
  };

  return (
    <section className="rounded-[34px] border border-[#E8DED0] bg-white p-8 shadow-[0_18px_50px_rgba(31,35,40,0.06)]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-[#8A7660]">Guest reviews</div>
          <h2 className="mt-3 font-serif text-4xl text-[#1F2328]">Guest perspectives</h2>
        </div>
        <div className="text-right">
          <div className="font-serif text-4xl text-[#1F2328]">{Number(data?.averageRating ?? 0).toFixed(1)}</div>
          <div className="text-sm text-[#6B645C]">{data?.totalReviews ?? 0} published reviews</div>
        </div>
      </div>

      {isLoading ? <div className="mt-6 text-sm text-[#6B645C]">Loading reviews...</div> : null}
      {isError ? <div className="mt-6 rounded-[18px] bg-red-50 px-4 py-3 text-sm text-red-700">Failed to load reviews.</div> : null}
      {!isLoading && !isError && (data?.items?.length ?? 0) === 0 ? <div className="mt-6 rounded-[22px] border border-[#E8DED0] bg-[#FCFBF9] px-5 py-6 text-sm text-[#6B645C]">No reviews have been published yet.</div> : null}

      <div className="mt-6 space-y-4">
        {(data?.items ?? []).map((review: any) => (
          <div key={review.id} className="rounded-[24px] border border-[#E8DED0] bg-[#FCFBF9] p-5">
            <div className="flex items-start justify-between gap-4"><div><div className="text-sm font-semibold text-[#1F2328]">{review.title || 'Guest review'}</div><div className="mt-1 text-sm text-[#6B645C]">{review.authorUser?.firstName} {review.authorUser?.lastName}</div></div><div className="rounded-full bg-white px-3 py-1 text-xs uppercase tracking-[0.18em] text-[#8A7660] shadow-sm">{review.rating}/5</div></div>
            <p className="mt-4 text-sm leading-8 text-[#5F5A53]">{review.comment}</p>
          </div>
        ))}
      </div>

      {user ? (
        <form onSubmit={submit} className="mt-8 rounded-[26px] border border-[#E8DED0] bg-[#FCFBF9] p-6">
          <div className="text-sm font-semibold text-[#1F2328]">Share your review</div>
          {eligibleLoading ? <div className="mt-4 text-sm text-[#6B645C]">Checking eligible completed bookings...</div> : null}
          {!eligibleLoading && propertyEligibleBookings.length === 0 ? <div className="mt-4 rounded-[18px] border border-[#E8DED0] bg-white px-4 py-3 text-sm text-[#6B645C]">You can review this stay after a completed booking.</div> : null}
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <select value={form.bookingId} onChange={(e) => setForm((prev) => ({ ...prev, bookingId: e.target.value }))} className="rounded-[18px] border border-[#E7DED1] bg-white px-4 py-3 outline-none" disabled={propertyEligibleBookings.length === 0}>
              <option value="">Select completed booking</option>
              {propertyEligibleBookings.map((booking: any) => <option key={booking.id} value={booking.id}>{booking.checkInDate?.slice?.(0,10)} → {booking.checkOutDate?.slice?.(0,10)}</option>)}
            </select>
            <select value={form.rating} onChange={(e) => setForm((prev) => ({ ...prev, rating: Number(e.target.value) }))} className="rounded-[18px] border border-[#E7DED1] bg-white px-4 py-3 outline-none">
              {[5,4,3,2,1].map((rating) => <option key={rating} value={rating}>{rating} stars</option>)}
            </select>
            <input value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="Title (optional)" className="rounded-[18px] border border-[#E7DED1] bg-white px-4 py-3 outline-none md:col-span-2" />
            <textarea value={form.comment} onChange={(e) => setForm((prev) => ({ ...prev, comment: e.target.value }))} placeholder="Comment" className="min-h-[140px] rounded-[18px] border border-[#E7DED1] bg-white px-4 py-3 outline-none md:col-span-2" />
          </div>
          {createMutation.isError ? <div className="mt-4 rounded-[18px] bg-red-50 px-4 py-3 text-sm text-red-700">Unable to submit your review. Make sure the booking is eligible and not already reviewed.</div> : null}
          {createMutation.isSuccess ? <div className="mt-4 rounded-[18px] border border-[#DCCDB8] bg-[#F8F3EA] px-4 py-3 text-sm text-[#5F5A53]">Your review was submitted for admin moderation.</div> : null}
          <button type="submit" disabled={createMutation.isPending || !form.bookingId || !form.comment} className="mt-5 rounded-full bg-[#1F2328] px-5 py-3 text-sm text-white disabled:opacity-60">{createMutation.isPending ? 'Submitting...' : 'Submit review'}</button>
        </form>
      ) : null}
    </section>
  );
}

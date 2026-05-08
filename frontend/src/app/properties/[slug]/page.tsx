'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useProperty } from '@/hooks/use-properties';
import { useAddToWishlist } from '@/hooks/use-wishlist';
import { useBookingQuote } from '@/hooks/use-bookings';
import { ReviewSection } from '@/components/property/review-section';

export default function PropertyDetailsPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();

  const { data: property, isLoading, isError } = useProperty(params.slug);
  const addToWishlist = useAddToWishlist();
  const quoteMutation = useBookingQuote();

  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [guestsCount, setGuestsCount] = useState(1);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  const cover = useMemo(
    () =>
      property?.images?.find((img: any) => img.isCover) ||
      property?.images?.[0],
    [property],
  );

  const coordinates =
    property?.location?.latitude && property?.location?.longitude
      ? `${property.location.latitude}, ${property.location.longitude}`
      : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white p-10 text-[#1F2328]">
        Loading...
      </div>
    );
  }

  if (isError || !property) {
    return (
      <div className="min-h-screen bg-white p-10 text-[#1F2328]">
        Property not found.
      </div>
    );
  }

  const canStartBooking = Boolean(
    checkInDate && checkOutDate && guestsCount > 0,
  );

  const bookingHref = `/booking?propertyId=${property.id}&checkInDate=${encodeURIComponent(
    checkInDate,
  )}&checkOutDate=${encodeURIComponent(checkOutDate)}&guestsCount=${guestsCount}`;

  const checkQuote = async () => {
    if (!canStartBooking) return;

    await quoteMutation.mutateAsync({
      propertyId: property.id,
      checkInDate,
      checkOutDate,
      guestsCount,
    });
  };

  const handleWishlist = () => {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('vayento_access_token')
        : null;

    if (!token) {
      router.push(`/login?redirect=/properties/${property.slug}`);
      return;
    }

    addToWishlist.mutate(property.id);
  };

  return (
    <div className="min-h-screen bg-white px-4 py-12">
      <div className="mx-auto max-w-7xl">
        <nav className="mb-6 text-sm text-[#6D655D]">
          <Link href="/" className="hover:underline">
            Home
          </Link>

          <span className="mx-2">/</span>

          <Link href="/properties" className="hover:underline">
            Properties
          </Link>

          <span className="mx-2">/</span>

          <span>{property.title}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-8">
            <div className="overflow-hidden rounded-[34px] border border-[#E8DED0] bg-white shadow-[0_18px_50px_rgba(31,35,40,0.06)]">
              <div className="grid gap-2 p-2 md:grid-cols-[2fr_1fr]">
                <button
                  type="button"
                  onClick={() => cover?.url && setActiveImage(cover.url)}
                  className="relative h-[420px] overflow-hidden rounded-[28px] bg-white"
                >
                  {cover ? (
                    <Image
                      src={cover.url}
                      alt={cover.altText || property.title}
                      fill
                      className="object-cover"
                    />
                  ) : null}
                </button>

                <div className="grid grid-cols-2 gap-2 md:grid-cols-1">
                  {(property.images ?? [])
                    .filter((img: any) => img.id !== cover?.id)
                    .slice(0, 3)
                    .map((img: any) => (
                      <button
                        key={img.id}
                        type="button"
                        onClick={() => setActiveImage(img.url)}
                        className="relative min-h-[130px] overflow-hidden rounded-[24px] bg-white"
                      >
                        <Image
                          src={img.url}
                          alt={img.altText || property.title}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                </div>
              </div>

              <div className="bg-white p-8">
                <div className="text-xs uppercase tracking-[0.24em] text-[#8A7660]">
                  {property.location?.city}, {property.location?.country}
                </div>

                <h1 className="mt-3 text-5xl font-semibold text-[#1F2328]">
                  {property.title}
                </h1>

                <p className="mt-4 max-w-3xl text-base leading-8 text-[#5F5A53]">
                  {property.longDescription}
                </p>

                <div className="mt-6 grid gap-3 text-sm text-[#5F5A53] sm:grid-cols-3">
                  <div>{property.maxGuests} guests</div>
                  <div>{property.bedrooms} bedrooms</div>
                  <div>{property.bathrooms} bathrooms</div>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {(property.amenities ?? []).map((amenity: any) => (
                    <span
                      key={amenity.id}
                      className="rounded-full border border-[#E8DED0] bg-white px-4 py-2 text-sm text-[#5F5A53]"
                    >
                      {amenity.amenityLabel}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-[34px] border border-[#E8DED0] bg-white p-8 shadow-[0_18px_50px_rgba(31,35,40,0.06)]">
              <div className="text-xs uppercase tracking-[0.24em] text-[#8A7660]">
                Location
              </div>

              <h2 className="mt-3 text-3xl font-semibold text-[#1F2328]">
                Map preview
              </h2>

              <div className="mt-5 rounded-[28px] border border-[#E8DED0] bg-white p-6 text-sm leading-8 text-[#5F5A53]">
                <div>
                  {property.location?.addressLine ??
                    'Address not publicly disclosed before booking.'}
                </div>

                <div>
                  {property.location?.city}, {property.location?.region ?? ''}{' '}
                  {property.location?.country}
                </div>

                <div className="mt-2 text-xs uppercase tracking-[0.18em] text-[#8A7660]">
                  {coordinates
                    ? `Coordinates: ${coordinates}`
                    : 'Map coordinates can be added by the host.'}
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="sticky top-24 rounded-[34px] border border-[#E8DED0] bg-white p-8 shadow-[0_18px_50px_rgba(31,35,40,0.06)]">
              <div className="text-xs uppercase tracking-[0.24em] text-[#8A7660]">
                Booking
              </div>

              <div className="mt-3 text-4xl font-semibold text-[#1F2328]">
                €{property.basePricePerNight}
                <span className="text-base font-normal text-[#5F5A53]">
                  {' '}
                  / night
                </span>
              </div>

              <p className="mt-4 text-sm leading-7 text-[#5F5A53]">
                {property.shortDescription}
              </p>

              <div className="mt-6 grid gap-3">
                <label className="text-sm text-[#5F5A53]">
                  Check-in
                  <input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className="mt-2 w-full rounded-[18px] border border-[#E7DED1] bg-white px-4 py-3 outline-none"
                  />
                </label>

                <label className="text-sm text-[#5F5A53]">
                  Check-out
                  <input
                    type="date"
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className="mt-2 w-full rounded-[18px] border border-[#E7DED1] bg-white px-4 py-3 outline-none"
                  />
                </label>

                <label className="text-sm text-[#5F5A53]">
                  Guests
                  <input
                    type="number"
                    min="1"
                    max={property.maxGuests}
                    value={guestsCount}
                    onChange={(e) => setGuestsCount(Number(e.target.value))}
                    className="mt-2 w-full rounded-[18px] border border-[#E7DED1] bg-white px-4 py-3 outline-none"
                  />
                </label>
              </div>

              <button
                type="button"
                disabled={!canStartBooking || quoteMutation.isPending}
                onClick={() => void checkQuote()}
                className="mt-5 w-full rounded-full border border-[#1F2328] bg-white px-6 py-4 text-sm font-medium text-[#1F2328] transition hover:bg-[#1F2328] hover:text-white disabled:opacity-50"
              >
                {quoteMutation.isPending ? 'Checking...' : 'Check quote'}
              </button>

              {quoteMutation.isError ? (
                <div className="mt-4 rounded-[18px] bg-red-50 px-4 py-3 text-sm text-red-700">
                  {(quoteMutation.error as any)?.response?.data?.message ??
                    'Selected dates are not available.'}
                </div>
              ) : null}

              {quoteMutation.data ? (
                <div className="mt-4 rounded-[20px] border border-[#E8DED0] bg-white p-4 text-sm leading-7 text-[#5F5A53]">
                  <div>Nights: {quoteMutation.data.nights}</div>
                  <div>Subtotal: €{quoteMutation.data.breakdown.subtotal}</div>
                  <div>Taxes: €{quoteMutation.data.breakdown.taxes}</div>
                  <div className="font-semibold text-[#1F2328]">
                    Total: €{quoteMutation.data.breakdown.totalAmount}
                  </div>
                </div>
              ) : null}

              <div className="mt-6 flex flex-col gap-3">
                <Link
                  aria-disabled={!canStartBooking}
                  href={canStartBooking ? bookingHref : '#'}
                  className={`rounded-full px-6 py-4 text-center text-sm font-medium ${
                    canStartBooking
                      ? 'bg-[#1F2328] text-white'
                      : 'bg-[#D8D1C7] text-[#7A726A]'
                  }`}
                >
                  Start booking
                </Link>

                <button
                  type="button"
                  onClick={handleWishlist}
                  className="rounded-full border border-[#1F2328] bg-white px-6 py-4 text-sm font-medium text-[#1F2328] transition hover:bg-[#1F2328] hover:text-white"
                >
                  Save to wishlist
                </button>
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-8">
          <ReviewSection propertyId={property.id} />
        </div>
      </div>

      {activeImage ? (
        <div
          onClick={() => setActiveImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6"
        >
          <div className="relative h-[80vh] w-full max-w-5xl">
            <Image
              src={activeImage}
              alt={property.title}
              fill
              className="object-contain"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
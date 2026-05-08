'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  useHostAvailability,
  useHostProperty,
  useUpdateHostAvailability,
  useUpdateHostProperty,
  useSubmitHostPropertyForReview,
} from '@/hooks/use-host';
import { CountrySelect } from '@/components/forms/country-select';
import { PropertyMediaManager } from '@/components/host/property-media-manager';

const inputClass =
  'rounded-[20px] border border-[#E7DED1] bg-[#FBFAF7] px-4 py-4 outline-none transition focus:border-[#CDB89C]';

const textareaClass =
  'rounded-[20px] border border-[#E7DED1] bg-[#FBFAF7] px-4 py-4 outline-none transition focus:border-[#CDB89C]';

const AMENITIES = [
  { amenityKey: 'wifi', amenityLabel: 'High-speed Wi-Fi' },
  { amenityKey: 'pool', amenityLabel: 'Pool' },
  { amenityKey: 'parking', amenityLabel: 'Private parking' },
  { amenityKey: 'aircon', amenityLabel: 'Air conditioning' },
  { amenityKey: 'kitchen', amenityLabel: 'Full kitchen' },
  { amenityKey: 'workspace', amenityLabel: 'Dedicated workspace' },
  { amenityKey: 'sea_view', amenityLabel: 'Sea view' },
  { amenityKey: 'terrace', amenityLabel: 'Terrace / balcony' },
  { amenityKey: 'washer', amenityLabel: 'Washer' },
  { amenityKey: 'family', amenityLabel: 'Family friendly' },
];

const emptyForm = {
  title: '',
  slug: '',
  shortDescription: '',
  longDescription: '',
  propertyType: 'Villa',
  basePricePerNight: '',
  cleaningFee: '',
  serviceFee: '',
  maxGuests: '',
  bedrooms: '',
  bathrooms: '',
  country: '',
  city: '',
  region: '',
  addressLine: '',
  checkInTime: '15:00',
  checkOutTime: '11:00',
  cancellationPolicy: 'Moderate',
  petsAllowed: false,
  smokingAllowed: false,
  eventsAllowed: false,
  extraNotes: '',
};

type EditForm = typeof emptyForm;

export default function HostPropertyEditorPage() {
  const params = useParams<{ id: string }>();
  const propertyId = Array.isArray(params.id) ? params.id[0] : params.id;

  const { data, isLoading, isError } = useHostProperty(propertyId);

  const {
    data: availability,
    isLoading: availabilityLoading,
    isError: availabilityError,
  } = useHostAvailability(propertyId);

  const updateMutation = useUpdateHostProperty();
  const submitForReviewMutation = useSubmitHostPropertyForReview();
  const updateAvailabilityMutation = useUpdateHostAvailability(propertyId);

  const [form, setForm] = useState<EditForm>(emptyForm);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitError, setSubmitError] = useState('');

  const [availabilityForm, setAvailabilityForm] = useState({
    startDate: '',
    endDate: '',
    blockType: 'BLOCKED',
    reason: '',
  });

  const selectedAmenityObjects = useMemo(
    () =>
      AMENITIES.filter((item) => selectedAmenities.includes(item.amenityKey)),
    [selectedAmenities],
  );

  useEffect(() => {
    if (!data) return;

    setForm({
      title: data.title ?? '',
      slug: data.slug ?? '',
      shortDescription: data.shortDescription ?? '',
      longDescription: data.longDescription ?? '',
      propertyType: data.propertyType ?? 'Villa',
      basePricePerNight: String(data.basePricePerNight ?? ''),
      cleaningFee: String(data.cleaningFee ?? ''),
      serviceFee: String(data.serviceFee ?? ''),
      maxGuests: String(data.maxGuests ?? ''),
      bedrooms: String(data.bedrooms ?? ''),
      bathrooms: String(data.bathrooms ?? ''),
      country: data.location?.country ?? '',
      city: data.location?.city ?? '',
      region: data.location?.region ?? '',
      addressLine: data.location?.addressLine ?? '',
      checkInTime: data.rules?.checkInTime ?? '15:00',
      checkOutTime: data.rules?.checkOutTime ?? '11:00',
      cancellationPolicy: data.rules?.cancellationPolicy ?? 'Moderate',
      petsAllowed: Boolean(data.rules?.petsAllowed),
      smokingAllowed: Boolean(data.rules?.smokingAllowed),
      eventsAllowed: Boolean(data.rules?.eventsAllowed),
      extraNotes: data.rules?.extraNotes ?? '',
    });

    setSelectedAmenities(
      (data.amenities ?? []).map((amenity: any) => amenity.amenityKey),
    );
  }, [data]);

  const setField = (key: keyof EditForm, value: string | boolean) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

    setMessage('');
    setError('');
  };

  const toggleAmenity = (key: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(key)
        ? prev.filter((item) => item !== key)
        : [...prev, key],
    );

    setMessage('');
    setError('');
  };

  const validate = () => {
    if (!form.title.trim()) return 'Title is required.';
    if (!form.slug.trim()) return 'Slug is required.';
    if (!form.shortDescription.trim()) return 'Short description is required.';
    if (!form.longDescription.trim()) return 'Long description is required.';
    if (!form.country.trim()) return 'Country is required.';
    if (!form.city.trim()) return 'City is required.';
    if (Number(form.basePricePerNight) <= 0) {
      return 'Base price must be greater than 0.';
    }
    if (Number(form.maxGuests) < 1) {
      return 'Maximum guests must be at least 1.';
    }
    if (!selectedAmenityObjects.length) {
      return 'Select at least one amenity.';
    }

    return '';
  };

  const handleSave = async () => {
    setMessage('');
    setError('');

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: propertyId,
        payload: {
          title: form.title.trim(),
          slug: form.slug.trim(),
          shortDescription: form.shortDescription.trim(),
          longDescription: form.longDescription.trim(),
          propertyType: form.propertyType,
          basePricePerNight: Number(form.basePricePerNight || 0),
          cleaningFee: Number(form.cleaningFee || 0),
          serviceFee: Number(form.serviceFee || 0),
          maxGuests: Number(form.maxGuests || 0),
          bedrooms: Number(form.bedrooms || 0),
          bathrooms: Number(form.bathrooms || 0),
          location: {
            country: form.country,
            city: form.city,
            region: form.region || undefined,
            addressLine: form.addressLine || undefined,
          },
          amenities: selectedAmenityObjects,
          rules: {
            checkInTime: form.checkInTime,
            checkOutTime: form.checkOutTime,
            cancellationPolicy: form.cancellationPolicy,
            petsAllowed: form.petsAllowed,
            smokingAllowed: form.smokingAllowed,
            eventsAllowed: form.eventsAllowed,
            extraNotes: form.extraNotes || undefined,
          },
        },
      });

      setMessage('Property updated successfully.');
    } catch (err: any) {
      const apiMessage = err?.response?.data?.message;

      setError(
        Array.isArray(apiMessage)
          ? apiMessage.join(' ')
          : apiMessage ?? 'Could not update property.',
      );
    }
  };

  const handleSubmitForReview = async () => {
    setSubmitMessage('');
    setSubmitError('');

    try {
      await submitForReviewMutation.mutateAsync(propertyId);
      setSubmitMessage('Property submitted for admin review.');
    } catch (err: any) {
      const apiMessage = err?.response?.data?.message;

      setSubmitError(
        Array.isArray(apiMessage)
          ? apiMessage.join(' ')
          : apiMessage ?? 'Could not submit property for review.',
      );
    }
  };

  const handleAvailabilitySave = async () => {
    if (!availabilityForm.startDate || !availabilityForm.endDate) {
      setError('Availability start and end dates are required.');
      return;
    }

    await updateAvailabilityMutation.mutateAsync({
      ranges: [
        {
          startDate: availabilityForm.startDate,
          endDate: availabilityForm.endDate,
          blockType: availabilityForm.blockType,
          reason: availabilityForm.reason || undefined,
        },
      ],
    });

    setAvailabilityForm({
      startDate: '',
      endDate: '',
      blockType: 'BLOCKED',
      reason: '',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white px-4 py-12">
        <div className="mx-auto h-[520px] max-w-6xl animate-pulse rounded-[32px] bg-[#FCFBF9]" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen bg-white px-4 py-12">
        <div className="mx-auto max-w-4xl rounded-[28px] bg-red-50 px-6 py-5 text-sm text-red-700">
          Failed to load property details.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-4 py-12">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-[34px] border border-[#E8DED0] bg-white p-8 shadow-[0_18px_50px_rgba(31,35,40,0.06)] sm:p-10">
          <div className="text-xs uppercase tracking-[0.24em] text-[#8A7660]">
            Property editor
          </div>

          <h1 className="mt-3 font-serif text-5xl text-[#1F2328]">
            {data.title}
          </h1>

          <p className="mt-4 max-w-3xl text-base leading-8 text-[#5F5A53]">
            Refine presentation, pricing, location, amenities and operational
            details from a single host workspace.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/host/properties"
              className="rounded-full border border-[#1F2328] px-4 py-2 text-sm transition hover:bg-[#1F2328] hover:text-white"
            >
              Back to properties
            </Link>

            <Link
              href={`/properties/${data.slug}`}
              target="_blank"
              className="rounded-full bg-[#1F2328] px-4 py-2 text-sm text-white"
            >
              View public page
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

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <input
              value={form.title}
              onChange={(e) => setField('title', e.target.value)}
              className={inputClass}
              placeholder="Property title"
            />

            <input
              value={form.slug}
              onChange={(e) =>
                setField(
                  'slug',
                  e.target.value
                    .toLowerCase()
                    .trim()
                    .replace(/[^a-z0-9-]+/g, '-')
                    .replace(/-+/g, '-'),
                )
              }
              className={inputClass}
              placeholder="Slug"
            />

            <select
              value={form.propertyType}
              onChange={(e) => setField('propertyType', e.target.value)}
              className={inputClass}
            >
              <option value="Villa">Villa</option>
              <option value="Apartment">Apartment</option>
              <option value="House">House</option>
              <option value="Suite">Suite</option>
              <option value="Loft">Loft</option>
              <option value="Maisonette">Maisonette</option>
              <option value="Estate">Estate</option>
            </select>

            <input
              value={form.basePricePerNight}
              onChange={(e) =>
                setField('basePricePerNight', e.target.value)
              }
              className={inputClass}
              placeholder="Base price per night"
              type="number"
              min="1"
            />

            <input
              value={form.cleaningFee}
              onChange={(e) => setField('cleaningFee', e.target.value)}
              className={inputClass}
              placeholder="Cleaning fee"
              type="number"
              min="0"
            />

            <input
              value={form.serviceFee}
              onChange={(e) => setField('serviceFee', e.target.value)}
              className={inputClass}
              placeholder="Service fee"
              type="number"
              min="0"
            />

            <input
              value={form.maxGuests}
              onChange={(e) => setField('maxGuests', e.target.value)}
              className={inputClass}
              placeholder="Maximum guests"
              type="number"
              min="1"
            />

            <input
              value={form.bedrooms}
              onChange={(e) => setField('bedrooms', e.target.value)}
              className={inputClass}
              placeholder="Bedrooms"
              type="number"
              min="0"
            />

            <input
              value={form.bathrooms}
              onChange={(e) => setField('bathrooms', e.target.value)}
              className={`${inputClass} md:col-span-2`}
              placeholder="Bathrooms"
              type="number"
              min="0"
            />

            <textarea
              value={form.shortDescription}
              onChange={(e) =>
                setField('shortDescription', e.target.value)
              }
              className={`min-h-[120px] ${textareaClass} md:col-span-2`}
              placeholder="Short description"
            />

            <textarea
              value={form.longDescription}
              onChange={(e) => setField('longDescription', e.target.value)}
              className={`min-h-[220px] ${textareaClass} md:col-span-2`}
              placeholder="Long description"
            />
          </div>
        </section>

        <section className="grid gap-8 xl:grid-cols-2">
          <div className="rounded-[34px] border border-[#E8DED0] bg-white p-8 shadow-[0_18px_50px_rgba(31,35,40,0.06)] sm:p-10">
            <div className="text-xs uppercase tracking-[0.24em] text-[#8A7660]">
              Location
            </div>

            <h2 className="mt-3 font-serif text-4xl text-[#1F2328]">
              Property location
            </h2>

            <div className="mt-8 grid gap-5">
              <CountrySelect
                value={form.country}
                onChange={(value) => setField('country', value)}
                className={inputClass}
                placeholder="Property country"
                required
              />

              <input
                value={form.city}
                onChange={(e) => setField('city', e.target.value)}
                className={inputClass}
                placeholder="City"
              />

              <input
                value={form.region}
                onChange={(e) => setField('region', e.target.value)}
                className={inputClass}
                placeholder="Region"
              />

              <input
                value={form.addressLine}
                onChange={(e) => setField('addressLine', e.target.value)}
                className={inputClass}
                placeholder="Address line"
              />
            </div>
          </div>

          <div className="rounded-[34px] border border-[#E8DED0] bg-white p-8 shadow-[0_18px_50px_rgba(31,35,40,0.06)] sm:p-10">
            <div className="text-xs uppercase tracking-[0.24em] text-[#8A7660]">
              Rules
            </div>

            <h2 className="mt-3 font-serif text-4xl text-[#1F2328]">
              Stay rules
            </h2>

            <div className="mt-8 grid gap-5">
              <input
                value={form.checkInTime}
                onChange={(e) => setField('checkInTime', e.target.value)}
                className={inputClass}
                placeholder="Check-in time"
              />

              <input
                value={form.checkOutTime}
                onChange={(e) => setField('checkOutTime', e.target.value)}
                className={inputClass}
                placeholder="Check-out time"
              />

              <select
                value={form.cancellationPolicy}
                onChange={(e) =>
                  setField('cancellationPolicy', e.target.value)
                }
                className={inputClass}
              >
                <option value="Flexible">Flexible</option>
                <option value="Moderate">Moderate</option>
                <option value="Strict">Strict</option>
              </select>

              <textarea
                value={form.extraNotes}
                onChange={(e) => setField('extraNotes', e.target.value)}
                className={`min-h-[120px] ${textareaClass}`}
                placeholder="Extra rules / notes"
              />
            </div>

            <div className="mt-5 flex flex-wrap gap-4 text-sm text-[#1F2328]">
              <label>
                <input
                  type="checkbox"
                  checked={form.petsAllowed}
                  onChange={(e) => setField('petsAllowed', e.target.checked)}
                  className="mr-2"
                />
                Pets allowed
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={form.smokingAllowed}
                  onChange={(e) =>
                    setField('smokingAllowed', e.target.checked)
                  }
                  className="mr-2"
                />
                Smoking allowed
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={form.eventsAllowed}
                  onChange={(e) =>
                    setField('eventsAllowed', e.target.checked)
                  }
                  className="mr-2"
                />
                Events allowed
              </label>
            </div>
          </div>
        </section>

        <section className="rounded-[34px] border border-[#E8DED0] bg-white p-8 shadow-[0_18px_50px_rgba(31,35,40,0.06)] sm:p-10">
          <div className="text-xs uppercase tracking-[0.24em] text-[#8A7660]">
            Amenities
          </div>

          <h2 className="mt-3 font-serif text-4xl text-[#1F2328]">
            Listing amenities
          </h2>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {AMENITIES.map((amenity) => (
              <label
                key={amenity.amenityKey}
                className={`rounded-[20px] border px-4 py-4 text-sm transition ${
                  selectedAmenities.includes(amenity.amenityKey)
                    ? 'border-[#1F2328] bg-[#1F2328] text-white'
                    : 'border-[#E8DED0] bg-white text-[#1F2328]'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedAmenities.includes(amenity.amenityKey)}
                  onChange={() => toggleAmenity(amenity.amenityKey)}
                  className="mr-3"
                />
                {amenity.amenityLabel}
              </label>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={updateMutation.isPending}
              className="rounded-full bg-[#1F2328] px-6 py-4 text-sm font-medium text-white disabled:opacity-60"
            >
              {updateMutation.isPending ? 'Saving...' : 'Save property updates'}
            </button>

            <button
              type="button"
              onClick={() => void handleSubmitForReview()}
              disabled={submitForReviewMutation.isPending}
              className="rounded-full border border-[#1F2328] px-6 py-4 text-sm font-medium disabled:opacity-60"
            >
              {submitForReviewMutation.isPending
                ? 'Submitting...'
                : 'Submit for admin review'}
            </button>
          </div>

          {submitMessage ? (
            <div className="mt-4 rounded-[18px] bg-green-50 px-4 py-3 text-sm text-green-700">
              {submitMessage}
            </div>
          ) : null}

          {submitError ? (
            <div className="mt-4 rounded-[18px] bg-red-50 px-4 py-3 text-sm text-red-700">
              {submitError}
            </div>
          ) : null}
        </section>

        <PropertyMediaManager
          propertyId={propertyId}
          initialImages={data.images ?? []}
        />

        <section className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[34px] border border-[#E8DED0] bg-white p-8 shadow-[0_18px_50px_rgba(31,35,40,0.06)] sm:p-10">
            <div className="text-xs uppercase tracking-[0.24em] text-[#8A7660]">
              Availability management
            </div>

            <h2 className="mt-3 font-serif text-4xl text-[#1F2328]">
              Add an availability block
            </h2>

            <div className="mt-8 grid gap-5">
              <input
                type="date"
                value={availabilityForm.startDate}
                onChange={(e) =>
                  setAvailabilityForm((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
                className={inputClass}
              />

              <input
                type="date"
                value={availabilityForm.endDate}
                onChange={(e) =>
                  setAvailabilityForm((prev) => ({
                    ...prev,
                    endDate: e.target.value,
                  }))
                }
                className={inputClass}
              />

              <select
                value={availabilityForm.blockType}
                onChange={(e) =>
                  setAvailabilityForm((prev) => ({
                    ...prev,
                    blockType: e.target.value,
                  }))
                }
                className={inputClass}
              >
                <option value="BLOCKED">Blocked</option>
                <option value="AVAILABLE">Available</option>
                <option value="RESERVED">Reserved</option>
              </select>

              <textarea
                value={availabilityForm.reason}
                onChange={(e) =>
                  setAvailabilityForm((prev) => ({
                    ...prev,
                    reason: e.target.value,
                  }))
                }
                placeholder="Reason (optional)"
                className={`min-h-[120px] ${textareaClass}`}
              />
            </div>

            <button
              type="button"
              onClick={() => void handleAvailabilitySave()}
              disabled={updateAvailabilityMutation.isPending}
              className="mt-6 rounded-full bg-[#1F2328] px-6 py-4 text-sm font-medium text-white disabled:opacity-60"
            >
              {updateAvailabilityMutation.isPending
                ? 'Saving...'
                : 'Save availability'}
            </button>
          </div>

          <div className="rounded-[34px] border border-[#E8DED0] bg-white p-8 shadow-[0_18px_50px_rgba(31,35,40,0.06)] sm:p-10">
            <div className="text-xs uppercase tracking-[0.24em] text-[#8A7660]">
              Existing blocks
            </div>

            <h2 className="mt-3 font-serif text-4xl text-[#1F2328]">
              Availability timeline
            </h2>

            {availabilityLoading ? (
              <div className="mt-6 space-y-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-24 animate-pulse rounded-[22px] bg-[#F6F1EA]"
                  />
                ))}
              </div>
            ) : null}

            {availabilityError ? (
              <div className="mt-6 rounded-[18px] bg-red-50 px-4 py-3 text-sm text-red-700">
                Failed to load availability blocks.
              </div>
            ) : null}

            {!availabilityLoading &&
            !availabilityError &&
            (availability ?? []).length === 0 ? (
              <div className="mt-6 rounded-[22px] border border-[#E8DED0] bg-[#FCFBF9] px-5 py-6 text-sm text-[#6B645C]">
                No availability blocks have been created yet.
              </div>
            ) : null}

            <div className="mt-6 space-y-4">
              {(availability ?? []).map((block: any) => (
                <div
                  key={block.id}
                  className="rounded-[24px] border border-[#E8DED0] bg-[#FCFBF9] p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-medium text-[#1F2328]">
                        {new Date(block.startDate).toLocaleDateString()} —{' '}
                        {new Date(block.endDate).toLocaleDateString()}
                      </div>

                      {block.reason ? (
                        <div className="mt-2 text-sm text-[#6B645C]">
                          {block.reason}
                        </div>
                      ) : null}
                    </div>

                    <div className="rounded-full bg-white px-3 py-1 text-xs uppercase tracking-[0.18em] text-[#7C6B58] shadow-sm">
                      {block.blockType}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
'use client';

import Link from 'next/link';
import { FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateHostProperty } from '@/hooks/use-host';
import { http } from '@/lib/api/http';
import { CountrySelect } from '@/components/forms/country-select';

const inputClass =
  'rounded-[20px] border border-[#E7DED1] bg-white px-4 py-4 outline-none transition focus:border-[#CDB89C]';

const textareaClass =
  'rounded-[20px] border border-[#E7DED1] bg-white px-4 py-4 outline-none transition focus:border-[#CDB89C]';

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

const initialForm = {
  title: '',
  slug: '',
  shortDescription: '',
  longDescription: '',
  propertyType: 'Villa',
  basePricePerNight: '180',
  cleaningFee: '35',
  serviceFee: '20',
  maxGuests: '2',
  bedrooms: '1',
  bathrooms: '1',
  country: 'Greece',
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

type HostPropertyForm = typeof initialForm;

export default function NewHostPropertyPage() {
  const router = useRouter();
  const createMutation = useCreateHostProperty();

  const [form, setForm] = useState<HostPropertyForm>(initialForm);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(['wifi']);
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const selectedAmenityObjects = useMemo(
    () =>
      AMENITIES.filter((item) => selectedAmenities.includes(item.amenityKey)),
    [selectedAmenities],
  );

  const setField = (key: keyof HostPropertyForm, value: string | boolean) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [key]: '',
    }));

    setError('');
  };

  const toggleAmenity = (key: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(key)
        ? prev.filter((item) => item !== key)
        : [...prev, key],
    );

    setErrors((prev) => ({
      ...prev,
      amenities: '',
    }));
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!form.title.trim()) nextErrors.title = 'Title is required.';
    if (!form.slug.trim()) nextErrors.slug = 'Slug is required.';
    if (!form.shortDescription.trim()) {
      nextErrors.shortDescription = 'Short description is required.';
    }
    if (!form.longDescription.trim()) {
      nextErrors.longDescription = 'Long description is required.';
    }
    if (!form.propertyType.trim()) {
      nextErrors.propertyType = 'Property type is required.';
    }
    if (!form.country.trim()) nextErrors.country = 'Country is required.';
    if (!form.city.trim()) nextErrors.city = 'City is required.';

    if (Number(form.basePricePerNight) <= 0) {
      nextErrors.basePricePerNight = 'Base price must be greater than 0.';
    }
    if (Number(form.maxGuests) < 1) {
      nextErrors.maxGuests = 'Maximum guests must be at least 1.';
    }
    if (Number(form.bedrooms) < 0) {
      nextErrors.bedrooms = 'Bedrooms cannot be negative.';
    }
    if (Number(form.bathrooms) < 0) {
      nextErrors.bathrooms = 'Bathrooms cannot be negative.';
    }
    if (!selectedAmenityObjects.length) {
      nextErrors.amenities = 'Select at least one amenity.';
    }

    const invalidFile = files.find((file) => !file.type.startsWith('image/'));

    if (invalidFile) {
      nextErrors.files = 'Only image files are allowed.';
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const uploadInitialImages = async (propertyId: string) => {
    for (const [index, file] of files.entries()) {
      const { data: uploadData } = await http.post('/media/upload-url', {
        propertyId,
        fileName: file.name,
        contentType: file.type,
        sizeBytes: file.size,
      });

      await fetch(uploadData.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      await http.post('/media/finalize', {
        propertyId,
        storageKey: uploadData.storageKey,
        url: uploadData.publicUrl,
        mimeType: file.type,
        sizeBytes: file.size,
        altText: `${form.title} image ${index + 1}`,
        isCover: index === 0,
        sortOrder: index,
      });
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError('');

    if (!validate()) {
      setError('Please fix the highlighted fields and try again.');
      return;
    }

    try {
      const created: any = await createMutation.mutateAsync({
        title: form.title.trim(),
        slug: form.slug.trim(),
        shortDescription: form.shortDescription.trim(),
        longDescription: form.longDescription.trim(),
        propertyType: form.propertyType,
        basePricePerNight: Number(form.basePricePerNight),
        cleaningFee: Number(form.cleaningFee || 0),
        serviceFee: Number(form.serviceFee || 0),
        maxGuests: Number(form.maxGuests),
        bedrooms: Number(form.bedrooms || 0),
        bathrooms: Number(form.bathrooms || 0),
        location: {
          country: form.country,
          city: form.city,
          region: form.region || undefined,
          addressLine: form.addressLine || undefined,
        },
        amenities: selectedAmenityObjects,
        images: [],
        rules: {
          checkInTime: form.checkInTime,
          checkOutTime: form.checkOutTime,
          cancellationPolicy: form.cancellationPolicy,
          petsAllowed: form.petsAllowed,
          smokingAllowed: form.smokingAllowed,
          eventsAllowed: form.eventsAllowed,
          extraNotes: form.extraNotes || undefined,
        },
      });

      if (files.length) {
        setUploading(true);
        await uploadInitialImages(created.id);
      }

      router.push(`/host/properties/${created.id}`);
    } catch (err: any) {
      const apiMessage = err?.response?.data?.message;

      setError(
        Array.isArray(apiMessage)
          ? apiMessage.join(' ')
          : apiMessage ??
              'Property creation failed. Please review the form and try again.',
      );
    } finally {
      setUploading(false);
    }
  };

  const fieldError = (key: string) =>
    errors[key] ? (
      <p className="mt-2 text-xs leading-5 text-red-600">{errors[key]}</p>
    ) : null;

  return (
    <div className="min-h-screen bg-white px-4 py-12">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-[34px] border border-[#E8DED0] bg-white p-8 shadow-[0_18px_50px_rgba(31,35,40,0.06)] sm:p-10">
          <div className="text-xs uppercase tracking-[0.24em] text-[#8A7660]">
            New listing
          </div>

          <h1 className="mt-3 font-serif text-5xl text-[#1F2328]">
            Create property
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-8 text-[#5F5A53]">
            Create a complete draft with location, amenities, rules and initial
            images. Images are uploaded immediately after the draft is created.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/host/properties"
              className="rounded-full border border-[#1F2328] px-4 py-2 text-sm transition hover:bg-[#1F2328] hover:text-white"
            >
              Back to properties
            </Link>
          </div>

          {error ? (
            <div className="mt-6 rounded-[18px] bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}
        </section>

        <form onSubmit={handleSubmit} className="space-y-8">
          <section className="rounded-[34px] border border-[#E8DED0] bg-white p-8 shadow-[0_18px_50px_rgba(31,35,40,0.06)] sm:p-10">
            <h2 className="text-3xl font-semibold text-[#1F2328]">
              Basic details
            </h2>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div>
                <input
                  value={form.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    setForm((prev) => ({
                      ...prev,
                      title,
                      slug:
                        prev.slug ||
                        title
                          .toLowerCase()
                          .trim()
                          .replace(/[^a-z0-9-]+/g, '-')
                          .replace(/-+/g, '-'),
                    }));
                  }}
                  placeholder="Title *"
                  className={`${inputClass} w-full ${
                    errors.title ? 'border-red-300 bg-red-50' : ''
                  }`}
                />
                {fieldError('title')}
              </div>

              <div>
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
                  placeholder="Slug *"
                  className={`${inputClass} w-full ${
                    errors.slug ? 'border-red-300 bg-red-50' : ''
                  }`}
                />
                {fieldError('slug')}
              </div>

              <div>
                <select
                  value={form.propertyType}
                  onChange={(e) => setField('propertyType', e.target.value)}
                  className={`${inputClass} w-full ${
                    errors.propertyType ? 'border-red-300 bg-red-50' : ''
                  }`}
                >
                  <option value="Villa">Villa</option>
                  <option value="Apartment">Apartment</option>
                  <option value="House">House</option>
                  <option value="Suite">Suite</option>
                  <option value="Loft">Loft</option>
                  <option value="Maisonette">Maisonette</option>
                  <option value="Estate">Estate</option>
                </select>
                {fieldError('propertyType')}
              </div>

              <div>
                <input
                  value={form.basePricePerNight}
                  onChange={(e) =>
                    setField('basePricePerNight', e.target.value)
                  }
                  placeholder="Base price per night *"
                  type="number"
                  min="1"
                  className={`${inputClass} w-full ${
                    errors.basePricePerNight ? 'border-red-300 bg-red-50' : ''
                  }`}
                />
                {fieldError('basePricePerNight')}
              </div>

              <input
                value={form.cleaningFee}
                onChange={(e) => setField('cleaningFee', e.target.value)}
                placeholder="Cleaning fee"
                type="number"
                min="0"
                className={inputClass}
              />

              <input
                value={form.serviceFee}
                onChange={(e) => setField('serviceFee', e.target.value)}
                placeholder="Service fee"
                type="number"
                min="0"
                className={inputClass}
              />

              <div>
                <input
                  value={form.maxGuests}
                  onChange={(e) => setField('maxGuests', e.target.value)}
                  placeholder="Max guests *"
                  type="number"
                  min="1"
                  className={`${inputClass} w-full ${
                    errors.maxGuests ? 'border-red-300 bg-red-50' : ''
                  }`}
                />
                {fieldError('maxGuests')}
              </div>

              <input
                value={form.bedrooms}
                onChange={(e) => setField('bedrooms', e.target.value)}
                placeholder="Bedrooms"
                type="number"
                min="0"
                className={inputClass}
              />

              <input
                value={form.bathrooms}
                onChange={(e) => setField('bathrooms', e.target.value)}
                placeholder="Bathrooms"
                type="number"
                min="0"
                className={inputClass}
              />

              <div className="md:col-span-2">
                <textarea
                  value={form.shortDescription}
                  onChange={(e) =>
                    setField('shortDescription', e.target.value)
                  }
                  placeholder="Short description *"
                  className={`min-h-[110px] w-full ${textareaClass} ${
                    errors.shortDescription ? 'border-red-300 bg-red-50' : ''
                  }`}
                />
                {fieldError('shortDescription')}
              </div>

              <div className="md:col-span-2">
                <textarea
                  value={form.longDescription}
                  onChange={(e) =>
                    setField('longDescription', e.target.value)
                  }
                  placeholder="Long description *"
                  className={`min-h-[180px] w-full ${textareaClass} ${
                    errors.longDescription ? 'border-red-300 bg-red-50' : ''
                  }`}
                />
                {fieldError('longDescription')}
              </div>
            </div>
          </section>

          <section className="rounded-[34px] border border-[#E8DED0] bg-white p-8 shadow-[0_18px_50px_rgba(31,35,40,0.06)] sm:p-10">
            <h2 className="text-3xl font-semibold text-[#1F2328]">
              Location
            </h2>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div>
                <CountrySelect
                  value={form.country}
                  onChange={(value) => setField('country', value)}
                  className={`${inputClass} w-full ${
                    errors.country ? 'border-red-300 bg-red-50' : ''
                  }`}
                  placeholder="Property country *"
                  required
                />
                {fieldError('country')}
              </div>

              <div>
                <input
                  value={form.city}
                  onChange={(e) => setField('city', e.target.value)}
                  placeholder="City *"
                  className={`${inputClass} w-full ${
                    errors.city ? 'border-red-300 bg-red-50' : ''
                  }`}
                />
                {fieldError('city')}
              </div>

              <input
                value={form.region}
                onChange={(e) => setField('region', e.target.value)}
                placeholder="Region / island"
                className={inputClass}
              />

              <input
                value={form.addressLine}
                onChange={(e) => setField('addressLine', e.target.value)}
                placeholder="Address line"
                className={inputClass}
              />
            </div>
          </section>

          <section className="rounded-[34px] border border-[#E8DED0] bg-white p-8 shadow-[0_18px_50px_rgba(31,35,40,0.06)] sm:p-10">
            <h2 className="text-3xl font-semibold text-[#1F2328]">
              Amenities
            </h2>

            <p className="mt-3 text-sm leading-7 text-[#5F5A53]">
              Select the amenities that should be visible on the listing.
            </p>

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

            {fieldError('amenities')}
          </section>

          <section className="rounded-[34px] border border-[#E8DED0] bg-white p-8 shadow-[0_18px_50px_rgba(31,35,40,0.06)] sm:p-10">
            <h2 className="text-3xl font-semibold text-[#1F2328]">
              Initial images
            </h2>

            <p className="mt-3 text-sm leading-7 text-[#5F5A53]">
              Choose initial gallery images. The first selected image becomes
              the cover image.
            </p>

            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(event) =>
                setFiles(Array.from(event.target.files ?? []))
              }
              className="mt-6 block w-full rounded-[20px] border border-[#E7DED1] bg-white px-4 py-4"
            />

            {files.length ? (
              <div className="mt-4 rounded-[20px] bg-[#FCFBF9] px-4 py-3 text-sm text-[#5F5A53]">
                Selected files: {files.map((file) => file.name).join(', ')}
              </div>
            ) : null}

            {fieldError('files')}
          </section>

          <section className="rounded-[34px] border border-[#E8DED0] bg-white p-8 shadow-[0_18px_50px_rgba(31,35,40,0.06)] sm:p-10">
            <h2 className="text-3xl font-semibold text-[#1F2328]">
              Rules
            </h2>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <input
                value={form.checkInTime}
                onChange={(e) => setField('checkInTime', e.target.value)}
                placeholder="Check-in time"
                className={inputClass}
              />

              <input
                value={form.checkOutTime}
                onChange={(e) => setField('checkOutTime', e.target.value)}
                placeholder="Check-out time"
                className={inputClass}
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
                placeholder="Extra rules / notes"
                className={`min-h-[110px] ${textareaClass}`}
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
          </section>

          <button
            type="submit"
            disabled={createMutation.isPending || uploading}
            className="rounded-full bg-[#1F2328] px-8 py-4 text-sm font-medium text-white transition hover:bg-[#343A42] disabled:opacity-60"
          >
            {createMutation.isPending || uploading
              ? 'Creating and uploading...'
              : 'Create property'}
          </button>
        </form>
      </div>
    </div>
  );
}
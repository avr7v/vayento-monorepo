'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  useDeleteHostProperty,
  useHostProperties,
} from '@/hooks/use-host';

function money(value: number | string | null | undefined) {
  return `€${Number(value ?? 0).toFixed(2)}`;
}

export default function HostPropertiesPage() {
  const { data, isLoading, isError } = useHostProperties();
  const deleteMutation = useDeleteHostProperty();

  const [statusFilter, setStatusFilter] = useState('');
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');

  const properties = useMemo(() => {
    return (data ?? []).filter((property: any) => {
      const matchesStatus = statusFilter
        ? property.status === statusFilter
        : true;

      const q = query.trim().toLowerCase();

      const matchesQuery = q
        ? `${property.title} ${property.location?.city ?? ''} ${
            property.location?.country ?? ''
          }`
            .toLowerCase()
            .includes(q)
        : true;

      return matchesStatus && matchesQuery;
    });
  }, [data, query, statusFilter]);

  const handleDelete = async (propertyId: string) => {
    setError('');

    if (!confirm('Delete this property? This cannot be undone.')) return;

    try {
      await deleteMutation.mutateAsync(propertyId);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          'Could not delete property. Please try again.',
      );
    }
  };

  return (
    <div className="min-h-screen bg-white px-4 py-12">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-[34px] border border-[#E8DED0] bg-white p-8 shadow-[0_18px_50px_rgba(31,35,40,0.06)] sm:p-10">
          <div className="text-xs uppercase tracking-[0.24em] text-[#8A7660]">
            Host properties
          </div>

          <h1 className="mt-3 font-serif text-5xl text-[#1F2328]">
            Your listings
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-8 text-[#5F5A53]">
            Manage drafts, review queue listings and published properties.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/host"
              className="rounded-full border border-[#1F2328] px-4 py-2 text-sm transition hover:bg-[#1F2328] hover:text-white"
            >
              Back to dashboard
            </Link>

            <Link
              href="/host/properties/new"
              className="rounded-full bg-[#1F2328] px-4 py-2 text-sm text-white transition hover:bg-[#343A42]"
            >
              Create property
            </Link>
          </div>

          {error ? (
            <div className="mt-6 rounded-[18px] bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title or location"
              className="rounded-[20px] border border-[#E7DED1] bg-white px-4 py-4 outline-none md:col-span-2"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-[20px] border border-[#E7DED1] bg-white px-4 py-4 outline-none"
            >
              <option value="">All statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="REVIEW">Review</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </section>

        {isError ? (
          <div className="rounded-[18px] bg-red-50 px-4 py-3 text-sm text-red-700">
            Failed to load host properties.
          </div>
        ) : null}

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {isLoading
            ? Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[280px] animate-pulse rounded-[30px] border border-[#E8DED0] bg-[#FCFBF9]"
                />
              ))
            : properties.map((property: any) => {
                const cover =
                  property.images?.find((image: any) => image.isCover) ??
                  property.images?.[0];

                return (
                  <article
                    key={property.id}
                    className="overflow-hidden rounded-[30px] border border-[#E8DED0] bg-white shadow-[0_18px_50px_rgba(31,35,40,0.06)]"
                  >
                    <div className="aspect-[4/3] bg-[#F1E8DC]">
                      {cover ? (
                        <img
                          src={cover.url}
                          alt={cover.altText || property.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-[#8A7660]">
                          No image yet
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <div className="text-xs uppercase tracking-[0.2em] text-[#8A7660]">
                        {property.status}
                      </div>

                      <h2 className="mt-3 text-2xl font-semibold text-[#1F2328]">
                        {property.title}
                      </h2>

                      <p className="mt-2 text-sm text-[#5F5A53]">
                        {property.location?.city ?? 'No city'},{' '}
                        {property.location?.country ?? 'No country'}
                      </p>

                      <p className="mt-3 text-sm font-medium text-[#1F2328]">
                        {money(property.basePricePerNight)}/night ·{' '}
                        {property.maxGuests} guests
                      </p>

                      <div className="mt-5 flex flex-wrap gap-3">
                        <Link
                          href={`/host/properties/${property.id}`}
                          className="rounded-full border border-[#1F2328] px-4 py-2 text-sm transition hover:bg-[#1F2328] hover:text-white"
                        >
                          Edit
                        </Link>

                        <button
                          type="button"
                          onClick={() => void handleDelete(property.id)}
                          disabled={deleteMutation.isPending}
                          className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 disabled:opacity-60"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
        </section>

        {!isLoading && properties.length === 0 ? (
          <div className="rounded-[28px] border border-[#E8DED0] bg-[#FCFBF9] px-6 py-10 text-center text-sm text-[#5F5A53]">
            No properties found.
          </div>
        ) : null}
      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { useProperties } from '@/hooks/use-properties';
import { PropertyCard } from '@/components/property/property-card';
import { buildPropertyFilters } from '@/lib/utils/property-filters';
import { CountrySelect } from '@/components/forms/country-select';

export default function PropertiesPage() {
  const [q, setQ] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [guests, setGuests] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [sortBy, setSortBy] = useState<
    'newest' | 'price_asc' | 'price_desc' | 'rating_desc'
  >('newest');
  const [page, setPage] = useState(1);

  const inputClass =
    'rounded-[20px] border border-[#E7DED1] bg-white px-4 py-4 outline-none';

  const filters = buildPropertyFilters({
    q,
    city,
    country,
    guests: guests ? Number(guests) : undefined,
    minPrice,
    maxPrice,
    propertyType,
    checkInDate,
    checkOutDate,
    sortBy,
    page,
  });

  const { data, isLoading, isError, error } = useProperties(filters);

  const clearFilters = () => {
    setQ('');
    setCity('');
    setCountry('');
    setGuests('');
    setMinPrice('');
    setMaxPrice('');
    setPropertyType('');
    setCheckInDate('');
    setCheckOutDate('');
    setSortBy('newest');
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-white px-4 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-[34px] border border-[#E8DED0] bg-white p-8 shadow-[0_18px_50px_rgba(31,35,40,0.06)]">
          <div className="text-xs uppercase tracking-[0.24em] text-[#8A7660]">
            Curated stays
          </div>

          <h1 className="mt-3 text-5xl font-semibold text-[#1F2328]">
            Find your next stay
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-8 text-[#5F5A53]">
            Search by destination, dates, guests, price range and property type.
            Availability filters now exclude blocked, reserved and active booking
            dates.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              className={inputClass}
              placeholder="Keyword"
            />

            <input
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                setPage(1);
              }}
              className={inputClass}
              placeholder="City"
            />

            <CountrySelect
              value={country}
              onChange={(value) => {
                setCountry(value);
                setPage(1);
              }}
              className={inputClass}
              placeholder="Any country"
            />

            <input
              value={guests}
              onChange={(e) => {
                setGuests(e.target.value);
                setPage(1);
              }}
              className={inputClass}
              placeholder="Guests"
              type="number"
              min="1"
            />

            <input
              value={checkInDate}
              onChange={(e) => {
                setCheckInDate(e.target.value);
                setPage(1);
              }}
              className={inputClass}
              type="date"
            />

            <input
              value={checkOutDate}
              onChange={(e) => {
                setCheckOutDate(e.target.value);
                setPage(1);
              }}
              className={inputClass}
              type="date"
            />

            <input
              value={minPrice}
              onChange={(e) => {
                setMinPrice(e.target.value);
                setPage(1);
              }}
              className={inputClass}
              placeholder="Min price"
              type="number"
              min="0"
            />

            <input
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(e.target.value);
                setPage(1);
              }}
              className={inputClass}
              placeholder="Max price"
              type="number"
              min="0"
            />

            <select
              value={propertyType}
              onChange={(e) => {
                setPropertyType(e.target.value);
                setPage(1);
              }}
              className={inputClass}
            >
              <option value="">Any property type</option>
              <option value="Villa">Villa</option>
              <option value="Apartment">Apartment</option>
              <option value="House">House</option>
              <option value="Suite">Suite</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as any);
                setPage(1);
              }}
              className={inputClass}
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price low to high</option>
              <option value="price_desc">Price high to low</option>
              <option value="rating_desc">Top rated</option>
            </select>

            <button
              type="button"
              onClick={clearFilters}
              className="rounded-full border border-[#1F2328] bg-white px-5 py-3 text-sm transition hover:bg-[#1F2328] hover:text-white md:col-span-2"
            >
              Clear filters
            </button>
          </div>
        </div>

        {isError ? (
          <div className="mt-6 rounded-[18px] bg-red-50 px-4 py-3 text-sm text-red-700">
            {(error as any)?.response?.data?.message ??
              'Failed to load properties.'}
          </div>
        ) : null}

        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[420px] animate-pulse rounded-[28px] border border-[#E8DED0] bg-white shadow-[0_18px_50px_rgba(31,35,40,0.06)]"
                />
              ))
            : data?.items?.map((property) => (
                <div
                  key={property.id}
                  className="overflow-hidden rounded-[28px] border border-[#E8DED0] bg-white shadow-[0_18px_50px_rgba(31,35,40,0.06)]"
                >
                  <PropertyCard property={property} />
                </div>
              ))}
        </div>

        {!isLoading && data?.items?.length === 0 ? (
          <div className="mt-8 rounded-[24px] border border-[#E8DED0] bg-white px-6 py-10 text-center text-sm text-[#5F5A53] shadow-[0_18px_50px_rgba(31,35,40,0.04)]">
            No properties found with the selected filters.
          </div>
        ) : null}

        {data?.meta ? (
          <div className="mt-10 flex items-center justify-center gap-4 text-sm text-[#5F5A53]">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-full border border-[#D9C7B0] bg-white px-5 py-3 disabled:opacity-50"
            >
              Previous
            </button>

            <span>
              Page {data.meta.page} of {data.meta.totalPages || 1}
            </span>

            <button
              type="button"
              disabled={page >= data.meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-full border border-[#D9C7B0] bg-white px-5 py-3 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
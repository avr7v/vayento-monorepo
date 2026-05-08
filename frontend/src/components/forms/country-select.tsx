'use client';

import { useCountries } from '@/hooks/use-metadata';

interface CountrySelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  required?: boolean;
}

const fallbackCountries = ['Greece', 'Italy', 'France', 'Spain', 'Portugal', 'Cyprus', 'Germany', 'United Kingdom', 'United States'];

export function CountrySelect({ value, onChange, className = '', placeholder = 'Select country', required }: CountrySelectProps) {
  const { data, isLoading } = useCountries();
  const countries = data?.length ? data.map((item) => item.name) : fallbackCountries;

  return (
    <select
      value={value}
      required={required}
      onChange={(event) => onChange(event.target.value)}
      className={className || 'rounded-[20px] border border-[#E7DED1] bg-white px-4 py-4 outline-none'}
    >
      <option value="">{isLoading ? 'Loading countries...' : placeholder}</option>
      {countries.map((country) => (
        <option key={country} value={country}>{country}</option>
      ))}
    </select>
  );
}

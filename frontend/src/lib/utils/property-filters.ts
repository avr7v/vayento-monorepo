import { PropertySearchParams } from '@/types/property.types';

export function buildPropertyFilters(params: { q?: string; city?: string; guests?: number; minPrice?: string; maxPrice?: string; propertyType?: string; country?: string; sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'rating_desc'; checkInDate?: string; checkOutDate?: string; page?: number; }): PropertySearchParams {
  return {
    q: params.q || undefined,
    city: params.city || undefined,
    country: params.country || undefined,
    guests: params.guests || undefined,
    minPrice: params.minPrice || undefined,
    maxPrice: params.maxPrice || undefined,
    propertyType: params.propertyType || undefined,
    sortBy: params.sortBy || undefined,
    checkInDate: params.checkInDate || undefined,
    checkOutDate: params.checkOutDate || undefined,
    page: params.page || 1,
    limit: 12,
  };
}

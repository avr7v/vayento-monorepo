'use client';

import { useQuery } from '@tanstack/react-query';
import { propertiesService } from '@/lib/api/properties.service';
import { PropertySearchParams } from '@/types/property.types';

export function useFeaturedProperties() {
  return useQuery({ queryKey: ['featured-properties'], queryFn: propertiesService.getFeatured });
}

export function useProperties(params: PropertySearchParams) {
  return useQuery({ queryKey: ['properties', params], queryFn: () => propertiesService.getAll(params) });
}

export function useProperty(slug: string) {
  return useQuery({ queryKey: ['property', slug], queryFn: () => propertiesService.getBySlug(slug), enabled: !!slug });
}

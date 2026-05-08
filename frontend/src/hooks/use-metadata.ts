'use client';

import { useQuery } from '@tanstack/react-query';
import { metadataService } from '@/lib/api/metadata.service';

export function useCountries() {
  return useQuery({ queryKey: ['metadata-countries'], queryFn: metadataService.getCountries, staleTime: 24 * 60 * 60 * 1000 });
}

'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { reviewsService } from '@/lib/api/reviews.service';

export function usePropertyReviews(propertyId: string) {
  return useQuery({
    queryKey: ['property-reviews', propertyId],
    queryFn: () => reviewsService.getPublishedByProperty(propertyId),
    enabled: !!propertyId,
  });
}

export function useCreateReview(propertyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reviewsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-reviews', propertyId] });
      queryClient.invalidateQueries({ queryKey: ['property', propertyId] });
    },
  });
}

export function useEligibleReviewBookings() {
  return useQuery({
    queryKey: ['eligible-review-bookings'],
    queryFn: reviewsService.getEligibleBookings,
  });
}

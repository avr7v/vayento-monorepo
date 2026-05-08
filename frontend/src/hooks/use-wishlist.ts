'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { wishlistService } from '@/lib/api/wishlist.service';

export function useWishlist() { return useQuery({ queryKey: ['my-wishlist'], queryFn: wishlistService.getMine }); }
export function useAddToWishlist() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: wishlistService.add, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-wishlist'] }) });
}
export function useRemoveFromWishlist() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: wishlistService.remove, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-wishlist'] }) });
}

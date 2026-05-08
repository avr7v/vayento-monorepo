'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bookingsService } from '@/lib/api/bookings.service';
import { userBookingsService } from '@/lib/api/user-bookings.service';

export function useBookingQuote() { return useMutation({ mutationFn: bookingsService.getQuote }); }
export function useCreateBooking() { return useMutation({ mutationFn: bookingsService.createBooking }); }
export function useCreatePaymentIntent() { return useMutation({ mutationFn: bookingsService.createPaymentIntent }); }
export function useConfirmMockPayment() { return useMutation({ mutationFn: bookingsService.confirmMockPayment }); }
export function useBookingPaymentStatus(bookingId: string | null) { return useQuery({ queryKey: ['booking-payment-status', bookingId], queryFn: () => bookingsService.getPaymentStatus(bookingId as string), enabled: !!bookingId, refetchInterval: 2500 }); }
export function useMyBookings() { return useQuery({ queryKey: ['my-bookings'], queryFn: userBookingsService.getMine }); }
export function useMyBooking(bookingId: string) { return useQuery({ queryKey: ['my-booking', bookingId], queryFn: () => userBookingsService.getOne(bookingId), enabled: !!bookingId }); }
export function useCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: userBookingsService.cancel,
    onSuccess: (_data, bookingId) => {
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['my-booking', bookingId] });
    },
  });
}

'use client';

import { useQuery } from '@tanstack/react-query';
import { paymentsService } from '@/lib/api/payments.service';

export function useMyPayments() {
  return useQuery({
    queryKey: ['my-payments'],
    queryFn: paymentsService.getMine,
  });
}

export function useMyPayment(paymentId: string) {
  return useQuery({
    queryKey: ['my-payment', paymentId],
    queryFn: () => paymentsService.getOne(paymentId),
    enabled: !!paymentId,
  });
}

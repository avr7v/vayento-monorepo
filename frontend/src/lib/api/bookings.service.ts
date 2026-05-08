import { http } from './http';
import { BookingQuotePayload, CreateBookingPayload, CreatePaymentIntentPayload, CreatePaymentIntentResponse } from '@/types/booking.types';

export const bookingsService = {
  async getQuote(payload: BookingQuotePayload) { const { data } = await http.post('/bookings/quote', payload); return data; },
  async createBooking(payload: CreateBookingPayload) { const { data } = await http.post('/bookings', payload); return data; },
  async createPaymentIntent(payload: CreatePaymentIntentPayload) { const { data } = await http.post<CreatePaymentIntentResponse>('/payments/create-intent', payload); return data; },
  async confirmMockPayment(bookingId: string) { const { data } = await http.post(`/payments/mock-confirm/${bookingId}`); return data; },
  async getPaymentStatus(bookingId: string) { const { data } = await http.get(`/bookings/${bookingId}/payment-status`); return data; },
};

import { http } from './http';

export const userBookingsService = {
  async getMine() { const { data } = await http.get('/users/me/bookings'); return data; },
  async getOne(bookingId: string) { const { data } = await http.get(`/users/me/bookings/${bookingId}`); return data; },
  async cancel(bookingId: string) { const { data } = await http.patch(`/users/me/bookings/${bookingId}/cancel`); return data; },
};

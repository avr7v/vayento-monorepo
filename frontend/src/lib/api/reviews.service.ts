import { http } from './http';

export const reviewsService = {
  async getPublishedByProperty(propertyId: string) {
    const { data } = await http.get(`/reviews/property/${propertyId}`);
    return data;
  },
  async create(payload: { propertyId: string; bookingId: string; rating: number; title?: string; comment: string }) {
    const { data } = await http.post('/reviews', payload);
    return data;
  },
  async getEligibleBookings() {
    const { data } = await http.get('/reviews/eligible-bookings');
    return data;
  },
};

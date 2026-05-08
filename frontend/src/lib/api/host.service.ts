import { http } from './http';

export const hostService = {
  async getDashboard() { const { data } = await http.get('/host/dashboard'); return data; },
  async getProperties() { const { data } = await http.get('/host/properties'); return data; },
  async getProperty(id: string) { const { data } = await http.get(`/host/properties/${id}`); return data; },
  async createProperty(payload: unknown) { const { data } = await http.post('/host/properties', payload); return data; },
  async updateProperty(id: string, payload: unknown) { const { data } = await http.patch(`/host/properties/${id}`, payload); return data; },
  async submitPropertyForReview(id: string) { const { data } = await http.patch(`/host/properties/${id}/submit-review`); return data; },
  async deleteProperty(id: string) { const { data } = await http.delete(`/host/properties/${id}`); return data; },
  async getAvailability(propertyId: string) { const { data } = await http.get(`/host/properties/${propertyId}/availability`); return data; },
  async updateAvailability(propertyId: string, payload: unknown) { const { data } = await http.patch(`/host/properties/${propertyId}/availability`, payload); return data; },
  async getBookings() { const { data } = await http.get('/host/bookings'); return data; },
  async getBooking(id: string) { const { data } = await http.get(`/host/bookings/${id}`); return data; },
  async updateBookingStatus(id: string, payload: unknown) { const { data } = await http.patch(`/host/bookings/${id}/status`, payload); return data; },
  async getEarningsSummary() { const { data } = await http.get('/host/earnings/summary'); return data; },
  async getEarningsBookings() { const { data } = await http.get('/host/earnings/bookings'); return data; },
};

import { http } from './http';

export const wishlistService = {
  async getMine() { const { data } = await http.get('/users/me/wishlist'); return data; },
  async add(propertyId: string) { const { data } = await http.post(`/users/me/wishlist/${propertyId}`); return data; },
  async remove(propertyId: string) { const { data } = await http.delete(`/users/me/wishlist/${propertyId}`); return data; },
};

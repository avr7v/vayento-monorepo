import { http } from './http';
import { PaginatedProperties, PropertySearchParams } from '@/types/property.types';

export const propertiesService = {
  async getAll(params?: PropertySearchParams) { const { data } = await http.get<PaginatedProperties>('/properties', { params }); return data; },
  async getFeatured() { const { data } = await http.get('/properties/featured'); return data; },
  async getBySlug(slug: string) { const { data } = await http.get(`/properties/${slug}`); return data; },
};

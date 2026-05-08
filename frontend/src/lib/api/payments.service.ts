import { http } from './http';

export const paymentsService = {
  async getMine() {
    const { data } = await http.get('/payments/me');
    return data;
  },
  async getOne(id: string) {
    const { data } = await http.get(`/payments/${id}`);
    return data;
  },
};

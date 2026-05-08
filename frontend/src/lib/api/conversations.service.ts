import { http } from './http';

export const conversationsService = {
  async getMine() {
    const { data } = await http.get('/conversations');
    return data;
  },
  async getMessages(conversationId: string) {
    const { data } = await http.get(`/conversations/${conversationId}/messages`);
    return data;
  },
  async create(payload: { propertyId?: string; bookingId?: string; recipientUserId?: string; type?: 'INQUIRY' | 'BOOKING' | 'SUPPORT'; message: string }) {
    const { data } = await http.post('/conversations', payload);
    return data;
  },
  async sendMessage(conversationId: string, payload: { body: string }) {
    const { data } = await http.post(`/conversations/${conversationId}/messages`, payload);
    return data;
  },
  async markAsRead(conversationId: string) {
    const { data } = await http.patch(`/conversations/${conversationId}/read`);
    return data;
  },
  async getAdminSupportInbox() {
    const { data } = await http.get('/admin/support-inbox');
    return data;
  },
};

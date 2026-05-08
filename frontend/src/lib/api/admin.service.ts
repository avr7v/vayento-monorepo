import { http } from './http';

export const adminService = {
  async getDashboard() {
    const { data } = await http.get('/admin/dashboard');
    return data;
  },

  async getUsers() {
    const { data } = await http.get('/admin/users');
    return data;
  },

  async createUser(payload: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: 'USER' | 'HOST';
  }) {
    const { data } = await http.post('/admin/users', payload);
    return data;
  },

  async updateUserRole(id: string, role: string) {
    const { data } = await http.patch(`/admin/users/${id}/role`, { role });
    return data;
  },

  async getProperties() {
    const { data } = await http.get('/admin/properties');
    return data;
  },

  async updatePropertyStatus(id: string, status: string) {
    const { data } = await http.patch(`/admin/properties/${id}/status`, {
      status,
    });
    return data;
  },

  async getBookings() {
    const { data } = await http.get('/admin/bookings');
    return data;
  },

  async getPayments() {
    const { data } = await http.get('/admin/payments');
    return data;
  },

  async getPages() {
    const { data } = await http.get('/admin/pages');
    return data;
  },

  async updatePage(id: string, payload: any) {
    const { data } = await http.patch(`/admin/pages/${id}`, payload);
    return data;
  },

  async getBlogPosts() {
    const { data } = await http.get('/admin/blog-posts');
    return data;
  },

  async createBlogPost(payload: {
    title: string;
    slug: string;
    excerpt?: string;
    body: string;
    coverImageUrl?: string;
    metaTitle?: string;
    metaDescription?: string;
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  }) {
    const { data } = await http.post('/admin/blog-posts', payload);
    return data;
  },

  async updateBlogPost(id: string, payload: any) {
    const { data } = await http.patch(`/admin/blog-posts/${id}`, payload);
    return data;
  },

  async deleteBlogPost(id: string) {
    const { data } = await http.delete(`/admin/blog-posts/${id}`);
    return data;
  },

  async getSupportInbox() {
    const { data } = await http.get('/admin/support');
    return data;
  },

  async getAuditLogs() {
    const { data } = await http.get('/admin/audit-logs');
    return data;
  },

  async getReviews() {
    const { data } = await http.get('/admin/reviews');
    return data;
  },

  async updateReviewStatus(id: string, status: string) {
    const { data } = await http.patch(`/admin/reviews/${id}/status`, {
      status,
    });
    return data;
  },

  async getHostLeads() {
    const { data } = await http.get('/admin/host-leads');
    return data;
  },
};
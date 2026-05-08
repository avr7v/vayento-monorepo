import { http } from './http';

export const usersService = {
  async getProfile() {
    const { data } = await http.get('/users/me/profile');
    return data;
  },

  async updateProfile(payload: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    country?: string;
    city?: string;
    addressLine?: string;
    postalCode?: string;
    bio?: string;
    preferredLanguage?: string;
  }) {
    const { data } = await http.patch('/users/me/profile', payload);
    return data;
  },

  async updateEmail(payload: { email: string }) {
    const { data } = await http.patch('/users/me/email', payload);
    return data;
  },

  async changePassword(payload: {
    currentPassword: string;
    newPassword: string;
  }) {
    const { data } = await http.patch('/users/me/password', payload);
    return data;
  },

  async deactivateAccount(payload: {
    password: string;
    reason?: string;
  }) {
    const { data } = await http.delete('/users/me', { data: payload });
    return data;
  },
};
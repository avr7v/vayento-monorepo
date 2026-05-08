import { http } from './http';
import { AuthResponse, LoginPayload, RegisterPayload, ForgotPasswordPayload, ResetPasswordPayload, ResendVerificationPayload } from '@/types/auth.types';

export const authService = {
  async login(payload: LoginPayload) { const { data } = await http.post<AuthResponse>('/auth/login', payload); return data; },
  async register(payload: RegisterPayload) { const { data } = await http.post<AuthResponse>('/auth/register', payload); return data; },
  async refresh(refreshToken: string) { const { data } = await http.post<AuthResponse>('/auth/refresh', { refreshToken }); return data; },
  async logout() { const { data } = await http.post('/auth/logout'); return data; },
  async me() { const { data } = await http.get('/auth/me'); return data; },
  async forgotPassword(payload: ForgotPasswordPayload) { const { data } = await http.post('/auth/forgot-password', payload); return data; },
  async resetPassword(payload: ResetPasswordPayload) { const { data } = await http.post('/auth/reset-password', payload); return data; },
  async verifyEmail(token: string) { const { data } = await http.get(`/auth/verify-email?token=${encodeURIComponent(token)}`); return data; },
  async resendVerification(payload: ResendVerificationPayload) { const { data } = await http.post('/auth/resend-verification', payload); return data; },
};

'use client';

import { useMutation } from '@tanstack/react-query';
import { authService } from '@/lib/api/auth.service';
import { useAuthStore } from '@/store/auth.store';

export function useLogin() {
  const setSession = useAuthStore((state) => state.setSession);
  return useMutation({ mutationFn: authService.login, onSuccess: (data) => { if (data.accessToken) setSession(data); } });
}

export function useRegister() {
  const setSession = useAuthStore((state) => state.setSession);
  return useMutation({ mutationFn: authService.register, onSuccess: (data) => { if (data.accessToken) setSession(data); } });
}

export function useForgotPassword() { return useMutation({ mutationFn: authService.forgotPassword }); }
export function useResetPassword() { return useMutation({ mutationFn: authService.resetPassword }); }
export function useVerifyEmail() { return useMutation({ mutationFn: authService.verifyEmail }); }
export function useResendVerification() { return useMutation({ mutationFn: authService.resendVerification }); }
export function useLogout() { const logout = useAuthStore((state) => state.logout); return useMutation({ mutationFn: authService.logout, onSettled: logout }); }

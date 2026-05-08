import { create } from 'zustand';
import { AuthUser } from '@/types/auth.types';
import { clearAuthStorage, getAccessToken, getRefreshToken, getStoredUser, setAccessToken, setRefreshToken, setStoredUser } from '@/lib/auth/auth-storage';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  setSession: (payload: { accessToken?: string; refreshToken?: string; user: AuthUser }) => void;
  setAuth: (payload: { user: AuthUser | null; isAuthenticated?: boolean }) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isHydrated: false,

  setSession: ({ accessToken, refreshToken, user }) => {
    if (accessToken) setAccessToken(accessToken);
    if (refreshToken) setRefreshToken(refreshToken);
    setStoredUser(user);
    set({ user, isAuthenticated: Boolean(accessToken), isHydrated: true });
  },

  setAuth: ({ user, isAuthenticated }) => {
    if (user) setStoredUser(user); else clearAuthStorage();
    set((state) => ({ user, isAuthenticated: isAuthenticated ?? state.isAuthenticated, isHydrated: true }));
  },

  logout: () => {
    clearAuthStorage();
    set({ user: null, isAuthenticated: false, isHydrated: true });
  },

  hydrate: () => {
    const storedUser = getStoredUser<AuthUser>();
    const accessToken = getAccessToken();
    const refreshToken = getRefreshToken();
    set({ user: storedUser, isAuthenticated: !!storedUser && (!!accessToken || !!refreshToken), isHydrated: true });
  },
}));

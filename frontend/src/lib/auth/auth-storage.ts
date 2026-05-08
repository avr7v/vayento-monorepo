const ACCESS_TOKEN_KEY = 'vayento_access_token';
const REFRESH_TOKEN_KEY = 'vayento_refresh_token';
const USER_KEY = 'vayento_user';

export function getAccessToken(): string | null { if (typeof window === 'undefined') return null; return localStorage.getItem(ACCESS_TOKEN_KEY); }
export function setAccessToken(token: string): void { if (typeof window === 'undefined') return; localStorage.setItem(ACCESS_TOKEN_KEY, token); }
export function clearAccessToken(): void { if (typeof window === 'undefined') return; localStorage.removeItem(ACCESS_TOKEN_KEY); }
export function getRefreshToken(): string | null { if (typeof window === 'undefined') return null; return localStorage.getItem(REFRESH_TOKEN_KEY); }
export function setRefreshToken(token: string): void { if (typeof window === 'undefined') return; localStorage.setItem(REFRESH_TOKEN_KEY, token); }
export function clearRefreshToken(): void { if (typeof window === 'undefined') return; localStorage.removeItem(REFRESH_TOKEN_KEY); }
export function getStoredUser<T>(): T | null { if (typeof window === 'undefined') return null; const raw = localStorage.getItem(USER_KEY); return raw ? JSON.parse(raw) as T : null; }
export function setStoredUser(user: unknown): void { if (typeof window === 'undefined') return; localStorage.setItem(USER_KEY, JSON.stringify(user)); }
export function clearStoredUser(): void { if (typeof window === 'undefined') return; localStorage.removeItem(USER_KEY); }
export function clearAuthStorage(): void { clearAccessToken(); clearRefreshToken(); clearStoredUser(); }

import axios from 'axios';
import {
  clearAuthStorage,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
  setStoredUser,
} from '../auth/auth-storage';
import { getPublicApiUrl } from '../env/public-env';

export const http = axios.create({
  baseURL: getPublicApiUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

http.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    return null;
  }

  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${getPublicApiUrl()}/auth/refresh`, { refreshToken })
      .then((response) => {
        const data = response.data;

        if (data.accessToken) {
          setAccessToken(data.accessToken);
        }

        if (data.refreshToken) {
          setRefreshToken(data.refreshToken);
        }

        if (data.user) {
          setStoredUser(data.user);
        }

        return data.accessToken ?? null;
      })
      .catch(() => null)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

function isProtectedFrontendPath(pathname: string) {
  const protectedPaths = [
    '/dashboard',
    '/host',
    '/admin',
    '/booking',
    '/payments',
    '/profile',
    '/account',
    '/settings',
  ];

  return protectedPaths.some((path) => pathname.startsWith(path));
}

function shouldTryRefreshForRequest(url?: string) {
  if (!url) {
    return false;
  }

  /*
    Public endpoints should not force login when they return 401.
    Protected endpoints may try refresh.
  */
  const protectedApiPrefixes = [
    '/auth/me',
    '/users/me',
    '/bookings',
    '/payments',
    '/host',
    '/admin',
    '/media',
    '/conversations',
    '/reviews/eligible-bookings',
  ];

  return protectedApiPrefixes.some((prefix) => url.includes(prefix));
}

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    const requestUrl = String(originalRequest?.url ?? '');

    const isBrowser = typeof window !== 'undefined';
    const currentPath = isBrowser ? window.location.pathname : '';
    const currentSearch = isBrowser ? window.location.search : '';

    const isProtectedPage = isBrowser
      ? isProtectedFrontendPath(currentPath)
      : false;

    const isProtectedRequest = shouldTryRefreshForRequest(requestUrl);

    /*
      Αν είμαστε σε public page, π.χ. /properties/sunset-villa-mykonos,
      δεν πρέπει ένα 401 από optional request να κάνει redirect στο login.
    */
    if (!isProtectedPage && !isProtectedRequest) {
      return Promise.reject(error);
    }

    /*
      Προσπάθησε refresh μόνο μία φορά.
    */
    if (!originalRequest?._retry && isProtectedRequest) {
      originalRequest._retry = true;

      const newToken = await refreshAccessToken();

      if (newToken) {
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return http(originalRequest);
      }
    }

    /*
      Redirect σε login μόνο αν ο χρήστης βρίσκεται ήδη σε protected frontend page.
      Public pages δεν πρέπει να πετάνε login.
    */
    if (isProtectedPage) {
      clearAuthStorage();

      const next = `${currentPath}${currentSearch}`;
      window.location.href = `/login?next=${encodeURIComponent(next)}`;
    }

    return Promise.reject(error);
  },
);
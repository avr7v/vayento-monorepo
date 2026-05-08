import { getPublicAppUrl } from '@/lib/env/public-env';

export function buildPaymentReturnUrl(path = '/dashboard'): string {
  const base = getPublicAppUrl().replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

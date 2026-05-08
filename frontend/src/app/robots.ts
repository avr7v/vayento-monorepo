import { MetadataRoute } from 'next';
import { getPublicAppUrl } from '@/lib/env/public-env';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getPublicAppUrl();
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

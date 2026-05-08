import { MetadataRoute } from 'next';
import { getPublicAppUrl } from '@/lib/env/public-env';
import { getPublicBlogPosts } from '@/lib/api/public-content.server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getPublicAppUrl();
  const staticRoutes = ['', '/properties', '/blog', '/list-your-property', '/terms', '/privacy', '/cookies', '/data-protection', '/about'].map((path) => ({ url: `${baseUrl}${path}`, lastModified: new Date() }));

  try {
    const posts = await getPublicBlogPosts();
    return [
      ...staticRoutes,
      ...(posts ?? []).map((post: any) => ({ url: `${baseUrl}/blog/${post.slug}`, lastModified: post.updatedAt ? new Date(post.updatedAt) : new Date() })),
    ];
  } catch {
    return staticRoutes;
  }
}

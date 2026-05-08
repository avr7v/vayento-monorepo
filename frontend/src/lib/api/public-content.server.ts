import 'server-only';
import { notFound } from 'next/navigation';
import { getPublicApiUrl } from '@/lib/env/public-env';

export type PublicBlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  body?: string | null;
  coverImageUrl?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type PublicContentPage = {
  id: string;
  slug: string;
  title: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  content: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
};

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${getPublicApiUrl()}${path}`, {
    cache: 'no-store',
    next: {
      revalidate: 0,
    },
  });

  if (response.status === 404) {
    notFound();
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch ${path}`);
  }

  return response.json();
}

export async function getPublicBlogPosts() {
  return fetchJson<PublicBlogPost[]>('/blog');
}

export async function getPublicBlogPost(slug: string) {
  return fetchJson<PublicBlogPost>(`/blog/${slug}`);
}

export async function getPublicPageBySlug(slug: string) {
  return fetchJson<PublicContentPage>(`/pages/${slug}`);
}
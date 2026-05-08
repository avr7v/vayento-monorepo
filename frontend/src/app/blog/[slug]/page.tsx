import Image from 'next/image';
import Link from 'next/link';
import { getPublicBlogPost } from '@/lib/api/public-content.server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type BlogDetailPageProps = {
  params: {
    slug: string;
  };
};

function formatDate(value?: string | null) {
  if (!value) return '';

  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  });
}

export async function generateMetadata({ params }: BlogDetailPageProps) {
  const post = await getPublicBlogPost(params.slug);

  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt || post.title,
  };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const post = await getPublicBlogPost(params.slug);

  return (
    <main className="min-h-screen bg-white px-4 py-12">
      <article className="mx-auto max-w-5xl">
        <div className="rounded-[34px] border border-[#E8DED0] bg-white p-8 shadow-[0_18px_50px_rgba(31,35,40,0.06)] sm:p-10">
          <Link
            href="/blog"
            className="inline-flex rounded-full border border-[#1F2328] px-4 py-2 text-sm transition hover:bg-[#1F2328] hover:text-white"
          >
            Back to blog
          </Link>

          <div className="mt-8 text-xs uppercase tracking-[0.28em] text-[#8A7660]">
            {formatDate(post.publishedAt ?? post.createdAt)}
          </div>

          <h1 className="mt-4 font-serif text-5xl leading-tight text-[#1F2328] md:text-6xl">
            {post.title}
          </h1>

          {post.excerpt ? (
            <p className="mt-5 max-w-3xl text-base leading-8 text-[#5F5A53]">
              {post.excerpt}
            </p>
          ) : null}
        </div>

        {post.coverImageUrl ? (
          <div className="relative mt-8 aspect-[16/8] overflow-hidden rounded-[34px] border border-[#E8DED0] bg-[#F1E8DC]">
            <Image
              src={post.coverImageUrl}
              alt={post.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-cover"
            />
          </div>
        ) : null}

        <div
          className="prose prose-neutral mt-8 max-w-none rounded-[34px] border border-[#E8DED0] bg-white p-8 leading-8 shadow-[0_18px_50px_rgba(31,35,40,0.06)] prose-headings:font-serif prose-headings:text-[#1F2328] prose-p:text-[#5F5A53] prose-a:text-[#1F2328] sm:p-10"
          dangerouslySetInnerHTML={{ __html: post.body ?? '' }}
        />
      </article>
    </main>
  );
}
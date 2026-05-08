import Image from 'next/image';
import Link from 'next/link';
import { getPublicBlogPosts } from '@/lib/api/public-content.server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function formatDate(value?: string | null) {
  if (!value) return '';

  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  });
}

export default async function BlogPage() {
  const posts = await getPublicBlogPosts();

  return (
    <main className="min-h-screen bg-white px-4 py-12">
      <section className="mx-auto max-w-7xl">
        <div className="rounded-[34px] border border-[#E8DED0] bg-white p-8 shadow-[0_18px_50px_rgba(31,35,40,0.06)] sm:p-10">
          <div className="text-xs uppercase tracking-[0.28em] text-[#8A7660]">
            Vayento journal
          </div>

          <h1 className="mt-4 font-serif text-5xl leading-tight text-[#1F2328] md:text-6xl">
            Stories, hosting insights and travel inspiration.
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-8 text-[#5F5A53]">
            Read selected articles from Vayento. Only published posts are shown
            here.
          </p>
        </div>

        {posts.length > 0 ? (
          <div className="mt-10 grid gap-7 md:grid-cols-2 xl:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.id}
                className="overflow-hidden rounded-[30px] border border-[#E8DED0] bg-white shadow-[0_18px_50px_rgba(31,35,40,0.05)]"
              >
                <div className="relative aspect-[16/10] bg-[#F1E8DC]">
                  {post.coverImageUrl ? (
                    <Image
                      src={post.coverImageUrl}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-[#8A7660]">
                      No cover image
                    </div>
                  )}
                </div>

                <div className="p-7">
                  <div className="text-xs uppercase tracking-[0.24em] text-[#8A7660]">
                    {formatDate(post.publishedAt ?? post.createdAt)}
                  </div>

                  <h2 className="mt-4 font-serif text-3xl leading-tight text-[#1F2328]">
                    {post.title}
                  </h2>

                  {post.excerpt ? (
                    <p className="mt-5 text-sm leading-7 text-[#5F5A53]">
                      {post.excerpt}
                    </p>
                  ) : null}

                  <Link
                    href={`/blog/${post.slug}`}
                    className="mt-7 inline-flex rounded-full border border-[#1F2328] px-5 py-3 text-sm transition hover:bg-[#1F2328] hover:text-white"
                  >
                    Read article
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-[30px] border border-[#E8DED0] bg-[#FCFBF9] p-8 text-sm leading-7 text-[#5F5A53]">
            No published blog posts are available right now.
          </div>
        )}
      </section>
    </main>
  );
}
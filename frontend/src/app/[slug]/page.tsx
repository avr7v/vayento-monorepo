import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPublicPageBySlug } from '@/lib/api/public-content.server';

interface ContentPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ContentPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const page = await getPublicPageBySlug(slug);
    return {
      title: page.metaTitle || `${page.title} | Vayento`,
      description: page.metaDescription || 'Discover more about Vayento and our premium hospitality experience.',
    };
  } catch {
    return { title: 'Page | Vayento' };
  }
}

export default async function GenericContentPage({ params }: ContentPageProps) {
  const { slug } = await params;
  const page = await getPublicPageBySlug(slug);
  if (!page) notFound();
  return (
    <main className="min-h-screen bg-white px-4 py-12 md:py-16">
      <article className="mx-auto max-w-5xl">
        <header className="rounded-[36px] border border-[#E8DED0] bg-white p-8 shadow-[0_18px_50px_rgba(31,35,40,0.06)] sm:p-12">
          <div className="text-xs uppercase tracking-[0.28em] text-[#8A7660]">Vayento</div>
          <h1 className="mt-4 font-serif text-5xl leading-tight text-[#1F2328] md:text-6xl">{page.title}</h1>
        </header>
        <section className="prose prose-lg prose-neutral mt-8 max-w-none rounded-[36px] border border-[#E8DED0] bg-white p-8 shadow-[0_18px_50px_rgba(31,35,40,0.06)] sm:p-12"><div className="leading-9 text-[#3E3A36]" dangerouslySetInnerHTML={{ __html: page.content }} /></section>
      </article>
    </main>
  );
}

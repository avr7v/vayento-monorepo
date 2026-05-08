'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useAdminPages, useUpdateAdminPage } from '@/hooks/use-admin';

type ContentStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

const inputClass =
  'rounded-[20px] border border-[#E7DED1] bg-white px-4 py-4 outline-none transition focus:border-[#CDB89C]';

const textareaClass =
  'min-h-[340px] w-full rounded-[20px] border border-[#E7DED1] bg-white px-4 py-4 font-mono text-sm leading-7 outline-none transition focus:border-[#CDB89C]';

const emptyForm = {
  title: '',
  slug: '',
  metaTitle: '',
  metaDescription: '',
  content: '',
  status: 'PUBLISHED' as ContentStatus,
};

export default function AdminContentPage() {
  const { data: pages, isLoading, isError } = useAdminPages();
  const updatePageMutation = useUpdateAdminPage();

  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const contentPages = useMemo(() => pages ?? [], [pages]);

  const selectedPage = useMemo(
    () => contentPages.find((page: any) => page.id === selectedPageId),
    [contentPages, selectedPageId],
  );

  useEffect(() => {
    if (!selectedPageId && contentPages.length > 0) {
      setSelectedPageId(contentPages[0].id);
    }
  }, [contentPages, selectedPageId]);

  useEffect(() => {
    if (!selectedPage) return;

    setForm({
      title: selectedPage.title ?? '',
      slug: selectedPage.slug ?? '',
      metaTitle: selectedPage.metaTitle ?? '',
      metaDescription: selectedPage.metaDescription ?? '',
      content: selectedPage.content ?? '',
      status: selectedPage.status ?? 'PUBLISHED',
    });

    setMessage('');
    setError('');
  }, [selectedPage]);

  const handleSelectPage = (page: any) => {
    setSelectedPageId(page.id);
  };

  const handleChange = (key: keyof typeof emptyForm, value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

    setMessage('');
    setError('');
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedPageId) {
      setError('Select a content page first.');
      return;
    }

    if (!form.title.trim()) {
      setError('Title is required.');
      return;
    }

    if (!form.slug.trim()) {
      setError('Slug is required.');
      return;
    }

    if (!form.content.trim()) {
      setError('Content is required.');
      return;
    }

    setError('');
    setMessage('');

    try {
      await updatePageMutation.mutateAsync({
        id: selectedPageId,
        payload: {
          title: form.title.trim(),
          slug: form.slug.trim(),
          metaTitle: form.metaTitle.trim() || undefined,
          metaDescription: form.metaDescription.trim() || undefined,
          content: form.content,
          status: form.status,
        },
      });

      setMessage('Content page updated successfully.');
    } catch (err: any) {
      const apiMessage = err?.response?.data?.message;

      setError(
        Array.isArray(apiMessage)
          ? apiMessage.join(' ')
          : apiMessage ?? 'Failed to update content page.',
      );
    }
  };

  return (
    <div className="min-h-screen bg-white px-4 py-12">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-[34px] border border-[#E8DED0] bg-white p-8 shadow-[0_18px_50px_rgba(31,35,40,0.06)] sm:p-10">
          <div className="text-xs uppercase tracking-[0.24em] text-[#8A7660]">
            Admin content
          </div>

          <h1 className="mt-3 font-serif text-5xl text-[#1F2328]">
            Content pages
          </h1>

          <p className="mt-4 max-w-3xl text-base leading-8 text-[#5F5A53]">
            Edit public legal and information pages such as Terms, Privacy,
            Cookies, Data Protection and About.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/admin"
              className="inline-flex rounded-full border border-[#1F2328] px-4 py-2 text-sm transition hover:bg-[#1F2328] hover:text-white"
            >
              Back to admin dashboard
            </Link>

            {selectedPage?.slug ? (
              <Link
                href={`/${selectedPage.slug}`}
                target="_blank"
                className="inline-flex rounded-full bg-[#1F2328] px-4 py-2 text-sm text-white transition hover:bg-[#343A42]"
              >
                Open public page
              </Link>
            ) : null}
          </div>

          {message ? (
            <div className="mt-6 rounded-[18px] bg-green-50 px-4 py-3 text-sm text-green-700">
              {message}
            </div>
          ) : null}

          {error ? (
            <div className="mt-6 rounded-[18px] bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}
        </section>

        <div className="grid gap-8 xl:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="rounded-[34px] border border-[#E8DED0] bg-white p-6 shadow-[0_18px_50px_rgba(31,35,40,0.06)]">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-semibold text-[#1F2328]">
                Pages
              </h2>

              <span className="rounded-full bg-[#FCFBF9] px-3 py-1 text-xs uppercase tracking-[0.16em] text-[#8A7660]">
                {contentPages.length}
              </span>
            </div>

            {isLoading ? (
              <div className="mt-6 text-sm text-[#5F5A53]">
                Loading pages...
              </div>
            ) : null}

            {isError ? (
              <div className="mt-6 rounded-[18px] bg-red-50 px-4 py-3 text-sm text-red-700">
                Failed to load content pages.
              </div>
            ) : null}

            <div className="mt-6 space-y-3">
              {contentPages.map((page: any) => {
                const isSelected = page.id === selectedPageId;

                return (
                  <button
                    key={page.id}
                    type="button"
                    onClick={() => handleSelectPage(page)}
                    className={`w-full rounded-[22px] border p-5 text-left transition hover:-translate-y-0.5 hover:shadow-[0_14px_40px_rgba(31,35,40,0.08)] ${
                      isSelected
                        ? 'border-[#1F2328] bg-[#1F2328] text-white'
                        : 'border-[#E8DED0] bg-[#FCFBF9]'
                    }`}
                  >
                    <div
                      className={`text-sm font-semibold ${
                        isSelected ? 'text-white' : 'text-[#1F2328]'
                      }`}
                    >
                      {page.title}
                    </div>

                    <div
                      className={`mt-2 text-xs ${
                        isSelected ? 'text-white/70' : 'text-[#6F675F]'
                      }`}
                    >
                      /{page.slug}
                    </div>

                    <div
                      className={`mt-3 inline-flex rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.16em] ${
                        isSelected
                          ? 'bg-white/10 text-white/70'
                          : page.status === 'PUBLISHED'
                            ? 'bg-green-50 text-green-700'
                            : 'bg-[#EFE6D8] text-[#8A7660]'
                      }`}
                    >
                      {page.status}
                    </div>
                  </button>
                );
              })}

              {!isLoading && contentPages.length === 0 ? (
                <div className="rounded-[22px] border border-[#E8DED0] bg-[#FCFBF9] p-5 text-sm text-[#5F5A53]">
                  No content pages found.
                </div>
              ) : null}
            </div>
          </aside>

          <main>
            <form
              onSubmit={handleSave}
              className="rounded-[34px] border border-[#E8DED0] bg-white p-8 shadow-[0_18px_50px_rgba(31,35,40,0.06)] sm:p-10"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.24em] text-[#8A7660]">
                    Editor
                  </div>

                  <h2 className="mt-3 text-3xl font-semibold text-[#1F2328]">
                    {selectedPage ? selectedPage.title : 'Select a page'}
                  </h2>
                </div>

                <button
                  type="submit"
                  disabled={updatePageMutation.isPending || !selectedPageId}
                  className="rounded-full bg-[#1F2328] px-6 py-4 text-sm font-medium text-white transition hover:bg-[#343A42] disabled:opacity-60"
                >
                  {updatePageMutation.isPending ? 'Saving...' : 'Save page'}
                </button>
              </div>

              <div className="mt-8 grid gap-5 md:grid-cols-2">
                <div>
                  <label className="text-xs uppercase tracking-[0.18em] text-[#8A7660]">
                    Title
                  </label>
                  <input
                    value={form.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    className={`mt-2 w-full ${inputClass}`}
                    placeholder="Page title"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase tracking-[0.18em] text-[#8A7660]">
                    Slug
                  </label>
                  <input
                    value={form.slug}
                    onChange={(e) =>
                      handleChange(
                        'slug',
                        e.target.value
                          .toLowerCase()
                          .trim()
                          .replace(/[^a-z0-9-]+/g, '-')
                          .replace(/-+/g, '-'),
                      )
                    }
                    className={`mt-2 w-full ${inputClass}`}
                    placeholder="terms"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase tracking-[0.18em] text-[#8A7660]">
                    Meta title
                  </label>
                  <input
                    value={form.metaTitle}
                    onChange={(e) => handleChange('metaTitle', e.target.value)}
                    className={`mt-2 w-full ${inputClass}`}
                    placeholder="SEO title"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase tracking-[0.18em] text-[#8A7660]">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      handleChange('status', e.target.value as ContentStatus)
                    }
                    className={`mt-2 w-full ${inputClass}`}
                  >
                    <option value="PUBLISHED">Published</option>
                    <option value="DRAFT">Draft</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs uppercase tracking-[0.18em] text-[#8A7660]">
                    Meta description
                  </label>
                  <textarea
                    value={form.metaDescription}
                    onChange={(e) =>
                      handleChange('metaDescription', e.target.value)
                    }
                    className="mt-2 min-h-[110px] w-full rounded-[20px] border border-[#E7DED1] bg-white px-4 py-4 outline-none transition focus:border-[#CDB89C]"
                    placeholder="SEO description"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs uppercase tracking-[0.18em] text-[#8A7660]">
                    HTML content
                  </label>
                  <textarea
                    value={form.content}
                    onChange={(e) => handleChange('content', e.target.value)}
                    className={`mt-2 ${textareaClass}`}
                    placeholder="<h2>Section title</h2><p>Page content...</p>"
                  />
                  <p className="mt-3 text-xs leading-6 text-[#7A726A]">
                    You can use simple HTML such as h2, p, ul, li, strong and
                    links. Dangerous tags such as script are sanitized by the
                    backend.
                  </p>
                </div>
              </div>
            </form>
          </main>
        </div>
      </div>
    </div>
  );
}
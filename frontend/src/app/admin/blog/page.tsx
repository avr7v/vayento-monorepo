'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  useAdminBlogPosts,
  useCreateAdminBlogPost,
  useDeleteAdminBlogPost,
  useUpdateAdminBlogPost,
} from '@/hooks/use-admin';

type BlogStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

const inputClass =
  'rounded-[20px] border border-[#E7DED1] bg-white px-4 py-4 outline-none transition focus:border-[#CDB89C]';

const textareaClass =
  'w-full rounded-[20px] border border-[#E7DED1] bg-white px-4 py-4 outline-none transition focus:border-[#CDB89C]';

const emptyForm = {
  title: '',
  slug: '',
  excerpt: '',
  body: '',
  coverImageUrl: '',
  metaTitle: '',
  metaDescription: '',
  status: 'DRAFT' as BlogStatus,
};

function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function getApiError(err: any, fallback: string) {
  const apiMessage = err?.response?.data?.message;

  if (Array.isArray(apiMessage)) {
    return apiMessage.join(' ');
  }

  return apiMessage ?? fallback;
}

export default function AdminBlogPage() {
  const { data: blogPosts, isLoading, isError } = useAdminBlogPosts();

  const createBlogPostMutation = useCreateAdminBlogPost();
  const updateBlogPostMutation = useUpdateAdminBlogPost();
  const deleteBlogPostMutation = useDeleteAdminBlogPost();

  const posts = useMemo(() => blogPosts ?? [], [blogPosts]);

  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const selectedPost = useMemo(
    () => posts.find((post: any) => post.id === selectedPostId),
    [posts, selectedPostId],
  );

  useEffect(() => {
    if (!selectedPost || mode !== 'edit') return;

    setForm({
      title: selectedPost.title ?? '',
      slug: selectedPost.slug ?? '',
      excerpt: selectedPost.excerpt ?? '',
      body: selectedPost.body ?? '',
      coverImageUrl: selectedPost.coverImageUrl ?? '',
      metaTitle: selectedPost.metaTitle ?? '',
      metaDescription: selectedPost.metaDescription ?? '',
      status: selectedPost.status ?? 'DRAFT',
    });

    setMessage('');
    setError('');
  }, [selectedPost, mode]);

  const resetForm = () => {
    setMode('create');
    setSelectedPostId(null);
    setForm(emptyForm);
    setMessage('');
    setError('');
  };

  const selectPostForEdit = (post: any) => {
    setMode('edit');
    setSelectedPostId(post.id);
  };

  const handleChange = (key: keyof typeof emptyForm, value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

    setMessage('');
    setError('');
  };

  const validate = () => {
    if (!form.title.trim()) return 'Title is required.';
    if (!form.slug.trim()) return 'Slug is required.';
    if (!form.body.trim()) return 'Body is required.';

    return '';
  };

  const buildPayload = () => ({
    title: form.title.trim(),
    slug: normalizeSlug(form.slug),
    excerpt: form.excerpt.trim() || undefined,
    body: form.body,
    coverImageUrl: form.coverImageUrl.trim() || undefined,
    metaTitle: form.metaTitle.trim() || undefined,
    metaDescription: form.metaDescription.trim() || undefined,
    status: form.status,
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setMessage('');
    setError('');

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    const payload = buildPayload();

    try {
      if (mode === 'edit' && selectedPostId) {
        await updateBlogPostMutation.mutateAsync({
          id: selectedPostId,
          payload,
        });

        setMessage(
          payload.status === 'PUBLISHED'
            ? 'Blog post updated and published.'
            : `Blog post updated as ${payload.status}.`,
        );

        return;
      }

      await createBlogPostMutation.mutateAsync(payload);

      setForm(emptyForm);

      setMessage(
        payload.status === 'PUBLISHED'
          ? 'Blog post created and published.'
          : `Blog post created as ${payload.status}.`,
      );
    } catch (err: any) {
      setError(getApiError(err, 'Blog action failed.'));
    }
  };

  const handleQuickStatusUpdate = async (post: any, status: BlogStatus) => {
    setMessage('');
    setError('');

    try {
      await updateBlogPostMutation.mutateAsync({
        id: post.id,
        payload: {
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt ?? undefined,
          body: post.body ?? '',
          coverImageUrl: post.coverImageUrl ?? undefined,
          metaTitle: post.metaTitle ?? undefined,
          metaDescription: post.metaDescription ?? undefined,
          status,
        },
      });

      if (selectedPostId === post.id) {
        setForm((prev) => ({
          ...prev,
          status,
        }));
      }

      setMessage(
        status === 'PUBLISHED'
          ? 'Blog post published.'
          : `Blog post changed to ${status}.`,
      );
    } catch (err: any) {
      setError(getApiError(err, 'Could not update blog status.'));
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('Delete this blog post? This cannot be undone.')) return;

    setMessage('');
    setError('');

    try {
      await deleteBlogPostMutation.mutateAsync(postId);

      if (selectedPostId === postId) {
        resetForm();
      }

      setMessage('Blog post deleted.');
    } catch (err: any) {
      setError(getApiError(err, 'Could not delete blog post.'));
    }
  };

  return (
    <div className="min-h-screen bg-white px-4 py-12">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-[34px] border border-[#E8DED0] bg-white p-8 shadow-[0_18px_50px_rgba(31,35,40,0.06)] sm:p-10">
          <div className="text-xs uppercase tracking-[0.24em] text-[#8A7660]">
            Admin blog
          </div>

          <h1 className="mt-3 font-serif text-5xl text-[#1F2328]">
            Blog management
          </h1>

          <p className="mt-4 max-w-3xl text-base leading-8 text-[#5F5A53]">
            Create, edit, publish, archive, draft or delete blog posts. Public
            blog shows only posts with status Published.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/admin"
              className="rounded-full border border-[#1F2328] px-4 py-2 text-sm transition hover:bg-[#1F2328] hover:text-white"
            >
              Back to admin dashboard
            </Link>

            <Link
              href="/blog"
              target="_blank"
              className="rounded-full bg-[#1F2328] px-4 py-2 text-sm text-white transition hover:bg-[#343A42]"
            >
              Open public blog
            </Link>

            <button
              type="button"
              onClick={resetForm}
              className="rounded-full border border-[#1F2328] px-4 py-2 text-sm transition hover:bg-[#1F2328] hover:text-white"
            >
              New blog post
            </button>
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

        <div className="grid gap-8 xl:grid-cols-[420px_minmax(0,1fr)]">
          <aside className="rounded-[34px] border border-[#E8DED0] bg-white p-6 shadow-[0_18px_50px_rgba(31,35,40,0.06)]">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-semibold text-[#1F2328]">
                Blog posts
              </h2>

              <span className="rounded-full bg-[#FCFBF9] px-3 py-1 text-xs uppercase tracking-[0.16em] text-[#8A7660]">
                {posts.length}
              </span>
            </div>

            {isLoading ? (
              <div className="mt-6 text-sm text-[#5F5A53]">
                Loading blog posts...
              </div>
            ) : null}

            {isError ? (
              <div className="mt-6 rounded-[18px] bg-red-50 px-4 py-3 text-sm text-red-700">
                Failed to load blog posts.
              </div>
            ) : null}

            <div className="mt-6 space-y-4">
              {posts.map((post: any) => {
                const isSelected = post.id === selectedPostId;

                return (
                  <div
                    key={post.id}
                    className={`rounded-[22px] border p-5 transition ${
                      isSelected
                        ? 'border-[#1F2328] bg-[#1F2328] text-white'
                        : 'border-[#E8DED0] bg-[#FCFBF9]'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => selectPostForEdit(post)}
                      className="block w-full text-left"
                    >
                      <div
                        className={`text-sm font-semibold ${
                          isSelected ? 'text-white' : 'text-[#1F2328]'
                        }`}
                      >
                        {post.title}
                      </div>

                      <div
                        className={`mt-2 text-xs ${
                          isSelected ? 'text-white/70' : 'text-[#6F675F]'
                        }`}
                      >
                        /{post.slug}
                      </div>

                      <div
                        className={`mt-3 inline-flex rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${
                          isSelected
                            ? 'bg-white/10 text-white/80'
                            : post.status === 'PUBLISHED'
                              ? 'bg-green-50 text-green-700'
                              : post.status === 'DRAFT'
                                ? 'bg-yellow-50 text-yellow-700'
                                : 'bg-[#EFE6D8] text-[#8A7660]'
                        }`}
                      >
                        {post.status}
                      </div>
                    </button>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {post.status !== 'PUBLISHED' ? (
                        <button
                          type="button"
                          onClick={() =>
                            void handleQuickStatusUpdate(post, 'PUBLISHED')
                          }
                          disabled={updateBlogPostMutation.isPending}
                          className={`rounded-full px-3 py-2 text-xs transition disabled:opacity-60 ${
                            isSelected
                              ? 'bg-white text-[#1F2328]'
                              : 'bg-[#1F2328] text-white'
                          }`}
                        >
                          Publish
                        </button>
                      ) : null}

                      {post.status !== 'DRAFT' ? (
                        <button
                          type="button"
                          onClick={() =>
                            void handleQuickStatusUpdate(post, 'DRAFT')
                          }
                          disabled={updateBlogPostMutation.isPending}
                          className={`rounded-full border px-3 py-2 text-xs transition disabled:opacity-60 ${
                            isSelected
                              ? 'border-white/30 text-white'
                              : 'border-[#1F2328] text-[#1F2328]'
                          }`}
                        >
                          Draft
                        </button>
                      ) : null}

                      {post.status !== 'ARCHIVED' ? (
                        <button
                          type="button"
                          onClick={() =>
                            void handleQuickStatusUpdate(post, 'ARCHIVED')
                          }
                          disabled={updateBlogPostMutation.isPending}
                          className={`rounded-full border px-3 py-2 text-xs transition disabled:opacity-60 ${
                            isSelected
                              ? 'border-white/30 text-white'
                              : 'border-[#1F2328] text-[#1F2328]'
                          }`}
                        >
                          Archive
                        </button>
                      ) : null}

                      <button
                        type="button"
                        onClick={() => void handleDelete(post.id)}
                        disabled={deleteBlogPostMutation.isPending}
                        className="rounded-full border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 transition hover:bg-red-100 disabled:opacity-60"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}

              {!isLoading && posts.length === 0 ? (
                <div className="rounded-[22px] border border-[#E8DED0] bg-[#FCFBF9] p-5 text-sm text-[#5F5A53]">
                  No blog posts yet.
                </div>
              ) : null}
            </div>
          </aside>

          <main>
            <form
              onSubmit={handleSubmit}
              className="rounded-[34px] border border-[#E8DED0] bg-white p-8 shadow-[0_18px_50px_rgba(31,35,40,0.06)] sm:p-10"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.24em] text-[#8A7660]">
                    {mode === 'edit' ? 'Edit post' : 'Create post'}
                  </div>

                  <h2 className="mt-3 text-3xl font-semibold text-[#1F2328]">
                    {mode === 'edit' ? 'Update blog post' : 'New blog post'}
                  </h2>

                  {mode === 'edit' && selectedPost ? (
                    <p className="mt-3 text-sm text-[#5F5A53]">
                      Editing: {selectedPost.title}
                    </p>
                  ) : null}
                </div>

                <button
                  type="submit"
                  disabled={
                    createBlogPostMutation.isPending ||
                    updateBlogPostMutation.isPending ||
                    !form.title ||
                    !form.slug ||
                    !form.body
                  }
                  className="rounded-full bg-[#1F2328] px-6 py-4 text-sm font-medium text-white transition hover:bg-[#343A42] disabled:opacity-60"
                >
                  {mode === 'edit'
                    ? updateBlogPostMutation.isPending
                      ? 'Saving...'
                      : 'Save changes'
                    : createBlogPostMutation.isPending
                      ? 'Creating...'
                      : 'Create post'}
                </button>
              </div>

              <div className="mt-8 grid gap-5 md:grid-cols-2">
                <div>
                  <label className="text-xs uppercase tracking-[0.18em] text-[#8A7660]">
                    Title
                  </label>

                  <input
                    value={form.title}
                    onChange={(event) => {
                      const title = event.target.value;

                      setForm((prev) => ({
                        ...prev,
                        title,
                        slug:
                          mode === 'create'
                            ? normalizeSlug(title)
                            : prev.slug,
                      }));
                    }}
                    placeholder="Blog title"
                    className={`mt-2 w-full ${inputClass}`}
                  />
                </div>

                <div>
                  <label className="text-xs uppercase tracking-[0.18em] text-[#8A7660]">
                    Slug
                  </label>

                  <input
                    value={form.slug}
                    onChange={(event) =>
                      handleChange('slug', normalizeSlug(event.target.value))
                    }
                    placeholder="blog-slug"
                    className={`mt-2 w-full ${inputClass}`}
                  />
                </div>

                <div>
                  <label className="text-xs uppercase tracking-[0.18em] text-[#8A7660]">
                    Status
                  </label>

                  <select
                    value={form.status}
                    onChange={(event) =>
                      handleChange('status', event.target.value as BlogStatus)
                    }
                    className={`mt-2 w-full ${inputClass}`}
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs uppercase tracking-[0.18em] text-[#8A7660]">
                    Cover image URL
                  </label>

                  <input
                    value={form.coverImageUrl}
                    onChange={(event) =>
                      handleChange('coverImageUrl', event.target.value)
                    }
                    placeholder="https://..."
                    className={`mt-2 w-full ${inputClass}`}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs uppercase tracking-[0.18em] text-[#8A7660]">
                    Excerpt
                  </label>

                  <textarea
                    value={form.excerpt}
                    onChange={(event) =>
                      handleChange('excerpt', event.target.value)
                    }
                    placeholder="Short summary"
                    className={`mt-2 min-h-[90px] ${textareaClass}`}
                  />
                </div>

                <div>
                  <label className="text-xs uppercase tracking-[0.18em] text-[#8A7660]">
                    Meta title
                  </label>

                  <input
                    value={form.metaTitle}
                    onChange={(event) =>
                      handleChange('metaTitle', event.target.value)
                    }
                    placeholder="SEO title"
                    className={`mt-2 w-full ${inputClass}`}
                  />
                </div>

                <div>
                  <label className="text-xs uppercase tracking-[0.18em] text-[#8A7660]">
                    Meta description
                  </label>

                  <input
                    value={form.metaDescription}
                    onChange={(event) =>
                      handleChange('metaDescription', event.target.value)
                    }
                    placeholder="SEO description"
                    className={`mt-2 w-full ${inputClass}`}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs uppercase tracking-[0.18em] text-[#8A7660]">
                    Body HTML
                  </label>

                  <textarea
                    value={form.body}
                    onChange={(event) => handleChange('body', event.target.value)}
                    placeholder="<p>Blog content...</p>"
                    className={`mt-2 min-h-[360px] font-mono text-sm leading-7 ${textareaClass}`}
                  />

                  <p className="mt-3 text-xs leading-6 text-[#7A726A]">
                    Draft and archived posts do not appear publicly. To show a
                    post on /blog, set status to Published and save.
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
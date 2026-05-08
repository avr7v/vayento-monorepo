'use client';

import Link from 'next/link';
import { type ReactNode, useMemo, useState } from 'react';
import {
  useAdminAuditLogs,
  useAdminBookings,
  useAdminBlogPosts,
  useAdminDashboard,
  useAdminPages,
  useAdminPayments,
  useAdminProperties,
  useAdminSupportInbox,
  useAdminUsers,
  useCreateAdminBlogPost,
  useCreateAdminUser,
  useUpdateAdminPropertyStatus,
  useUpdateAdminUserRole,
  useAdminReviews,
  useUpdateAdminReviewStatus,
  useAdminHostLeads,
  useDeleteAdminBlogPost,
  useUpdateAdminBlogPost,
} from '@/hooks/use-admin';
import { useAuthStore } from '@/store/auth.store';

const inputClass =
  'rounded-[20px] border border-[#E7DED1] bg-white px-4 py-4 outline-none';

type BlogStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
}

export default function AdminDashboardPage() {
  const user = useAuthStore((state) => state.user);

  const { data: dashboard } = useAdminDashboard();
  const { data: properties } = useAdminProperties();
  const { data: users } = useAdminUsers();
  const { data: bookings } = useAdminBookings();
  const { data: payments } = useAdminPayments();
  const { data: pages } = useAdminPages();
  const { data: blogPosts } = useAdminBlogPosts();
  const { data: support } = useAdminSupportInbox();
  const { data: logs } = useAdminAuditLogs();
  const { data: reviews } = useAdminReviews();
  const { data: hostLeads } = useAdminHostLeads();

  const updatePropertyStatusMutation = useUpdateAdminPropertyStatus();
  const updateUserRoleMutation = useUpdateAdminUserRole();
  const createUserMutation = useCreateAdminUser();
  const createBlogPostMutation = useCreateAdminBlogPost();
  const updateBlogPostMutation = useUpdateAdminBlogPost();
  const deleteBlogPostMutation = useDeleteAdminBlogPost();
  const updateReviewStatusMutation = useUpdateAdminReviewStatus();

  const moderationQueue = useMemo(
    () =>
      (properties ?? [])
        .filter((property: any) => property.status === 'REVIEW')
        .slice(0, 8),
    [properties],
  );

  const recentUsers = useMemo(() => (users ?? []).slice(0, 8), [users]);
  const recentBookings = useMemo(() => (bookings ?? []).slice(0, 8), [bookings]);
  const recentPayments = useMemo(() => (payments ?? []).slice(0, 8), [payments]);

  const pendingReviews = useMemo(
    () =>
      (reviews ?? [])
        .filter((review: any) => review.status === 'PENDING')
        .slice(0, 8),
    [reviews],
  );

  const latestHostLeads = useMemo(
    () => (hostLeads ?? []).slice(0, 8),
    [hostLeads],
  );

  const supportThreads = useMemo(() => support ?? [], [support]);

  const latestSupportThreads = useMemo(
    () => supportThreads.slice(0, 3),
    [supportThreads],
  );

  const unreadSupportMessages = useMemo(() => {
    return supportThreads.reduce((total: number, conversation: any) => {
      const unreadInConversation = (conversation.messages ?? []).filter(
        (message: any) => {
          const senderId = message.senderUser?.id ?? message.senderUserId;
          return !message.readAt && senderId !== user?.id;
        },
      ).length;

      return total + unreadInConversation;
    }, 0);
  }, [supportThreads, user?.id]);

  const [userForm, setUserForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'USER' as 'USER' | 'HOST',
  });

  const [blogForm, setBlogForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    body: '',
    coverImageUrl: '',
    metaTitle: '',
    metaDescription: '',
    status: 'PUBLISHED' as BlogStatus,
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const metrics = [
    {
      label: 'Users',
      value: dashboard?.totalUsers ?? 0,
      helper: 'Registered accounts',
    },
    {
      label: 'Hosts',
      value: dashboard?.totalHosts ?? 0,
      helper: 'Property owners',
    },
    {
      label: 'Properties',
      value: dashboard?.totalProperties ?? 0,
      helper: 'Total listings',
    },
    {
      label: 'Review queue',
      value: dashboard?.pendingProperties ?? 0,
      helper: 'Awaiting approval',
    },
    {
      label: 'Reviews',
      value: dashboard?.pendingReviews ?? 0,
      helper: 'Pending moderation',
    },
    {
      label: 'Bookings',
      value: dashboard?.totalBookings ?? 0,
      helper: 'All reservations',
    },
    {
      label: 'Support',
      value: supportThreads.length,
      helper:
        unreadSupportMessages > 0
          ? `${unreadSupportMessages} unread message${
              unreadSupportMessages === 1 ? '' : 's'
            }`
          : 'No unread messages',
    },
    {
      label: 'GMV',
      value: formatCurrency(Number(dashboard?.grossRevenue ?? 0)),
      helper: 'Gross revenue',
      featured: true,
    },
  ];

  const handleCreateUser = async () => {
    setMessage('');
    setError('');

    try {
      await createUserMutation.mutateAsync(userForm);

      setUserForm({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'USER',
      });

      setMessage('User account created.');
    } catch (err: any) {
      const apiMessage = err?.response?.data?.message;

      setError(
        Array.isArray(apiMessage)
          ? apiMessage.join(' ')
          : apiMessage ?? 'Could not create user account.',
      );
    }
  };

  const handleCreateBlogPost = async () => {
    setMessage('');
    setError('');

    try {
      await createBlogPostMutation.mutateAsync({
        ...blogForm,
        title: blogForm.title.trim(),
        slug: blogForm.slug.trim(),
        excerpt: blogForm.excerpt.trim() || undefined,
        coverImageUrl: blogForm.coverImageUrl.trim() || undefined,
        metaTitle: blogForm.metaTitle.trim() || undefined,
        metaDescription: blogForm.metaDescription.trim() || undefined,
      });

      setBlogForm({
        title: '',
        slug: '',
        excerpt: '',
        body: '',
        coverImageUrl: '',
        metaTitle: '',
        metaDescription: '',
        status: 'PUBLISHED',
      });

      setMessage(
        blogForm.status === 'PUBLISHED'
          ? 'Blog post created and published.'
          : `Blog post created as ${blogForm.status}.`,
      );
    } catch (err: any) {
      const apiMessage = err?.response?.data?.message;

      setError(
        Array.isArray(apiMessage)
          ? apiMessage.join(' ')
          : apiMessage ?? 'Could not create blog post.',
      );
    }
  };

  const handleUpdateBlogStatus = async (post: any, status: BlogStatus) => {
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

      setMessage(
        status === 'PUBLISHED'
          ? 'Blog post published.'
          : `Blog post changed to ${status}.`,
      );
    } catch (err: any) {
      const apiMessage = err?.response?.data?.message;

      setError(
        Array.isArray(apiMessage)
          ? apiMessage.join(' ')
          : apiMessage ?? 'Could not update blog post status.',
      );
    }
  };

  const handleDeleteBlogPost = async (id: string) => {
    if (!confirm('Delete this blog post? This cannot be undone.')) return;

    setMessage('');
    setError('');

    try {
      await deleteBlogPostMutation.mutateAsync(id);
      setMessage('Blog post deleted.');
    } catch (err: any) {
      const apiMessage = err?.response?.data?.message;

      setError(
        Array.isArray(apiMessage)
          ? apiMessage.join(' ')
          : apiMessage ?? 'Could not delete blog post.',
      );
    }
  };

  return (
    <div className="min-h-screen bg-white px-4 py-12">
      <div className="mx-auto max-w-7xl space-y-10">
        <div className="rounded-[34px] border border-[#E8DED0] bg-white p-8 shadow-[0_18px_50px_rgba(31,35,40,0.06)] sm:p-10">
          <div className="text-xs uppercase tracking-[0.24em] text-[#8A7660]">
            Admin dashboard
          </div>

          <h1 className="mt-3 font-serif text-5xl text-[#1F2328]">
            Welcome back{user?.firstName ? `, ${user.firstName}` : ''}
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-8 text-[#5F5A53]">
            Monitor platform performance, moderate listings, manage users and
            control content from one admin workspace.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/admin/support"
              className="inline-flex rounded-full bg-[#1F2328] px-4 py-2 text-sm text-white transition hover:bg-[#343A42]"
            >
              Open support inbox
              {unreadSupportMessages > 0 ? ` (${unreadSupportMessages})` : ''}
            </Link>

            <Link
              href="/admin/content"
              className="inline-flex rounded-full border border-[#1F2328] px-4 py-2 text-sm transition hover:bg-[#1F2328] hover:text-white"
            >
              Manage content
            </Link>

            <Link
              href="/admin/blog"
              className="inline-flex rounded-full border border-[#1F2328] px-4 py-2 text-sm transition hover:bg-[#1F2328] hover:text-white"
            >
              Manage blog
            </Link>

            <Link
              href="/admin/audit-logs"
              className="inline-flex rounded-full border border-[#1F2328] px-4 py-2 text-sm transition hover:bg-[#1F2328] hover:text-white"
            >
              Audit logs
            </Link>
          </div>

          {message ? (
            <div className="mt-5 rounded-[18px] bg-green-50 px-4 py-3 text-sm text-green-700">
              {message}
            </div>
          ) : null}

          {error ? (
            <div className="mt-5 rounded-[18px] bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="mt-8 grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {metrics
                .filter((metric) => !metric.featured)
                .map((metric) => (
                  <MetricCard
                    key={metric.label}
                    label={metric.label}
                    value={metric.value}
                    helper={metric.helper}
                  />
                ))}
            </div>

            <div className="self-start">
              {metrics
                .filter((metric) => metric.featured)
                .map((metric) => (
                  <MetricCard
                    key={metric.label}
                    label={metric.label}
                    value={metric.value}
                    helper={metric.helper}
                    featured
                  />
                ))}
            </div>
          </div>
        </div>

        <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="space-y-8">
            <Panel title="Moderation queue">
              <div className="space-y-4">
                {moderationQueue.map((property: any) => (
                  <div
                    key={property.id}
                    className="rounded-[24px] border border-[#E8DED0] bg-white p-5"
                  >
                    <div className="text-sm text-[#8A7660]">
                      {property.status} · {property.location?.city}
                    </div>

                    <div className="mt-2 text-xl font-semibold">
                      {property.title}
                    </div>

                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          updatePropertyStatusMutation.mutate({
                            id: property.id,
                            status: 'PUBLISHED',
                          })
                        }
                        className="rounded-full bg-[#1F2328] px-4 py-2 text-sm text-white"
                      >
                        Publish
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          updatePropertyStatusMutation.mutate({
                            id: property.id,
                            status: 'ARCHIVED',
                          })
                        }
                        className="rounded-full border border-[#1F2328] px-4 py-2 text-sm"
                      >
                        Archive
                      </button>
                    </div>
                  </div>
                ))}

                {moderationQueue.length === 0 ? (
                  <p className="text-sm text-[#5F5A53]">
                    No properties are pending review.
                  </p>
                ) : null}
              </div>
            </Panel>

            <Panel title="Review moderation">
              <div className="space-y-4">
                {pendingReviews.map((review: any) => (
                  <div
                    key={review.id}
                    className="rounded-[24px] border border-[#E8DED0] bg-white p-5"
                  >
                    <div className="text-sm text-[#8A7660]">
                      {review.property?.title} · {review.rating}/5
                    </div>

                    <div className="mt-2 text-lg font-semibold">
                      {review.title || 'Untitled review'}
                    </div>

                    <p className="mt-2 text-sm text-[#5F5A53]">
                      {review.comment}
                    </p>

                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          updateReviewStatusMutation.mutate({
                            id: review.id,
                            status: 'PUBLISHED',
                          })
                        }
                        className="rounded-full bg-[#1F2328] px-4 py-2 text-sm text-white"
                      >
                        Publish
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          updateReviewStatusMutation.mutate({
                            id: review.id,
                            status: 'HIDDEN',
                          })
                        }
                        className="rounded-full border border-[#1F2328] px-4 py-2 text-sm"
                      >
                        Hide
                      </button>
                    </div>
                  </div>
                ))}

                {pendingReviews.length === 0 ? (
                  <p className="text-sm text-[#5F5A53]">
                    No reviews are pending moderation.
                  </p>
                ) : null}
              </div>
            </Panel>

            <Panel title="User management">
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  value={userForm.firstName}
                  onChange={(e) =>
                    setUserForm((prev) => ({
                      ...prev,
                      firstName: e.target.value,
                    }))
                  }
                  placeholder="First name"
                  className={inputClass}
                />

                <input
                  value={userForm.lastName}
                  onChange={(e) =>
                    setUserForm((prev) => ({
                      ...prev,
                      lastName: e.target.value,
                    }))
                  }
                  placeholder="Last name"
                  className={inputClass}
                />

                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) =>
                    setUserForm((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  placeholder="Email"
                  className={`${inputClass} sm:col-span-2`}
                />

                <input
                  type="password"
                  value={userForm.password}
                  onChange={(e) =>
                    setUserForm((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  placeholder="Password e.g. Password123!"
                  className={inputClass}
                />

                <select
                  value={userForm.role}
                  onChange={(e) =>
                    setUserForm((prev) => ({
                      ...prev,
                      role: e.target.value as 'USER' | 'HOST',
                    }))
                  }
                  className={inputClass}
                >
                  <option value="USER">User</option>
                  <option value="HOST">Host</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => void handleCreateUser()}
                disabled={createUserMutation.isPending}
                className="mt-6 rounded-full bg-[#1F2328] px-6 py-4 text-sm font-medium text-white disabled:opacity-60"
              >
                {createUserMutation.isPending ? 'Creating...' : 'Create account'}
              </button>

              <div className="mt-8 space-y-4">
                {recentUsers.map((item: any) => (
                  <div
                    key={item.id}
                    className="rounded-[24px] border border-[#E8DED0] bg-white p-5"
                  >
                    <div className="text-lg font-semibold">
                      {item.firstName} {item.lastName}
                    </div>

                    <div className="mt-1 text-sm text-[#5F5A53]">
                      {item.email} · {item.role}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {(['USER', 'HOST', 'ADMIN'] as const).map((role) => (
                        <button
                          type="button"
                          key={role}
                          onClick={() =>
                            updateUserRoleMutation.mutate({
                              id: item.id,
                              role,
                            })
                          }
                          className="rounded-full border border-[#1F2328] px-3 py-1 text-xs"
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </section>

          <aside className="space-y-8">
            <Panel title="Support inbox">
              <div className="rounded-[24px] border border-[#E8DED0] bg-[#FCFBF9] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm uppercase tracking-[0.2em] text-[#8A7660]">
                      Messages
                    </div>

                    <div className="mt-2 text-3xl font-semibold text-[#1F2328]">
                      {supportThreads.length}
                    </div>
                  </div>

                  {unreadSupportMessages > 0 ? (
                    <div className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                      {unreadSupportMessages} unread
                    </div>
                  ) : (
                    <div className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                      Clear
                    </div>
                  )}
                </div>

                <Link
                  href="/admin/support"
                  className="mt-5 inline-flex rounded-full bg-[#1F2328] px-4 py-2 text-sm text-white transition hover:bg-[#343A42]"
                >
                  Go to inbox
                </Link>
              </div>

              <div className="mt-5 space-y-3">
                {latestSupportThreads.map((conversation: any) => {
                  const latestMessage = conversation.messages?.[0];

                  const senderName = latestMessage?.senderUser
                    ? `${latestMessage.senderUser.firstName ?? ''} ${
                        latestMessage.senderUser.lastName ?? ''
                      }`.trim()
                    : 'Unknown sender';

                  const hasUnread = (conversation.messages ?? []).some(
                    (message: any) => {
                      const senderId =
                        message.senderUser?.id ?? message.senderUserId;

                      return !message.readAt && senderId !== user?.id;
                    },
                  );

                  return (
                    <Link
                      key={conversation.id}
                      href="/admin/support"
                      className={`block rounded-[18px] border p-4 transition hover:-translate-y-0.5 hover:shadow-[0_14px_40px_rgba(31,35,40,0.08)] ${
                        hasUnread
                          ? 'border-red-200 bg-red-50'
                          : 'border-[#E8DED0] bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-semibold text-[#1F2328]">
                          {senderName || 'Support thread'}
                        </div>

                        {hasUnread ? (
                          <span className="rounded-full bg-red-600 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
                            New
                          </span>
                        ) : null}
                      </div>

                      <p className="mt-2 max-h-12 overflow-hidden text-sm leading-6 text-[#5F5A53]">
                        {latestMessage?.body ?? 'No message preview available.'}
                      </p>
                    </Link>
                  );
                })}

                {latestSupportThreads.length === 0 ? (
                  <p className="text-sm text-[#5F5A53]">
                    No support messages yet.
                  </p>
                ) : null}
              </div>
            </Panel>

            <Panel title="Create blog post">
              <div className="space-y-4">
                <input
                  value={blogForm.title}
                  onChange={(e) =>
                    setBlogForm((prev) => ({
                      ...prev,
                      title: e.target.value,
                      slug:
                        prev.slug ||
                        e.target.value
                          .toLowerCase()
                          .trim()
                          .replace(/[^a-z0-9-]+/g, '-')
                          .replace(/-+/g, '-'),
                    }))
                  }
                  placeholder="Title"
                  className={`w-full ${inputClass}`}
                />

                <input
                  value={blogForm.slug}
                  onChange={(e) =>
                    setBlogForm((prev) => ({
                      ...prev,
                      slug: e.target.value
                        .toLowerCase()
                        .trim()
                        .replace(/[^a-z0-9-]+/g, '-')
                        .replace(/-+/g, '-'),
                    }))
                  }
                  placeholder="Slug"
                  className={`w-full ${inputClass}`}
                />

                <input
                  value={blogForm.excerpt}
                  onChange={(e) =>
                    setBlogForm((prev) => ({
                      ...prev,
                      excerpt: e.target.value,
                    }))
                  }
                  placeholder="Excerpt"
                  className={`w-full ${inputClass}`}
                />

                <input
                  value={blogForm.coverImageUrl}
                  onChange={(e) =>
                    setBlogForm((prev) => ({
                      ...prev,
                      coverImageUrl: e.target.value,
                    }))
                  }
                  placeholder="Cover image URL"
                  className={`w-full ${inputClass}`}
                />

                <input
                  value={blogForm.metaTitle}
                  onChange={(e) =>
                    setBlogForm((prev) => ({
                      ...prev,
                      metaTitle: e.target.value,
                    }))
                  }
                  placeholder="Meta title"
                  className={`w-full ${inputClass}`}
                />

                <textarea
                  value={blogForm.metaDescription}
                  onChange={(e) =>
                    setBlogForm((prev) => ({
                      ...prev,
                      metaDescription: e.target.value,
                    }))
                  }
                  placeholder="Meta description"
                  className="min-h-[90px] w-full rounded-[20px] border border-[#E7DED1] bg-white px-4 py-4 outline-none"
                />

                <textarea
                  value={blogForm.body}
                  onChange={(e) =>
                    setBlogForm((prev) => ({
                      ...prev,
                      body: e.target.value,
                    }))
                  }
                  placeholder="HTML or rich text body"
                  className="min-h-[180px] w-full rounded-[20px] border border-[#E7DED1] bg-white px-4 py-4 outline-none"
                />

                <select
                  value={blogForm.status}
                  onChange={(e) =>
                    setBlogForm((prev) => ({
                      ...prev,
                      status: e.target.value as BlogStatus,
                    }))
                  }
                  className={`w-full ${inputClass}`}
                >
                  <option value="PUBLISHED">Published</option>
                  <option value="DRAFT">Draft</option>
                  <option value="ARCHIVED">Archived</option>
                </select>

                <button
                  type="button"
                  onClick={() => void handleCreateBlogPost()}
                  disabled={
                    createBlogPostMutation.isPending ||
                    !blogForm.title ||
                    !blogForm.slug ||
                    !blogForm.body
                  }
                  className="rounded-full bg-[#1F2328] px-6 py-4 text-sm font-medium text-white disabled:opacity-60"
                >
                  {createBlogPostMutation.isPending
                    ? 'Creating...'
                    : 'Create blog post'}
                </button>
              </div>

              <div className="mt-6 space-y-3">
                {(blogPosts ?? []).slice(0, 8).map((post: any) => (
                  <div
                    key={post.id}
                    className="rounded-[18px] border border-[#E8DED0] bg-white p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="font-medium text-[#1F2328]">
                          {post.title}
                        </div>

                        <div
                          className={`mt-2 inline-flex rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${
                            post.status === 'PUBLISHED'
                              ? 'bg-green-50 text-green-700'
                              : post.status === 'DRAFT'
                                ? 'bg-yellow-50 text-yellow-700'
                                : 'bg-[#EFE6D8] text-[#8A7660]'
                          }`}
                        >
                          {post.status}
                        </div>

                        <div className="mt-2 text-xs text-[#6F675F]">
                          /{post.slug}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => void handleDeleteBlogPost(post.id)}
                        disabled={deleteBlogPostMutation.isPending}
                        className="rounded-full border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 transition hover:bg-red-100 disabled:opacity-60"
                      >
                        Delete
                      </button>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {post.status !== 'PUBLISHED' ? (
                        <button
                          type="button"
                          onClick={() =>
                            void handleUpdateBlogStatus(post, 'PUBLISHED')
                          }
                          disabled={updateBlogPostMutation.isPending}
                          className="rounded-full bg-[#1F2328] px-3 py-2 text-xs text-white disabled:opacity-60"
                        >
                          Publish
                        </button>
                      ) : null}

                      {post.status !== 'DRAFT' ? (
                        <button
                          type="button"
                          onClick={() =>
                            void handleUpdateBlogStatus(post, 'DRAFT')
                          }
                          disabled={updateBlogPostMutation.isPending}
                          className="rounded-full border border-[#1F2328] px-3 py-2 text-xs disabled:opacity-60"
                        >
                          Draft
                        </button>
                      ) : null}

                      {post.status !== 'ARCHIVED' ? (
                        <button
                          type="button"
                          onClick={() =>
                            void handleUpdateBlogStatus(post, 'ARCHIVED')
                          }
                          disabled={updateBlogPostMutation.isPending}
                          className="rounded-full border border-[#1F2328] px-3 py-2 text-xs disabled:opacity-60"
                        >
                          Archive
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}

                {(blogPosts ?? []).length === 0 ? (
                  <p className="text-sm text-[#5F5A53]">
                    No blog posts yet.
                  </p>
                ) : null}
              </div>
            </Panel>

            <Panel title="Host leads">
              {latestHostLeads.map((lead: any) => (
                <div
                  key={lead.id}
                  className="mb-4 rounded-[24px] border border-[#E8DED0] bg-white p-5"
                >
                  <div className="font-semibold">
                    {lead.firstName} {lead.lastName}
                  </div>

                  <div className="mt-1 text-sm text-[#5F5A53]">
                    {lead.email} · {lead.propertyCity ?? 'No city'} ·{' '}
                    {lead.propertyCountry ?? 'No country'} ·{' '}
                    {lead.propertyType ?? 'No type'}
                  </div>

                  <div className="mt-2 text-xs uppercase tracking-[0.18em] text-[#8A7660]">
                    {lead.status}
                  </div>
                </div>
              ))}

              {latestHostLeads.length === 0 ? (
                <p className="text-sm text-[#5F5A53]">No host leads yet.</p>
              ) : null}
            </Panel>

            <Panel title="Operations preview">
              <p className="text-sm text-[#5F5A53]">
                Content pages: {pages?.length ?? 0}
              </p>

              <p className="mt-2 text-sm text-[#5F5A53]">
                Support threads: {supportThreads.length}
              </p>

              <p className="mt-2 text-sm text-[#5F5A53]">
                Unread support messages: {unreadSupportMessages}
              </p>

              <p className="mt-2 text-sm text-[#5F5A53]">
                Audit logs: {logs?.length ?? 0}
              </p>

              <p className="mt-2 text-sm text-[#5F5A53]">
                Bookings tracked: {recentBookings.length}
              </p>

              <p className="mt-2 text-sm text-[#5F5A53]">
                Payments tracked: {recentPayments.length}
              </p>
            </Panel>
          </aside>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  helper,
  featured = false,
}: {
  label: string;
  value: string | number;
  helper: string;
  featured?: boolean;
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-[28px] border transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(31,35,40,0.10)] ${
        featured
          ? 'min-h-[170px] border-[#C9A46A] bg-[#1F2328] p-7 text-white'
          : 'min-h-[150px] border-[#E8DED0] bg-[#FCFBF9] p-6'
      }`}
    >
      <div
        className={`absolute right-[-28px] top-[-28px] rounded-full ${
          featured ? 'h-28 w-28 bg-white/10' : 'h-24 w-24 bg-[#EFE6D8]'
        }`}
      />

      <div
        className={`relative text-[11px] font-semibold uppercase tracking-[0.22em] ${
          featured ? 'text-[#E8DED0]' : 'text-[#8A7660]'
        }`}
      >
        {label}
      </div>

      <div
        className={`relative mt-4 font-serif leading-none tracking-tight ${
          featured ? 'text-[2.2rem] text-white' : 'text-4xl text-[#1F2328]'
        }`}
      >
        {value}
      </div>

      <div
        className={`relative mt-4 text-xs ${
          featured ? 'text-white/70' : 'text-[#6F675F]'
        }`}
      >
        {helper}
      </div>
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-[34px] border border-[#E8DED0] bg-white p-8 shadow-[0_18px_50px_rgba(31,35,40,0.06)]">
      <h2 className="font-serif text-3xl text-[#1F2328]">{title}</h2>

      <div className="mt-6">{children}</div>
    </div>
  );
}
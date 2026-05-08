'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLogin } from '@/hooks/use-auth';
import {
  getDefaultRedirectByRole,
  isWorkspacePathAllowedForRole,
} from '@/lib/auth/roles';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const loginMutation = useLogin();

  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const handleChange = (key: 'email' | 'password', value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await loginMutation.mutateAsync(form);
      const next = searchParams.get('next');
      const fallback = getDefaultRedirectByRole(result.user.role);

      if (next && isWorkspacePathAllowedForRole(next, result.user.role)) {
        router.push(next);
        return;
      }

      router.push(fallback);
    } catch {}
  };

  return (
    <div className="min-h-screen bg-white px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 18, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-xl rounded-[34px] border border-[#E8DED0] bg-white p-8 shadow-[0_18px_50px_rgba(31,35,40,0.08)] sm:p-10"
      >
        <div className="text-xs uppercase tracking-[0.24em] text-[#8A7660]">
          Welcome back
        </div>

        <h1 className="mt-3 font-serif text-4xl text-[#1F2328]">
          Sign in to your account
        </h1>

        <p className="mt-4 text-sm leading-8 text-[#5F5A53]">
          Access only the workspace assigned to your account role.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block text-sm text-[#5F5A53]">
              Email
            </label>

            <input
              type="email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full rounded-[20px] border border-[#E7DED1] bg-[#FBFAF7] px-4 py-4 outline-none transition-all duration-300 focus:border-[#C8B193]"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-4">
              <label className="block text-sm text-[#5F5A53]">
                Password
              </label>

              <Link
                href="/forgot-password"
                className="text-sm text-[#8A7660] underline underline-offset-4 hover:text-[#1F2328]"
              >
                Forgot password?
              </Link>
            </div>

            <input
              type="password"
              value={form.password}
              onChange={(e) => handleChange('password', e.target.value)}
              className="w-full rounded-[20px] border border-[#E7DED1] bg-[#FBFAF7] px-4 py-4 outline-none transition-all duration-300 focus:border-[#C8B193]"
              placeholder="Enter your password"
            />
          </div>

          {loginMutation.isError ? (
            <div className="rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Login failed. Please check your credentials and try again.
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full rounded-full bg-[#1F2328] px-6 py-4 text-sm font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(31,35,40,0.18)] disabled:opacity-60"
          >
            {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="mt-6 text-sm text-[#6D655D]">
          New to Vayento?{' '}
          <Link
            href="/register"
            className="text-[#1F2328] underline underline-offset-4"
          >
            Create your account
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
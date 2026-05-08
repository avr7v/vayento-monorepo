'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useResetPassword } from '@/hooks/use-auth';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const mutation = useResetPassword();
  const [password, setPassword] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await mutation.mutateAsync({ token, password });
  };

  return (
    <div className="min-h-screen bg-white px-4 py-16">
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-xl rounded-[34px] border border-[#E8DED0] bg-white p-8 shadow-[0_18px_50px_rgba(31,35,40,0.08)] sm:p-10">
        <div className="text-xs uppercase tracking-[0.24em] text-[#8A7660]">Create a new password</div>
        <h1 className="mt-3 font-serif text-4xl text-[#1F2328]">Choose a new password</h1>
        <p className="mt-4 text-sm leading-8 text-[#5F5A53]">Use a strong password to secure your Vayento account.</p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-[20px] border border-[#E7DED1] bg-[#FBFAF7] px-4 py-4 outline-none" placeholder="New password" />
          {mutation.isSuccess ? <div className="rounded-[18px] border border-[#DCCDB8] bg-[#F8F3EA] px-4 py-3 text-sm text-[#5F5A53]">Password updated successfully. You can now sign in.</div> : null}
          {mutation.isError ? <div className="rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">The reset token is invalid or expired.</div> : null}
          <button type="submit" disabled={mutation.isPending || !token} className="w-full rounded-full bg-[#1F2328] px-6 py-4 text-sm font-medium text-white disabled:opacity-60">{mutation.isPending ? 'Updating...' : 'Update password'}</button>
        </form>
        <div className="mt-6 text-sm text-[#6D655D]"><Link href="/login" className="text-[#1F2328] underline underline-offset-4">Back to sign in</Link></div>
      </motion.div>
    </div>
  );
}

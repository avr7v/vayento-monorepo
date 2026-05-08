'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useResendVerification, useVerifyEmail } from '@/hooks/use-auth';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const verifyMutation = useVerifyEmail();
  const resendMutation = useResendVerification();
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (token) {
      verifyMutation.mutate(token);
    }
  }, [token]);

  const handleResend = async (event: React.FormEvent) => {
    event.preventDefault();
    await resendMutation.mutateAsync({ email });
  };

  return (
    <div className="min-h-screen bg-white px-4 py-16">
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-xl rounded-[34px] border border-[#E8DED0] bg-white p-8 shadow-[0_18px_50px_rgba(31,35,40,0.08)] sm:p-10">
        <div className="text-xs uppercase tracking-[0.24em] text-[#8A7660]">Email verification</div>
        <h1 className="mt-3 font-serif text-4xl text-[#1F2328]">Verify your email address</h1>
        <p className="mt-4 text-sm leading-8 text-[#5F5A53]">Complete verification to keep your Vayento account aligned with a trusted booking experience.</p>

        {token ? (
          <div className="mt-8">
            {verifyMutation.isPending ? <div className="rounded-[18px] border border-[#DCCDB8] bg-[#F8F3EA] px-4 py-3 text-sm text-[#5F5A53]">Verifying your email...</div> : null}
            {verifyMutation.isSuccess ? <div className="rounded-[18px] border border-[#DCCDB8] bg-[#F8F3EA] px-4 py-3 text-sm text-[#5F5A53]">Your email has been verified successfully.</div> : null}
            {verifyMutation.isError ? <div className="rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">Verification token is invalid or expired.</div> : null}
          </div>
        ) : (
          <form onSubmit={handleResend} className="mt-8 space-y-5">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-[20px] border border-[#E7DED1] bg-[#FBFAF7] px-4 py-4 outline-none" placeholder="Email" />
            {resendMutation.isSuccess ? <div className="rounded-[18px] border border-[#DCCDB8] bg-[#F8F3EA] px-4 py-3 text-sm text-[#5F5A53]">Verification email sent.</div> : null}
            {resendMutation.isError ? <div className="rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">Unable to resend the verification email right now.</div> : null}
            <button type="submit" disabled={resendMutation.isPending} className="w-full rounded-full bg-[#1F2328] px-6 py-4 text-sm font-medium text-white disabled:opacity-60">{resendMutation.isPending ? 'Sending...' : 'Resend verification email'}</button>
          </form>
        )}

        <div className="mt-6 text-sm text-[#6D655D]"><Link href="/login" className="text-[#1F2328] underline underline-offset-4">Back to sign in</Link></div>
      </motion.div>
    </div>
  );
}

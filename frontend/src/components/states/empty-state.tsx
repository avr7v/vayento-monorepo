'use client';

import Link from 'next/link';
interface EmptyStateProps { title: string; message: string; actionLabel?: string; actionHref?: string; }
export function EmptyState({ title, message, actionLabel, actionHref }: EmptyStateProps) {
  return <div className="rounded-[28px] border border-[#E8DED0] bg-[#FCFBF9] px-8 py-12 text-center"><h3 className="text-3xl font-semibold text-[#1F2328]">{title}</h3><p className="mt-3 text-sm leading-7 text-[#5F5A53]">{message}</p>{actionLabel && actionHref ? <Link href={actionHref} className="mt-5 inline-block rounded-full bg-[#1F2328] px-5 py-3 text-sm text-white">{actionLabel}</Link> : null}</div>;
}

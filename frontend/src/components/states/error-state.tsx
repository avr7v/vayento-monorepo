'use client';

interface ErrorStateProps { title?: string; message?: string; actionLabel?: string; onAction?: () => void; }
export function ErrorState({ title = 'Something went wrong', message = 'We could not load this section right now.', actionLabel, onAction }: ErrorStateProps) {
  return <div className="rounded-[28px] border border-red-100 bg-red-50 px-6 py-6 text-red-700"><h3 className="text-2xl font-semibold text-red-800">{title}</h3><p className="mt-3 text-sm leading-7">{message}</p>{actionLabel && onAction ? <button onClick={onAction} className="mt-5 rounded-full bg-white px-5 py-3 text-sm text-red-700 shadow-sm">{actionLabel}</button> : null}</div>;
}

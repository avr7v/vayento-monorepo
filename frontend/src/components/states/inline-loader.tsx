'use client';
export function InlineLoader({ label = 'Loading...' }: { label?: string }) { return <div className="flex items-center gap-3 text-sm text-[#5F5A53]"><div className="h-4 w-4 animate-spin rounded-full border-2 border-[#D9C7B0] border-t-[#1F2328]" /><span>{label}</span></div>; }

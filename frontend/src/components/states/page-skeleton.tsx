'use client';
export function PageSkeleton({ heightClassName = 'h-[520px]' }: { heightClassName?: string }) { return <div className="min-h-screen bg-white px-4 py-12"><div className={`mx-auto max-w-6xl animate-pulse rounded-[32px] bg-white ${heightClassName}`} /></div>; }

'use client';
export function SectionSkeleton({ items = 3, className = 'h-28' }: { items?: number; className?: string }) { return <div className="space-y-4">{Array.from({ length: items }).map((_, index) => <div key={index} className={`animate-pulse rounded-[24px] bg-[#F6F1EA] ${className}`} />)}</div>; }

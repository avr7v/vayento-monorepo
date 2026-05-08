'use client';

export function RouteGateShell({
  title = 'Preparing your session',
  body = 'Please wait while we verify access and route you to the correct workspace.',
}: {
  title?: string;
  body?: string;
}) {
  return (
    <div className="min-h-[60vh] bg-white px-4 py-16">
      <div className="mx-auto max-w-xl rounded-[32px] border border-[#E8DED0] bg-white p-10 text-center shadow-[0_18px_50px_rgba(31,35,40,0.06)]">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[#D9C7B0] border-t-[#1F2328]" />
        <div className="mt-6 text-xs uppercase tracking-[0.24em] text-[#8A7660]">
          Vayento
        </div>
        <h2 className="mt-3 font-serif text-3xl text-[#1F2328]">{title}</h2>
        <p className="mt-4 text-sm leading-8 text-[#5F5A53]">{body}</p>
      </div>
    </div>
  );
}

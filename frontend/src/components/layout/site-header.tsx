'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { getDefaultRedirectByRole } from '@/lib/auth/roles';

const navLinkClassName = 'relative text-sm text-[#5F5A53] transition-colors duration-300 hover:text-[#1F2328] after:absolute after:left-0 after:-bottom-1 after:h-px after:w-0 after:bg-[#1F2328] after:transition-all after:duration-300 hover:after:w-full';

export function SiteHeader() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);
  const [open, setOpen] = useState(false);

  const workspaceHref = user ? getDefaultRedirectByRole(user.role) : '/login';
  const close = () => setOpen(false);
  const handleLogout = () => {
    logout();
    close();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-20 border-b border-[#E8DED0] bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-4 py-3">
        <Link href="/" onClick={close} className="flex items-center transition-transform duration-300 hover:scale-[1.02]"><Image src="/logo-wordmark.png" alt="Vayento" width={180} height={44} priority className="h-auto w-[120px] md:w-[150px]" /></Link>
        <button onClick={() => setOpen((value) => !value)} className="rounded-full border border-[#1F2328] px-4 py-2 text-sm text-[#1F2328] md:hidden">Menu</button>
        <nav className="hidden items-center gap-4 md:flex md:gap-5"><HeaderLinks isAuthenticated={isAuthenticated} workspaceHref={workspaceHref} onLogout={handleLogout} onNavigate={close} /></nav>
      </div>
      {open ? <nav className="border-t border-[#E8DED0] bg-white px-4 py-4 md:hidden"><div className="mx-auto flex max-w-7xl flex-col gap-4"><HeaderLinks isAuthenticated={isAuthenticated} workspaceHref={workspaceHref} onLogout={handleLogout} onNavigate={close} /></div></nav> : null}
    </header>
  );
}

function HeaderLinks({ isAuthenticated, workspaceHref, onLogout, onNavigate }: { isAuthenticated: boolean; workspaceHref: string; onLogout: () => void; onNavigate: () => void }) {
  return <>
    <Link href="/" onClick={onNavigate} className={navLinkClassName}>Home</Link>
    <Link href="/properties" onClick={onNavigate} className={navLinkClassName}>Stays</Link>
    <Link href="/blog" onClick={onNavigate} className={navLinkClassName}>Blog</Link>
    <Link href="/list-your-property" onClick={onNavigate} className={navLinkClassName}>Host</Link>
    {isAuthenticated ? <><Link href={workspaceHref} onClick={onNavigate} className={navLinkClassName}>Workspace</Link><button onClick={onLogout} className="rounded-full border border-[#1F2328] px-4 py-2 text-sm text-[#1F2328] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#1F2328] hover:text-white">Logout</button></> : <><Link href="/login" onClick={onNavigate} className={navLinkClassName}>Login</Link><Link href="/register" onClick={onNavigate} className="rounded-full bg-[#1F2328] px-4 py-2 text-sm text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(31,35,40,0.18)]">Join</Link></>}
  </>;
}

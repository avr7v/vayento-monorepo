import './globals.css';
import type { Metadata } from 'next';
import { Providers } from './providers';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { PageTransition } from '@/components/motion/page-transition';

export const metadata: Metadata = {
  title: 'Vayento',
  description: 'Premium hospitality and short-term rental platform.',
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-[#1F2328] antialiased">
        <Providers>
          <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <div className="flex-1">
              <PageTransition>{children}</PageTransition>
            </div>
            <SiteFooter />
          </div>
        </Providers>
      </body>
    </html>
  );
}

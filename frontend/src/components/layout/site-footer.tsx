import Link from 'next/link';
import Image from 'next/image';

const footerNavigation = {
  discover: [
    { label: 'Home', href: '/' },
    { label: 'Stays', href: '/properties' },
    { label: 'Blog', href: '/blog' },
    { label: 'List your property', href: '/list-your-property' },
  ],
  account: [
    { label: 'Login', href: '/login' },
    { label: 'Register', href: '/register' },
    { label: 'Dashboard', href: '/dashboard' },
  ],
  legal: [
    { label: 'Terms and Conditions', href: '/terms' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Cookie Policy', href: '/cookies' },
    { label: 'Data Protection', href: '/data-protection' },
  ],
};

export function SiteFooter() {
  return (
    <footer className="border-t border-[#E8DED0] bg-white">
      <div className="mx-auto max-w-7xl px-4 py-14 md:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <div>
            <Link href="/" className="inline-flex items-center"><Image src="/logo-wordmark.png" alt="Vayento" width={220} height={62} className="h-auto w-[155px] md:w-[185px]" /></Link>
            <p className="mt-5 max-w-2xl text-sm leading-8 text-[#5F5A53] md:text-[15px]">Vayento is a refined short-term rental platform designed for premium stays, seamless booking journeys and elegant host management.</p>
            <div className="mt-8 rounded-[28px] border border-[#DECBB2] bg-white p-6 shadow-[0_14px_35px_rgba(31,35,40,0.04)]">
              <div className="text-xs uppercase tracking-[0.24em] text-[#8A7660]">Hospitality-first digital presence</div>
              <p className="mt-3 text-sm leading-8 text-[#5F5A53]">From listing presentation to reservation oversight, every touchpoint supports a premium and trustworthy guest experience.</p>
            </div>
          </div>
          <div className="grid gap-8 sm:grid-cols-3 lg:pl-10">
            <FooterColumn title="Explore" items={footerNavigation.discover} />
            <FooterColumn title="Account" items={footerNavigation.account} />
            <FooterColumn title="Legal" items={footerNavigation.legal} />
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-[#DECBB2] pt-6 text-sm text-[#756E66] md:flex-row md:items-center md:justify-between"><p>© {new Date().getFullYear()} Vayento. Premium hospitality, refined digitally.</p><p>Curated stays · Refined hosting · Seamless booking</p></div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, items }: { title: string; items: { label: string; href: string }[] }) {
  return <div><div className="text-xs uppercase tracking-[0.24em] text-[#8A7660]">{title}</div><ul className="mt-5 space-y-3 text-sm text-[#5F5A53]">{items.map((item) => <li key={item.href}><Link href={item.href} className="transition-colors duration-300 hover:text-[#1F2328]">{item.label}</Link></li>)}</ul></div>;
}

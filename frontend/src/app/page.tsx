'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useFeaturedProperties } from '@/hooks/use-properties';
import { PropertyCard } from '@/components/property/property-card';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 28, filter: 'blur(10px)' }, show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } } };

const featureCards = [
  { title: 'Curated discovery', body: 'Browse distinctive homes through a clean, editorial experience built to highlight quality, location and atmosphere.' },
  { title: 'Smooth reservations', body: 'Move from search to confirmation with transparent pricing, clear stay details and a secure payment journey.' },
  { title: 'Professional hosting tools', body: 'Manage listings, availability, reservations and earnings from a workspace shaped for modern hospitality operations.' },
];

export default function HomePage() {
  const { data: featured, isLoading } = useFeaturedProperties();
  const properties = Array.isArray(featured) ? featured : [];

  return (
    <main className="bg-white text-[#1F2328]">
      <section className="relative overflow-hidden border-b border-[#E8DED0] bg-[linear-gradient(135deg,#ffffff_0%,#f7f4ee_48%,#efe4d2_100%)]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-8%] top-[-14%] h-[28rem] w-[28rem] rounded-full bg-white/70 blur-3xl" />
          <div className="absolute bottom-[-14%] right-[-4%] h-[24rem] w-[24rem] rounded-full bg-[#d8c2a5]/30 blur-3xl" />
        </div>
        <div className="mx-auto grid min-h-[78vh] max-w-7xl gap-10 px-4 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-20">
          <motion.div variants={container} initial="hidden" animate="show" className="relative z-10">
            <motion.div variants={fadeUp} className="text-xs uppercase tracking-[0.34em] text-[#8A7660]">Curated stays · Refined hosting · Seamless booking</motion.div>
            <motion.h1 variants={fadeUp} className="mt-5 max-w-4xl font-serif text-5xl leading-[1.02] text-[#1F2328] md:text-7xl">A more elegant way to book and host exceptional stays.</motion.h1>
            <motion.p variants={fadeUp} className="mt-6 max-w-2xl text-lg leading-8 text-[#5F5A53]">Vayento brings together premium short-term rentals, polished guest journeys and modern host management in one hospitality-focused platform.</motion.p>
            <motion.div variants={fadeUp} className="mt-9 flex flex-wrap gap-4">
              <Link href="/properties" className="rounded-full bg-[#1F2328] px-6 py-4 text-sm font-medium text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(31,35,40,0.18)]">Explore stays</Link>
              <Link href="/list-your-property" className="rounded-full border border-[#1F2328] bg-white px-6 py-4 text-sm font-medium text-[#1F2328] transition-all duration-300 hover:-translate-y-1 hover:bg-[#1F2328] hover:text-white">List your property</Link>
            </motion.div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 24, scale: 0.985, filter: 'blur(8px)' }} animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }} transition={{ duration: 0.85, delay: 0.18, ease: [0.22, 1, 0.36, 1] }} className="relative z-10">
            <div className="overflow-hidden rounded-[34px] border border-[#E8DED0] bg-white p-8 shadow-[0_22px_60px_rgba(31,35,40,0.08)] sm:p-10">
              <div className="text-xs uppercase tracking-[0.24em] text-[#8A7660]">Trust & experience</div>
              <h2 className="mt-4 font-serif text-3xl leading-tight text-[#1F2328] sm:text-4xl">Designed for guests and built for modern hosts.</h2>
              <p className="mt-5 text-sm leading-8 text-[#5F5A53] sm:text-[15px]">Vayento combines elevated property discovery with secure booking flows and role-based tools for every stage of the stay.</p>
              <div className="mt-7 grid gap-4 sm:grid-cols-2"><Mini title="Book with confidence" body="Transparent pricing and secure payments." /><Mini title="Operate with clarity" body="Listings, reservations and earnings in one workspace." /></div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div><div className="text-xs uppercase tracking-[0.26em] text-[#8A7660]">Featured stays</div><h2 className="mt-3 font-serif text-4xl text-[#1F2328] md:text-5xl">Selected properties</h2><p className="mt-3 max-w-2xl text-sm leading-8 text-[#5F5A53]">A live preview from the published property catalogue, connected directly to the backend.</p></div>
          <Link href="/properties" className="rounded-full border border-[#1F2328] px-5 py-3 text-sm">View all stays</Link>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {isLoading ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-[410px] animate-pulse rounded-[28px] border border-[#E8DED0] bg-white" />) : null}
          {!isLoading && properties.length ? properties.slice(0, 6).map((property: any) => <PropertyCard key={property.id} property={property} />) : null}
          {!isLoading && properties.length === 0 ? <div className="rounded-[28px] border border-[#E8DED0] bg-white p-8 text-sm text-[#5F5A53] md:col-span-2">No featured properties are available yet. Run the seed script or publish featured properties from the admin dashboard.</div> : null}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 md:pb-20">
        <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.16 }} className="grid gap-6 md:grid-cols-3">
          {featureCards.map((card) => <motion.article key={card.title} variants={fadeUp} whileHover={{ y: -8 }} className="rounded-[30px] border border-[#E8DED0] bg-white p-8 shadow-[0_10px_30px_rgba(31,35,40,0.03)]"><div className="text-xs uppercase tracking-[0.2em] text-[#8A7660]">Feature</div><h3 className="mt-4 font-serif text-2xl leading-tight text-[#1F2328]">{card.title}</h3><p className="mt-4 text-sm leading-8 text-[#5F5A53]">{card.body}</p></motion.article>)}
        </motion.div>
      </section>
    </main>
  );
}

function Mini({ title, body }: { title: string; body: string }) {
  return <div className="rounded-[24px] border border-[#EFE5D7] bg-white p-5"><div className="text-lg font-semibold text-[#1F2328]">{title}</div><p className="mt-2 text-sm leading-7 text-[#5F5A53]">{body}</p></div>;
}

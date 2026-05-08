import Link from 'next/link';
import Image from 'next/image';
import { PropertyCard as PropertyCardType } from '@/types/property.types';

export function PropertyCard({ property }: { property: PropertyCardType }) {
  const cover = property.images?.find((image) => image.isCover) || property.images?.[0];
  return (
    <Link href={`/properties/${property.slug}`} className="overflow-hidden rounded-[28px] border border-[#E8DED0] bg-white shadow-[0_18px_50px_rgba(31,35,40,0.06)]">
      <div className="relative h-64 w-full bg-[#EDE7DB]">{cover ? <Image src={cover.url} alt={cover.altText || property.title} fill className="object-cover" /> : null}</div>
      <div className="p-6">
        <div className="text-xs uppercase tracking-[0.2em] text-[#8A7660]">{property.location?.city}, {property.location?.country}</div>
        <h3 className="mt-3 text-2xl font-semibold text-[#1F2328]">{property.title}</h3>
        <p className="mt-3 text-sm leading-7 text-[#5F5A53]">{property.shortDescription}</p>
        <div className="mt-5 flex items-center justify-between text-sm text-[#5F5A53]"><span>{property.bedrooms} beds · {property.maxGuests} guests</span><span className="font-semibold text-[#1F2328]">€{property.basePricePerNight}/night</span></div>
      </div>
    </Link>
  );
}

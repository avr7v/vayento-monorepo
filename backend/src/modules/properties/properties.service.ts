import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { PropertySearchQueryDto } from './dto/property-search-query.dto';
import { SAFE_USER_SELECT } from '../../common/serializers/user.serializer';

@Injectable()
export class PropertiesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PropertySearchQueryDto) {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 12, 50);
    const skip = (page - 1) * limit;

    const where: Prisma.PropertyWhereInput = { status: 'PUBLISHED' };

    if (query.q) {
      where.OR = [
        { title: { contains: query.q, mode: 'insensitive' } },
        { shortDescription: { contains: query.q, mode: 'insensitive' } },
        { longDescription: { contains: query.q, mode: 'insensitive' } },
        { citySearch: { contains: query.q, mode: 'insensitive' } },
      ];
    }

    if (query.city || query.country) {
      where.location = { is: { city: query.city ? { contains: query.city, mode: 'insensitive' } : undefined, country: query.country ? { contains: query.country, mode: 'insensitive' } : undefined } };
    }

    if (query.propertyType) where.propertyType = { equals: query.propertyType, mode: 'insensitive' };
    if (query.guests) where.maxGuests = { gte: query.guests };
    if (query.featured === 'true') where.featured = true;

    if (query.minPrice || query.maxPrice) {
      where.basePricePerNight = {};
      if (query.minPrice) where.basePricePerNight.gte = new Prisma.Decimal(query.minPrice);
      if (query.maxPrice) where.basePricePerNight.lte = new Prisma.Decimal(query.maxPrice);
    }

    if (query.checkInDate || query.checkOutDate) {
      if (!query.checkInDate || !query.checkOutDate) throw new BadRequestException('Both checkInDate and checkOutDate are required for availability search.');
      const checkInDate = new Date(query.checkInDate);
      const checkOutDate = new Date(query.checkOutDate);
      if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime()) || checkOutDate <= checkInDate) throw new BadRequestException('Invalid availability date range.');
      where.AND = [
        ...(Array.isArray(where.AND) ? where.AND : []),
        {
          availabilityBlocks: {
            none: {
              blockType: { in: ['BLOCKED', 'RESERVED'] },
              startDate: { lt: checkOutDate },
              endDate: { gt: checkInDate },
            },
          },
        },
        {
          bookings: {
            none: {
              bookingStatus: { in: ['AWAITING_PAYMENT', 'CONFIRMED', 'COMPLETED'] },
              OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
              checkInDate: { lt: checkOutDate },
              checkOutDate: { gt: checkInDate },
            },
          },
        },
      ];
    }

    let orderBy: Prisma.PropertyOrderByWithRelationInput = { createdAt: 'desc' };
    if (query.sortBy === 'price_asc') orderBy = { basePricePerNight: 'asc' };
    if (query.sortBy === 'price_desc') orderBy = { basePricePerNight: 'desc' };
    if (query.sortBy === 'rating_desc') orderBy = { ratingAverage: 'desc' };

    const [items, total] = await Promise.all([
      this.prisma.property.findMany({ where, orderBy, skip, take: limit, include: { location: true, amenities: true, images: { orderBy: { sortOrder: 'asc' } }, rules: true, pricingRules: true, availabilityOverrides: true } }),
      this.prisma.property.count({ where }),
    ]);

    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findFeatured() {
    return this.prisma.property.findMany({ where: { status: 'PUBLISHED', featured: true }, take: 6, orderBy: { createdAt: 'desc' }, include: { location: true, amenities: true, images: { orderBy: { sortOrder: 'asc' } } } });
  }

  async findBySlug(slug: string) {
    const property = await this.prisma.property.findUnique({
      where: { slug },
      include: {
        host: { select: SAFE_USER_SELECT },
        location: true,
        amenities: true,
        images: { orderBy: { sortOrder: 'asc' } },
        rules: true,
        pricingRules: true,
        availabilityOverrides: true,
        availabilityBlocks: { where: { blockType: { in: ['BLOCKED', 'RESERVED'] } }, orderBy: { startDate: 'asc' } },
        reviews: { where: { status: 'PUBLISHED' }, orderBy: { createdAt: 'desc' }, include: { authorUser: { select: { firstName: true, lastName: true } } } },
      },
    });

    if (!property || property.status !== 'PUBLISHED') throw new NotFoundException('Property not found.');
    return property;
  }
}

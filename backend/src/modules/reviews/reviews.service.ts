import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateReviewDto) {
    const booking = await this.prisma.booking.findFirst({
      where: { id: dto.bookingId, propertyId: dto.propertyId, guestUserId: userId, bookingStatus: { in: ['COMPLETED'] } },
    });
    if (!booking) throw new BadRequestException('You are not eligible to review this stay. Reviews can be submitted after completed bookings.');

    const duplicate = await this.prisma.review.findFirst({ where: { bookingId: dto.bookingId, authorUserId: userId } });
    if (duplicate) throw new BadRequestException('You have already submitted a review for this booking.');

    const review = await this.prisma.review.create({
      data: { propertyId: dto.propertyId, bookingId: dto.bookingId, authorUserId: userId, rating: dto.rating, title: dto.title, comment: dto.comment, status: 'PENDING' },
      include: { authorUser: { select: { id: true, firstName: true, lastName: true } } },
    });

    await this.prisma.auditLog.create({ data: { actorUserId: userId, action: 'USER_SUBMITTED_REVIEW_PENDING', entityType: 'REVIEW', entityId: review.id, metadataJson: { propertyId: dto.propertyId, bookingId: dto.bookingId } } });
    return { ...review, moderationMessage: 'Review submitted and pending moderation.' };
  }

  async getEligibleBookings(userId: string) {
    return this.prisma.booking.findMany({
      where: { guestUserId: userId, bookingStatus: 'COMPLETED', reviews: { none: { authorUserId: userId } } },
      orderBy: { checkOutDate: 'desc' },
      include: { property: { include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 }, location: true } } },
    });
  }

  async getPublishedByProperty(propertyId: string) {
    const property = await this.prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) throw new NotFoundException('Property not found.');

    const [items, aggregate] = await Promise.all([
      this.prisma.review.findMany({ where: { propertyId, status: 'PUBLISHED' }, orderBy: { createdAt: 'desc' }, include: { authorUser: { select: { firstName: true, lastName: true } } } }),
      this.prisma.review.aggregate({ where: { propertyId, status: 'PUBLISHED' }, _avg: { rating: true }, _count: { _all: true } }),
    ]);

    return { items, averageRating: aggregate._avg.rating ?? 0, totalReviews: aggregate._count._all };
  }
}

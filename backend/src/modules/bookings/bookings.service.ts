import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { BookingStatus, PaymentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { BookingQuoteDto } from './dto/booking-quote.dto';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  private readonly awaitingPaymentTtlMs = 15 * 60 * 1000;

  constructor(private readonly prisma: PrismaService) {}

  async getQuote(dto: BookingQuoteDto) {
    const property = await this.prisma.property.findFirst({ where: { id: dto.propertyId, status: 'PUBLISHED' } });
    if (!property) throw new NotFoundException('Property not found.');

    const checkInDate = new Date(dto.checkInDate);
    const checkOutDate = new Date(dto.checkOutDate);

    this.validateDates(checkInDate, checkOutDate);
    this.validateGuests(dto.guestsCount, property.maxGuests);
    await this.expireStaleAwaitingPayments(dto.propertyId);
    await this.ensureAvailability(dto.propertyId, checkInDate, checkOutDate);

    return this.calculateQuote(property, checkInDate, checkOutDate);
  }

  async createBooking(userId: string, dto: CreateBookingDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { isEmailVerified: true, isActive: true } });
    if (!user?.isActive) throw new UnauthorizedException('Invalid user.');

    const property = await this.prisma.property.findFirst({ where: { id: dto.propertyId, status: 'PUBLISHED' } });
    if (!property) throw new NotFoundException('Property not found.');

    const checkInDate = new Date(dto.checkInDate);
    const checkOutDate = new Date(dto.checkOutDate);
    this.validateDates(checkInDate, checkOutDate);
    this.validateGuests(dto.guestsCount, property.maxGuests);

    return this.prisma.$transaction(async (tx) => {
      await this.expireStaleAwaitingPayments(dto.propertyId, tx);
      await this.ensureAvailability(dto.propertyId, checkInDate, checkOutDate, tx);
      const quote = this.calculateQuote(property, checkInDate, checkOutDate);

      const booking = await tx.booking.create({
        data: {
          propertyId: property.id,
          guestUserId: userId,
          hostId: property.hostId,
          checkInDate,
          checkOutDate,
          guestsCount: dto.guestsCount,
          nights: quote.nights,
          bookingStatus: BookingStatus.AWAITING_PAYMENT,
          subtotal: quote.breakdown.subtotal,
          cleaningFee: quote.breakdown.cleaningFee,
          serviceFee: quote.breakdown.serviceFee,
          taxes: quote.breakdown.taxes,
          totalAmount: quote.breakdown.totalAmount,
          currency: property.currency,
          paymentStatus: PaymentStatus.PENDING,
          expiresAt: new Date(Date.now() + this.awaitingPaymentTtlMs),
          guestDetails: {
            create: {
              firstName: dto.firstName,
              lastName: dto.lastName,
              email: dto.email,
              phone: dto.phone,
              country: dto.country,
              city: dto.city,
              specialRequests: dto.specialRequests,
            },
          },
        },
        include: { property: true, guestDetails: true },
      });

      await tx.auditLog.create({
        data: {
          actorUserId: userId,
          action: 'BOOKING_CREATED_AWAITING_PAYMENT',
          entityType: 'BOOKING',
          entityId: booking.id,
          metadataJson: { propertyId: property.id, checkInDate: dto.checkInDate, checkOutDate: dto.checkOutDate, totalAmount: String(quote.breakdown.totalAmount) },
        },
      });

      return booking;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  }

  async findBookingByIdForUser(bookingId: string, userId: string) {
    await this.expireStaleAwaitingPayments();
    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, guestUserId: userId },
      include: { property: true, guestDetails: true, payments: true },
    });
    if (!booking) throw new NotFoundException('Booking not found.');
    return booking;
  }

  async verifyPaymentStatus(bookingId: string, userId: string) {
    const booking = await this.findBookingByIdForUser(bookingId, userId);
    return {
      bookingId: booking.id,
      bookingStatus: booking.bookingStatus,
      paymentStatus: booking.paymentStatus,
      expiresAt: booking.expiresAt,
    };
  }

  async markBookingConfirmed(bookingId: string) {
    return this.prisma.$transaction(async (tx) => {
      const current = await tx.booking.findUnique({ where: { id: bookingId } });
      if (!current) throw new NotFoundException('Booking not found.');

      if (current.bookingStatus === BookingStatus.CONFIRMED || current.bookingStatus === BookingStatus.COMPLETED) {
        return current;
      }

      if (current.bookingStatus === BookingStatus.CANCELLED || current.bookingStatus === BookingStatus.EXPIRED) {
        throw new BadRequestException('Cannot confirm a cancelled or expired booking.');
      }

      await this.ensureAvailability(current.propertyId, current.checkInDate, current.checkOutDate, tx, bookingId);

      const booking = await tx.booking.update({
        where: { id: bookingId },
        data: { bookingStatus: BookingStatus.CONFIRMED, paymentStatus: PaymentStatus.SUCCEEDED, expiresAt: null },
      });

      await tx.availabilityBlock.upsert({
        where: { id: `reserved-${booking.id}` },
        create: {
          id: `reserved-${booking.id}`,
          propertyId: booking.propertyId,
          startDate: booking.checkInDate,
          endDate: booking.checkOutDate,
          blockType: 'RESERVED',
          reason: `Booking ${booking.id}`,
        },
        update: {
          startDate: booking.checkInDate,
          endDate: booking.checkOutDate,
          blockType: 'RESERVED',
          reason: `Booking ${booking.id}`,
        },
      });

      await tx.auditLog.create({ data: { action: 'BOOKING_CONFIRMED', entityType: 'BOOKING', entityId: booking.id } });
      return booking;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  }

  async markBookingPaymentFailed(bookingId: string) {
    return this.prisma.booking.update({ where: { id: bookingId }, data: { paymentStatus: PaymentStatus.FAILED } });
  }

  async expireStaleAwaitingPayments(propertyId?: string, tx: any = this.prisma) {
    const now = new Date();
    const stale = await tx.booking.findMany({
      where: {
        propertyId,
        bookingStatus: 'AWAITING_PAYMENT',
        expiresAt: { not: null, lt: now },
      },
      select: { id: true },
    });

    if (!stale.length) return { expired: 0 };
    const ids = stale.map((booking: { id: string }) => booking.id);
    await tx.booking.updateMany({
      where: { id: { in: ids } },
      data: { bookingStatus: 'EXPIRED', paymentStatus: 'CANCELLED' },
    });
    await tx.payment.updateMany({
      where: { bookingId: { in: ids }, paymentStatus: { in: ['PENDING', 'REQUIRES_ACTION'] } },
      data: { paymentStatus: 'CANCELLED', failureReason: 'Booking payment window expired.' },
    });
    return { expired: ids.length };
  }

  async ensureAvailability(propertyId: string, checkInDate: Date, checkOutDate: Date, tx: any = this.prisma, ignoreBookingId?: string) {
    const overlappingBlock = await tx.availabilityBlock.findFirst({
      where: {
        propertyId,
        blockType: { in: ['BLOCKED', 'RESERVED'] },
        AND: [{ startDate: { lt: checkOutDate } }, { endDate: { gt: checkInDate } }],
      },
    });
    if (overlappingBlock && overlappingBlock.reason !== `Booking ${ignoreBookingId}`) throw new BadRequestException('Selected dates are not available.');

    const overlappingBooking = await tx.booking.findFirst({
      where: {
        propertyId,
        id: ignoreBookingId ? { not: ignoreBookingId } : undefined,
        bookingStatus: { in: ['AWAITING_PAYMENT', 'CONFIRMED', 'COMPLETED'] },
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        AND: [{ checkInDate: { lt: checkOutDate } }, { checkOutDate: { gt: checkInDate } }],
      },
    });
    if (overlappingBooking) throw new BadRequestException('Property already has an overlapping booking.');
  }

  validateDates(checkInDate: Date, checkOutDate: Date) {
    if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime())) throw new BadRequestException('Invalid booking dates.');
    if (checkOutDate <= checkInDate) throw new BadRequestException('Check-out date must be after check-in date.');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (checkInDate < today) throw new BadRequestException('Check-in date cannot be in the past.');
  }

  validateGuests(guestsCount: number, maxGuests: number) {
    if (guestsCount > maxGuests) throw new BadRequestException('Guest count exceeds property capacity.');
  }

  calculateNights(checkInDate: Date, checkOutDate: Date) {
    const diff = checkOutDate.getTime() - checkInDate.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  private calculateQuote(property: { id: string; currency: string; basePricePerNight: Prisma.Decimal; cleaningFee: Prisma.Decimal; serviceFee: Prisma.Decimal }, checkInDate: Date, checkOutDate: Date) {
    const nights = this.calculateNights(checkInDate, checkOutDate);
    const subtotal = property.basePricePerNight.mul(nights);
    const cleaningFee = property.cleaningFee;
    const serviceFee = property.serviceFee;
    const taxes = subtotal.mul(new Prisma.Decimal(0.08));
    const totalAmount = subtotal.add(cleaningFee).add(serviceFee).add(taxes);
    return { propertyId: property.id, nights, currency: property.currency, breakdown: { subtotal, cleaningFee, serviceFee, taxes, totalAmount } };
  }
}

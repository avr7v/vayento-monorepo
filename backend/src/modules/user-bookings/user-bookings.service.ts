import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { BookingStatus, PaymentStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PaymentsService } from '../payments/payments.service';

@Injectable()
export class UserBookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly paymentsService: PaymentsService,
  ) {}

  async findMine(userId: string) {
    return this.prisma.booking.findMany({
      where: { guestUserId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        property: {
          include: {
            location: true,
            images: { orderBy: { sortOrder: 'asc' } },
          },
        },
        guestDetails: true,
        payments: {
          orderBy: { createdAt: 'desc' },
          include: { refunds: true },
        },
      },
    });
  }

  async findOneMine(userId: string, bookingId: string) {
    const booking = await this.prisma.booking.findFirst({
      where: {
        id: bookingId,
        guestUserId: userId,
      },
      include: {
        property: {
          include: {
            location: true,
            amenities: true,
            images: { orderBy: { sortOrder: 'asc' } },
            rules: true,
          },
        },
        guestDetails: true,
        payments: {
          orderBy: { createdAt: 'desc' },
          include: { refunds: true },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found.');
    }

    return booking;
  }

  async cancelMine(userId: string, bookingId: string) {
    const booking = await this.prisma.booking.findFirst({
      where: {
        id: bookingId,
        guestUserId: userId,
      },
      include: {
        property: {
          include: {
            rules: true,
          },
        },
        guestUser: true,
        host: true,
        guestDetails: true,
        payments: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found.');
    }

    if (booking.bookingStatus === BookingStatus.CANCELLED) {
      throw new BadRequestException('Booking is already cancelled.');
    }

    if (booking.bookingStatus === BookingStatus.COMPLETED) {
      throw new BadRequestException('Completed bookings cannot be cancelled.');
    }

    if (booking.bookingStatus === BookingStatus.EXPIRED) {
      throw new BadRequestException('Expired bookings cannot be cancelled.');
    }

    const cancellableStatuses: BookingStatus[] = [
      BookingStatus.PENDING,
      BookingStatus.AWAITING_PAYMENT,
      BookingStatus.CONFIRMED,
    ];

    if (!cancellableStatuses.includes(booking.bookingStatus)) {
      throw new BadRequestException('This booking cannot be cancelled.');
    }

    const now = new Date();

    if (booking.checkInDate <= now) {
      throw new BadRequestException('Bookings cannot be cancelled after check-in.');
    }

    const succeededPayment = booking.payments.find(
      (payment) => payment.paymentStatus === PaymentStatus.SUCCEEDED,
    );

    const shouldRefund = Boolean(succeededPayment);

    const refund = shouldRefund
      ? await this.paymentsService.refundBooking(
          booking.id,
          booking.property.rules?.cancellationPolicy ??
            'Customer requested cancellation',
        )
      : null;

    const nextPaymentStatus = shouldRefund
      ? PaymentStatus.REFUNDED
      : PaymentStatus.CANCELLED;

    const updatedBooking = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.booking.update({
        where: { id: booking.id },
        data: {
          bookingStatus: BookingStatus.CANCELLED,
          paymentStatus: nextPaymentStatus,
          cancelledAt: now,
          expiresAt: null,
        },
      });

      await tx.payment.updateMany({
        where: {
          bookingId: booking.id,
          paymentStatus: {
            in: [PaymentStatus.PENDING, PaymentStatus.REQUIRES_ACTION],
          },
        },
        data: {
          paymentStatus: PaymentStatus.CANCELLED,
          failureReason: 'Booking cancelled by guest.',
        },
      });

      await tx.availabilityBlock.deleteMany({
        where: {
          propertyId: booking.propertyId,
          blockType: 'RESERVED',
          OR: [
            {
              reason: `Booking ${booking.id}`,
            },
            {
              startDate: booking.checkInDate,
              endDate: booking.checkOutDate,
            },
          ],
        },
      });

      await tx.auditLog.create({
        data: {
          actorUserId: userId,
          action: 'BOOKING_CANCELLED_BY_GUEST',
          entityType: 'BOOKING',
          entityId: booking.id,
          metadataJson: {
            previousBookingStatus: booking.bookingStatus,
            previousPaymentStatus: booking.paymentStatus,
            nextBookingStatus: BookingStatus.CANCELLED,
            nextPaymentStatus,
            refundId: refund?.id ?? null,
          },
        },
      });

      return updated;
    });

    await this.notificationsService.sendCancellationEmail({
      email: booking.guestDetails?.email ?? booking.guestUser.email,
      firstName: booking.guestDetails?.firstName ?? booking.guestUser.firstName,
      propertyTitle: booking.property.title,
      bookingId: booking.id,
    });

    await this.notificationsService.sendAdminAlert({
      subject: 'Booking cancelled',
      message: `Booking ${booking.id} for ${booking.property.title} was cancelled.`,
    });

    return {
      ...updatedBooking,
      refund,
    };
  }
}
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { BookingsService } from '../bookings/bookings.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly stripe?: Stripe;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly bookingsService: BookingsService,
    private readonly notificationsService: NotificationsService,
  ) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (secretKey && !secretKey.includes('change_me')) {
      this.stripe = new Stripe(secretKey, { apiVersion: '2025-02-24.acacia' as Stripe.LatestApiVersion });
    }
  }

  async createPaymentIntent(userId: string, dto: CreatePaymentIntentDto) {
    await this.bookingsService.expireStaleAwaitingPayments();
    const booking = await this.prisma.booking.findFirst({ where: { id: dto.bookingId, guestUserId: userId }, include: { payments: true } });
    if (!booking) throw new NotFoundException('Booking not found.');
    if (booking.bookingStatus !== 'AWAITING_PAYMENT') throw new BadRequestException('Booking is not awaiting payment.');
    if (booking.expiresAt && booking.expiresAt < new Date()) throw new BadRequestException('Booking payment window has expired.');

    const amount = Math.round(Number(booking.totalAmount) * 100);
    const reusablePayment = booking.payments.find((payment) => payment.paymentStatus === 'PENDING' && payment.providerPaymentIntentId);

    if (!this.stripe) {
      const existing = reusablePayment?.providerPaymentIntentId?.startsWith('mock_') ? reusablePayment : null;
      const payment = existing ?? await this.prisma.payment.create({
        data: {
          bookingId: booking.id,
          userId,
          amount: booking.totalAmount,
          currency: booking.currency,
          paymentStatus: 'PENDING',
          provider: 'mock',
          providerPaymentIntentId: `mock_${booking.id}`,
        },
      });
      return { clientSecret: null, paymentId: payment.id, mode: 'mock', bookingId: booking.id };
    }

    if (reusablePayment?.providerPaymentIntentId?.startsWith('pi_')) {
      const existingIntent = await this.stripe.paymentIntents.retrieve(reusablePayment.providerPaymentIntentId);
      return { clientSecret: existingIntent.client_secret, paymentId: reusablePayment.id, mode: 'stripe', bookingId: booking.id };
    }

    const intent = await this.stripe.paymentIntents.create({
      amount,
      currency: booking.currency.toLowerCase(),
      metadata: { bookingId: booking.id, userId, amount: String(amount), currency: booking.currency.toLowerCase() },
      automatic_payment_methods: { enabled: true },
    }, { idempotencyKey: `booking_${booking.id}_payment_intent` });

    const payment = await this.prisma.payment.create({
      data: {
        bookingId: booking.id,
        userId,
        amount: booking.totalAmount,
        currency: booking.currency,
        paymentStatus: 'PENDING',
        provider: 'stripe',
        providerPaymentIntentId: intent.id,
        rawPayloadJson: intent as unknown as object,
      },
    });

    return { clientSecret: intent.client_secret, paymentId: payment.id, mode: 'stripe', bookingId: booking.id };
  }

  async confirmMockPayment(userId: string, bookingId: string) {
    if (this.stripe) throw new BadRequestException('Mock confirmation is disabled when Stripe is configured.');

    const booking = await this.prisma.booking.findFirst({ where: { id: bookingId, guestUserId: userId }, include: { payments: true, property: true, guestDetails: true, guestUser: true, host: true } });
    if (!booking) throw new NotFoundException('Booking not found.');
    if (booking.bookingStatus !== 'AWAITING_PAYMENT') throw new BadRequestException('Booking is not awaiting payment.');
    if (booking.expiresAt && booking.expiresAt < new Date()) throw new BadRequestException('Booking payment window has expired.');

    await this.bookingsService.markBookingConfirmed(booking.id);
    await this.prisma.payment.updateMany({
      where: { bookingId: booking.id, provider: 'mock' },
      data: { paymentStatus: 'SUCCEEDED', paidAt: new Date(), receiptUrl: `${this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000'}/booking/success?bookingId=${booking.id}` },
    });

    await this.notifySuccessfulBooking(booking.id);
    return { success: true, bookingId: booking.id, mode: 'mock' };
  }

  async handleWebhook(signature: string | string[] | undefined, payload: Buffer | string) {
    if (!this.stripe) {
      this.logger.warn('Stripe webhook received without Stripe configuration.');
      return { received: true, mode: 'mock' };
    }

    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) throw new BadRequestException('Missing webhook secret.');

    const event = this.stripe.webhooks.constructEvent(payload, String(signature), webhookSecret);
    const duplicate = await this.prisma.stripeWebhookEvent.findUnique({ where: { id: event.id } });
    if (duplicate) return { received: true, duplicate: true };

    await this.prisma.stripeWebhookEvent.create({ data: { id: event.id, type: event.type, payloadJson: event as unknown as object } });

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await this.handlePaymentIntentSucceeded(paymentIntent);
    }

    if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const bookingId = paymentIntent.metadata.bookingId;
      if (bookingId) await this.bookingsService.markBookingPaymentFailed(bookingId);
      await this.prisma.payment.updateMany({
        where: { providerPaymentIntentId: paymentIntent.id },
        data: { paymentStatus: 'FAILED', failureReason: paymentIntent.last_payment_error?.message, rawPayloadJson: paymentIntent as unknown as object },
      });
    }

    return { received: true };
  }

  async refundBooking(bookingId: string, reason?: string) {
    const payment = await this.prisma.payment.findFirst({ where: { bookingId, paymentStatus: 'SUCCEEDED' }, orderBy: { paidAt: 'desc' } });
    if (!payment) return null;

    if (!this.stripe || payment.provider !== 'stripe' || !payment.providerPaymentIntentId?.startsWith('pi_')) {
      const refund = await this.prisma.refund.create({
        data: { paymentId: payment.id, bookingId, amount: payment.amount, currency: payment.currency, status: 'SUCCEEDED', reason: reason ?? 'Mock/local refund' },
      });
      await this.prisma.payment.update({ where: { id: payment.id }, data: { paymentStatus: 'REFUNDED' } });
      return refund;
    }

    const refund = await this.stripe.refunds.create({ payment_intent: payment.providerPaymentIntentId, reason: 'requested_by_customer' }, { idempotencyKey: `booking_${bookingId}_refund` });
    const record = await this.prisma.refund.create({
      data: {
        paymentId: payment.id,
        bookingId,
        providerRefundId: refund.id,
        amount: payment.amount,
        currency: payment.currency,
        status: refund.status === 'succeeded' ? 'SUCCEEDED' : 'PENDING',
        reason,
        rawPayloadJson: refund as unknown as object,
      },
    });
    if (refund.status === 'succeeded') await this.prisma.payment.update({ where: { id: payment.id }, data: { paymentStatus: 'REFUNDED' } });
    return record;
  }

  async getMyPayments(userId: string) {
    return this.prisma.payment.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, include: { booking: { include: { property: true } }, refunds: true } });
  }

  async getPayment(userId: string, paymentId: string) {
    const payment = await this.prisma.payment.findFirst({ where: { id: paymentId, userId }, include: { booking: { include: { property: true } }, refunds: true } });
    if (!payment) throw new NotFoundException('Payment not found.');
    return payment;
  }

  private async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    const bookingId = paymentIntent.metadata.bookingId;
    if (!bookingId) return;

    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException('Booking not found for payment intent.');

    const expectedAmount = Math.round(Number(booking.totalAmount) * 100);
    const expectedCurrency = booking.currency.toLowerCase();
    if (paymentIntent.amount_received !== expectedAmount || paymentIntent.currency !== expectedCurrency) {
      await this.prisma.payment.updateMany({
        where: { providerPaymentIntentId: paymentIntent.id },
        data: { paymentStatus: 'FAILED', failureReason: 'Payment amount or currency mismatch.', rawPayloadJson: paymentIntent as unknown as object },
      });
      throw new BadRequestException('Payment amount or currency mismatch.');
    }

    await this.bookingsService.markBookingConfirmed(bookingId);
    await this.prisma.payment.updateMany({
      where: { providerPaymentIntentId: paymentIntent.id },
      data: {
        paymentStatus: 'SUCCEEDED',
        paidAt: new Date(),
        rawPayloadJson: paymentIntent as unknown as object,
      },
    });
    await this.notifySuccessfulBooking(bookingId);
  }

  private async notifySuccessfulBooking(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId }, include: { property: true, guestDetails: true, guestUser: true, host: true } });
    if (!booking) return;

    await this.notificationsService.sendPaymentSuccessEmail({
      email: booking.guestDetails?.email ?? booking.guestUser.email,
      firstName: booking.guestDetails?.firstName ?? booking.guestUser.firstName,
      propertyTitle: booking.property.title,
      totalAmount: String(booking.totalAmount),
      bookingId: booking.id,
    });
    await this.notificationsService.sendBookingConfirmationEmail({
      email: booking.guestDetails?.email ?? booking.guestUser.email,
      firstName: booking.guestDetails?.firstName ?? booking.guestUser.firstName,
      propertyTitle: booking.property.title,
      checkInDate: booking.checkInDate.toISOString().slice(0, 10),
      checkOutDate: booking.checkOutDate.toISOString().slice(0, 10),
      totalAmount: String(booking.totalAmount),
      bookingId: booking.id,
    });
    await this.notificationsService.sendHostBookingAlert({ email: booking.host.email, hostName: booking.host.firstName, propertyTitle: booking.property.title, bookingId: booking.id });
  }
}

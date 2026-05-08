import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from './email.service';
import { EmailTemplatesService } from './email-templates.service';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly emailService: EmailService,
    private readonly templates: EmailTemplatesService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async sendWelcomeEmail(payload: { email: string; firstName: string }) {
    const email = this.templates.welcome(payload);
    return this.sendTracked('WELCOME', payload.email, email.subject, email.html);
  }

  async sendEmailVerificationEmail(payload: {
    email: string;
    firstName: string;
    verificationUrl: string;
  }) {
    const email = this.templates.emailVerification(payload);
    return this.sendTracked('EMAIL_VERIFICATION', payload.email, email.subject, email.html);
  }

  async sendPasswordResetEmail(payload: {
    email: string;
    firstName: string;
    resetUrl: string;
  }) {
    const email = this.templates.passwordReset(payload);
    return this.sendTracked('PASSWORD_RESET', payload.email, email.subject, email.html);
  }

  async sendBookingConfirmationEmail(payload: {
    email: string;
    firstName: string;
    propertyTitle: string;
    checkInDate: string;
    checkOutDate: string;
    totalAmount: string;
    bookingId: string;
  }) {
    const email = this.templates.bookingConfirmation(payload);

    return this.sendTracked(
      'BOOKING_CONFIRMATION',
      payload.email,
      email.subject,
      email.html,
      { bookingId: payload.bookingId },
    );
  }

  async sendPaymentSuccessEmail(payload: {
    email: string;
    firstName: string;
    propertyTitle: string;
    totalAmount: string;
    bookingId: string;
  }) {
    const email = this.templates.paymentSuccess(payload);

    return this.sendTracked(
      'PAYMENT_SUCCESS',
      payload.email,
      email.subject,
      email.html,
      { bookingId: payload.bookingId },
    );
  }

  async sendCancellationEmail(payload: {
    email: string;
    firstName: string;
    propertyTitle: string;
    bookingId: string;
  }) {
    const email = this.templates.cancellation(payload);

    return this.sendTracked(
      'BOOKING_CANCELLATION',
      payload.email,
      email.subject,
      email.html,
      { bookingId: payload.bookingId },
    );
  }

  async sendHostBookingAlert(payload: {
    email: string;
    hostName: string;
    propertyTitle: string;
    bookingId: string;
  }) {
    const email = this.templates.hostBookingAlert(payload);

    return this.sendTracked(
      'HOST_BOOKING_ALERT',
      payload.email,
      email.subject,
      email.html,
      { bookingId: payload.bookingId },
    );
  }

  async sendAdminAlert(payload: { subject: string; message: string }) {
    const to = this.configService.get<string>('ADMIN_ALERT_EMAIL') || 'admin@vayento.local';
    const email = this.templates.adminAlert(payload);

    return this.sendTracked('ADMIN_ALERT', to, email.subject, email.html);
  }

  async sendMessageAlert(payload: {
    to: string;
    userId?: string;
    senderName: string;
    preview: string;
    conversationId: string;
  }) {
    const email = this.templates.messageAlert(payload);

    return this.sendTracked(
      'MESSAGE_ALERT',
      payload.to,
      email.subject,
      email.html,
      {
        conversationId: payload.conversationId,
        ...(payload.userId ? { userId: payload.userId } : {}),
      },
    );
  }

  private async sendTracked(
    type: string,
    to: string,
    subject: string,
    html: string,
    metadataJson?: Prisma.InputJsonValue,
  ) {
    try {
      const result: any = await this.emailService.send({
        to,
        subject,
        html,
      });

      await this.prisma.notificationLog
        .create({
          data: {
            recipient: to,
            type,
            status: 'SENT',
            providerMessageId: result?.messageId,
            ...(metadataJson !== undefined ? { metadataJson } : {}),
            sentAt: new Date(),
          },
        })
        .catch(() => undefined);

      return result;
    } catch (error: any) {
      await this.prisma.notificationLog
        .create({
          data: {
            recipient: to,
            type,
            status: 'FAILED',
            error: error?.message,
            ...(metadataJson !== undefined ? { metadataJson } : {}),
          },
        })
        .catch(() => undefined);

      throw error;
    }
  }
}
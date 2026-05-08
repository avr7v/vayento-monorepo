import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailTemplatesService {
  private wrap(title: string, body: string) {
    return `
      <div style="font-family: Arial, sans-serif; background: #f7f4ee; padding: 32px; color: #1f2328;">
        <div style="max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 20px; padding: 32px; border: 1px solid #e8ded0;">
          <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.2em; color: #8a7660; margin-bottom: 12px;">Vayento</div>
          <h1 style="margin: 0 0 16px; font-size: 32px; line-height: 1.2;">${title}</h1>
          <div style="font-size: 15px; line-height: 1.8; color: #5f5a53;">${body}</div>
        </div>
      </div>`;
  }

  welcome(payload: { firstName: string }) {
    return {
      subject: 'Welcome to Vayento',
      html: this.wrap('Welcome to Vayento', `<p>Hello ${payload.firstName},</p><p>Your account has been created successfully.</p>`),
    };
  }

  emailVerification(payload: { firstName: string; verificationUrl: string }) {
    return {
      subject: 'Verify your email',
      html: this.wrap('Verify your email', `<p>Hello ${payload.firstName},</p><p>Please verify your email address to complete your account setup.</p><p><a href="${payload.verificationUrl}" style="display:inline-block;padding:12px 22px;border-radius:999px;background:#1f2328;color:#f7f4ee;text-decoration:none;">Verify email</a></p>`),
    };
  }

  passwordReset(payload: { firstName: string; resetUrl: string }) {
    return {
      subject: 'Reset your password',
      html: this.wrap('Reset your password', `<p>Hello ${payload.firstName},</p><p>You requested to reset your password.</p><p><a href="${payload.resetUrl}" style="display:inline-block;padding:12px 22px;border-radius:999px;background:#1f2328;color:#f7f4ee;text-decoration:none;">Create a new password</a></p>`),
    };
  }

  bookingConfirmation(payload: { firstName: string; propertyTitle: string; checkInDate: string; checkOutDate: string; totalAmount: string; bookingId: string }) {
    return {
      subject: 'Your booking is confirmed',
      html: this.wrap('Your booking is confirmed', `<p>Hello ${payload.firstName},</p><p>Your stay at <strong>${payload.propertyTitle}</strong> is confirmed.</p><p>Booking ID: ${payload.bookingId}<br/>Check-in: ${payload.checkInDate}<br/>Check-out: ${payload.checkOutDate}<br/>Total: €${payload.totalAmount}</p>`),
    };
  }

  paymentSuccess(payload: { firstName: string; propertyTitle: string; totalAmount: string; bookingId: string }) {
    return {
      subject: 'Payment received',
      html: this.wrap('Payment received', `<p>Hello ${payload.firstName},</p><p>We received your payment for <strong>${payload.propertyTitle}</strong>.</p><p>Booking ID: ${payload.bookingId}<br/>Amount: €${payload.totalAmount}</p>`),
    };
  }

  cancellation(payload: { firstName: string; propertyTitle: string; bookingId: string }) {
    return {
      subject: 'Booking cancelled',
      html: this.wrap('Booking cancelled', `<p>Hello ${payload.firstName},</p><p>Your booking for <strong>${payload.propertyTitle}</strong> has been cancelled.</p><p>Booking ID: ${payload.bookingId}</p>`),
    };
  }

  hostBookingAlert(payload: { hostName: string; propertyTitle: string; bookingId: string }) {
    return {
      subject: 'New booking received',
      html: this.wrap('New booking received', `<p>Hello ${payload.hostName},</p><p>You received a new booking for <strong>${payload.propertyTitle}</strong>.</p><p>Booking ID: ${payload.bookingId}</p>`),
    };
  }

  adminAlert(payload: { subject: string; message: string }) {
    return {
      subject: payload.subject,
      html: this.wrap(payload.subject, `<p>${payload.message}</p>`),
    };
  }

  messageAlert(payload: { senderName: string; preview: string; conversationId: string }) {
    return {
      subject: 'New Vayento message',
      html: this.wrap('New message received', `<p><strong>${payload.senderName}</strong> sent you a message.</p><p>${payload.preview}</p><p>Conversation ID: ${payload.conversationId}</p>`),
    };
  }
}

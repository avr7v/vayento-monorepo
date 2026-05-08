import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { SendEmailDto } from './dto/send-email.dto';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter;
  private readonly from: string;

  constructor(private readonly configService: ConfigService) {
    this.from = this.configService.get<string>('MAIL_FROM') ?? 'Vayento <no-reply@vayento.local>';

    const host = this.configService.get<string>('SMTP_HOST');
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');

    this.transporter = host && user && pass
      ? nodemailer.createTransport({
          host,
          port: Number(this.configService.get<string>('SMTP_PORT') ?? 587),
          secure: this.configService.get<string>('SMTP_SECURE') === 'true',
          auth: { user, pass },
        })
      : nodemailer.createTransport({ jsonTransport: true });
  }

  async send(dto: SendEmailDto) {
    const result = await this.transporter.sendMail({
      from: this.from,
      to: dto.to,
      cc: dto.cc,
      subject: dto.subject,
      html: dto.html,
      text: dto.text,
    });

    this.logger.log(`Email sent to ${dto.to}`);
    return result;
  }
}

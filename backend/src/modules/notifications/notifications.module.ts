import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailTemplatesService } from './email-templates.service';
import { NotificationsService } from './notifications.service';

@Module({
  providers: [EmailService, EmailTemplatesService, NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}

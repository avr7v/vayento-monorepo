import { Module } from '@nestjs/common';
import { MessagingController, AdminSupportController } from './messaging.controller';
import { MessagingService } from './messaging.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [MessagingController, AdminSupportController],
  providers: [MessagingService],
  exports: [MessagingService],
})
export class MessagingModule {}

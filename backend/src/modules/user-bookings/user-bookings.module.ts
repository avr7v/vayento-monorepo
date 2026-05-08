import { Module } from '@nestjs/common';
import { UserBookingsController } from './user-bookings.controller';
import { UserBookingsService } from './user-bookings.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [NotificationsModule, PaymentsModule],
  controllers: [UserBookingsController],
  providers: [UserBookingsService],
  exports: [UserBookingsService],
})
export class UserBookingsModule {}

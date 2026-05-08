import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { RateLimitGuard } from '../../common/rate-limit/rate-limit.guard';
import { HostLeadsController } from './host-leads.controller';
import { HostLeadsService } from './host-leads.service';

@Module({
  imports: [NotificationsModule],
  controllers: [HostLeadsController],
  providers: [HostLeadsService, RateLimitGuard],
})
export class HostLeadsModule {}

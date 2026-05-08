import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { PropertiesModule } from './modules/properties/properties.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { UserBookingsModule } from './modules/user-bookings/user-bookings.module';
import { WishlistModule } from './modules/wishlist/wishlist.module';
import { HostModule } from './modules/host/host.module';
import { AdminModule } from './modules/admin/admin.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { StorageModule } from './common/storage/storage.module';
import { MediaModule } from './modules/media/media.module';
import { PublicContentModule } from './modules/public-content/public-content.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { MessagingModule } from './modules/messaging/messaging.module';
import { HostLeadsModule } from './modules/host-leads/host-leads.module';
import { MetadataModule } from './modules/metadata/metadata.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UsersModule,
    AuthModule,
    HealthModule,
    PropertiesModule,
    BookingsModule,
    PaymentsModule,
    UserBookingsModule,
    WishlistModule,
    HostModule,
    AdminModule,
    NotificationsModule,
    StorageModule,
    MediaModule,
    PublicContentModule,
    ReviewsModule,
    MessagingModule,
    HostLeadsModule,
    MetadataModule,
  ],
})
export class AppModule {}

import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingQuoteDto } from './dto/booking-quote.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post('quote')
  getQuote(@Body() dto: BookingQuoteDto) {
    return this.bookingsService.getQuote(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER')
  @Post()
  createBooking(
    @CurrentUser() user: { sub: string },
    @Body() dto: CreateBookingDto,
  ) {
    return this.bookingsService.createBooking(user.sub, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER')
  @Get(':id')
  getById(@CurrentUser() user: { sub: string }, @Param('id') id: string) {
    return this.bookingsService.findBookingByIdForUser(id, user.sub);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER')
  @Get(':id/payment-status')
  getPaymentStatus(
    @CurrentUser() user: { sub: string },
    @Param('id') id: string,
  ) {
    return this.bookingsService.verifyPaymentStatus(id, user.sub);
  }
}
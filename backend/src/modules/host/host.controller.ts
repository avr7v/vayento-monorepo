import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { HostService } from './host.service';
import { CreateHostPropertyDto } from './dto/create-host-property.dto';
import { UpdateHostPropertyDto } from './dto/update-host-property.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { UpdateHostBookingStatusDto } from './dto/update-host-booking-status.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('HOST')
@Controller('host')
export class HostController {
  constructor(private readonly hostService: HostService) {}

  @Get('dashboard')
  getDashboard(@CurrentUser() user: { sub: string }) {
    return this.hostService.getDashboard(user.sub);
  }

  @Get('properties')
  getProperties(@CurrentUser() user: { sub: string }) {
    return this.hostService.findProperties(user.sub);
  }

  @Post('properties')
  createProperty(@CurrentUser() user: { sub: string }, @Body() dto: CreateHostPropertyDto) {
    return this.hostService.createProperty(user.sub, dto);
  }

  @Get('properties/:id')
  getProperty(@CurrentUser() user: { sub: string }, @Param('id') id: string) {
    return this.hostService.findProperty(user.sub, id);
  }

  @Patch('properties/:id')
  updateProperty(@CurrentUser() user: { sub: string }, @Param('id') id: string, @Body() dto: UpdateHostPropertyDto) {
    return this.hostService.updateProperty(user.sub, id, dto);
  }

  @Patch('properties/:id/submit-review')
  submitPropertyForReview(@CurrentUser() user: { sub: string }, @Param('id') id: string) {
    return this.hostService.submitPropertyForReview(user.sub, id);
  }

  @Delete('properties/:id')
  deleteProperty(@CurrentUser() user: { sub: string }, @Param('id') id: string) {
    return this.hostService.deleteProperty(user.sub, id);
  }

  @Get('properties/:id/availability')
  getAvailability(@CurrentUser() user: { sub: string }, @Param('id') id: string) {
    return this.hostService.getAvailability(user.sub, id);
  }

  @Patch('properties/:id/availability')
  updateAvailability(@CurrentUser() user: { sub: string }, @Param('id') id: string, @Body() dto: UpdateAvailabilityDto) {
    return this.hostService.updateAvailability(user.sub, id, dto);
  }

  @Get('bookings')
  getBookings(@CurrentUser() user: { sub: string }) {
    return this.hostService.getBookings(user.sub);
  }

  @Get('bookings/:id')
  getBooking(@CurrentUser() user: { sub: string }, @Param('id') id: string) {
    return this.hostService.getBooking(user.sub, id);
  }

  @Patch('bookings/:id/status')
  updateBookingStatus(@CurrentUser() user: { sub: string }, @Param('id') id: string, @Body() dto: UpdateHostBookingStatusDto) {
    return this.hostService.updateBookingStatus(user.sub, id, dto);
  }

  @Get('earnings/summary')
  getEarningsSummary(@CurrentUser() user: { sub: string }) {
    return this.hostService.getEarningsSummary(user.sub);
  }

  @Get('earnings/bookings')
  getEarningsBookings(@CurrentUser() user: { sub: string }) {
    return this.hostService.getEarningsBookings(user.sub);
  }
}

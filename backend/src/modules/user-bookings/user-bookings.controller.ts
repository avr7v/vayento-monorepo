import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserBookingsService } from './user-bookings.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('USER')
@Controller('users/me/bookings')
export class UserBookingsController {
  constructor(private readonly userBookingsService: UserBookingsService) {}

  @Get()
  findMine(@CurrentUser() user: { sub: string }) {
    return this.userBookingsService.findMine(user.sub);
  }

  @Get(':id')
  findOneMine(@CurrentUser() user: { sub: string }, @Param('id') id: string) {
    return this.userBookingsService.findOneMine(user.sub, id);
  }

  @Patch(':id/cancel')
  cancelMine(@CurrentUser() user: { sub: string }, @Param('id') id: string) {
    return this.userBookingsService.cancelMine(user.sub, id);
  }
}
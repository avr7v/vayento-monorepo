import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('property/:propertyId')
  getPublishedByProperty(@Param('propertyId') propertyId: string) {
    return this.reviewsService.getPublishedByProperty(propertyId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER')
  @Get('eligible-bookings')
  getEligibleBookings(@CurrentUser() user: { sub: string }) {
    return this.reviewsService.getEligibleBookings(user.sub);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER')
  @Post()
  create(@CurrentUser() user: { sub: string }, @Body() dto: CreateReviewDto) {
    return this.reviewsService.create(user.sub, dto);
  }
}
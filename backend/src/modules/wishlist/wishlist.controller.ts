import { Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { WishlistService } from './wishlist.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('USER')
@Controller('users/me/wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  getMine(@CurrentUser() user: { sub: string }) {
    return this.wishlistService.getMine(user.sub);
  }

  @Post(':propertyId')
  add(
    @CurrentUser() user: { sub: string },
    @Param('propertyId') propertyId: string,
  ) {
    return this.wishlistService.add(user.sub, propertyId);
  }

  @Delete(':propertyId')
  remove(
    @CurrentUser() user: { sub: string },
    @Param('propertyId') propertyId: string,
  ) {
    return this.wishlistService.remove(user.sub, propertyId);
  }
}
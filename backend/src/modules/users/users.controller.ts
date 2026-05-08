import { Body, Controller, Delete, Get, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateEmailDto } from './dto/update-email.dto';
import { DeleteAccountDto } from './dto/delete-account.dto';

@UseGuards(JwtAuthGuard)
@Controller('users/me')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  getProfile(@CurrentUser() user: { sub: string }) {
    return this.usersService.getProfile(user.sub);
  }

  @Patch('profile')
  updateProfile(@CurrentUser() user: { sub: string }, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.sub, dto);
  }

  @Patch('email')
  updateEmail(@CurrentUser() user: { sub: string }, @Body() dto: UpdateEmailDto) {
    return this.usersService.updateEmail(user.sub, dto.email);
  }

  @Patch('password')
  changePassword(@CurrentUser() user: { sub: string }, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(user.sub, dto.currentPassword, dto.newPassword);
  }

  @Delete()
  deactivateAccount(@CurrentUser() user: { sub: string }, @Body() dto: DeleteAccountDto) {
    return this.usersService.deactivateAccount(user.sub, dto.password, dto.reason);
  }
}

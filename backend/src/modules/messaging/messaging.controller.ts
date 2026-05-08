import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { MessagingService } from './messaging.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';

@UseGuards(JwtAuthGuard)
@Controller('conversations')
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @Get()
  listMine(@CurrentUser() user: { sub: string }) {
    return this.messagingService.listMine(user.sub);
  }

  @Get(':id/messages')
  listMessages(@CurrentUser() user: { sub: string }, @Param('id') id: string) {
    return this.messagingService.listMessages(user.sub, id);
  }

  @Post()
  createConversation(@CurrentUser() user: { sub: string }, @Body() dto: CreateConversationDto) {
    return this.messagingService.createConversation(user.sub, dto);
  }

  @Post(':id/messages')
  sendMessage(@CurrentUser() user: { sub: string }, @Param('id') id: string, @Body() dto: SendMessageDto) {
    return this.messagingService.sendMessage(user.sub, id, dto);
  }

  @Patch(':id/read')
  markAsRead(@CurrentUser() user: { sub: string }, @Param('id') id: string) {
    return this.messagingService.markAsRead(user.sub, id);
  }
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin/support-inbox')
export class AdminSupportController {
  constructor(private readonly messagingService: MessagingService) {}

  @Get()
  getInbox() {
    return this.messagingService.adminSupportInbox();
  }
}

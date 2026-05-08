import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { HostLeadsService } from './host-leads.service';
import { CreateHostLeadDto } from './dto/create-host-lead.dto';
import { RateLimit } from '../../common/rate-limit/rate-limit.decorator';
import { RateLimitGuard } from '../../common/rate-limit/rate-limit.guard';

@Controller('host-leads')
export class HostLeadsController {
  constructor(private readonly hostLeadsService: HostLeadsService) {}

  @UseGuards(RateLimitGuard)
  @RateLimit({ limit: 5, ttlMs: 60_000 })
  @Post()
  create(@Body() dto: CreateHostLeadDto) {
    return this.hostLeadsService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get()
  list() {
    return this.hostLeadsService.list();
  }
}

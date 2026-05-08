import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RateLimit } from '../../common/rate-limit/rate-limit.decorator';
import { RateLimitGuard } from '../../common/rate-limit/rate-limit.guard';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard, RateLimitGuard)
  @Roles('USER')
  @RateLimit({ limit: 10, ttlMs: 60_000 })
  @Post('create-intent')
  createIntent(
    @CurrentUser() user: { sub: string },
    @Body() dto: CreatePaymentIntentDto,
  ) {
    return this.paymentsService.createPaymentIntent(user.sub, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard, RateLimitGuard)
  @Roles('USER')
  @RateLimit({ limit: 10, ttlMs: 60_000 })
  @Post('mock-confirm/:bookingId')
  confirmMock(
    @CurrentUser() user: { sub: string },
    @Param('bookingId') bookingId: string,
  ) {
    return this.paymentsService.confirmMockPayment(user.sub, bookingId);
  }

  @Post('webhook')
  webhook(
    @Headers('stripe-signature') signature: string | undefined,
    @Req() req: any,
  ) {
    return this.paymentsService.handleWebhook(
      signature,
      req.rawBody ?? req.body,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER')
  @Get('me')
  getMine(@CurrentUser() user: { sub: string }) {
    return this.paymentsService.getMyPayments(user.sub);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER')
  @Get(':id')
  getOne(@CurrentUser() user: { sub: string }, @Param('id') id: string) {
    return this.paymentsService.getPayment(user.sub, id);
  }
}
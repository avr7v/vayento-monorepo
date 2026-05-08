import { Controller, Get, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getHealth() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ok',
        service: 'vayento-api',
        database: 'ok',
        timestamp: new Date().toISOString(),
      };
    } catch {
      throw new InternalServerErrorException({
        status: 'error',
        service: 'vayento-api',
        database: 'unreachable',
        timestamp: new Date().toISOString(),
      });
    }
  }
}

import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WishlistService {
  constructor(private readonly prisma: PrismaService) {}

  async getMine(userId: string) {
    return this.prisma.wishlist.findMany({
      where: { userId },
      include: {
        property: {
          include: {
            location: true,
            images: { orderBy: { sortOrder: 'asc' } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async add(userId: string, propertyId: string) {
    const existing = await this.prisma.wishlist.findUnique({
      where: { userId_propertyId: { userId, propertyId } },
    });

    if (existing) throw new BadRequestException('Property already exists in wishlist.');

    return this.prisma.wishlist.create({
      data: { userId, propertyId },
      include: { property: { include: { location: true, images: true } } },
    });
  }

  async remove(userId: string, propertyId: string) {
    await this.prisma.wishlist.delete({
      where: { userId_propertyId: { userId, propertyId } },
    });
    return { success: true };
  }
}

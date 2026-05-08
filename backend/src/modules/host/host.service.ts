import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { BookingStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateHostPropertyDto } from './dto/create-host-property.dto';
import { UpdateHostPropertyDto } from './dto/update-host-property.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { UpdateHostBookingStatusDto } from './dto/update-host-booking-status.dto';

@Injectable()
export class HostService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(hostId: string) {
    const [
      propertiesCount,
      publishedCount,
      bookingsCount,
      confirmedRevenueResult,
      unreadMessages,
    ] = await Promise.all([
      this.prisma.property.count({ where: { hostId } }),
      this.prisma.property.count({ where: { hostId, status: 'PUBLISHED' } }),
      this.prisma.booking.count({ where: { hostId } }),
      this.prisma.booking.aggregate({
        where: {
          hostId,
          bookingStatus: { in: ['CONFIRMED', 'COMPLETED'] },
        },
        _sum: { totalAmount: true },
      }),
      this.prisma.message.count({
        where: {
          readAt: null,
          conversation: {
            participants: {
              some: { userId: hostId },
            },
          },
          senderUserId: { not: hostId },
        },
      }),
    ]);

    return {
      propertiesCount,
      publishedCount,
      bookingsCount,
      unreadMessages,
      revenueTotal: confirmedRevenueResult._sum.totalAmount ?? 0,
    };
  }

  async findProperties(hostId: string) {
    return this.prisma.property.findMany({
      where: { hostId },
      orderBy: { createdAt: 'desc' },
      include: {
        location: true,
        amenities: true,
        images: { orderBy: { sortOrder: 'asc' } },
        rules: true,
        pricingRules: true,
        availabilityOverrides: true,
      },
    });
  }

  async findProperty(hostId: string, propertyId: string) {
    const property = await this.prisma.property.findFirst({
      where: { id: propertyId, hostId },
      include: {
        location: true,
        amenities: true,
        images: { orderBy: { sortOrder: 'asc' } },
        rules: true,
        pricingRules: true,
        availabilityOverrides: true,
        availabilityBlocks: { orderBy: { startDate: 'asc' } },
      },
    });

    if (!property) {
      throw new NotFoundException('Property not found.');
    }

    return property;
  }

  async createProperty(hostId: string, dto: CreateHostPropertyDto) {
    const existingSlug = await this.prisma.property.findUnique({
      where: { slug: dto.slug },
    });

    if (existingSlug) {
      throw new BadRequestException('Slug already exists.');
    }

    const property = await this.prisma.property.create({
      data: {
        hostId,
        title: dto.title,
        slug: dto.slug,
        shortDescription: dto.shortDescription,
        longDescription: dto.longDescription,
        propertyType: dto.propertyType,
        status: 'DRAFT',
        basePricePerNight: dto.basePricePerNight,
        cleaningFee: dto.cleaningFee,
        serviceFee: dto.serviceFee,
        maxGuests: dto.maxGuests,
        bedrooms: dto.bedrooms,
        bathrooms: dto.bathrooms,
        citySearch: dto.location.city,
        location: { create: dto.location },
        amenities: { create: dto.amenities ?? [] },
        images: { create: dto.images ?? [] },
        rules: dto.rules ? { create: dto.rules } : undefined,
      },
      include: {
        location: true,
        amenities: true,
        images: true,
        rules: true,
        pricingRules: true,
        availabilityOverrides: true,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        actorUserId: hostId,
        action: 'HOST_CREATED_PROPERTY_DRAFT',
        entityType: 'PROPERTY',
        entityId: property.id,
      },
    });

    return property;
  }

  async updateProperty(hostId: string, propertyId: string, dto: UpdateHostPropertyDto) {
    const property = await this.prisma.property.findFirst({
      where: { id: propertyId, hostId },
      include: {
        location: true,
      },
    });

    if (!property) {
      throw new NotFoundException('Property not found.');
    }

    if (dto.slug && dto.slug !== property.slug) {
      const existingSlug = await this.prisma.property.findUnique({
        where: { slug: dto.slug },
      });

      if (existingSlug) {
        throw new BadRequestException('Slug already exists.');
      }
    }

    let locationWrite:
      | Prisma.PropertyLocationUpdateOneWithoutPropertyNestedInput
      | undefined;

    if (dto.location) {
      const country = dto.location.country ?? property.location?.country;
      const city = dto.location.city ?? property.location?.city;

      if (!country || !city) {
        throw new BadRequestException('Country and city are required for property location.');
      }

      const locationCreate: Prisma.PropertyLocationCreateWithoutPropertyInput = {
        country,
        city,
        region: dto.location.region ?? property.location?.region ?? undefined,
        addressLine: dto.location.addressLine ?? property.location?.addressLine ?? undefined,
        latitude: dto.location.latitude ?? property.location?.latitude ?? undefined,
        longitude: dto.location.longitude ?? property.location?.longitude ?? undefined,
      };

      const locationUpdate: Prisma.PropertyLocationUpdateWithoutPropertyInput = {
        country: dto.location.country,
        city: dto.location.city,
        region: dto.location.region,
        addressLine: dto.location.addressLine,
        latitude: dto.location.latitude,
        longitude: dto.location.longitude,
      };

      locationWrite = {
        upsert: {
          create: locationCreate,
          update: locationUpdate,
        },
      };
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      if (dto.amenities) {
        await tx.propertyAmenity.deleteMany({
          where: { propertyId },
        });

        if (dto.amenities.length) {
          await tx.propertyAmenity.createMany({
            data: dto.amenities.map((amenity) => ({
              ...amenity,
              propertyId,
            })),
            skipDuplicates: true,
          });
        }
      }

      const result = await tx.property.update({
        where: { id: propertyId },
        data: {
          title: dto.title,
          slug: dto.slug,
          shortDescription: dto.shortDescription,
          longDescription: dto.longDescription,
          propertyType: dto.propertyType,
          basePricePerNight:
            dto.basePricePerNight != null ? dto.basePricePerNight : undefined,
          cleaningFee: dto.cleaningFee != null ? dto.cleaningFee : undefined,
          serviceFee: dto.serviceFee != null ? dto.serviceFee : undefined,
          maxGuests: dto.maxGuests,
          bedrooms: dto.bedrooms,
          bathrooms: dto.bathrooms,
          citySearch: dto.location?.city,
          status: property.status === 'PUBLISHED' ? 'REVIEW' : undefined,
          location: locationWrite,
          rules: dto.rules
            ? {
                upsert: {
                  create: dto.rules,
                  update: dto.rules,
                },
              }
            : undefined,
        },
        include: {
          location: true,
          amenities: true,
          images: { orderBy: { sortOrder: 'asc' } },
          rules: true,
          pricingRules: true,
          availabilityOverrides: true,
        },
      });

      await tx.auditLog.create({
        data: {
          actorUserId: hostId,
          action: 'HOST_UPDATED_PROPERTY',
          entityType: 'PROPERTY',
          entityId: propertyId,
        },
      });

      return result;
    });

    return updated;
  }

  async submitPropertyForReview(hostId: string, propertyId: string) {
    const property = await this.findProperty(hostId, propertyId);

    if (!property.location) {
      throw new BadRequestException('Property location is required before review.');
    }

    if (!property.images.length) {
      throw new BadRequestException('At least one image is required before review.');
    }

    if (!property.amenities.length) {
      throw new BadRequestException('At least one amenity is required before review.');
    }

    const updated = await this.prisma.property.update({
      where: { id: propertyId },
      data: { status: 'REVIEW' },
      include: {
        location: true,
        amenities: true,
        images: true,
        rules: true,
        pricingRules: true,
        availabilityOverrides: true,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        actorUserId: hostId,
        action: 'HOST_SUBMITTED_PROPERTY_FOR_REVIEW',
        entityType: 'PROPERTY',
        entityId: propertyId,
      },
    });

    return updated;
  }

  async deleteProperty(hostId: string, propertyId: string) {
    const property = await this.prisma.property.findFirst({
      where: { id: propertyId, hostId },
    });

    if (!property) {
      throw new NotFoundException('Property not found.');
    }

    const activeBookings = await this.prisma.booking.count({
      where: {
        propertyId,
        bookingStatus: { in: ['AWAITING_PAYMENT', 'CONFIRMED'] },
      },
    });

    if (activeBookings > 0) {
      throw new BadRequestException('Cannot delete property with active bookings.');
    }

    await this.prisma.property.delete({
      where: { id: propertyId },
    });

    await this.prisma.auditLog.create({
      data: {
        actorUserId: hostId,
        action: 'HOST_DELETED_PROPERTY',
        entityType: 'PROPERTY',
        entityId: propertyId,
      },
    });

    return { success: true };
  }

  async getAvailability(hostId: string, propertyId: string) {
    await this.findProperty(hostId, propertyId);

    return this.prisma.availabilityBlock.findMany({
      where: { propertyId },
      orderBy: { startDate: 'asc' },
    });
  }

  async updateAvailability(hostId: string, propertyId: string, dto: UpdateAvailabilityDto) {
    await this.findProperty(hostId, propertyId);

    await this.prisma.$transaction(
      async (tx) => {
        for (const range of dto.ranges) {
          const startDate = new Date(range.startDate);
          const endDate = new Date(range.endDate);

          if (
            Number.isNaN(startDate.getTime()) ||
            Number.isNaN(endDate.getTime()) ||
            endDate <= startDate
          ) {
            throw new BadRequestException('Invalid availability range.');
          }

          if (range.blockType === 'AVAILABLE') {
            const overlappingBlocks = await tx.availabilityBlock.findMany({
              where: {
                propertyId,
                blockType: 'BLOCKED',
                startDate: { lt: endDate },
                endDate: { gt: startDate },
              },
            });

            for (const block of overlappingBlocks) {
              await tx.availabilityBlock.delete({
                where: { id: block.id },
              });

              if (block.startDate < startDate) {
                await tx.availabilityBlock.create({
                  data: {
                    propertyId,
                    startDate: block.startDate,
                    endDate: startDate,
                    blockType: 'BLOCKED',
                    reason: block.reason,
                  },
                });
              }

              if (block.endDate > endDate) {
                await tx.availabilityBlock.create({
                  data: {
                    propertyId,
                    startDate: endDate,
                    endDate: block.endDate,
                    blockType: 'BLOCKED',
                    reason: block.reason,
                  },
                });
              }
            }
          } else {
            const overlappingReserved = await tx.availabilityBlock.findFirst({
              where: {
                propertyId,
                blockType: 'RESERVED',
                startDate: { lt: endDate },
                endDate: { gt: startDate },
              },
            });

            if (overlappingReserved) {
              throw new BadRequestException('Cannot block dates that are already reserved.');
            }

            await tx.availabilityBlock.deleteMany({
              where: {
                propertyId,
                blockType: 'BLOCKED',
                startDate: { lt: endDate },
                endDate: { gt: startDate },
              },
            });

            await tx.availabilityBlock.create({
              data: {
                propertyId,
                startDate,
                endDate,
                blockType: range.blockType,
                reason: range.reason,
              },
            });
          }
        }

        await tx.auditLog.create({
          data: {
            actorUserId: hostId,
            action: 'HOST_UPDATED_AVAILABILITY',
            entityType: 'PROPERTY',
            entityId: propertyId,
          },
        });
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );

    return this.getAvailability(hostId, propertyId);
  }

  async getBookings(hostId: string) {
    return this.prisma.booking.findMany({
      where: { hostId },
      orderBy: { createdAt: 'desc' },
      include: {
        property: {
          include: {
            images: true,
            location: true,
          },
        },
        guestDetails: true,
        payments: true,
      },
    });
  }

  async getBooking(hostId: string, bookingId: string) {
    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, hostId },
      include: {
        property: {
          include: {
            images: true,
            location: true,
          },
        },
        guestDetails: true,
        payments: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found.');
    }

    return booking;
  }

  async updateBookingStatus(
    hostId: string,
    bookingId: string,
    dto: UpdateHostBookingStatusDto,
  ) {
    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, hostId },
      include: { payments: true },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found.');
    }

    if (dto.status === BookingStatus.CONFIRMED && booking.paymentStatus !== 'SUCCEEDED') {
      throw new BadRequestException('Cannot confirm a booking without successful payment.');
    }

    if (dto.status === BookingStatus.COMPLETED && booking.checkOutDate > new Date()) {
      throw new BadRequestException('Cannot complete a booking before check-out.');
    }

    if (dto.status === BookingStatus.CANCELLED && booking.bookingStatus === 'COMPLETED') {
      throw new BadRequestException('Cannot cancel a completed booking.');
    }

    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: { bookingStatus: dto.status },
    });

    await this.prisma.auditLog.create({
      data: {
        actorUserId: hostId,
        action: 'HOST_UPDATED_BOOKING_STATUS',
        entityType: 'BOOKING',
        entityId: bookingId,
        metadataJson: { status: dto.status },
      },
    });

    return updated;
  }

  async getEarningsSummary(hostId: string) {
    const aggregate = await this.prisma.booking.aggregate({
      where: {
        hostId,
        bookingStatus: { in: ['CONFIRMED', 'COMPLETED'] },
      },
      _sum: { totalAmount: true },
      _count: { _all: true },
    });

    return {
      totalRevenue: aggregate._sum.totalAmount ?? 0,
      bookingsCount: aggregate._count._all,
    };
  }

  async getEarningsBookings(hostId: string) {
    return this.prisma.booking.findMany({
      where: {
        hostId,
        bookingStatus: { in: ['CONFIRMED', 'COMPLETED'] },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        property: true,
        guestDetails: true,
        payments: true,
      },
    });
  }
}
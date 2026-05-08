import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../../common/storage/storage.service';
import { CreateUploadUrlDto } from './dto/create-upload-url.dto';
import { FinalizeUploadDto } from './dto/finalize-upload.dto';
import { ReorderPropertyImagesDto } from './dto/reorder-property-images.dto';
import { UpdateImageMetaDto } from './dto/update-image-meta.dto';

@Injectable()
export class MediaService {
  private readonly maxImagesPerProperty = 30;

  private readonly allowedImageMimeTypes = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
  ]);

  private readonly maxUploadBytes = 10 * 1024 * 1024;

  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  private async assertPropertyAccess(userId: string, propertyId: string) {
    const property = await this.prisma.property.findUnique({
      where: {
        id: propertyId,
      },
      select: {
        id: true,
        hostId: true,
      },
    });

    if (!property) {
      throw new NotFoundException('Property not found.');
    }

    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        role: true,
      },
    });

    if (!user) {
      throw new ForbiddenException('You do not have access to this property.');
    }

    if (user.role === UserRole.ADMIN || property.hostId === userId) {
      return property;
    }

    throw new ForbiddenException('You do not have access to this property.');
  }

  private async assertImageAccess(userId: string, imageId: string) {
    const image = await this.prisma.propertyImage.findUnique({
      where: {
        id: imageId,
      },
      include: {
        property: {
          select: {
            id: true,
            hostId: true,
          },
        },
      },
    });

    if (!image) {
      throw new NotFoundException('Image not found.');
    }

    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        role: true,
      },
    });

    if (!user) {
      throw new ForbiddenException('You do not have access to this image.');
    }

    if (user.role === UserRole.ADMIN || image.property.hostId === userId) {
      return image;
    }

    throw new ForbiddenException('You do not have access to this image.');
  }

  async createUploadUrl(userId: string, dto: CreateUploadUrlDto) {
    await this.assertPropertyAccess(userId, dto.propertyId);

    if (!this.allowedImageMimeTypes.has(dto.contentType)) {
      throw new BadRequestException(
        'Only JPEG, PNG, WEBP and GIF images are allowed.',
      );
    }

    if (dto.sizeBytes && dto.sizeBytes > this.maxUploadBytes) {
      throw new BadRequestException(
        'Image is larger than the allowed 10MB limit.',
      );
    }

    const currentCount = await this.prisma.propertyImage.count({
      where: {
        propertyId: dto.propertyId,
      },
    });

    if (currentCount >= this.maxImagesPerProperty) {
      throw new BadRequestException(
        'Maximum number of images reached for this property.',
      );
    }

    const safeFileName = dto.fileName.replace(/[^a-zA-Z0-9._-]/g, '-');
    const key = `properties/${dto.propertyId}/${randomUUID()}-${safeFileName}`;

    return this.storageService.createPresignedUploadUrl({
      key,
      contentType: dto.contentType,
      sizeBytes: dto.sizeBytes,
    });
  }

  async finalizeUpload(userId: string, dto: FinalizeUploadDto) {
    await this.assertPropertyAccess(userId, dto.propertyId);

    if (!dto.storageKey) {
      throw new BadRequestException('Missing storage key.');
    }

    if (!dto.url) {
      throw new BadRequestException('Missing public image URL.');
    }

    if (dto.mimeType && !this.allowedImageMimeTypes.has(dto.mimeType)) {
      throw new BadRequestException('Unsupported image type.');
    }

    if (dto.sizeBytes && dto.sizeBytes > this.maxUploadBytes) {
      throw new BadRequestException(
        'Image is larger than the allowed 10MB limit.',
      );
    }

    const exists = await this.storageService.objectExists(dto.storageKey);

    if (!exists) {
      throw new BadRequestException('Uploaded object could not be verified.');
    }

    const count = await this.prisma.propertyImage.count({
      where: {
        propertyId: dto.propertyId,
      },
    });

    if (count >= this.maxImagesPerProperty) {
      throw new BadRequestException(
        'Maximum number of images reached for this property.',
      );
    }

    if (dto.isCover || count === 0) {
      await this.prisma.propertyImage.updateMany({
        where: {
          propertyId: dto.propertyId,
        },
        data: {
          isCover: false,
        },
      });
    }

    return this.prisma.propertyImage.create({
      data: {
        propertyId: dto.propertyId,
        url: dto.url,
        storageKey: dto.storageKey,
        altText: dto.altText,
        mimeType: dto.mimeType,
        sizeBytes: dto.sizeBytes,
        width: dto.width,
        height: dto.height,
        sortOrder: dto.sortOrder ?? count,
        isCover: dto.isCover ?? count === 0,
      },
    });
  }

  async reorder(userId: string, dto: ReorderPropertyImagesDto) {
    await this.assertPropertyAccess(userId, dto.propertyId);

    const imageIds = dto.items.map((item) => item.imageId);
    const uniqueImageIds = [...new Set(imageIds)];

    const ownedImagesCount = await this.prisma.propertyImage.count({
      where: {
        propertyId: dto.propertyId,
        id: {
          in: uniqueImageIds,
        },
      },
    });

    if (ownedImagesCount !== uniqueImageIds.length) {
      throw new ForbiddenException(
        'One or more images do not belong to this property.',
      );
    }

    await this.prisma.$transaction(
      dto.items.map((item) =>
        this.prisma.propertyImage.update({
          where: {
            id: item.imageId,
          },
          data: {
            sortOrder: item.sortOrder,
          },
        }),
      ),
    );

    return this.prisma.propertyImage.findMany({
      where: {
        propertyId: dto.propertyId,
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });
  }

  async updateMeta(userId: string, imageId: string, dto: UpdateImageMetaDto) {
    const image = await this.assertImageAccess(userId, imageId);

    if (dto.isCover) {
      await this.prisma.propertyImage.updateMany({
        where: {
          propertyId: image.propertyId,
        },
        data: {
          isCover: false,
        },
      });
    }

    return this.prisma.propertyImage.update({
      where: {
        id: imageId,
      },
      data: dto,
    });
  }

  async remove(userId: string, imageId: string) {
    const image = await this.assertImageAccess(userId, imageId);

    await this.prisma.propertyImage.delete({
      where: {
        id: imageId,
      },
    });

    if (image.storageKey) {
      await this.storageService.deleteObject(image.storageKey);
    }

    return {
      success: true,
    };
  }
}
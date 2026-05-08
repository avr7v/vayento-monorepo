import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { SAFE_USER_WITH_PROFILE_SELECT, toSafeUser } from '../../common/serializers/user.serializer';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByEmailVerificationTokenHash(emailVerificationTokenHash: string) {
    return this.prisma.user.findFirst({ where: { emailVerificationTokenHash } });
  }

  async findByPasswordResetTokenHash(passwordResetTokenHash: string) {
    return this.prisma.user.findFirst({ where: { passwordResetTokenHash } });
  }

  async findByRefreshTokenHash(refreshTokenHash: string) {
    return this.prisma.user.findFirst({ where: { refreshTokenHash } });
  }

  async createUser(data: {
    firstName: string;
    lastName: string;
    email: string;
    passwordHash: string;
    phone?: string;
    role?: 'USER' | 'HOST' | 'ADMIN';
    isEmailVerified?: boolean;
    emailVerificationTokenHash?: string | null;
    emailVerificationExpiresAt?: Date | null;
    profile?: {
      country?: string;
      city?: string;
      addressLine?: string;
      postalCode?: string;
      preferredLanguage?: string;
    };
  }) {
    const { profile, ...userData } = data;
    return this.prisma.user.create({
      data: {
        ...userData,
        profile: profile
          ? {
              create: {
                country: profile.country,
                city: profile.city,
                addressLine: profile.addressLine,
                postalCode: profile.postalCode,
                preferredLanguage: profile.preferredLanguage ?? 'en',
              },
            }
          : undefined,
      },
    });
  }

  async updateAuthFields(
    userId: string,
    data: {
      passwordHash?: string;
      isEmailVerified?: boolean;
      emailVerificationTokenHash?: string | null;
      emailVerificationExpiresAt?: Date | null;
      passwordResetTokenHash?: string | null;
      passwordResetExpiresAt?: Date | null;
      refreshTokenHash?: string | null;
      refreshTokenExpiresAt?: Date | null;
      failedLoginCount?: number;
      lockedUntil?: Date | null;
    },
  ) {
    return this.prisma.user.update({ where: { id: userId }, data });
  }

  async getProfile(userId: string) {
    const profile = await this.prisma.user.findUnique({
      where: { id: userId },
      select: SAFE_USER_WITH_PROFILE_SELECT,
    });

    if (!profile) throw new NotFoundException('User not found.');
    return profile;
  }

  async updateProfile(
    userId: string,
    data: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      country?: string;
      city?: string;
      addressLine?: string;
      postalCode?: string;
      bio?: string;
      preferredLanguage?: string;
    },
  ) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        profile: {
          upsert: {
            create: {
              country: data.country,
              city: data.city,
              addressLine: data.addressLine,
              postalCode: data.postalCode,
              bio: data.bio,
              preferredLanguage: data.preferredLanguage,
            },
            update: {
              country: data.country,
              city: data.city,
              addressLine: data.addressLine,
              postalCode: data.postalCode,
              bio: data.bio,
              preferredLanguage: data.preferredLanguage,
            },
          },
        },
      },
      select: SAFE_USER_WITH_PROFILE_SELECT,
    });

    return user;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found.');

    const matches = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!matches) throw new UnauthorizedException('Current password is not valid.');

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash, refreshTokenHash: null, refreshTokenExpiresAt: null },
    });

    await this.prisma.auditLog.create({
      data: {
        actorUserId: userId,
        action: 'USER_CHANGED_PASSWORD',
        entityType: 'USER',
        entityId: userId,
      },
    });

    return { success: true, message: 'Password changed successfully. Please sign in again.' };
  }

  async updateEmail(userId: string, email: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing && existing.id !== userId) throw new BadRequestException('Email is already in use.');

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { email, isEmailVerified: false },
      select: SAFE_USER_WITH_PROFILE_SELECT,
    });

    await this.prisma.auditLog.create({
      data: { actorUserId: userId, action: 'USER_UPDATED_EMAIL', entityType: 'USER', entityId: userId, metadataJson: { email } },
    });

    return updated;
  }

  async deactivateAccount(userId: string, password: string, reason?: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found.');
    const matches = await bcrypt.compare(password, user.passwordHash);
    if (!matches) throw new UnauthorizedException('Password confirmation is not valid.');

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isActive: false,
        deactivatedAt: new Date(),
        refreshTokenHash: null,
        refreshTokenExpiresAt: null,
      },
    });

    await this.prisma.auditLog.create({
      data: { actorUserId: userId, action: 'USER_DEACTIVATED_ACCOUNT', entityType: 'USER', entityId: userId, metadataJson: reason ? { reason } : undefined },
    });

    return { success: true };
  }

  sanitizeUser(user: Record<string, any>) {
    return toSafeUser(user);
  }
}

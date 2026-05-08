import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AuthService {
  private readonly maxFailedAttempts = 5;
  private readonly lockMs = 15 * 60 * 1000;

  constructor(
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async register(dto: RegisterDto) {
    const normalizedEmail = dto.email.toLowerCase().trim();
    const existingUser = await this.usersService.findByEmail(normalizedEmail);
    if (existingUser) throw new BadRequestException('Email is already in use.');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const verification = this.createStoredToken(24);
    const autoVerify = this.configService.get<string>('AUTO_VERIFY_REGISTERED_USERS') === 'true';

    const user = await this.usersService.createUser({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: normalizedEmail,
      passwordHash,
      phone: dto.phone,
      profile: {
        country: dto.country,
        city: dto.city,
        addressLine: dto.addressLine,
        postalCode: dto.postalCode,
        preferredLanguage: dto.preferredLanguage ?? 'en',
      },
      isEmailVerified: autoVerify,
      emailVerificationTokenHash: autoVerify ? null : verification.tokenHash,
      emailVerificationExpiresAt: autoVerify ? null : verification.expiresAt,
    });

    await this.notificationsService.sendWelcomeEmail({ email: user.email, firstName: user.firstName });

    if (!autoVerify) {
      await this.notificationsService.sendEmailVerificationEmail({
        email: user.email,
        firstName: user.firstName,
        verificationUrl: `${this.getFrontendUrl()}/verify-email?token=${verification.plainToken}`,
      });
    }

    if (this.isEmailVerificationRequired() && !autoVerify) {
      return {
        success: true,
        verificationRequired: true,
        message: 'Account created. Please verify your email before signing in.',
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          isEmailVerified: user.isEmailVerified,
        },
      };
    }

    return this.buildAuthResponse(user);
  }

  async validateUser(dto: LoginDto, meta?: { ipAddress?: string; userAgent?: string }) {
    const email = dto.email.toLowerCase().trim();
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      await this.logLoginAttempt({ email, success: false, ipAddress: meta?.ipAddress, userAgent: meta?.userAgent });
      throw new UnauthorizedException('Invalid credentials.');
    }

    if (!user.isActive) {
      await this.logLoginAttempt({ userId: user.id, email, success: false, ipAddress: meta?.ipAddress, userAgent: meta?.userAgent });
      throw new UnauthorizedException('Account is deactivated.');
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      await this.logLoginAttempt({ userId: user.id, email, success: false, ipAddress: meta?.ipAddress, userAgent: meta?.userAgent });
      throw new UnauthorizedException('Account is temporarily locked. Please try again later.');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      const failedLoginCount = (user.failedLoginCount ?? 0) + 1;
      await this.usersService.updateAuthFields(user.id, {
        failedLoginCount,
        lockedUntil: failedLoginCount >= this.maxFailedAttempts ? new Date(Date.now() + this.lockMs) : null,
      });
      await this.logLoginAttempt({ userId: user.id, email, success: false, ipAddress: meta?.ipAddress, userAgent: meta?.userAgent });
      throw new UnauthorizedException('Invalid credentials.');
    }

    if (this.isEmailVerificationRequired() && !user.isEmailVerified) {
      await this.logLoginAttempt({ userId: user.id, email, success: false, ipAddress: meta?.ipAddress, userAgent: meta?.userAgent });
      throw new UnauthorizedException('Please verify your email before signing in.');
    }

    await this.usersService.updateAuthFields(user.id, { failedLoginCount: 0, lockedUntil: null });
    await this.logLoginAttempt({ userId: user.id, email, success: true, ipAddress: meta?.ipAddress, userAgent: meta?.userAgent });
    return user;
  }

  async login(dto: LoginDto, meta?: { ipAddress?: string; userAgent?: string }) {
    const user = await this.validateUser(dto, meta);
    return this.buildAuthResponse(user);
  }

  async refresh(dto: RefreshTokenDto) {
    const refreshTokenHash = this.hashToken(dto.refreshToken);
    const user = await this.usersService.findByRefreshTokenHash(refreshTokenHash);

    if (!user || !user.refreshTokenExpiresAt || user.refreshTokenExpiresAt < new Date() || !user.isActive) {
      throw new UnauthorizedException('Refresh token is invalid or expired.');
    }

    return this.buildAuthResponse(user);
  }

  async logout(userId: string) {
    await this.usersService.updateAuthFields(userId, { refreshTokenHash: null, refreshTokenExpiresAt: null });
    return { success: true };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(dto.email.toLowerCase().trim());
    if (!user) return { success: true, message: 'If the account exists, reset instructions have been sent.' };

    const reset = this.createStoredToken(24);
    await this.usersService.updateAuthFields(user.id, { passwordResetTokenHash: reset.tokenHash, passwordResetExpiresAt: reset.expiresAt });

    await this.notificationsService.sendPasswordResetEmail({
      email: user.email,
      firstName: user.firstName,
      resetUrl: `${this.getFrontendUrl()}/reset-password?token=${reset.plainToken}`,
    });

    return { success: true, message: 'If the account exists, reset instructions have been sent.' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const tokenHash = this.hashToken(dto.token);
    const user = await this.usersService.findByPasswordResetTokenHash(tokenHash);
    if (!user || !user.passwordResetExpiresAt || user.passwordResetExpiresAt < new Date()) {
      throw new BadRequestException('Password reset token is invalid or expired.');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    await this.usersService.updateAuthFields(user.id, {
      passwordHash,
      passwordResetTokenHash: null,
      passwordResetExpiresAt: null,
      refreshTokenHash: null,
      refreshTokenExpiresAt: null,
      failedLoginCount: 0,
      lockedUntil: null,
    });

    return { success: true, message: 'Password updated successfully.' };
  }

  async verifyEmail(token: string) {
    const tokenHash = this.hashToken(token);
    const user = await this.usersService.findByEmailVerificationTokenHash(tokenHash);
    if (!user || !user.emailVerificationExpiresAt || user.emailVerificationExpiresAt < new Date()) {
      throw new BadRequestException('Verification token is invalid or expired.');
    }

    await this.usersService.updateAuthFields(user.id, {
      isEmailVerified: true,
      emailVerificationTokenHash: null,
      emailVerificationExpiresAt: null,
    });

    return { success: true, message: 'Email verified successfully.' };
  }

  async resendVerification(dto: ResendVerificationDto) {
    const user = await this.usersService.findByEmail(dto.email.toLowerCase().trim());
    if (!user) return { success: true, message: 'If the account exists, a verification email has been sent.' };
    if (user.isEmailVerified) return { success: true, message: 'This email is already verified.' };

    const verification = this.createStoredToken(24);
    await this.usersService.updateAuthFields(user.id, {
      emailVerificationTokenHash: verification.tokenHash,
      emailVerificationExpiresAt: verification.expiresAt,
    });

    await this.notificationsService.sendEmailVerificationEmail({
      email: user.email,
      firstName: user.firstName,
      verificationUrl: `${this.getFrontendUrl()}/verify-email?token=${verification.plainToken}`,
    });

    return { success: true, message: 'Verification email sent.' };
  }

  private createStoredToken(size = 32, hours = 1) {
    const plainToken = crypto.randomBytes(size).toString('hex');
    const tokenHash = this.hashToken(plainToken);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * hours);
    return { plainToken, tokenHash, expiresAt };
  }

  private hashToken(token: string) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private getFrontendUrl() {
    return this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
  }

  private isEmailVerificationRequired() {
    return this.configService.get<string>('REQUIRE_EMAIL_VERIFICATION') === 'true';
  }

  private async logLoginAttempt(data: { userId?: string; email: string; success: boolean; ipAddress?: string; userAgent?: string }) {
    await this.prisma.loginAttempt.create({ data }).catch(() => undefined);
  }

  private parseRefreshExpiryMs() {
    const value = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d';
    const match = value.match(/^(\d+)([smhd])$/);
    if (!match) return 7 * 24 * 60 * 60 * 1000;
    const amount = Number(match[1]);
    const unit = match[2];
    const factor = unit === 's' ? 1000 : unit === 'm' ? 60_000 : unit === 'h' ? 3_600_000 : 86_400_000;
    return amount * factor;
  }

  private async buildAuthResponse(user: {
    id: string;
    email: string;
    role: 'USER' | 'HOST' | 'ADMIN';
    firstName: string;
    lastName: string;
    isEmailVerified?: boolean;
  }) {
    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };
    const accessSecret =
      this.configService.get<string>('JWT_ACCESS_SECRET') ||
      this.configService.get<string>('JWT_SECRET');
    const accessExpiresIn =
      this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') ||
      this.configService.get<string>('JWT_EXPIRES_IN') ||
      '15m';

    if (!accessSecret) {
      throw new Error('JWT secret is missing. Please define JWT_ACCESS_SECRET or JWT_SECRET.');
    }

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: accessSecret,
      expiresIn: accessExpiresIn,
    });

    const refresh = this.createStoredToken(48, this.parseRefreshExpiryMs() / 3_600_000);
    await this.usersService.updateAuthFields(user.id, {
      refreshTokenHash: refresh.tokenHash,
      refreshTokenExpiresAt: refresh.expiresAt,
    });

    return {
      accessToken,
      refreshToken: refresh.plainToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        isEmailVerified: user.isEmailVerified ?? false,
      },
    };
  }
}

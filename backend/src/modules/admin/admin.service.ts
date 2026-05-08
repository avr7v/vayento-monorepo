import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ContentStatus,
  PaymentStatus,
  PropertyStatus,
  ReviewStatus,
  UserRole,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { sanitizeHtml } from '../../common/security/html-sanitizer';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard() {
    const [
      totalUsers,
      totalHosts,
      totalProperties,
      pendingProperties,
      pendingReviews,
      totalBookings,
      grossRevenue,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({
        where: {
          role: UserRole.HOST,
        },
      }),
      this.prisma.property.count(),
      this.prisma.property.count({
        where: {
          status: PropertyStatus.REVIEW,
        },
      }),
      this.prisma.review.count({
        where: {
          status: ReviewStatus.PENDING,
        },
      }),
      this.prisma.booking.count(),
      this.prisma.payment.aggregate({
        where: {
          paymentStatus: PaymentStatus.SUCCEEDED,
        },
        _sum: {
          amount: true,
        },
      }),
    ]);

    return {
      totalUsers,
      totalHosts,
      totalProperties,
      pendingProperties,
      pendingReviews,
      totalBookings,
      grossRevenue: Number(grossRevenue._sum.amount ?? 0),
    };
  }

  async getUsers() {
    return this.prisma.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        isEmailVerified: true,
        createdAt: true,
        profile: true,
      },
    });
  }

  async createUser(adminUserId: string, dto: any) {
    if (!dto.firstName || !dto.lastName || !dto.email || !dto.password) {
      throw new BadRequestException(
        'First name, last name, email and password are required.',
      );
    }

    const email = String(dto.email).toLowerCase().trim();

    const existing = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existing) {
      throw new BadRequestException('A user with this email already exists.');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        firstName: dto.firstName.trim(),
        lastName: dto.lastName.trim(),
        email,
        passwordHash,
        role: dto.role ?? UserRole.USER,
        isEmailVerified: true,
        profile: {
          create: {
            preferredLanguage: 'en',
          },
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        actorUserId: adminUserId,
        action: 'ADMIN_CREATED_USER',
        entityType: 'USER',
        entityId: user.id,
        metadataJson: {
          email: user.email,
          role: user.role,
        },
      },
    });

    return user;
  }

  async updateUserRole(adminUserId: string, id: string, dto: any) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const updated = await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        role: dto.role,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        actorUserId: adminUserId,
        action: 'ADMIN_UPDATED_USER_ROLE',
        entityType: 'USER',
        entityId: id,
        metadataJson: {
          previousRole: user.role,
          newRole: updated.role,
        },
      },
    });

    return updated;
  }

  async getProperties() {
    return this.prisma.property.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        host: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        location: true,
        images: {
          orderBy: {
            sortOrder: 'asc',
          },
        },
        amenities: true,
        rules: true,
      },
    });
  }

  async updatePropertyStatus(adminUserId: string, id: string, dto: any) {
    const property = await this.prisma.property.findUnique({
      where: {
        id,
      },
    });

    if (!property) {
      throw new NotFoundException('Property not found.');
    }

    const updated = await this.prisma.property.update({
      where: {
        id,
      },
      data: {
        status: dto.status,
      },
      include: {
        location: true,
        images: {
          orderBy: {
            sortOrder: 'asc',
          },
        },
        amenities: true,
        rules: true,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        actorUserId: adminUserId,
        action: 'ADMIN_UPDATED_PROPERTY_STATUS',
        entityType: 'PROPERTY',
        entityId: id,
        metadataJson: {
          previousStatus: property.status,
          newStatus: updated.status,
        },
      },
    });

    return updated;
  }

  async getBookings() {
    return this.prisma.booking.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        guestUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        host: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        guestDetails: true,
        payments: true,
      },
    });
  }

  async getPayments() {
    return this.prisma.payment.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        booking: {
          include: {
            property: {
              select: {
                id: true,
                title: true,
                slug: true,
              },
            },
          },
        },
      },
    });
  }

  async getPages() {
    return this.prisma.contentPage.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async updatePage(adminUserId: string, id: string, dto: any) {
    const page = await this.prisma.contentPage.findUnique({
      where: {
        id,
      },
    });

    if (!page) {
      throw new NotFoundException('Content page not found.');
    }

    const updated = await this.prisma.contentPage.update({
      where: {
        id,
      },
      data: {
        title: dto.title ?? page.title,
        slug: dto.slug ?? page.slug,
        metaTitle: dto.metaTitle,
        metaDescription: dto.metaDescription,
        content:
          dto.content !== undefined
            ? sanitizeHtml(dto.content) ?? ''
            : page.content,
        status: dto.status ?? page.status,
        authorId: adminUserId,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        actorUserId: adminUserId,
        action: 'ADMIN_UPDATED_CONTENT_PAGE',
        entityType: 'CONTENT_PAGE',
        entityId: id,
        metadataJson: {
          slug: updated.slug,
          previousStatus: page.status,
          newStatus: updated.status,
        },
      },
    });

    return updated;
  }

  async getBlogPosts() {
    return this.prisma.blogPost.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async createBlogPost(adminUserId: string, dto: any) {
    if (!dto.title || !dto.slug || !dto.body) {
      throw new BadRequestException('Title, slug and body are required.');
    }

    const slug = String(dto.slug).trim();

    const existing = await this.prisma.blogPost.findUnique({
      where: {
        slug,
      },
    });

    if (existing) {
      throw new BadRequestException('A blog post with this slug already exists.');
    }

    const status = dto.status ?? ContentStatus.PUBLISHED;

    const post = await this.prisma.blogPost.create({
      data: {
        title: String(dto.title).trim(),
        slug,
        excerpt: dto.excerpt,
        body: sanitizeHtml(dto.body) ?? '',
        coverImageUrl: dto.coverImageUrl,
        metaTitle: dto.metaTitle,
        metaDescription: dto.metaDescription,
        status,
        publishedAt: status === ContentStatus.PUBLISHED ? new Date() : undefined,
        authorId: adminUserId,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        actorUserId: adminUserId,
        action: 'ADMIN_CREATED_BLOG_POST',
        entityType: 'BLOG_POST',
        entityId: post.id,
        metadataJson: {
          title: post.title,
          slug: post.slug,
          status: post.status,
        },
      },
    });

    return post;
  }

  async updateBlogPost(adminUserId: string, id: string, dto: any) {
    const post = await this.prisma.blogPost.findUnique({
      where: {
        id,
      },
    });

    if (!post) {
      throw new NotFoundException('Blog post not found.');
    }

    const nextStatus = dto.status ?? post.status;

    const updated = await this.prisma.blogPost.update({
      where: {
        id,
      },
      data: {
        title: dto.title ?? post.title,
        slug: dto.slug ?? post.slug,
        excerpt: dto.excerpt,
        body: dto.body !== undefined ? sanitizeHtml(dto.body) ?? '' : undefined,
        coverImageUrl: dto.coverImageUrl,
        metaTitle: dto.metaTitle,
        metaDescription: dto.metaDescription,
        status: nextStatus,
        publishedAt:
          nextStatus === ContentStatus.PUBLISHED && !post.publishedAt
            ? new Date()
            : post.publishedAt,
        authorId: adminUserId,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        actorUserId: adminUserId,
        action: 'ADMIN_UPDATED_BLOG_POST',
        entityType: 'BLOG_POST',
        entityId: id,
        metadataJson: {
          title: updated.title,
          slug: updated.slug,
          previousStatus: post.status,
          newStatus: updated.status,
        },
      },
    });

    return updated;
  }

  async deleteBlogPost(adminUserId: string, id: string) {
    const blogPost = await this.prisma.blogPost.findUnique({
      where: {
        id,
      },
    });

    if (!blogPost) {
      throw new NotFoundException('Blog post not found.');
    }

    await this.prisma.blogPost.delete({
      where: {
        id,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        actorUserId: adminUserId,
        action: 'ADMIN_DELETED_BLOG_POST',
        entityType: 'BLOG_POST',
        entityId: id,
        metadataJson: {
          title: blogPost.title,
          slug: blogPost.slug,
          previousStatus: blogPost.status,
        },
      },
    });

    return {
      success: true,
    };
  }

  async getSupportInbox() {
    return this.prisma.conversation.findMany({
      where: {
        type: 'SUPPORT',
      },
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
              },
            },
          },
        },
        messages: {
          take: 5,
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            senderUser: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
    });
  }

  async getAuditLogs() {
    return this.prisma.auditLog.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 100,
    });
  }

  async getReviews() {
    return this.prisma.review.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        authorUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async updateReviewStatus(adminUserId: string, id: string, dto: any) {
    const review = await this.prisma.review.findUnique({
      where: {
        id,
      },
    });

    if (!review) {
      throw new NotFoundException('Review not found.');
    }

    const updated = await this.prisma.review.update({
      where: {
        id,
      },
      data: {
        status: dto.status,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        actorUserId: adminUserId,
        action: 'ADMIN_UPDATED_REVIEW_STATUS',
        entityType: 'REVIEW',
        entityId: id,
        metadataJson: {
          previousStatus: review.status,
          newStatus: updated.status,
        },
      },
    });

    return updated;
  }

  async getHostLeads() {
    return this.prisma.hostLead.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
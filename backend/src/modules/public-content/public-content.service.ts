import { Injectable, NotFoundException } from '@nestjs/common';
import { ContentStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PublicContentService {
  constructor(private readonly prisma: PrismaService) {}

  async getPublishedBlogPosts() {
    return this.prisma.blogPost.findMany({
      where: {
        status: ContentStatus.PUBLISHED,
      },
      orderBy: [
        {
          publishedAt: 'desc',
        },
        {
          createdAt: 'desc',
        },
      ],
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImageUrl: true,
        metaTitle: true,
        metaDescription: true,
        status: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getPublishedBlogPost(slug: string) {
    const post = await this.prisma.blogPost.findFirst({
      where: {
        slug,
        status: ContentStatus.PUBLISHED,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        body: true,
        coverImageUrl: true,
        metaTitle: true,
        metaDescription: true,
        status: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!post) {
      throw new NotFoundException('Blog post not found.');
    }

    return post;
  }

  async getPublishedPage(slug: string) {
    const page = await this.prisma.contentPage.findFirst({
      where: {
        slug,
        status: ContentStatus.PUBLISHED,
      },
      select: {
        id: true,
        slug: true,
        title: true,
        metaTitle: true,
        metaDescription: true,
        content: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!page) {
      throw new NotFoundException('Page not found.');
    }

    return page;
  }
}
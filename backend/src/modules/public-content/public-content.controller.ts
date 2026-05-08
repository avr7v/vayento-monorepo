import { Controller, Get, Param } from '@nestjs/common';
import { PublicContentService } from './public-content.service';

@Controller()
export class PublicContentController {
  constructor(private readonly publicContentService: PublicContentService) {}

  @Get('blog')
  getPublishedBlogPosts() {
    return this.publicContentService.getPublishedBlogPosts();
  }

  @Get('blog/:slug')
  getPublishedBlogPost(@Param('slug') slug: string) {
    return this.publicContentService.getPublishedBlogPost(slug);
  }

  @Get('pages/:slug')
  getPublishedPage(@Param('slug') slug: string) {
    return this.publicContentService.getPublishedPage(slug);
  }
}
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AdminService } from './admin.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  getDashboard() {
    return this.adminService.getDashboard();
  }

  @Get('users')
  getUsers() {
    return this.adminService.getUsers();
  }

  @Post('users')
  createUser(@CurrentUser() user: { sub: string }, @Body() dto: any) {
    return this.adminService.createUser(user.sub, dto);
  }

  @Patch('users/:id/role')
  updateUserRole(
    @CurrentUser() user: { sub: string },
    @Param('id') id: string,
    @Body() dto: any,
  ) {
    return this.adminService.updateUserRole(user.sub, id, dto);
  }

  @Get('properties')
  getProperties() {
    return this.adminService.getProperties();
  }

  @Patch('properties/:id/status')
  updatePropertyStatus(
    @CurrentUser() user: { sub: string },
    @Param('id') id: string,
    @Body() dto: any,
  ) {
    return this.adminService.updatePropertyStatus(user.sub, id, dto);
  }

  @Get('bookings')
  getBookings() {
    return this.adminService.getBookings();
  }

  @Get('payments')
  getPayments() {
    return this.adminService.getPayments();
  }

  // Canonical content pages endpoint
  @Get('pages')
  getPages() {
    return this.adminService.getPages();
  }

  @Patch('pages/:id')
  updatePage(
    @CurrentUser() user: { sub: string },
    @Param('id') id: string,
    @Body() dto: any,
  ) {
    return this.adminService.updatePage(user.sub, id, dto);
  }

  // Alias για παλιό frontend endpoint: /api/admin/content/pages
  @Get('content/pages')
  getContentPagesAlias() {
    return this.adminService.getPages();
  }

  @Patch('content/pages/:id')
  updateContentPageAlias(
    @CurrentUser() user: { sub: string },
    @Param('id') id: string,
    @Body() dto: any,
  ) {
    return this.adminService.updatePage(user.sub, id, dto);
  }

  // Canonical blog endpoint
  @Get('blog-posts')
  getBlogPosts() {
    return this.adminService.getBlogPosts();
  }

  @Post('blog-posts')
  createBlogPost(@CurrentUser() user: { sub: string }, @Body() dto: any) {
    return this.adminService.createBlogPost(user.sub, dto);
  }

  @Patch('blog-posts/:id')
  updateBlogPost(
    @CurrentUser() user: { sub: string },
    @Param('id') id: string,
    @Body() dto: any,
  ) {
    return this.adminService.updateBlogPost(user.sub, id, dto);
  }

  @Delete('blog-posts/:id')
  deleteBlogPost(
    @CurrentUser() user: { sub: string },
    @Param('id') id: string,
  ) {
    return this.adminService.deleteBlogPost(user.sub, id);
  }

  // Alias για παλιό frontend endpoint: /api/admin/blog
  @Get('blog')
  getBlogPostsAlias() {
    return this.adminService.getBlogPosts();
  }

  @Post('blog')
  createBlogPostAlias(@CurrentUser() user: { sub: string }, @Body() dto: any) {
    return this.adminService.createBlogPost(user.sub, dto);
  }

  @Patch('blog/:id')
  updateBlogPostAlias(
    @CurrentUser() user: { sub: string },
    @Param('id') id: string,
    @Body() dto: any,
  ) {
    return this.adminService.updateBlogPost(user.sub, id, dto);
  }

  @Delete('blog/:id')
  deleteBlogPostAlias(
    @CurrentUser() user: { sub: string },
    @Param('id') id: string,
  ) {
    return this.adminService.deleteBlogPost(user.sub, id);
  }

  @Get('support')
  getSupportInbox() {
    return this.adminService.getSupportInbox();
  }

  @Get('audit-logs')
  getAuditLogs() {
    return this.adminService.getAuditLogs();
  }

  @Get('reviews')
  getReviews() {
    return this.adminService.getReviews();
  }

  @Patch('reviews/:id/status')
  updateReviewStatus(
    @CurrentUser() user: { sub: string },
    @Param('id') id: string,
    @Body() dto: any,
  ) {
    return this.adminService.updateReviewStatus(user.sub, id, dto);
  }

  @Get('host-leads')
  getHostLeads() {
    return this.adminService.getHostLeads();
  }
}
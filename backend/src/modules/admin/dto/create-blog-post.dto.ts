import { IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateBlogPostDto {
  @IsString() title: string;
  @IsString() slug: string;
  @IsOptional() @IsString() excerpt?: string;
  @IsString() body: string;
  @IsOptional() @IsUrl() coverImageUrl?: string;
  @IsOptional() @IsString() metaTitle?: string;
  @IsOptional() @IsString() metaDescription?: string;
  @IsOptional() @IsString() status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}

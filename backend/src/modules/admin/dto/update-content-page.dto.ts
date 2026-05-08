import { IsOptional, IsString } from 'class-validator';

export class UpdateContentPageDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() slug?: string;
  @IsOptional() @IsString() metaTitle?: string;
  @IsOptional() @IsString() metaDescription?: string;
  @IsOptional() @IsString() content?: string;
  @IsOptional() @IsString() status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}

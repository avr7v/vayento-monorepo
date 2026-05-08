import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateImageMetaDto {
  @IsOptional() @IsString() altText?: string;
  @IsOptional() @IsBoolean() isCover?: boolean;
}

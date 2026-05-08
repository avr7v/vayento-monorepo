import { IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUploadUrlDto {
  @IsUUID()
  propertyId: string;

  @IsString()
  fileName: string;

  @IsString()
  contentType: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10 * 1024 * 1024)
  sizeBytes?: number;
}

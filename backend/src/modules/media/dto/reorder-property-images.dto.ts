import { Type } from 'class-transformer';
import { IsArray, IsInt, IsUUID, Min, ValidateNested } from 'class-validator';

class ImageOrderItemDto {
  @IsUUID() imageId: string;
  @Type(() => Number) @IsInt() @Min(0) sortOrder: number;
}

export class ReorderPropertyImagesDto {
  @IsUUID() propertyId: string;
  @IsArray() @ValidateNested({ each: true }) @Type(() => ImageOrderItemDto) items: ImageOrderItemDto[];
}

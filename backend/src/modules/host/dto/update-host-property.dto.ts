import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsInt, IsNumber, IsOptional, IsString, IsUrl, Min, ValidateNested } from 'class-validator';

class AmenityInputDto {
  @IsString() amenityKey: string;
  @IsString() amenityLabel: string;
}

class ImageInputDto {
  @IsUrl() url: string;
  @IsOptional() @IsString() storageKey?: string;
  @IsOptional() @IsString() altText?: string;
  @IsOptional() @IsInt() sortOrder?: number;
  @IsOptional() @IsBoolean() isCover?: boolean;
}

class LocationInputDto {
  @IsOptional() @IsString() country?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() region?: string;
  @IsOptional() @IsString() addressLine?: string;
  @IsOptional() @Type(() => Number) @IsNumber() latitude?: number;
  @IsOptional() @Type(() => Number) @IsNumber() longitude?: number;
}

class RulesInputDto {
  @IsOptional() @IsString() checkInTime?: string;
  @IsOptional() @IsString() checkOutTime?: string;
  @IsOptional() @IsString() cancellationPolicy?: string;
  @IsOptional() @IsBoolean() petsAllowed?: boolean;
  @IsOptional() @IsBoolean() smokingAllowed?: boolean;
  @IsOptional() @IsBoolean() eventsAllowed?: boolean;
  @IsOptional() @IsString() extraNotes?: string;
}

export class UpdateHostPropertyDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() slug?: string;
  @IsOptional() @IsString() shortDescription?: string;
  @IsOptional() @IsString() longDescription?: string;
  @IsOptional() @IsString() propertyType?: string;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) basePricePerNight?: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) cleaningFee?: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) serviceFee?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) maxGuests?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) bedrooms?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) bathrooms?: number;
  @IsOptional() @ValidateNested() @Type(() => LocationInputDto) location?: LocationInputDto;
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => AmenityInputDto) amenities?: AmenityInputDto[];
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => ImageInputDto) images?: ImageInputDto[];
  @IsOptional() @ValidateNested() @Type(() => RulesInputDto) rules?: RulesInputDto;
}

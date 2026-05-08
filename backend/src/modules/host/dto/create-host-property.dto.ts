import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, Min, ValidateNested } from 'class-validator';

class AmenityInputDto {
  @IsString()
  amenityKey: string;

  @IsString()
  amenityLabel: string;
}

class ImageInputDto {
  @IsUrl()
  url: string;

  @IsOptional()
  @IsString()
  storageKey?: string;

  @IsOptional()
  @IsString()
  altText?: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isCover?: boolean;
}

class LocationInputDto {
  @IsString()
  country: string;

  @IsString()
  city: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  addressLine?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;
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

export class CreateHostPropertyDto {
  @IsString() @IsNotEmpty() title: string;
  @IsString() @IsNotEmpty() slug: string;
  @IsString() shortDescription: string;
  @IsString() longDescription: string;
  @IsString() propertyType: string;
  @Type(() => Number) @IsNumber() @Min(0) basePricePerNight: number;
  @Type(() => Number) @IsNumber() @Min(0) cleaningFee: number;
  @Type(() => Number) @IsNumber() @Min(0) serviceFee: number;
  @Type(() => Number) @IsInt() @Min(1) maxGuests: number;
  @Type(() => Number) @IsInt() @Min(0) bedrooms: number;
  @Type(() => Number) @IsInt() @Min(0) bathrooms: number;
  @ValidateNested() @Type(() => LocationInputDto) location: LocationInputDto;
  @IsArray() @ValidateNested({ each: true }) @Type(() => AmenityInputDto) amenities: AmenityInputDto[];
  @IsArray() @ValidateNested({ each: true }) @Type(() => ImageInputDto) images: ImageInputDto[];
  @ValidateNested() @Type(() => RulesInputDto) rules: RulesInputDto;
}

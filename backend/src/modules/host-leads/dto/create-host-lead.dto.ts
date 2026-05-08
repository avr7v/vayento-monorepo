import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateHostLeadDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  preferredContactMethod?: string;

  @IsOptional()
  @IsString()
  propertyName?: string;

  @IsString()
  @IsNotEmpty()
  propertyCity: string;

  @IsString()
  @IsNotEmpty()
  propertyCountry: string;

  @IsOptional()
  @IsString()
  propertyRegion?: string;

  @IsOptional()
  @IsString()
  propertyAddress?: string;

  @IsString()
  @IsNotEmpty()
  propertyType: string;

  @IsOptional()
  @IsString()
  bedrooms?: string;

  @IsOptional()
  @IsString()
  bathrooms?: string;

  @IsOptional()
  @IsString()
  maxGuests?: string;

  @IsOptional()
  @IsString()
  estimatedNightlyRate?: string;

  @IsOptional()
  @IsString()
  availabilityStatus?: string;

  @IsOptional()
  @IsString()
  currentListingUrl?: string;

  @IsOptional()
  @IsString()
  message?: string;
}
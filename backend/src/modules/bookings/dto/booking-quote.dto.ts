import { IsDateString, IsInt, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class BookingQuoteDto {
  @IsUUID()
  propertyId: string;

  @IsDateString()
  checkInDate: string;

  @IsDateString()
  checkOutDate: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  guestsCount: number;
}

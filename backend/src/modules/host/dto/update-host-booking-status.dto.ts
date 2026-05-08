import { IsString } from 'class-validator';

export class UpdateHostBookingStatusDto {
  @IsString()
  status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
}

import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsOptional, IsString, ValidateNested } from 'class-validator';

class AvailabilityRangeDto {
  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsString()
  blockType: 'AVAILABLE' | 'BLOCKED' | 'RESERVED';

  @IsOptional()
  @IsString()
  reason?: string;
}

export class UpdateAvailabilityDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AvailabilityRangeDto)
  ranges: AvailabilityRangeDto[];
}

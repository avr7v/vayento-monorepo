import { IsString } from 'class-validator';

export class UpdatePropertyStatusDto {
  @IsString()
  status: 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'ARCHIVED';
}

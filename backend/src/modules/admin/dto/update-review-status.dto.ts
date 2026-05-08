import { IsIn } from 'class-validator';

export class UpdateReviewStatusDto {
  @IsIn(['PENDING', 'PUBLISHED', 'HIDDEN'])
  status: 'PENDING' | 'PUBLISHED' | 'HIDDEN';
}

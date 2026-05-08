import { IsString } from 'class-validator';

export class UpdateUserRoleDto {
  @IsString()
  role: 'USER' | 'HOST' | 'ADMIN';
}

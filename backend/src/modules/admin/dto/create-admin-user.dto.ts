import { IsEmail, IsIn, IsString, Matches, MinLength } from 'class-validator';

export class CreateAdminUserDto {
  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(10)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/, {
    message: 'Password must include uppercase, lowercase, number and symbol.',
  })
  password!: string;

  @IsIn(['USER', 'HOST'])
  role!: 'USER' | 'HOST';
}

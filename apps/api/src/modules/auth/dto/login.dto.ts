import { IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  identifier: string; // email or user ID like 'U001'

  @IsString()
  @IsNotEmpty()
  password: string;
}

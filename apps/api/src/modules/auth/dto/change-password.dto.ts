import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @MinLength(3)
  newPassword: string;
}

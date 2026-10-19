import { IsString, IsNotEmpty } from 'class-validator';

export class CreateProjectTypeDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  description: string;
}

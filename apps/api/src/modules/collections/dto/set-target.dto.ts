import { IsString, IsNumber, IsUUID, IsOptional } from 'class-validator';

export class SetTargetDto {
  @IsUUID()
  @IsOptional()
  projectId?: string;

  @IsUUID()
  @IsOptional()
  clientId?: string;

  @IsString()
  collectorName: string;

  @IsString()
  targetMonth: string; // YYYY-MM

  @IsNumber()
  targetAmount: number;
}

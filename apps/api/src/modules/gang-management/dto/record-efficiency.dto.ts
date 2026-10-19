import { IsDateString, IsNumber, IsInt, IsOptional, IsString } from 'class-validator';

export class RecordEfficiencyDto {
  @IsDateString()
  Date: string;

  @IsNumber()
  KmCompleted: number;

  @IsNumber()
  TargetKm: number;

  @IsInt()
  ManpowerPresent: number;

  @IsNumber()
  @IsOptional()
  IdleHours?: number;

  @IsString()
  @IsOptional()
  IdleReason?: string;

  @IsString()
  @IsOptional()
  WeatherCondition?: string;
}
